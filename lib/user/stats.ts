import { Types } from "mongoose"
import { File } from "../models/upload"

export const getTrashStatistics = async (userId: Types.ObjectId): Promise<Statistics.Trash> => {
  const trashStats = await File.aggregate([
    { $match: { userId, isDeleted: true } }, // Match deleted files/folders for the user
    {
      $group: {
        _id: null,
        items: { $sum: 1 }, // Count total files
        size: { $sum: "$fileSize" } // Sum fileSize
      }
    },
    {
      $project: {
        _id: 0,
        items: { $ifNull: ["$items", 0] }, // Default 0 if no files
        size: { $ifNull: ["$size", 0] } // Default 0 if no files
      }
    }
  ]).exec()
  if (!trashStats.length) {
    return {
      items: 0,
      size: 0
    }
  }

  return trashStats[0]
}
