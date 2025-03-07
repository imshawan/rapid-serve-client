import { NextApiRequest, NextApiResponse } from "next"
import { Types } from "mongoose"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { RecentFile } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initializeDbConnection(); // Ensure DB connection exists
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error connecting to the database", HttpStatus.INTERNAL_SERVER_ERROR), String(req.url));
  }

  switch (req.method) {
    case "GET":
      return await get(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { page = 1, limit = 10, fields = "", search = "" } = req.query,
    pageNumber = parseInt(page as string, 10),
    limitNumber = parseInt(limit as string, 10),
    fieldArray = (fields as string).split(",").filter(Boolean);

  const userId = new Types.ObjectId(req.user?.userId)
  const fieldSelection = (fieldArray.length ? fieldArray.join(" ") : "") + "-chunkHashes -storageNode"
  const query: any = { userId }

  if (search) {
    query.fileName = { $regex: new RegExp(_.escapeRegExp(String(search)), "i") } // Case-insensitive search
  }

  const [files, total] = await Promise.all([
    RecentFile.find(query)
      .select(fieldSelection)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),
    RecentFile.countDocuments()
  ])

  return formatApiResponse(res, paginate(files, total, limitNumber, pageNumber, String(req.url)))
}

export default authMiddleware(handler)