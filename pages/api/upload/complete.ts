import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection } from '@/lib/db';
import { Chunk, File } from '@/lib/models/upload';
import { authMiddleware } from "@/lib/middlewares";
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response";
import { getStorageNodeById, verifyChunkUpload } from "@/services/s3/storage";
import { Document, Types } from "mongoose";
import { incrementStorageUsageCount } from "@/lib/user";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED));
  }

  try {
    await initializeDbConnection();

    const userId = new Types.ObjectId(req.user?.userId)
    const { fileId } = await req.body;

    // Get file record
    const file = await File.findOne({ fileId, userId }) as Document & File
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    // Verify all chunks are present
    const chunkCount = await Chunk.countDocuments({
      fileId,
      hash: { $in: file.chunkHashes },
      userId
    });
    let chunksInDisk = 0, totalChunks = file.chunkHashes.length;

    await Promise.all(file.chunkHashes.map(async (hash) => {
      let node = getStorageNodeById(String(file.storageNode))
      if (!node) return;
      if (await verifyChunkUpload(fileId, hash, node)) {
        chunksInDisk += 1;
      }
    }))

    if (chunkCount !== totalChunks || chunksInDisk != totalChunks) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Missing chunks in drive, please delete the file and re-upload", HttpStatus.BAD_REQUEST))
    }

    // Mark file as complete
    file.status = 'complete'
    
    const [_, updatedUser] = await Promise.all([
      file.save(),
      incrementStorageUsageCount(String(userId), file.fileSize)
    ])

    return formatApiResponse(res, { success: true, file, used: updatedUser?.storageUsed || 0 })
  } catch (error: any) {
    console.error("Error in chunk upload:", error);
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk upload", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);