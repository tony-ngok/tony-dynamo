import DiaryModel from "@/app/models/DiaryModel"
import { apiString, emailValidate } from "@/app/utils"
import * as uuid from "uuid"

export async function GET(request) {
  const url = new URL(request.url)
  let email = decodeURIComponent(url.searchParams.get('email') || "")
  const sort = url.searchParams.get('sort') || 'ascending'
  if (!emailValidate(email) || (sort !== 'ascending' && sort !== 'descending')) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const dir = url.searchParams.get('dir')
    const gsisk = dir ? `DIR#${dir}#DIARY` : "DIARY"

    const res = await DiaryModel.query().where('GSI1PK').eq(`AUTOR#EMAIL#${email}`)
      .where('GSI1SK').beginsWith(gsisk).using('nameIndex').sort(sort).exec()
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

  const email = apiString(data.email)
  const title = apiString(data.title)
  const content = apiString(data.content)
  const htmlContent = apiString(data.htmlContent)
  if (!(emailValidate(email) && title && content && htmlContent)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const dir = apiString(data.dir)
    const gsis1k = (dir ? `DIR#${dir}#DIARY` : "DIARY") + `#TITLE#${title}`

    const id = uuid.v4()
    const res = await DiaryModel.create({
      pk: `DIARY#${id}`,
      sk: `DIARY#${id}`,
      GSI1PK: `AUTOR#EMAIL#${email}`,
      GSI1SK: gsis1k,
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
  if (!(id && title && content && htmlContent)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `DIARY#${id}`

  try {
    const dir = apiString(data.dir)
    const gsis1k = (dir ? `DIR#${dir}#DIARY` : "DIARY") + `#TITLE#${title}`

    const res = await DiaryModel.update({ pk: pk, sk: pk }, {
      content: content, htmlContent: htmlContent, title: title, GSI1SK: gsis1k
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
  const pk = `DIARY#${id}`

  try {
    await DiaryModel.delete({ pk: pk, sk: pk })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
