import ArticleNew from "@/app/components/article_new"

export default async function NewDirArticle({ params }) {
  const { pk, dir_id } = await params
  return <ArticleNew pk={pk} dirId={dir_id} />
}
