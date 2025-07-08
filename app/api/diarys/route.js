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
    let gsi1pk = `AUTOR#EMAIL#${email}`
    if (dir) gsi1pk += `#DIR#${dir}`

    const res = await DiaryModel.query().where('GSI1PK').eq(gsi1pk).using('nameIndex').sort(sort).exec()
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
  if (!(emailValidate(email) && content && title)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const id = uuid.v4()
    const res = await DiaryModel.create({
      pk: `DIARY#${id}`,
      sk: `DIARY#${id}`,
      GSI1PK: `AUTOR#EMAIL#${email}`,
      GSI1SK: `DIARY#TITLE#${title}`,
      title: title,
      content: content
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
  if (!(id && title && content)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `DIARY#${id}`

  try {
    const res = await DiaryModel.update({ pk: pk, sk: pk }, {
      content: content, title: title, GSI1SK: `DIARY#TITLE#${title}`
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
