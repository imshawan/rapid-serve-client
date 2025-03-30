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

  const cookieStore = await cookies()
  const token = String(cookieStore.get("token")?.value)
  const user = await verifyToken(token)
  if (!user) {
    return notFound()
  }

  const file = await getFile(id, user.userId, typeof sharer === "string" ? sharer : Array.isArray(sharer) && sharer.length ? sharer[0] : undefined)
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

async function getFile(id: string, userId: string, sharer: string | undefined): Promise<File | undefined> {
  await initializeDbConnection()
  const file = await withCache(`file:${id}`, async () => {
    return await File.findOne({ fileId: id }).lean()
  })
  if (!file) return;

  if (sharer) {
    const sharedFile = Shared.findOne({ shareId: sharer, sharedWith: { $elemMatch: { userId: new Types.ObjectId(userId) } } }).lean()
    if (!sharedFile) return;
  } else if (String(file.userId) != userId) {
    return
  }
  return JSON.parse(JSON.stringify(file))
}