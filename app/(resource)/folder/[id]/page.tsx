
import { Fragment } from "react"
import { initializeDbConnection, withCache } from "@/lib/db";
import { File } from "@/lib/models/upload";
import { notFound } from "next/navigation";

interface FolderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FoldersPreviewPage({ params }: FolderPageProps) {
  const { id } = await params;
  console.log(id)
  const file = await getFolder(id)
  if (!file) {
    return notFound()
  }
  return (
    <Fragment>
      <h1>Preview Page</h1>

      {/* <DownloadDialog /> */}
    </Fragment>
  )
}

async function getFolder(id: string): Promise<File | null> {
  await initializeDbConnection()
  const file = await withCache(`file:${id}`, async () => {
    return await File.findOne({ fileId: id }).lean()
  })
  if (!file) return null;
  return JSON.parse(JSON.stringify(file));
}