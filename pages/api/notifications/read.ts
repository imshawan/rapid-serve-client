import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { Notification } from "@/lib/models/notification"


async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== "POST") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  const userId = String(req.user?.userId)
  try {
      await initializeDbConnection()
      await Notification.updateMany(
        { recipient: userId },
        { $set: { isRead: true } },
        { new: true }
      )

      return formatApiResponse(res, { message: "All notifications marked as read" })
  } catch (error) {
      if (error instanceof ApiError) {
        return formatApiResponse(res, error)
      }
      console.error("Error while marking read:", error)
      return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while marking read", HttpStatus.INTERNAL_SERVER_ERROR))
    }
}

export default authMiddleware(handler)