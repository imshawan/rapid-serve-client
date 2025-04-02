import { Bandwidth } from "@/lib/models/analytics/bandwidth"
import type { File } from "../../models/upload"
import { NextApiRequest } from "next/types"
import { getIpAddress, getUserAgent } from "../../utils/network"
import { Types } from "mongoose"

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
  type: "upload" | "download" | "preview"
) => {
  try {
    if (!file.fileId || !file.userId) {
      console.warn("trackHttpBandwidth: Missing fileId or userId", { file, type })
      return
    }

    const fileSize = (file.fileSize || file.size) ?? 0 // Ensure it’s a number
    const callerId = typeof file.callerId === 'string' ? new Types.ObjectId(file.callerId) : file.callerId

    await Bandwidth.create({
      fileId: file.fileId,
      ownerId: file.userId,
      callerId,
      type,
      resourceType: file.type,
      size: fileSize,
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
export async function getBandwidthUsage(callerId: string | Types.ObjectId, duration: "week" | "month" | "year") {
  const now = new Date();
  const callerIdparsed = typeof callerId === 'string' ? new Types.ObjectId(callerId) : callerId
  let startDate = new Date();

  switch (duration) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const result = await Bandwidth.aggregate([
    {
      $match: {
        callerId: callerIdparsed,
        createdAt: { $gte: startDate, $lte: now },
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
  ]);

  return result.length > 0 ? result[0] : { upload: 0, download: 0, preview: 0, total: 0 };
}
