import ArticleModel from "@/app/models/ArticleModel"

export async function GET(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ""
  if (!id) {
    return Response.json({ error: "Bad request" }, { status: 400 })
  }

  try {
    const res = await ArticleModel.get({ pk: `ARTICLE#${id}`, sk: `ARTICLE#${id}` })
    if (!res) {
      return Response.json({ error: "Article not found" }, { status: 404 })
    }
    return Response.json({ data: res }, { status: 200 })
  } catch (err) {
    return Response.json({ error: err.toString() }, { status: 500 })
  }
}
