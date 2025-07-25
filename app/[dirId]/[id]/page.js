import ArticleView from "@/app/components/article/article_view"

export default async function ArticleLayout({ params }) {
  const { dirId, id } = await params
  return <ArticleView dirId={dirId} id={id} />
}
