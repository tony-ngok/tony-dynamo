import UserModel from "@/app/models/UserModel"

export async function GET(request) {
  try {
    let res = await UserModel.query().where('GSI1PK').eq('USER').using('nameIndex').sort('ascending').exec()
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
