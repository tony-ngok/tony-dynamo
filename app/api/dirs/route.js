import DiaryModel from "@/app/models/DiaryModel"
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
  const dirName = apiString(data.dirName)
  if (!(id && dirName)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `DIR#${id}`

  try {
    const res = await DirModel.update({ pk: pk, sk: pk }, {
      dirName: dirName, GSI1SK: `DIRNAME#${dirName}`
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

  const email = apiString(data.email)
  const id = apiString(data.id)
  if (!(emailValidate(email) && id)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `DIR#${id}`
  const dir_gsi1pk = `AUTOR#EMAIL#${email}#` + pk

  try {
    const res_pk = await DiaryModel.query().where('GSI1PK').eq(dir_gsi1pk).exec()
    // console.log(res_pk)
    if (res_pk.count) {
      const pksks = res_pk.map(i => ({
        pk: i.pk,
        sk: i.sk
      }))
      // console.log(pksks)
      await DiaryModel.batchDelete(pksks)
    }

    await DirModel.delete({ pk: pk, sk: pk })
    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
