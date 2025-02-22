import { NextRequest, NextResponse } from "next/server";
import { User } from "../models/user";
import { initializeDbConnection, withCache } from "../db";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "../api/response";
import { verifyToken, generateToken } from "../auth/jwt-utils";

export async function getUserFromToken(token: string) {
  try {
    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded !== "object" || !decoded.userId) return null;

    await initializeDbConnection();

    // Use cache for user data
    return await withCache(
      `${decoded.userId}`,
      async () => {
        const user = await User.findById<IUser>(decoded.userId).select("-password");
        return user;
      },
      3600 // Cache for 1 hour
    );
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}

export async function validateAuthToken(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new Error("Authentication required")
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw new Error("Invalid or expired token")
  }

  return user;
}

export function authMiddleware(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startDate = Date.now();
    try {
      const token = req.cookies['token']
      if (!token) return formatApiResponse(res, new ApiError(ErrorCode.FORBIDDEN, "Authentication required", HttpStatus.FORBIDDEN), String(req.url), startDate);

      const decoded = await verifyToken(token)
      if (!decoded) return formatApiResponse(res, new ApiError(ErrorCode.UNAUTHORIZED, "Invalid or expired token", HttpStatus.UNAUTHORIZED), String(req.url), startDate);

      // Attach user info to request object
      req.user = decoded;

      return handler(req, res); // Proceed to the actual API handler
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      return formatApiResponse(res, error as Error, String(req.url), startDate, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}