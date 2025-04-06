import _ from "lodash"
import { NextApiRequest, NextApiResponse } from "next"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { User } from "@/lib/models/user"
import { initializeDbConnection } from "@/lib/db"
import app from "@/config/app.json"
import { parseSizeToBytes } from "@/lib/utils/common"
import { Types } from "mongoose"
import { getAverageResponseTimeByUserId, getBandwidthUsage } from "@/lib/user/analytics/bandwidth"
import { getUserEngagementByUserId } from "@/lib/user/analytics/engagement"

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

    const [bandwidth, bandwidthLastWeek, 
      averageResponseTimeMs, averageResponseTimeMsLastweek,
      userEngagement, userEngagementLastWeek
    ] = await Promise.all([
      getBandwidthUsage(userId, "week"),
      getBandwidthUsage(userId, "last-week"),
      getAverageResponseTimeByUserId(userId, "week"),
      getAverageResponseTimeByUserId(userId, "last-week"),
      getUserEngagementByUserId(userId, "week"),
      getUserEngagementByUserId(userId, "last-week")
    ])

    const comparisons = {
      bandwidth: calculatePercentChange(bandwidth.total, bandwidthLastWeek.total),
      averageResponseTimeMs: calculatePercentChange(averageResponseTimeMs.averageResponseTimeMs, averageResponseTimeMsLastweek.averageResponseTimeMs),
      storageUsed: calculatePercentChange(user.storageUsed, 0), // Assuming 0 as the previous storage used for comparison
      userEngagement: calculatePercentChange(userEngagement.total, userEngagementLastWeek.total)
    }

    const payload = _.merge(user.subscription, {
      limit: parseSizeToBytes(app.maxStoragePerUser),
      used: user.storageUsed,
      bandwidth,
      ...averageResponseTimeMs,
      comparisons,
      userEngagement
    });

    formatApiResponse(res, payload)
  } catch (error: any) {
    console.error("Upload Error:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "Error occured while loading analytisc details", HttpStatus.BAD_REQUEST))
  }
}

function calculatePercentChange(current: number, previous: number): {
  type: "inc" | "dec";
  value: number;
} {
  if (previous === 0) {
    return {
      type: "inc",
      value: 100,
    };
  }

  const change = ((current - previous) / previous) * 100;
  return {
    type: change >= 0 ? "inc" : "dec",
    value: Math.abs(parseFloat(change.toFixed(1))),
  };
}


export default authMiddleware(handler)