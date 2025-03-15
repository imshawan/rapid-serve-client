import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { SoftDeleteDocument } from "@/lib/db/plugins/soft-delete"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { decrementStorageUsageCount } from "@/lib/user"
import { Document, Types } from "mongoose"
import { Recent } from "@/lib/models/recent"
import { Shared } from "@/lib/models/shared"
import { User } from "@/lib/models/user"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeDbConnection(); // Ensure DB connection exists

  switch (req.method) {
    case "DELETE":
      return await deleteFile(req, res);

    case "PATCH":
      return await updateName(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }
}

async function updateName(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { [key: string]: string }
  const userId = String(req.user?.userId)
  const { fileName } = req.body as { fileName: string }

  if (!fileName) {
    return formatApiResponse(res, new ApiError(ErrorCode.NO_CONTENT, "Nothing to update", HttpStatus.NO_CONTENT))
  }

  try {
    const file = await File.findOne({ fileId, userId }) as File & Document
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }

    file.fileName = fileName
    await Promise.all([
      file.save(),
      Recent.updateMany({ fileId }, { fileName }),
      Shared.updateMany({ fileId }, { fileName })
    ])

    return formatApiResponse(res, { fileId, fileName }, "File name updated successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in updating file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

/**
 * Deletes a file or folder and its associated data from the database.
 * 
 * @param req - The Next.js API request object, containing the file ID in the query and user information.
 * @param res - The Next.js API response object.
 * 
 * @returns A formatted API response indicating the result of the delete operation.
 * 
 * The function performs the following steps:
 * 1. Retrieves the file record based on the provided file ID.
 * 2. Checks if the file exists and if the user is the owner of the file.
 * 3. If the file is a folder, recursively retrieves all child files and prepares them for deletion.
 * 4. Deletes the file(s) and their associated data (chunks, recent entries, shared entries).
 * 5. Updates the user's storage usage count if necessary.
 * 6. Returns a success response with the file ID and updated storage usage, or an error response if an error occurs.
 * 
 * @throws {ApiError} If the file is not found, the user is not the owner, or an internal error occurs during deletion.
 */
async function deleteFile(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { [key: string]: string }
  const userId = new Types.ObjectId(req.user?.userId)

  try {
    // Get file record
    const file = await File.findOne({ fileId }) as SoftDeleteDocument & File
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }
    if (file.userId.toString() !== userId.toString()) {
      return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "Cannot delete file since you are not owner", HttpStatus.FORBIDDEN))
    }

    const deletePromises: Promise<any>[] = []
    let toBeFreed = file.fileSize

    if (file.type === "folder") {
      // Get all child files recursively
      const getAllChildren = async (parentId: string): Promise<(SoftDeleteDocument & File)[]> => {
        const children = await File.find({ parentId, userId }) as (SoftDeleteDocument & File)[]
        const grandChildren = await Promise.all(
          children.map(child => getAllChildren(child.fileId))
        )
        return [...children, ...grandChildren.flat()]
      }

      // Get all files to delete
      const filesToDelete = [file, ...(await getAllChildren(file.fileId))]
      const fileIdsToDelete = filesToDelete.map(file => file.fileId)
      const chunkHashesToDelete = filesToDelete.flatMap(file => file.chunkHashes)
      toBeFreed = filesToDelete.reduce((total, file) => total + file.fileSize, 0)

      // Delete all files and their associated data
      const deleteAllPromises = [
        File.deleteManySoft({ fileId: { $in: fileIdsToDelete } }),
        Chunk.deleteManySoft({ hash: { $in: chunkHashesToDelete } }),
        Recent.deleteManySoft({ fileId: { $in: fileIdsToDelete } }),
        Shared.deleteManySoft({ fileId: { $in: fileIdsToDelete } })
      ]

      deletePromises.push(...deleteAllPromises)
      
    } else {
      deletePromises.push(...[
        file.delete(),
        Chunk.deleteManySoft({
          hash: { $in: file.chunkHashes },
          userId
        }),
        Recent.deleteManySoft({ fileId }),
        Shared.deleteManySoft({ fileId })
      ])
    }

    if (toBeFreed) {
      deletePromises.push(decrementStorageUsageCount(String(userId), toBeFreed))
    } else {
      deletePromises.push(User.findById(userId).select("storageUsed"))
    }

    const results = await Promise.all(deletePromises)
    const used = results[results.length - 1]?.storageUsed || 0

    return formatApiResponse(res, { fileId, used }, "File deleted successfully", HttpStatus.OK)

  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in deleting file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);