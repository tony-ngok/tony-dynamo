import ArticleModel from "@/app/models/ArticleModel"

export async function GET(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ""
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }
  const pk = `ARTICLE#${id}`

  try {
    const res = await ArticleModel.get({ pk: pk, sk: pk })
    if (!res) {
      return Response.json({ error: "Article not found for this user" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
