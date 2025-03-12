import { Types } from "mongoose"
import { Recent } from "../models/recent"
import type { File } from "../models/upload"

const RECENTS_TRESHOLD = 30

export const addFileToRecents = async (file: File, userId: Types.ObjectId, ip?: string) => {
  const { fileId } = file
  const payload = {
    fileId,
    userId,
    fileName: file.fileName,
    lastAccessed: new Date(),
    fileSize: file.fileSize,
    type: file.type,
    isStarred: file.isStarred,
    status: file.status,
    ipAddress: ip
  }
  try {
    await Recent.findOneAndUpdate(
      { fileId, userId },
      {
        ...payload,
        $inc: { accessCount: 1 },
      },
      { upsert: true, new: true }
    )

    // Keep only the latest threshold records
    const totalFiles = await Recent.countDocuments({ userId })
    if (totalFiles > RECENTS_TRESHOLD) {
      const oldestFile = await Recent.find({ userId })
        .sort({ lastAccessed: 1 })
        .limit(1)
      if (oldestFile.length) {
        await Recent.deleteHard({ _id: new Types.ObjectId(String(oldestFile[0]._id)) })
      }
    }
  } catch (error) {
    console.error("Error updating recent files:", error)
  }
}
