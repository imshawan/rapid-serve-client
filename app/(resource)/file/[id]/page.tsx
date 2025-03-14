
import { notFound } from "next/navigation"
import { Preview } from "@/components/dashboard/preview"
import { File } from "@/lib/models/upload"
import { initializeDbConnection, withCache } from "@/lib/db"
import { Breadcrumb } from "@/components/previews/breadcrumb"

interface FilePageProps {
  params: Promise<{ id: string }>;
}

export default async function FilesPreviewPage({ params }: FilePageProps) {
  const { id } = await params
  const file = await getFile(id)
  if (!file) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-0 sm:p-8">
      {/* Breadcrumb */}
      <Breadcrumb file={file} />

      {/* Page Content */}
      <div className="max-w-6xl mx-auto min-h-screen sm:min-h-[calc(100vh-100px)] flex-col align-middle flex-1 justify-center flex">
        <Preview file={file} outerClassname="p-0 min-h-screen sm:min-h-[calc(100vh-100px)]" />
      </div>
    </div>
  )
}

async function getFile(id: string): Promise<File | null> {
  await initializeDbConnection()
  const file = await withCache(`file:${id}`, async () => {
    return await File.findOne({ fileId: id }).lean()
  })
  if (!file) return null;
  return JSON.parse(JSON.stringify(file));
}