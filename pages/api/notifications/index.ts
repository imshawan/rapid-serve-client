import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { Notification } from "@/lib/models/notification"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDbConnection()
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error connecting to the database", HttpStatus.INTERNAL_SERVER_ERROR), String(req.url));
  }

  switch (req.method) {
    case "GET":
      return await get(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const userId = new Types.ObjectId(req.user?.userId)
  try {
    const { page = 1, limit = 10, sort = "", sortBy = "" } = req.query,
      pageNumber = parseInt(page as string, 10),
      limitNumber = parseInt(limit as string, 10);

    const sortDirection = sort?.toString().toUpperCase() === "ASC" ? 1 : -1
    const sortOptions: any = { updatedAt: sortDirection }
    const query: any = { recipient: new Types.ObjectId(userId) }

    if (sortBy && ["createdAt", "updatedAt"].includes(String(sortBy))) {
      sortOptions[String(sortBy)] = sortDirection
      delete sortOptions.updatedAt
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("creator", "name profilePicture")
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ ...query, isRead: false })
    ])

    const paginated = paginate(notifications, total, limitNumber, pageNumber, String(req.url))

    return formatApiResponse(res, {paginated, unreadCount})

  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error);
    }
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Failed to load notifications", HttpStatus.INTERNAL_SERVER_ERROR));
  }
}

export default authMiddleware(handler)