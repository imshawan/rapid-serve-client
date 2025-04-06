import { Bandwidth as BandwidthModel } from "@/lib/models/analytics/bandwidth"
import type { File } from "../../models/upload"
import { NextApiRequest } from "next/types"
import { getIpAddress, getUserAgent } from "../../utils/network"
import { Types } from "mongoose"
import { getDateRangeFromDuration } from "@/lib/utils/analytics"

/**
 * Tracks HTTP bandwidth usage for a file operation such as upload, download, or preview.
 *
 * @param file - Partial file object containing details about the file and operation.
 * @param file.fileId - The unique identifier of the file (required).
 * @param file.userId - The unique identifier of the user who owns the file (required).
 * @param file.chunkId - The optional identifier of the file chunk being processed.
 * @param file.size - The size of the file or chunk in bytes (optional).
 * @param file.callerId - The identifier of the caller, either as a string or ObjectId.
 * @param req - The Next.js API request object.
 * @param type - The type of operation being tracked ("upload", "download", or "preview").
 *
 * @returns A promise that resolves when the bandwidth usage is successfully tracked.
 *
 * @throws Logs an error if the bandwidth tracking operation fails.
 */
export const trackHttpBandwidth = async (
  file: Partial<File> & { chunkId?: Types.ObjectId, size?: number, callerId: Types.ObjectId | string },
  req: NextApiRequest,
  type: "upload" | "download" | "preview",
  timeElapsed: number
) => {
  try {
    if (!file.fileId || !file.userId) {
      console.warn("trackHttpBandwidth: Missing fileId or userId", { file, type })
      return
    }

    const fileSize = (file.fileSize || file.size) ?? 0 // Ensure it’s a number
    const callerId = typeof file.callerId === 'string' ? new Types.ObjectId(file.callerId) : file.callerId

    await BandwidthModel.create({
      fileId: file.fileId,
      ownerId: file.userId,
      callerId,
      type,
      resourceType: file.type,
      size: fileSize,
      requestDuration: timeElapsed ?? 0,
      chunk: file.chunkId || null,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    })
  } catch (error) {
    console.error("trackHttpBandwidth: Failed to save bandwidth usage", error)
  }
}

/**
 * Retrieves the bandwidth usage for a specific caller within a given time duration.
 *
 * @param callerId - The ID of the caller, which can be a string or a `Types.ObjectId`.
 * @param duration - The time duration for which to calculate bandwidth usage. 
 *                   It can be one of the following values: "week", "month", or "year".
 * 
 * @returns A promise that resolves to an object containing the following properties:
 *          - `upload`: Total size of uploaded data in the specified duration.
 *          - `download`: Total size of downloaded data in the specified duration.
 *          - `preview`: Total size of previewed data in the specified duration.
 *          - `total`: Total size of all data (upload, download, preview) in the specified duration.
 *          If no data is found, the returned object will have all properties set to 0.
 *
 * @throws Will throw an error if the aggregation query fails.
 */
export async function getBandwidthUsage(callerId: string | Types.ObjectId, duration: Duration): Promise<Bandwidth> {
  const callerIdparsed = typeof callerId === 'string' ? new Types.ObjectId(callerId) : callerId
  const { startDate, endDate } = getDateRangeFromDuration(duration)

  const result = await BandwidthModel.aggregate([
    {
      $match: {
        callerId: callerIdparsed,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$callerId",
        upload: {
          $sum: {
            $cond: [{ $eq: ["$type", "upload"] }, "$size", 0],
          },
        },
        download: {
          $sum: {
            $cond: [{ $eq: ["$type", "download"] }, "$size", 0],
          },
        },
        preview: {
          $sum: {
            $cond: [{ $eq: ["$type", "preview"] }, "$size", 0],
          },
        },
        total: { $sum: "$size" },
      },
    },
    {
      $project: { _id: 0 },
    }
  ])

  return result.length > 0 ? result[0] : { upload: 0, download: 0, preview: 0, total: 0 }
}

export async function getAverageResponseTimeByUserId(userId: string | Types.ObjectId, duration: Duration) {
  const { startDate, endDate } = getDateRangeFromDuration(duration)
  const user = typeof userId === 'string' ? new Types.ObjectId(userId) : userId

  const result = await BandwidthModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        $or: [{ ownerId: user }, { callerId: user }],
      },
    },
    {
      $group: {
        _id: null, // No grouping
        averageResponseTimeMs: { $avg: "$requestDuration" },
        requestCount: { $sum: 1 },
      },
    },
  ])

  if (result.length === 0) {
    return {
      averageResponseTimeMs: 0,
      totalRequests: 0,
    }
  }

  return {
    averageResponseTimeMs: Math.round(result[0].averageResponseTimeMs),
    totalRequests: result[0].requestCount,
  }
}