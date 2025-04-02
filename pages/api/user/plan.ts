import _ from "lodash"
import { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { User } from "@/lib/models/user"
import { initializeDbConnection } from "@/lib/db"
import app from "@/config/app.json"
import { parseSizeToBytes } from "@/lib/utils/common"
import { Types } from "mongoose"
import { getTrashStatistics } from "@/lib/user/stats"
import { getBandwidthUsage } from "@/lib/user/analytics/bandwidth"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  try {
    await initializeDbConnection()
    const userId = new Types.ObjectId(req.user?.userId)

    const user = await User.findById<IUser>(userId).select("subscription storageUsed").lean()
    if (!user) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "User not found", HttpStatus.BAD_REQUEST))
    }

    const [trash, bandwidth] = await Promise.all([
      getTrashStatistics(userId),
      getBandwidthUsage(userId, "month")
    ])
    const payload = _.merge(
      user.subscription,
      { limit: parseSizeToBytes(app.maxStoragePerUser), trash, used: user.storageUsed, bandwidth },
    )

    formatApiResponse(res, payload)
  } catch (error: any) {
    console.error("Upload Error:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Error occured while loading plan details", HttpStatus.BAD_REQUEST))
  }
}

export default authMiddleware(handler)