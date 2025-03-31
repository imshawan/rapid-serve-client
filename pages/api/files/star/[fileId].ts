import { NextApiRequest, NextApiResponse } from "next"
import { Types, Document } from "mongoose"
import _ from "lodash"
import { initializeDbConnection, withCache } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { File } from "@/lib/models/upload"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDbConnection(); // Ensure DB connection exists
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error connecting to the database", HttpStatus.INTERNAL_SERVER_ERROR));
  }

  switch (req.method) {
    case "POST":
      return await add(req, res);
    case "DELETE":
      return await remove(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED));
  }
}

async function add(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.user?.userId)

  try {
    const { fileId } = req.query

    return formatApiResponse(res, await manageStar(String(fileId), new Types.ObjectId(userId), true))
  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error)
    }
    return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Invalid request data", HttpStatus.BAD_REQUEST))
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const userId = String(req.user?.userId)

  try {
    const { fileId } = req.query

    return formatApiResponse(res, await manageStar(String(fileId), new Types.ObjectId(userId), false))

  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error)
    }
    return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Invalid request data", HttpStatus.BAD_REQUEST))
  }
}

async function manageStar(fileId: string, userId: Types.ObjectId, star: boolean = false) {
  const file = await withCache<File & Document | null>("file:" + fileId, async () => await File.findOne({ fileId, userId: new Types.ObjectId(userId) }))
    if (!file) {
      throw new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND)
    }

    file.isStarred = star
    await file.save()

    return { fileId, isStarred: star }
}

export default authMiddleware(handler)