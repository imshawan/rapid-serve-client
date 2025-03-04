import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { deleteMultipleFilesFromBucket } from "@/services/s3/storage"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const userId = String(req.user?.userId)

  try {
    await initializeDbConnection()

    // Get file record which is deleted
    const files = await File.findAllSoftDeleted({ userId })
    if (!files) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }
    
    const fileIds = files.map(f => f.fileId)
    const chunkHashes = files.flatMap(f => f.chunkHashes)

    await Promise.all([
      File.deleteManyHard({ userId, fileId: { $in: fileIds }}),
      Chunk.deleteManyHard({
        hash: { $in: chunkHashes },
        userId
      })
    ])

    // Remove the file chunks from S3
    await deleteMultipleFilesFromBucket(files)

    return formatApiResponse(res, { files: files.map(f => f.fileId) }, "File deleted permanently", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in deleting file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);