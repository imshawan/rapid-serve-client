import type { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from '@/lib/db'
import { Chunk, File } from '@/lib/models/upload'
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { generateToken } from "@/services/s3/storage"
import { addFileToRecents } from "@/lib/user/recents"
import { getIpAddress } from "@/lib/utils/network"
import { Shared } from "@/lib/models/shared"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()

    const { fileId } = req.query as { [key: string]: string }
    const userId = String(req.user?.userId)

    // Get file record
    const [file, sharedWithMe] = await Promise.all([
      File.findOne({ fileId }),
      Shared.findOne({ fileId, "sharedWith.userId": userId   })
    ])
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }
    if (String(file.userId) !== userId && !sharedWithMe) {
      return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "You are not authorized to download this file", HttpStatus.FORBIDDEN))
    }

    const existingChunks = await Chunk.find({
      hash: { $in: file?.chunkHashes },
    }).select("mimeType size hash")

    let mimeType = "application/octet-stream"
    let existingChunksSizeMap = new Map<string, number>()
    if (existingChunks.length) {
      mimeType = [...new Set(existingChunks.map(chunk => chunk.mimeType))][0]
      existingChunksSizeMap = existingChunks.reduce((acc, chunk) => {
        acc.set(chunk.hash, chunk.size)
        return acc
      }, new Map<string, number>())
    }

    // Generate download tokens for each chunk
    const chunkTokens = await Promise.all(
      file.chunkHashes.map(async (hash) => ({
        hash,
        token: await generateToken(fileId, hash, userId),
        size: existingChunksSizeMap.get(hash) || 0
      }))
    )

    if (file.status === "complete")  {
      await addFileToRecents(file, userId, getIpAddress(req))
    }

    return formatApiResponse(res, { success: true, chunks: chunkTokens, file, mimeType })
  } catch (error: any) {
    console.error("Error in chunk download:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk download", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)