import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection, withCache } from '@/lib/db';
import { Chunk, File as FileModel } from '@/lib/models/upload';
import type {File as FileModelType} from '@/lib/models/upload'
import { getStorageNodeById, selectStorageNode, uploadChunkByNode, validateUploadToken, verifyChunkUpload } from '@/services/s3/storage';
import { calculateSHA256 } from '@/lib/utils/chunk';
import { authMiddleware } from "@/lib/middlewares";
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response";
import multer from "multer";

// Configure Multer (store file in memory)
const upload = multer({ storage: multer.memoryStorage() });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }

  try {
    await initializeDbConnection();

    const userId = String(req.user?.userId)
    const { fileId, hash, token } = req.query as { [key: string]: string };

    const existingFile = await withCache(fileId, async () => await FileModel.findOne({fileId, userId})) as FileModelType
    if (!existingFile) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }

    // Validate upload token
    if (!validateUploadToken(token, fileId, hash)) {
      return formatApiResponse(
        res,
        new ApiError(ErrorCode.FORBIDDEN, "Invalid upload token", HttpStatus.FORBIDDEN)
      );
    }

    await new Promise<void>((resolve, reject) => {
      upload.single('chunk')(req as any, res as any, (err: unknown) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (req as any).file as MulterFile;

    // Read raw binary data from request
    // const chunks: Uint8Array[] = [];
    // for await (const chunk of req) {
    //   chunks.push(chunk);
    // }
    // const buffer = Buffer.concat(chunks)
    let node = getStorageNodeById(String(existingFile.storageNode))
    if (!node) {
      node = await selectStorageNode()
    }

    // Validate chunk hash
    const calculatedHash = await calculateSHA256(file.buffer);
    if (calculatedHash !== hash) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Hash mismatch", HttpStatus.BAD_REQUEST))
    }

    await uploadChunkByNode(fileId, hash, file.buffer, node)
    await verifyChunkUpload(fileId, hash, node)

    await Chunk.create({
      userId,
      fileId,
      hash,
      storageNode: node.id,
      size: file.size,
      mimeType: file.mimetype
    });

    return formatApiResponse(res, { success: true })
  } catch (error) {
    console.error("Error in chunk upload:", error);
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in chunk upload", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};


export default authMiddleware(handler);