import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { Shared } from "@/lib/models/shared"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeDbConnection()

  switch (req.method) {
    case "GET":
      return await get(req, res)

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
    const { fileId } = req.query
    const ownerId = new Types.ObjectId(req.user?.userId)

    try {
      const sharedFile = await Shared.findOne({ fileId, ownerId }).lean()
      if (!sharedFile) {
        return formatApiResponse(res, new ApiError(ErrorCode.NOT_FOUND, "File not found", HttpStatus.NOT_FOUND))
      }

      return formatApiResponse(res, {...sharedFile, sharableLink: "/file/share/" + sharedFile.shareId})
    } catch (error) {
      console.error("Error in fetching shared file:", error)
      return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error in fetching shared file", HttpStatus.INTERNAL_SERVER_ERROR))
    }
}

export default authMiddleware(handler)