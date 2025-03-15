import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { SoftDeleteDocument } from "@/lib/db/plugins/soft-delete"
import { File, Chunk } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { incrementStorageUsageCount } from "@/lib/user"
import { Recent } from "@/lib/models/recent"
import { Shared } from "@/lib/models/shared"
import { Types } from "mongoose"
import { User } from "@/lib/models/user"

/**
 * Handles the restoration of a file or folder from the trash.
 * 
 * This function is an API route handler for restoring files or folders that have been marked as deleted.
 * It supports only the PATCH method and performs various checks and operations to ensure the file or folder
 * is restored correctly, including restoring parent folders and child files if necessary.
 * 
 * @param req - The HTTP request object, which includes the method, query parameters, and user information.
 * @param res - The HTTP response object used to send the response back to the client.
 * 
 * @returns A promise that resolves to the API response indicating the result of the restore operation.
 * 
 * @throws Will return an error response if the request method is not PATCH, if the file is not found,
 *         if the user is not the owner of the file, or if there is an internal server error during the restore process.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "PATCH") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const { fileId } = req.query as { [key: string]: string }
  const userId = new Types.ObjectId(req.user?.userId)

  try {
    await initializeDbConnection()

    const file = await File.findOneSoftDeleted({ fileId })
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "File not found", HttpStatus.BAD_REQUEST))
    }
    if (file.userId.toString() !== userId.toString()) {
      return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "Cannot restore file since you are not owner", HttpStatus.FORBIDDEN))
    }

    const fileIds = [file.fileId], chunkHashes = file.chunkHashes;
    let fileSizes = file.fileSize;

    if (file.parentId) {

      /**
       * Recursively restores parent folders if they are marked as deleted.
       *
       * @param parentId - The ID of the parent folder to restore. If null, the function returns immediately.
       * @param userId - The ID of the user performing the restore operation.
       * @returns A promise that resolves when the parent folders have been restored.
       */
      const restoreParentFolders = async (parentId: string | null, userId: Types.ObjectId) => {
        if (!parentId) return;

        const parentFolder = await File.findOne<SoftDeleteDocument & File>({
          fileId: parentId,
          userId,
          type: "folder"
        }).setOptions({ includeDeleted: true })

        if (parentFolder && parentFolder.isDeleted) {
          await parentFolder.restore();
          if (parentFolder.parentId) {
            await restoreParentFolders(parentFolder.parentId, userId);
          }
        }
      }

      await restoreParentFolders(file.parentId, userId);
    }

    if (file.type === "folder") {
      const getAllChildren = async (parentId: string): Promise<(SoftDeleteDocument & File)[]> => {
        const children = await File.find({ parentId, userId }) as (SoftDeleteDocument & File)[]
        const grandChildren = await Promise.all(
          children.map(child => getAllChildren(child.fileId))
        )
        return [...children, ...grandChildren.flat()]
      }

      const filesToRestore = [file, ...(await getAllChildren(file.fileId))]
      const fileIdsToRestore = filesToRestore.map(file => file.fileId)
      const chunkHashesToRestore = filesToRestore.flatMap(file => file.chunkHashes)
      const fileSizeAdded = filesToRestore.reduce((total, file) => total + file.fileSize, 0)

      fileIds.push(...fileIdsToRestore)
      chunkHashes.push(...chunkHashesToRestore)
      fileSizes += fileSizeAdded
    }
    
    const promises: Promise<any>[] = [
      File.restoreMany({ fileId: { $in: fileIds } }),
      Chunk.restoreMany({ hash: { $in: chunkHashes }, userId }),
      Recent.restoreMany({ fileId }),
      Shared.restoreMany({ fileId })
    ]

    if (fileSizes) {
      promises.push(incrementStorageUsageCount(String(userId), fileSizes))
    } else {
      promises.push(User.findById(userId).select("storageUsed"))
    }

    const results = await Promise.all(promises)
    const storageUsed = results[results.length - 1]?.storageUsed || 0

    return formatApiResponse(res, { fileId, used: storageUsed, parentId: file.parentId }, "File restored successfully", HttpStatus.OK)

  } catch (error) {
    console.error("Error in restoring file:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in restoring file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);