import ArticleModel from "@/app/models/ArticleModel"
import CommentModel from "@/app/models/CommentModel"
import RelationModel from "@/app/models/RelationModel"
import { apiString, getId } from "@/app/string_utils"

export async function GET(request) {
  const url = new URL(request.url)
  const articleId = url.searchParams.get('articleId')
  if (!articleId) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await CommentModel.query().where('GSI1PK').eq(`ARTICLE#${articleId}`)
      .using('SortIndex').sort('descending').exec()
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
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
  const articleId = apiString(data.articleId)
  const content = apiString(data.content)
  if (!(dirId && articleId && content)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const id = nanoid()
    const comment = await CommentModel.get({ pk: `COMMENT#${id}`, sk: `COMMENT#${id}` })
    if (comment) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const article = await ArticleModel.get({ pk: `ARTICLE#${articleId}`, sk: `ARTICLE#${articleId}` })
    if (!(article && getId(article.GSI1PK) === dirId)) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }
    await RelationModel.create({ pk: `COMMENT#${id}`, sk: `DIR#${dirId}` })

    const res = await CommentModel.create({
      pk: `COMMENT#${id}`,
      sk: `COMMENT#${id}`,
      GSI1PK: `ARTICLE#${articleId}`,
      GSI1SK: (new Date()).getTime(),
      content: content
    })
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
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

  const id = apiString(data.id)
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const del_keys = await RelationModel.query().where('pk').eq(`COMMENT#${id}`).exec()
    await CommentModel.delete({ pk: `COMMENT#${id}`, sk: `COMMENT#${id}` })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
