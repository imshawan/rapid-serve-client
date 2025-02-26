import type { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from '@/lib/db'
import { Chunk, File } from '@/lib/models/upload'
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { generateToken } from "@/services/s3/storage"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()

    const { fileId } = req.query as { [key: string]: string }
    const userId = String(req.user?.userId)

    // Get file record
    const file = await File.findOne({ fileId, userId }) as File
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    const existingChunksMimetype = await Chunk.find({
      hash: { $in: file.chunkHashes },
      userId
    }).select("mimeType")

    let mimeType = "application/octet-stream"
    if (existingChunksMimetype.length) {
      mimeType = [...new Set(existingChunksMimetype.map(chunk => chunk.mimeType))][0]
    }

    // Generate download tokens for each chunk
    const chunkTokens = await Promise.all(
      file.chunkHashes.map(async (hash) => ({
        hash,
        token: await generateToken(fileId, hash, userId)
      }))
    )

    return formatApiResponse(res, { success: true, chunks: chunkTokens, file, mimeType })
  } catch (error: any) {
    console.error("Error in chunk upload:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk upload", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)