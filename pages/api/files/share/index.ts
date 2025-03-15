import { z } from "zod";
import { v4 as uuidv4 } from "uuid"
import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection, withCache } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { Document } from "mongoose"
import { User } from "@/lib/models/user"
import { Shared } from "@/lib/models/shared";

const shareSchema = z.object({
  fileId: z.string().min(36, "fileId is required and must be valid"),
  email: z.string().email().optional(),
  password: z.string().min(1, "Password cannot be empty").optional(),
  accessLevel: z.enum(["viewer", "editor", "full"]).optional(),
  expirationDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.user?.userId)

  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()

    const { fileId, email, password, accessLevel, expirationDate } = shareSchema.parse(req.body)
    const updateData: any = { fileId };
    const file = await withCache<File & Document | null>("file:" + fileId, async () => await File.findOne({ fileId }))
    if (!file) {
      return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
    }
    const existingSf = await withCache<Shared | null>(`shared:${fileId}:${userId}`, async () => await Shared.findOne({ fileId, ownerId: userId }))

    if (email) {
      const user = await withCache<User | null>("user:" + email, async () => await User.findOne({ email }))
      if (!user) {
        return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "User not found", HttpStatus.NOT_FOUND))
      }

      updateData.$addToSet = {
        sharedWith: {
          userId: user._id,
          accessLevel: accessLevel || "viewer",
        },
      }
    }
    if (password && (!existingSf || !existingSf.isPasswordProtected)) {
      updateData.isPasswordProtected = true
      updateData.password = password

      // If expiration date is provided else no expiry
      if (expirationDate) {
        updateData.expirationDate = new Date(expirationDate)
      }
    }
    if (["editor", "full"].includes(String(accessLevel)) && !password) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Password is required for edit and full access levels", HttpStatus.BAD_REQUEST))
    }

    updateData.linkAccessLevel = accessLevel || "viewer"; // Password-protected files default have viewer access.
    updateData.shareId = uuidv4()
    updateData.linkShared = true
    updateData.fileName = file.fileName

    const sharedFile = await Shared.findOneAndUpdate(
      { fileId, ownerId: userId },
      updateData,
      { upsert: true, new: true }
    );

    let link = "/file/share/" + (sharedFile.shareId || existingSf?.shareId)

    return formatApiResponse(res, { fileId, shareableLink: link }, "File shared", HttpStatus.OK)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return formatApiResponse(res, new ApiError(ErrorCode.VALIDATION_ERROR, error.message, HttpStatus.BAD_REQUEST, error.errors))
    }
    console.error("Error in sharing file:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in sharing file", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler);