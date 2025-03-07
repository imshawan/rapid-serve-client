import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { Recent } from "@/lib/models/recent"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDbConnection(); // Ensure DB connection exists
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error connecting to the database", HttpStatus.INTERNAL_SERVER_ERROR), String(req.url));
  }

  switch (req.method) {
    case "DELETE":
      return await remove(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const fileId = req.query.fileId as string
  const userId = new Types.ObjectId(req.user?.userId)

  const file = await Recent.findOneAndDelete({ fileId, userId })

  if (!file) {
    return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND));
  }

  return formatApiResponse(res, { message: "File removed from recents" });
}

export default authMiddleware(handler)