import DiaryModel from "@/app/models/DiaryModel"
import { emailValidate } from "@/app/utils"

export async function GET(request) {
  const url = new URL(request.url)
  let email = decodeURIComponent(url.searchParams.get('email') || "")
  const sort = url.searchParams.get('sort') || 'ascending'
  if (!(emailValidate(email) && sort)) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  email = decodeURIComponent(email)

  try {
    const res = await DiaryModel.query().where('GSI1PK').eq(`AUTOR#EMAIL#${email}`)
      .using('nameIndex').sort(sort).exec()

    // console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
