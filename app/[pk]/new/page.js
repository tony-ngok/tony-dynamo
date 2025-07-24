import ArticleNew from "@/app/components/article_new"

export default async function NewArticle({ params }) {
  const { pk } = await params
  return <ArticleNew pk={pk} />
}
