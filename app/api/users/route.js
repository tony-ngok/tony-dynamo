import UserModel from "@/app/models/UserModel"

export async function GET(request) {
  try {
    let res = await UserModel.scan().exec()
    res = res.filter((user) => !user.pk.startsWith('email#'))
    console.log(res)
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    console.log(err.toString())
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
