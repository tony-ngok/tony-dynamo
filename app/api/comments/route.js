import ArticleModel from "@/app/models/ArticleModel"
import CommentModel from "@/app/models/CommentModel"
import RelationModel from "@/app/models/RelationModel"
import { apiString, getId } from "@/app/utils/string_utils"
import { nanoid } from "nanoid"

export async function GET(request) {
  const url = new URL(request.url)
  const articleId = url.searchParams.get('articleId')
  if (!articleId) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await CommentModel.query().where('GSI1PK').eq(`ARTICLE#${articleId}`)
      .using('SortIndex').sort('descending').exec()
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
  const articleId = apiString(data.articleId)
  const text = apiString(data.text)
  if (!(dirId && articleId && text)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const commentPk = `COMMENT#${nanoid()}`
    const comment = await CommentModel.get({ pk: commentPk, sk: commentPk })
    if (comment) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const article = await ArticleModel.get({ pk: `ARTICLE#${articleId}`, sk: `ARTICLE#${articleId}` })
    if (!(article && getId(article.GSI1PK) === dirId)) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }
    await RelationModel.create({
      pk: commentPk,
      sk: 'RELATION',
      GSI1PK: 'RELATION',
      GSI1SK: `DIR#${dirId}#ARTICLE#${articleId}#COMMENT`
    })

    const createTimestamp = (new Date()).getTime()
    const res = await CommentModel.create({
      pk: commentPk,
      sk: commentPk,
      GSI1PK: `ARTICLE#${articleId}`,
      GSI1SK: (new Date()).getTime().toString().padStart(13, '0'),
      text: text,
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
    const commentPk = `COMMENT#${id}`
    const comment = await CommentModel.get({ pk: commentPk, sk: commentPk })
    if (!comment) {
      return Response.json({ message: "Comment not found" }, { status: 404 })
    }

    await RelationModel.delete({ pk: commentPk, sk: 'RELATION' })
    await comment.delete()
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
