import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { SoftDeleteDocument } from "@/lib/db/plugins/soft-delete"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { decrementStorageUsageCount } from "@/lib/user"
import { Document } from "mongoose"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeDbConnection(); // Ensure DB connection exists

  switch (req.method) {
    case "DELETE":
      return await deleteFile(req, res);

    case "PATCH":
      return await updateName(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }
}

async function updateName(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { [key: string]: string }
  const userId = String(req.user?.userId)
  const { fileName } = req.body as { fileName: string }

  try {
    const file = await File.findOne({ fileId, userId }) as File & Document
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    file.fileName = fileName
    await file.save()

    return formatApiResponse(res, { fileId, fileName }, "File name updated successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in updating file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { [key: string]: string }
  const userId = String(req.user?.userId)

  try {
    // Get file record
    const file = await File.findOne({ fileId, userId }) as SoftDeleteDocument & File
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }

    const [, , updated] = await Promise.all([
      file.delete(),
      Chunk.deleteManySoft({
        hash: { $in: file.chunkHashes },
        userId
      }),
      decrementStorageUsageCount(userId, file.fileSize)
    ])

    return formatApiResponse(res, { fileId, used: updated?.storageUsed || 0 }, "File deleted successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in deleting file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);