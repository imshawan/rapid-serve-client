import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { Shared } from "@/lib/models/shared"
import { Types } from "mongoose"
import { getIpAddress } from "@/lib/utils/network"
import { addFileToRecents } from "@/lib/user/recents"
import { MAX_PREVIEW_FILE_SIZE } from "@/common/constants"
import { getChunkStreamFromBucket } from "@/services/s3/storage"
import { getMimeType } from "@/lib/utils/mimetype"
import { Readable } from "stream"
import { mergeChunks } from "@/lib/utils/server-chunk"

async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()

    const { fileId } = req.query as { [key: string]: string }
    const userId = new Types.ObjectId(req.user?.userId)

    // Get file record
    const [file, sharedWithMe] = await Promise.all([
      File.findOne({ fileId }),
      Shared.findOne({ fileId, "sharedWith.userId": String(userId) })
    ])
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }
    if (String(file.userId) != String(userId) && !sharedWithMe) {
      return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "You are not authorized to preview this file", HttpStatus.FORBIDDEN))
    }

    let mimeType = getMimeType(file.fileName), fileSize = file.fileSize;
    let stream: Readable | null = null;
    if (file.status === "complete") {
      await addFileToRecents(file, userId, getIpAddress(req))
    }

    // If the file has only 1 chunk then we can directly return the file
    if (file.chunkHashes.length === 1) {
      let hash = file.chunkHashes[0]
      stream = await getChunkStreamFromBucket(fileId, hash, String(file.storageNode))
    } else if (fileSize <= MAX_PREVIEW_FILE_SIZE) {
      const chunkStreams = await Promise.all(
        file.chunkHashes.map(async hash => getChunkStreamFromBucket(fileId, hash, String(file.storageNode)))
      )
      stream = mergeChunks(chunkStreams)
    } else {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File is too large to preview", HttpStatus.BAD_REQUEST))
    }

    if (stream) {
      res.setHeader("Content-Type", mimeType)
      res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`)
      stream.pipe(res)
    } else {
      formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Unable to create stream", HttpStatus.INTERNAL_SERVER_ERROR))
    }
  } catch (error: any) {
    console.error("Error in preview:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in preview", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}


export default authMiddleware(handler)

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser for streaming
    responseLimit: false, // Remove response size limit
  },
};