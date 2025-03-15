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
 * Handles the restoration of all soft-deleted files for a user.
 * 
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * 
 * @returns A formatted API response indicating the result of the restoration process.
 * 
 * The handler performs the following steps:
 * 1. Checks if the request method is "PATCH". If not, responds with a "Method Not Allowed" error.
 * 2. Extracts the user ID from the request object.
 * 3. Initializes the database connection.
 * 4. Retrieves all soft-deleted files for the user.
 * 5. If no files are found, responds with a "Nothing to restore" message.
 * 6. Collects file IDs and calculates the total occupied size of the files.
 * 7. Restores the files and associated chunks, recent files, and shared files.
 * 8. Updates the user's storage usage if necessary.
 * 9. Responds with the list of restored file IDs and the updated storage usage.
 * 
 * If an error occurs during the process, logs the error and responds with an "Internal Server Error" message.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "PATCH") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const userId = new Types.ObjectId(req.user?.userId)

  try {
    await initializeDbConnection()

    const files = await File.findAllSoftDeleted({ userId })
    if (!files.length) {
      return formatApiResponse(res, new ApiError(ErrorCode.NO_CONTENT, "Nothing to restore", HttpStatus.NO_CONTENT))
    }
    const fileIds = files.map(e => e.fileId)
    const occupiedSize = files.reduce((prev, curr) => (prev + curr.fileSize), 0)

    const promises: Promise<any>[] = [
      File.restoreMany({ fileId: { $in: fileIds } }),
      Chunk.restoreMany({ hash: { $in: files.flatMap(e => e.chunkHashes) }, userId }),
      Recent.restoreMany({ fileId: { $in: fileIds } }),
      Shared.restoreMany({ fileId: { $in: fileIds } })
    ]

    if (occupiedSize) {
      promises.push(incrementStorageUsageCount(String(userId), occupiedSize))
    } else {
      promises.push(User.findById(userId).select("storageUsed"))
    }

    const results = await Promise.all(promises)
    const storageUsed = results[results.length - 1]?.storageUsed || 0

    return formatApiResponse(res, { files: fileIds, used: storageUsed }, "Files restored successfully", HttpStatus.OK)

  } catch (error) {
    console.error("Error in restoring files:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in restoring files", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);