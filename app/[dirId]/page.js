import DirView from "../components/dir_view"

export default async function DirLayout({ params }) {
  const { dirId } = await params
  return <DirView dirId={dirId} />
}
