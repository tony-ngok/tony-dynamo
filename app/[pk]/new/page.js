import DiaryNew from "@/app/components/diary_new"

export default async function NewDiary({ params }) {
  const { pk } = await params
  return <DiaryNew pk={pk} />
}
