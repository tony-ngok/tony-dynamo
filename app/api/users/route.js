import UserModel from "@/app/models/UserModel"
import DiaryModel from "@/app/models/DiaryModel"
import { apiString, emailValidate } from "@/app/utils"
import DirModel from "@/app/models/DirModel"

export async function GET(request) {
  const url = new URL(request.url)
  const sort = url.searchParams.get('sort') || 'ascending'
  if (sort !== 'ascending' && sort !== 'descending') {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await UserModel.query().where('GSI1PK').eq('USER').using('nameIndex').sort(sort).exec()
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
  const name = apiString(data.name)
  if (!(emailValidate(email) && name)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await UserModel.create({
      pk: `USER#EMAIL#${email}`,
      sk: `USER#EMAIL#${email}`,
      GSI1PK: "USER",
      GSI1SK: `NAME#${name}`,
      email: email,
      name: name
    })
    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    if (err.name === 'ConditionalCheckFailedException') {
      return Response.json({ error: err.toString() }, { status: 412 })
    }
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
  const name = apiString(data.name)
  if (!(emailValidate(email) && name)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `USER#EMAIL#${email}`

  try {
    const res = await UserModel.update({ pk: pk, sk: pk }, { GSI1SK: `NAME#${name}`, name: name })
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
  if (!emailValidate(email)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    // 待完成：要把所有的删光
    const res_pk = await DiaryModel.query().where('GSI1PK').eq(`AUTOR#EMAIL#${email}`).exec()
    // console.log(res_pk)
    if (res_pk.count) {
      const pksks = res_pk.map(i => ({
        pk: i.pk,
        sk: i.sk
      }))
      // console.log(pksks)
      await DiaryModel.batchDelete(pksks)
    }

    const res_dirs = await DirModel.query().where('GSI1PK').eq(`DIR#EMAIL#${email}`).exec()
    // console.log(res_dirs)
    if (res_dirs.count) {
      const pksks_dirs = res_dirs.map(i => ({
        pk: i.pk,
        sk: i.sk
      }))
      // console.log(pksks_dirs)
      await DirModel.batchDelete(pksks_dirs)
    }

    const pk = `USER#EMAIL#${email}`
    await UserModel.delete({ pk: pk, sk: pk })

    return Response.json({ message: "Delete complete" }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
