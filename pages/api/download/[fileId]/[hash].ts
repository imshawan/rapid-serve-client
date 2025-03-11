import type { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { Chunk, File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { getChunkStreamFromBucket, validateUploadToken } from "@/services/s3/storage"
import { Shared } from "@/lib/models/shared"
import { Types } from "mongoose"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()

    const { fileId, hash, token } = req.query as { [key: string]: string }
    const userId = new Types.ObjectId(req.user?.userId)

    // Validate token
    if (!await validateUploadToken(token, fileId, hash)) {
      return formatApiResponse(
        res,
        new ApiError(ErrorCode.FORBIDDEN, "Invalid or expired token", HttpStatus.FORBIDDEN)
      );
    }

    // Get file record
    const [file, sharedWithMe] = await Promise.all([
      File.findOne({ fileId }),
      Shared.findOne({ fileId, "sharedWith.userId": userId })
    ])
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }
    if (String(file.userId) !== String(userId) && !sharedWithMe) {
      return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "You are not authorized to download this file", HttpStatus.FORBIDDEN))
    }

    // Get chunk metadata
    const chunk = await Chunk.findOne({ fileId, hash }) as Chunk
    if (!chunk) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "Chunk not found", HttpStatus.NOT_FOUND))
    }

    // Stream the data from S3
    const stream = await getChunkStreamFromBucket(fileId, hash, chunk.storageNode)

    res.setHeader("Content-Type", chunk.mimeType)
    res.setHeader("Content-Disposition", `attachment; filename="${hash}"`);

    // Pipe the S3 stream directly to the client response
    stream.pipe(res);
  } catch (error) {
    console.error("Error in chunk download:", error);
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk download", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser for streaming
    responseLimit: false, // Remove response size limit
  },
};


export default authMiddleware(handler)