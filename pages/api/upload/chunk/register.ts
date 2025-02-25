import { v4 as uuidv4 } from 'uuid';
import { initializeDbConnection } from '@/lib/db';
import { File, Chunk } from '@/lib/models/upload';
import { authMiddleware } from '@/lib/middlewares';
import { NextApiRequest, NextApiResponse } from 'next/types';
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from '@/lib/api/response';
import { generateToken, selectStorageNode } from '@/services/s3/storage';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED));
  }

  try {
    await initializeDbConnection();
    const { fileName, fileSize, chunkHashes } = req.body;

    // Check for existing chunks
    const existingChunks = await Chunk.find({
      hash: { $in: chunkHashes }
    }).select('hash storageNode');

    const existingHashes = new Set(existingChunks.map(chunk => chunk.hash));
    const missingChunks = chunkHashes.filter((hash: any) => !existingHashes.has(hash));

    // Select storage node for new chunks
    const node = await selectStorageNode();

    // Create new file record with unique ID
    const fileId = uuidv4();
    await File.create({
      fileId,
      fileName,
      fileSize,
      chunkHashes,
      status: 'pending',
      storageNode: node.id
    });

    // Generate pre-signed chunks with token for missing chunks
    const uploadChunks = await Promise.all(missingChunks.map(async (hash: string) => {
      const token = await generateToken(fileId, hash);
      return { hash, token };
    }));

    return formatApiResponse(res, { fileId, missingChunks, existingChunks: Array.from(existingHashes), uploadChunks })
  } catch (error) {
    console.error('Error in register:', error);
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while registering file chunks", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);