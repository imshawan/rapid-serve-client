import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { SoftDeleteDocument } from "@/lib/db/plugins/soft-delete"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { incrementStorageUsageCount } from "@/lib/user"
import { Recent } from "@/lib/models/recent"
import { Shared } from "@/lib/models/shared"
import { Types } from "mongoose"

async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "PATCH") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const { fileId } = req.query as { [key: string]: string }
  const userId = new Types.ObjectId(req.user?.userId)

  try {
    await initializeDbConnection()

    const file = await File.findOne<SoftDeleteDocument & File>({ fileId, userId }).setOptions({ includeDeleted: true })
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }

    const [, , updated] = await Promise.all([
      file.restore(),
      Chunk.restoreMany({ hash: { $in: file.chunkHashes }, userId }),
      incrementStorageUsageCount(String(userId), file.fileSize),
      Recent.restoreMany({ fileId }),
      Shared.restoreMany({ fileId })
    ])

    return formatApiResponse(res, { fileId, used: updated?.storageUsed || 0 }, "File restored successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in restoring file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);