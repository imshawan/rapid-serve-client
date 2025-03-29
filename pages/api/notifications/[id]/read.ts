import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import { initializeDbConnection } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { Notification } from "@/lib/models/notification"

async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
      await initializeDbConnection()
      const userId = String(req.user?.userId)
      const { id } = req.query
      if (!Types.ObjectId.isValid(String(id)))  {
        throw new ApiError(ErrorCode.BAD_REQUEST, "Invalid notification id", HttpStatus.BAD_REQUEST)
      }

      const notificationId = new Types.ObjectId(String(id))
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { $set: { isRead: true } },
        { new: true }
      )
      if (!notification) {
        throw new ApiError(ErrorCode.NOT_FOUND, "No such notification", HttpStatus.NOT_FOUND)
      }

      return formatApiResponse(res, { message: "Notification marked as read" })
  } catch (error) {
      if (error instanceof ApiError) {
        return formatApiResponse(res, error)
      }
      console.error("Error while marking read:", error)
      return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while marking read", HttpStatus.INTERNAL_SERVER_ERROR))
    }
}

export default authMiddleware(handler)