import DiaryEdit from "@/app/components/diary_edit"

export default async function IdEdit({ params }) {
  const { pk, dir_id, id } = await params
  return <DiaryEdit pk={pk} dirId={dir_id} id={id} />
}
