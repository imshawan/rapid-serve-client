import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import _ from "lodash"
import { v4 as uuidv4 } from "uuid"
import { initializeDbConnection } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { z } from "zod"
import { validateRequest } from "@/lib/api/validator"
import { File } from "@/lib/models/upload"

const chunkRegisterSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  parentId: z.string().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDbConnection()
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error connecting to the database", HttpStatus.INTERNAL_SERVER_ERROR), String(req.url));
  }

  switch (req.method) {
    case "POST":
      return await create(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }
}

/**
 * Creates a new folder in the database.
 *
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @returns A promise that resolves to the API response.
 *
 * @throws {ApiError} If the request validation fails or folder creation fails.
 */
async function create(req: NextApiRequest, res: NextApiResponse) {
  const userId = new Types.ObjectId(req.user?.userId)
  try {
    const data = await validateRequest(chunkRegisterSchema, req.body)
    const { fileName, parentId } = data
    const fileId = uuidv4()
    const file = await File.create({
      userId,
      fileId,
      parentId,
      fileName,
      fileSize: 0,
      type: "folder",
      status: "complete",
    })

    return formatApiResponse(res, file.toJSON())
  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error);
    }
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Failed to create the folder", HttpStatus.INTERNAL_SERVER_ERROR));
  }
}

export default authMiddleware(handler)