import { NextApiRequest, NextApiResponse } from "next"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { getSharedFilesCount, getSharedFilesPopulated } from "@/lib/user/shared"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 10, fields = "", search = "", filter = "" } = req.query,
    pageNumber = parseInt(page as string, 10),
    limitNumber = parseInt(limit as string, 10);

  const userId = String(req.user?.userId)
  const query: any = {}

  if (search) {
    query.fileName = { $regex: new RegExp(_.escapeRegExp(String(search)), "i") } // Case-insensitive search
  }
  if (filter === "shared-with-me") {
    query["sharedWith.userId"] = userId
  } else if (filter === "shared-by-me") {
    query.ownerId = userId
  } else {
    return formatApiResponse(res, paginate([], 0, limitNumber, pageNumber, String(req.url)))
  }

  try {
    await initializeDbConnection()

    const [sharedFiles, total] = await Promise.all([
      getSharedFilesPopulated({ query, page: pageNumber, limit: limitNumber, sharedWithMe: filter === "shared-with-me" }),
      getSharedFilesCount(query)
    ])

    return formatApiResponse(res, paginate(sharedFiles, total, limitNumber, pageNumber, String(req.url)))

  } catch (error) {
    console.error("Error while loading shared files:", error)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while loading shared files", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)