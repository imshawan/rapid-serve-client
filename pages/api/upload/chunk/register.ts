import { v4 as uuidv4 } from "uuid"
import { initializeDbConnection, withCache } from "@/lib/db"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { NextApiRequest, NextApiResponse } from "next/types"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { generateToken, selectStorageNode } from "@/services/s3/storage"
import { User } from "@/lib/models/user"
import { parseSizeToBytes } from "@/lib/utils/common"
import app from "@/config/app.json"
import { Types } from "mongoose"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()
    const { fileName, fileSize, chunkHashes, parentId } = req.body
    const userId = new Types.ObjectId(req.user?.userId)

    // Check for existing chunks
    const [existingChunks, user] = await Promise.all([
      Chunk.find({
        hash: { $in: chunkHashes },
        userId
      }).select("hash storageNode fileId"),
      withCache<IUser | null>("user:" + String(userId), async () => await User.findById(userId))
    ])

    if (user) {
      const storageLimit = parseSizeToBytes(app.maxStoragePerUser)
      const { storageUsed } = user
      if ((storageUsed + fileSize) > storageLimit) {
        return formatApiResponse(
          res,
          new ApiError(ErrorCode.PAYMENT_REQUIRED, "Cannot upload this file as your storage limit exceeded quota of " + app.maxStoragePerUser.toUpperCase(),
            HttpStatus.PAYMENT_REQUIRED)
        )
      }
    }

    let existingHashes = new Set(existingChunks.map(chunk => chunk.hash))
    const existingFileIds = new Set(existingChunks.map(chunk => chunk.fileId))
    let missingChunks = chunkHashes.filter((hash: any) => !existingHashes.has(hash))

    // If nothing to upload than why go ahead in the upload process?
    // returning from this point
    if (missingChunks.length === 0) {
      return formatApiResponse(res, { fileId: null, missingChunks, existingChunks: Array.from(existingHashes), uploadChunks: [] })
    }

    let existingFile: File | null = null, invalidChunkGrouping = false;
    if (existingFileIds.size === 1) {
      existingFile = await File.findOne({ fileId: existingFileIds.values().next().value, userId })
      if (!existingFile || !Object.keys(existingFile).length) {
        invalidChunkGrouping = true
      }
    } else {
      invalidChunkGrouping = true
    }

    // Means there are multiple files with same chunks
    // So we need to check if the chunks are in the same file
    // If not, we need to start a fresh file, ignoring the existing file because they may belong to some different user
    if (invalidChunkGrouping) {
      // TODO: Infuture we would share chunks between users (would save our storage :D)
      missingChunks = chunkHashes
      existingHashes.clear()
    }

    // Select storage node for new chunks
    const node = await selectStorageNode()

    // Create new file record with unique ID
    const fileId = !invalidChunkGrouping ? String(existingFile?.fileId) : uuidv4()
    const file = !invalidChunkGrouping ? existingFile : await File.create({
      userId,
      fileId,
      parentId,
      fileName,
      fileSize,
      chunkHashes,
      type: "file",
      status: "pending",
      storageNode: node.id
    })

    // Generate pre-signed chunks with token for missing chunks
    const uploadChunks = await Promise.all(missingChunks.map(async (hash: string) => {
      const token = await generateToken(fileId, hash, String(userId))
      return { hash, token }
    }))

    return formatApiResponse(res, { fileId, missingChunks, existingChunks: Array.from(existingHashes), uploadChunks, file })
  } catch (error) {
    console.error("Error in register:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while registering file chunks", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)