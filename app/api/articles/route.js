import ArticleModel from "@/app/models/ArticleModel"
import { apiString } from "@/app/string_utils"
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
  const title = apiString(data.title)
  const content = apiString(data.content)
  if (!(dirId && title && content)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const id = nanoid()
    const article = await ArticleModel.get({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` })
    if (article) {
      return Response.json({ error: "ID conflict, please try again" }, { status: 409 })
    }

    const res = await ArticleModel.create({
      pk: `ARTICLE#${id}`,
      sk: `ARTICLE#${id}`,
      GSI1PK: `DIR#${dirId}`,
      GSI1SK: (new Date()).getTime(),
      title: title,
      content: content
    })
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
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
  if (!(id && title && content)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await ArticleModel.update({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` }, {
      content: content, title: title, GSI1SK: (new Date()).getTime()
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
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
