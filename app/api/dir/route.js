import DirModel from "@/app/models/DirModel"

export async function GET(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await DirModel.get({ pk: `DIR#${id}`, sk: `DIR#${id}` })
    // console.log(res)
    if (!res) {
      return Response.json({ error: "Dir not found" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    // console.log(err)
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
