import ArticleModel from "@/app/models/ArticleModel"
import DirModel from "@/app/models/DirModel"
import { apiString, htmlText } from "@/app/string_utils"
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
    const id = nanoid()
    const article = await ArticleModel.get({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` })
    if (article) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const dir = await DirModel.get({ pk: `DIR#${dirId}`, sk: `DIR#${dirId}` })
    if (!dir) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    }

    const res = await ArticleModel.create({
      pk: `ARTICLE#${id}`,
      sk: `ARTICLE#${id}`,
      GSI1PK: `DIR#${dirId}`,
      GSI1SK: (new Date()).getTime(),
      title: title,
      content: content,
      htmlContent: htmlContent
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
    const article = await ArticleModel.get({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` })
    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }

    const res = await ArticleModel.update({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` }, {
      content: content, htmlContent: htmlContent, title: title, GSI1SK: (new Date()).getTime()
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
    await ArticleModel.delete({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
