import { NextApiRequest, NextApiResponse } from "next"
import { initializeDbConnection } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  await initializeDbConnection()

  const { page = 1, limit = 10, fields = "", search= "" } = req.query,
    pageNumber = parseInt(page as string, 10),
    limitNumber = parseInt(limit as string, 10),
    fieldArray = (fields as string).split(",").filter(Boolean);

  const userId = String(req.user?.userId)
  const fieldSelection = (fieldArray.length ? fieldArray.join(" ") : "") + "-chunkHashes -storageNode"
  const query: any = { userId, status: "complete" }

  if (search) {
    query.fileName = { $regex: new RegExp(search as string, "i") } // Case-insensitive search
  }

  const [files, total] = await Promise.all([
    File.find(query)
      .select(fieldSelection)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(),
    File.countDocuments()
  ])

  return formatApiResponse(res, paginate(files, total, limitNumber, pageNumber, String(req.url)))
}

export default authMiddleware(handler)