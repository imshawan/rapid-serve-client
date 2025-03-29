import { cookies } from "next/headers";
import { notFound } from "next/navigation"
import { Preview } from "@/components/dashboard/preview"
import { File } from "@/lib/models/upload"
import { initializeDbConnection, withCache } from "@/lib/db"
import { Breadcrumb } from "@/components/previews/breadcrumb"
import { verifyToken } from "@/lib/auth/jwt-utils";
import { Shared } from "@/lib/models/shared";
import { Types } from "mongoose";

interface FilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FilesPreviewPage({ params, searchParams }: FilePageProps) {
  const { id } = await params
  const {sharer} = await searchParams
  if (!sharer) {
    return notFound()
  }

  const cookieStore = await cookies()
  const token = String(cookieStore.get("token")?.value)
  const user = await verifyToken(token)
  if (!user) {
    return notFound()
  }

  const file = await getFile(id, user.userId, String(sharer))
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

async function getFile(id: string, userId: string, sharer: string): Promise<File | null> {
  await initializeDbConnection()
  const [file, sharedFile] = await Promise.all([
    withCache(`file:${id}`, async () => {
      return await File.findOne({ fileId: id }).lean()
    }),
    Shared.findOne({ shareId: sharer, sharedWith: { $elemMatch: { userId: new Types.ObjectId(userId) } } }).lean()
  ])
  if (!file || (!sharedFile && String(file.userId) != userId)) return null;
  return JSON.parse(JSON.stringify(file));
}