import { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection, withCache } from "@/lib/db";
import { User } from "@/lib/models/user";
import { authMiddleware } from "@/lib/middlewares";
import { merge } from "lodash";
import { ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response";
import { ApiError } from "@/lib/api/response"

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await initializeDbConnection(); // Ensure DB connection exists

  switch (req.method) {
    case "PUT":
      return await update(req, res);

    case "GET":
      return await get(req, res);

    default:
      return formatApiResponse(res, new ApiError(ErrorCode.METHOD_NOT_ALLOWED, "Method Not Allowed", HttpStatus.METHOD_NOT_ALLOWED), String(req.url));
  }
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.user?.userId;
    const user = await withCache(String(userId).trim(), async () => await User.findById(userId).select("-password"));
    if (!user) {
      return formatApiResponse(res, new Error("User not found"), String(req.url));
    }
    return formatApiResponse(res, user, String(req.url));
  } catch (error) {
    return formatApiResponse(res, new Error("Error while fetching the user data"), String(req.url));
  }
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.user?.userId;

    // Fetch current user data
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return formatApiResponse(res, new ApiError(ErrorCode.BAD_REQUEST, "User not found", HttpStatus.BAD_REQUEST), String(req.url));
    }

    // Allowed top-level fields
    const allowedFields = ["email", "name", "role", "profilePicture", "storageUsed", "storageLimit", "isEmailVerified", "lastLogin", "preferences", "security", "subscription", "devices"];

    // Allowed nested fields
    const allowedNestedFields: Record<string, string[]> = {
      preferences: ["theme", "language", "timezone", "notifications"],
      security: ["twoFactorEnabled", "lastPasswordChange", "failedLoginAttempts", "publicLinks", "deviceHistory", "activityLog"],
      subscription: ["plan", "status", "autoRenew"],
      devices: ["id", "name", "type", "lastActive", "ipAddress", "userAgent"],
    };

    // Extract only valid fields
    const updates = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((acc, key) => {
        if (typeof req.body[key] === "object" && key in allowedNestedFields) {
          acc[key] = Object.keys(req.body[key])
            .filter((subKey) => allowedNestedFields[key as keyof typeof allowedNestedFields].includes(subKey))
            .reduce((subAcc, subKey) => {
              subAcc[subKey] = req.body[key][subKey];
              return subAcc;
            }, {} as Record<string, any>);
        } else {
          acc[key] = req.body[key];
        }
        return acc;
      }, {} as Record<string, any>);

    // Deep merge with existing user data
    const mergedUserData = merge(existingUser.toObject(), updates);

    if (req.body.hasOwnProperty("profilePicture")) {
      // Handle profile picture separately because we might want to not have a picture
      mergedUserData.profilePicture = req.body.profilePicture;
    }
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: mergedUserData },
      { new: true, runValidators: true }
    ).select("-password");

    return formatApiResponse(res, { message: "Profile updated successfully", user: updatedUser }, String(req.url));
  } catch (error) {
    return formatApiResponse(res, new ApiError(ErrorCode.INTERNAL_ERROR, "Error while updating the user data", HttpStatus.INTERNAL_SERVER_ERROR), String(req.url));
  }
}

export default authMiddleware(handler);