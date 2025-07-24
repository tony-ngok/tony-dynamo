import ArticleEdit from "@/app/components/article_edit"

export default async function IdEdit({ params }) {
  const { pk, dir_id, id } = await params
  return <ArticleEdit pk={pk} dirId={dir_id} id={id} />
}
