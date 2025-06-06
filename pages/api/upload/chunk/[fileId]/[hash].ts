import type { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection, withCache } from '@/lib/db';
import { Chunk, File as FileModel } from '@/lib/models/upload';
import type {File as FileModelType} from '@/lib/models/upload'
import { getStorageNodeById, selectStorageNode, uploadChunkByNode, validateUploadToken, verifyChunkUpload } from '@/services/s3/storage';
import { calculateSHA256 } from '@/lib/utils/chunk';
import { authMiddleware } from "@/lib/middlewares";
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response";
import multer from "multer";
import { Types } from "mongoose";
import { trackHttpBandwidth } from "@/lib/user/analytics/bandwidth";

// Configure Multer (store file in memory)
const upload = multer({ storage: multer.memoryStorage() });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }

  try {
    const start = Date.now()
    await initializeDbConnection();

    const userId = new Types.ObjectId(req.user?.userId)
    const { fileId, hash, token } = req.query as { [key: string]: string };

    const existingFile = await withCache(fileId, async () => await FileModel.findOne({fileId, userId}).lean()) as FileModelType
    if (!existingFile) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }

    // Validate upload token
    if (!await validateUploadToken(token, fileId, hash)) {
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

    await uploadChunkByNode(fileId, hash, file.buffer, node) // Uploads the chunk to s3
    await verifyChunkUpload(fileId, hash, node) // Verifies after upload if the chunk was successfully saved to s3

    const chunk = await Chunk.create({
      userId,
      fileId,
      hash,
      storageNode: node.id,
      size: file.size,
      mimeType: file.mimetype
    })

    const elapsed = (Date.now() - start)

    // I do not want to block the JS thread, so not awaiting. 
    trackHttpBandwidth({...existingFile, chunkId: (chunk._id as Types.ObjectId), callerId: userId}, req, "upload", elapsed)

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