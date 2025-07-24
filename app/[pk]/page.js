import ArticleView from "../components/article_view"

export default async function Pk({ params }) {
  const { pk } = await params
  return <ArticleView pk={pk} />
}
