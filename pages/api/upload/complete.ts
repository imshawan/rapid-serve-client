import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection } from '@/lib/db';
import { Chunk, File } from '@/lib/models/upload';
import { authMiddleware } from "@/lib/middlewares";
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED));
  }

  try {
    await initializeDbConnection();

    const userId = String(req.user?.userId)
    const { fileId } = await req.body;

    // Get file record
    const file = await File.findOne({ fileId, userId })
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    // Verify all chunks are present
    const chunkCount = await Chunk.countDocuments({
      fileId,
      hash: { $in: file.chunkHashes },
      userId
    });

    if (chunkCount !== file.chunkHashes.length) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Missing chunks", HttpStatus.BAD_REQUEST))
    }

    // Mark file as complete
    file.status = 'complete';
    await file.save();

    return formatApiResponse(res, { success: true, file })
  } catch (error: any) {
    console.error("Error in chunk upload:", error);
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk upload", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);