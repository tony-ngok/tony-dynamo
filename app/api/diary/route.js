import DiaryModel from "@/app/models/DiaryModel"

export async function GET(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ""
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `DIARY#${id}`

  try {
    const res = await DiaryModel.get({ pk: pk, sk: pk })
    if (!res) {
      return Response.json({ error: "Diary not found for this user" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
