import { NextApiRequest, NextApiResponse } from "next"
import _ from "lodash"
import { initializeDbConnection } from "@/lib/db"
import { File } from "@/lib/models/upload"
import { authMiddleware } from "@/lib/middlewares"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus, paginate } from "@/lib/api/response"
import { Types } from "mongoose"

/**
 * Handles the API request for listing files.
 *
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 *
 * @remarks
 * This handler supports only the `GET` method. It initializes a database connection
 * and retrieves a paginated list of files based on the provided query parameters.
 *
 * @queryparam page - The page number for pagination (default: 1).
 * @queryparam limit - The number of items per page (default: 10).
 * @queryparam fields - A comma-separated list of fields to include in the response.
 * @queryparam search - A search term to filter files by name (case-insensitive).
 * @queryparam type - The type of files to filter (`file` or `folder`).
 * @queryparam loc - The location filter (`trash` for deleted files).
 * @queryparam sort - The sort direction (`ASC` or `DESC`, default: `DESC`).
 * @queryparam sortBy - The field to sort by (`fileName`, `fileSize`, `createdAt`, or `updatedAt`).
 * @queryparam includeAll - Whether to include all files, including those with a parent (default: `false`).
 * @queryparam starred - Whether to filter for starred files (default: `false`).
 *
 * @throws {ApiError} If the request method is not `GET`.
 * @throws {ApiError} If there is an error while fetching files from the database.
 *
 * @returns A paginated list of files along with metadata such as total count and pagination details.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED))
  }

  await initializeDbConnection()

  const { page = 1, limit = 10, fields = "", search = "", type = "", loc = "", sort = "", sortBy = "", includeAll = "false", starred = "false" } = req.query,
    pageNumber = parseInt(page as string, 10) || 1,
    limitNumber = parseInt(limit as string, 10) || 10,
    fieldArray = (fields as string).split(",").filter(Boolean);

  try {
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

    if (starred && String(starred).toLowerCase() === "true") {
      query.isStarred = true
      delete query.parentId
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
  } catch (err) {
    console.error("Error while listing files", err)
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Failed to load files", HttpStatus.INTERNAL_SERVER_ERROR))
  }
}

export default authMiddleware(handler)