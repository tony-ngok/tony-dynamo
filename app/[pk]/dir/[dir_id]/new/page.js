import DiaryNew from "@/app/components/diary_new";

export default async function NewDirDiary({ params }) {
  const { pk, dir_id } = await params
  return <DiaryNew pk={pk} dirId={dir_id} />
}
