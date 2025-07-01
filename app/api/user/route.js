import UserModel from "@/app/models/UserModel"
import { emailValidate } from "@/app/utils"

export async function GET(request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email') || ""
  if (!emailValidate(email)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `USER#EMAIL#${email}`

  try {
    const res = await UserModel.get({ pk: pk, sk: pk })
    if (!res) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
