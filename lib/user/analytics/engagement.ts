
import { Types } from "mongoose"
import { Bandwidth as BandwidthModel } from "@/lib/models/analytics/bandwidth"
import { getDateRangeFromDuration } from "@/lib/utils/analytics"

export async function getUserEngagementByUserId(userId: string | Types.ObjectId, duration: Duration): Promise<UserEngagement> {
  const { startDate, endDate } = getDateRangeFromDuration(duration)
  const user = typeof userId === 'string' ? new Types.ObjectId(userId) : userId

  const result = await BandwidthModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        ownerId: user,
        callerId: { $ne: user }
      },
    },
    // First group by callerId + fileId to ensure uniqueness
    {
      $group: {
        _id: {
          callerId: "$callerId",
          fileId: "$fileId",
        },
        type: { $first: "$type" },
      },
    },
    // Then group by callerId and count unique file accesses per type
    {
      $group: {
        _id: "$_id.callerId",
        download: {
          $sum: {
            $cond: [{ $eq: ["$type", "download"] }, 1, 0],
          },
        },
        preview: {
          $sum: {
            $cond: [{ $eq: ["$type", "preview"] }, 1, 0],
          },
        },
        total: { $sum: 1 }, // total unique file accesses
      },
    },
    {
      $project: { _id: 0 },
    },
  ])

  return result.length > 0 ? result[0] : { download: 0, preview: 0, total: 0 }
}