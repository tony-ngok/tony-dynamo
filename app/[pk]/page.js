import DiaryView from "../components/diary_view"

export default async function Pk({ params }) {
  const { pk } = await params
  return <DiaryView pk={pk} />
}
