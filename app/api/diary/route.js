import DiaryModel from "@/app/models/DiaryModel"
import { emailValidate } from "@/app/utils"

export async function GET(request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email') || ""
  const id = url.searchParams.get('id') || ""
  if (!(emailValidate(email) && id)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `USER#EMAIL#${email}`
  const sk = `DIARY#${id}`

  try {
    const res = await DiaryModel.get({ pk: pk, sk: sk })
    if (!res) {
      return Response.json({ error: "Diary not found for this user" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
