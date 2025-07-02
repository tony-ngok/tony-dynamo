import DiaryEdit from "@/app/components/diary_edit"

export default async function IdEdit({ params }) {
  const { pk, id } = await params
  return <DiaryEdit pk={pk} id={id} />
}
