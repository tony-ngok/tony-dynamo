import UserModel from "@/app/models/UserModel"
import { emailValidate } from "@/app/utils"

export async function GET(request) {
  const url = new URL(request.url)
  const sort = url.searchParams.get('sort') || 'ascending'

  try {
    let res = await UserModel.query().where('GSI1PK').eq('USER').using('nameIndex').sort(sort).exec()
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

  const email = String(data.email) || ""
  const name = String(data.name) || ""
  if (!(emailValidate(email) && name)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    let res = await UserModel.create({
      pk: `EMAIL#${email}`,
      sk: `EMAIL#${email}`,
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
