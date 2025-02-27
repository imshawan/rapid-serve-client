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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()
    const { fileName, fileSize, chunkHashes, parentId } = req.body
    const userId = String(req.user?.userId)

    // Check for existing chunks
    const [existingChunks, user] = await Promise.all([
      Chunk.find({
        hash: { $in: chunkHashes },
        userId
      }).select("hash storageNode"),
      withCache<IUser | null>(userId, async () => await User.findById(userId))
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

    const existingHashes = new Set(existingChunks.map(chunk => chunk.hash))
    const missingChunks = chunkHashes.filter((hash: any) => !existingHashes.has(hash))

    // If nothing to upload than why go ahead in the upload process?
    // returning from this point
    if (missingChunks.length === 0) {
      return formatApiResponse(res, { fileId: null, missingChunks, existingChunks: Array.from(existingHashes), uploadChunks: [] })
    }

    // Select storage node for new chunks
    const node = await selectStorageNode()

    // Create new file record with unique ID
    const fileId = uuidv4()
    const file = await File.create({
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
      const token = await generateToken(fileId, hash, userId)
      return { hash, token }
    }))

    return formatApiResponse(res, { fileId, missingChunks, existingChunks: Array.from(existingHashes), uploadChunks, file })
  } catch (error) {
    console.error("Error in register:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while registering file chunks", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)