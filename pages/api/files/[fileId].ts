import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { SoftDeleteDocument } from "@/lib/db/plugins/soft-delete"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { deleteChunkFromBucket } from "@/services/s3/storage"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeDbConnection(); // Ensure DB connection exists

  switch (req.method) {
    case "DELETE":
      return await deleteFile(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }
}

async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { [key: string]: string }
  const userId = String(req.user?.userId)

  try {
    // Get file record
    const file = await File.findOne({ fileId, userId }) as SoftDeleteDocument & File
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    await Promise.all([
      file.delete(),
      Chunk.deleteManySoft({
        hash: { $in: file.chunkHashes },
        userId
      })
    ])

    // let errors = 0, deleted = 0, total = file.chunkHashes.length;

    // As of now tested deletion peremanently from s3
    // await Promise.all(file.chunkHashes.map(async chunk => {
    //   try {
    //     await deleteChunkFromBucket(file.fileId, chunk, String(file.storageNode))
    //     deleted++
    //   } catch (e) {
    //     console.log(e)
    //     errors++
    //   }
    // }))

    return formatApiResponse(res, { fileId }, "File deleted successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in deleting file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);