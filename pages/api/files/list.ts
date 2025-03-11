import { NextApiRequest, NextApiResponse } from "next"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { Types } from "mongoose"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  await initializeDbConnection()

  const { page = 1, limit = 10, fields = "", search= "", type = "", loc = "" } = req.query,
    pageNumber = parseInt(page as string, 10),
    limitNumber = parseInt(limit as string, 10),
    fieldArray = (fields as string).split(",").filter(Boolean);

  const userId = String(req.user?.userId)
  const fieldSelection = (fieldArray.length ? fieldArray.join(" ") : "") + "-chunkHashes -storageNode"
  const query: any = { userId: new Types.ObjectId(userId), status: "complete" }
  const includeDeleted = loc === "trash"

  if (search) {
    query.fileName = { $regex: new RegExp(_.escapeRegExp(String(search)), "i") } // Case-insensitive search
  }
  
  if (loc === "trash") {
    query.isDeleted = true
  }

  if (["file", "folder"].includes(String(type).toLowerCase())) {
    query.type = String(type).toLowerCase()
  }

  const [files, total] = await Promise.all([
    File.find(query)
      .select(fieldSelection)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .set("includeDeleted", includeDeleted)
      .lean(),
    File.countDocuments()
  ])

  return formatApiResponse(res, paginate(files, total, limitNumber, pageNumber, String(req.url)))
}

export default authMiddleware(handler)