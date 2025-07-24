import ArticleView from "@/app/components/article_view"

export default async function Pk({ params }) {
  const { pk, dir_id } = await params
  return <ArticleView pk={pk} dirId={dir_id} />
}
