import DirModel from "@/app/models/DirModel"
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
    const res = await DirModel.query().where('GSI1PK').eq(`DIR#EMAIL#${email}`)
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
  const dirName = apiString(data.dirName)
  if (!(emailValidate(email) && dirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const id = uuid.v4()
    const res = await DirModel.create({
      pk: `DIR#${id}`,
      sk: `DIR#${id}`,
      GSI1PK: `DIR#EMAIL#${email}`,
      GSI1SK: `DIRNAME#${dirName}`,
      dirName: dirName
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

  const email = apiString(data.email)
  const dirName = apiString(data.dirName)
  if (!(emailValidate(email) && dirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const id = uuid.v4()
    const res = await DirModel.create({
      pk: `DIR#${id}`,
      sk: `DIR#${id}`,
      GSI1PK: `DIR#EMAIL#${email}`,
      GSI1SK: `DIRNAME#${dirName}`,
      dirName: dirName
    })
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
