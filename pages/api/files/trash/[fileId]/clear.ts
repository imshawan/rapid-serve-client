import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { deleteChunksFromBucket } from "@/services/s3/storage"
import { Recent } from "@/lib/models/recent"
import { Shared } from "@/lib/models/shared"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const { fileId } = req.query as { [key: string]: string }
  const userId = String(req.user?.userId)

  try {
    await initializeDbConnection()

    // Get file record which is deleted
    const file = await File.findOne({ fileId, userId }).setOptions({ includeDeleted: true })
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    await Promise.all([
      File.deleteHard({ fileId, userId }),
      Chunk.deleteManyHard({
        hash: { $in: file.chunkHashes },
        userId
      }),
      Recent.deleteManyHard({ fileId }),
      Shared.deleteManyHard({ fileId })
    ])

    // Remove the file chunks from S3
    await deleteChunksFromBucket(file.fileId, file.chunkHashes, String(file.storageNode))

    return formatApiResponse(res, { fileId }, "File deleted permanently", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in deleting file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);