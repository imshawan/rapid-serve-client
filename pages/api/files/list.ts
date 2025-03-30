import { NextApiRequest, NextApiResponse } from "next"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { Types } from "mongoose"

/**
 * Handles the API request to list files.
 * 
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * 
 * @returns A formatted API response with the list of files.
 * 
 * The handler supports the following query parameters:
 * - `page` (number): The page number for pagination (default: 1).
 * - `limit` (number): The number of items per page (default: 10).
 * - `fields` (string): A comma-separated list of fields to include in the response.
 * - `search` (string): A search term to filter files by name.
 * - `type` (string): The type of files to filter (e.g., "file" or "folder").
 * - `loc` (string): The location filter (e.g., "trash" to include deleted files).
 * - `sort` (string): The sort direction ("ASC" or "DESC").
 * - `sortBy` (string): The field to sort by (e.g., "fileName", "fileSize", "createdAt", "updatedAt").
 * - `includeAll` (string): Whether to include all files, including those with a parentId (default: "false").
 * 
 * The handler performs the following steps:
 * 1. Validates the request method to ensure it is a GET request.
 * 2. Initializes the database connection.
 * 3. Parses and validates the query parameters.
 * 4. Constructs the query object based on the provided filters.
 * 5. Executes the query to fetch the list of files and the total count.
 * 6. Returns a paginated response with the list of files.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  await initializeDbConnection()

  const { page = 1, limit = 10, fields = "", search = "", type = "", loc = "", sort = "", sortBy = "", includeAll = "false" } = req.query,
    pageNumber = parseInt(page as string, 10) || 1,
    limitNumber = parseInt(limit as string, 10) || 10,
    fieldArray = (fields as string).split(",").filter(Boolean);

  const userId = String(req.user?.userId)
  const fieldSelection = (fieldArray.length ? fieldArray.join(" ") : "") + "-chunkHashes -storageNode"
  const query: any = { userId: new Types.ObjectId(userId), status: "complete" }
  const includeDeleted = loc === "trash"
  const sortDirection = sort?.toString().toUpperCase() === "ASC" ? 1 : -1
  const sortOptions: any = { updatedAt: sortDirection }

  if (sortBy && ["fileName", "fileSize", "createdAt", "updatedAt"].includes(String(sortBy))) {
    if (String(sortBy) === "fileName") {
      // Use collation for case-insensitive string sorting
      sortOptions.collation = { locale: "en", strength: 2 }
    }
    sortOptions[String(sortBy)] = sortDirection
    delete sortOptions.updatedAt
  }

  if ((!includeAll || String(includeAll).toLowerCase() != "true") && !includeDeleted) {
    query.parentId = null
  }

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
      .sort(sortOptions)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .set("includeDeleted", includeDeleted)
      .lean(),
    File.countDocuments(query)
  ])

  return formatApiResponse(res, paginate(files, total, limitNumber, pageNumber, String(req.url)))
}

export default authMiddleware(handler)