import ArticleEdit from "@/app/components/article/article_edit"

export default async function EditArticle({ params }) {
  const { dirId, id } = await params
  return <ArticleEdit dirId={dirId} id={id} />
}
