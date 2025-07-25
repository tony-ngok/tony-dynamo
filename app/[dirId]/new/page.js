import ArticleNew from "@/app/components/article/article_new"

export default async function NewArticle({ params }) {
  const { dirId } = await params
  return <ArticleNew dirId={dirId} />
}
