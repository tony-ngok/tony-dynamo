import DiaryView from "@/app/components/diary_view"

export default async function Pk({ params }) {
  const { pk, dir_id } = await params
  return <DiaryView pk={pk} dirId={dir_id} />
}
