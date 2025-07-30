import ArticleModel from "@/app/models/ArticleModel"
import CommentModel from "@/app/models/CommentModel"
import DirModel from "@/app/models/DirModel"
import RelationModel from "@/app/models/RelationModel"
import { gsiQueryAll, sliceBatchDelete } from "@/app/utils/db_utils"
import { apiString, getId, htmlText } from "@/app/utils/string_utils"
import { nanoid } from "nanoid"

export async function GET(request) {
  const url = new URL(request.url)
  const dirId = url.searchParams.get('dirId')
  const sort = url.searchParams.get('sort') || 'ascending'
  if (!dirId || (sort !== 'ascending' && sort !== 'descending')) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await ArticleModel.query().where('GSI1PK').eq(`DIR#${dirId}`)
      .using('SortIndex').sort(sort).exec()
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function POST(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const dirId = apiString(data.dirId)
  const title = apiString(data.title)
  const content = apiString(data.content)
  const htmlContent = apiString(data.htmlContent)
  if (!(dirId && title && content && htmlText(htmlContent))) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${nanoid()}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (article) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const dir = await DirModel.get({ pk: `DIR#${dirId}`, sk: `DIR#${dirId}` })
    if (!dir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    }
    await RelationModel.create({
      pk: articlePk,
      sk: 'RELATION',
      GSI1PK: 'RELATION',
      GSI1SK: `DIR#${dirId}#ARTICLE`
    })

    const createTimestamp = (new Date()).getTime()
    const res = await ArticleModel.create({
      pk: articlePk,
      sk: articlePk,
      GSI1PK: `DIR#${dirId}`,
      GSI1SK: createTimestamp.toString().padStart(13, '0'),
      title: title,
      content: content,
      htmlContent: htmlContent,
      createTimestamp: createTimestamp,
      updateTimestamp: createTimestamp
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function PATCH(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const id = apiString(data.id)
  const title = apiString(data.title)
  const content = apiString(data.content)
  const htmlContent = apiString(data.htmlContent)
  if (!(id && title && content && htmlText(htmlContent))) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${nanoid()}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }

    const updateTimestamp = (new Date()).getTime()
    const res = await ArticleModel.update({ pk: articlePk, sk: articlePk }, {
      content: content,
      htmlContent: htmlContent,
      title: title,
      GSI1SK: updateTimestamp.toString().padStart(13, '0'),
      updateTimestamp: updateTimestamp
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}

export async function DELETE(request) {
  let data
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  const dirId = apiString(data.dirId)
  const id = apiString(data.id)
  if (!(dirId && id)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const articlePk = `ARTICLE#${id}`
    const article = await ArticleModel.get({ pk: articlePk, sk: articlePk })
    if (!(article && getId(article.GSI1PK) === dirId)) {
      return Response.json({ message: "Article not found" }, { status: 404 })
    }

    // 清除留言与目录间的关系
    const comms_rels_query = await gsiQueryAll(RelationModel, 'RELATION',
      `DIR#${dirId}#${articlePk}#COMMENT`
    )
    console.log(comms_rels_query)

    // 清除相关的留言
    let comms_pksks = []
    for (const rel of comms_rels_query) {
      if (rel.pk.startsWith("COMMENT#")) {
        comms_pksks.push({ pk: rel.pk, sk: rel.pk })
      }
    }
    console.log(comms_pksks)

    await sliceBatchDelete(RelationModel, comms_rels_query)
    await sliceBatchDelete(CommentModel, comms_pksks, false)

    await RelationModel.delete({ pk: articlePk, sk: 'RELATION' })
    await article.delete()
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
