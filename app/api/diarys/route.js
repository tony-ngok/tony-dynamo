import DiaryModel from "@/app/models/DiaryModel"
import { apiString, emailValidate } from "@/app/utils"
import * as uuid from "uuid"

export async function GET(request) {
  const url = new URL(request.url)
  let email = decodeURIComponent(url.searchParams.get('email') || "")
  const sort = url.searchParams.get('sort') || 'ascending'
  if (!(emailValidate(email) && sort)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await DiaryModel.query().where('GSI1PK').eq(`AUTOR#EMAIL#${email}`)
      .using('nameIndex').sort(sort).exec()

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
    const res = await DiaryModel.create({
      pk: `USER#EMAIL#${email}`,
      sk: `DIARY#${uuid.v4()}`,
      GSI1PK: `AUTOR#EMAIL#${email}`,
      GSI1SK: `DIARY#TITLE#${title}`,
      title: title,
      content: content
    })
    // console.log(res)
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

  const email = apiString(data.email)
  const id = apiString(data.id)
  if (!(emailValidate(email) && id)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `USER#EMAIL#${email}`
  const sk = `DIARY#${id}`

  try {
    await DiaryModel.delete({ pk: pk, sk: sk })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
