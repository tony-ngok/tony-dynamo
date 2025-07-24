import ArticleEdit from "@/app/components/article_edit"

export default async function IdEdit({ params }) {
  const { pk, id } = await params
  return <ArticleEdit pk={pk} id={id} />
}
