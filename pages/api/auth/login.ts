import ms from "ms"
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from '@/lib/models/user';
import { generateToken } from '@/lib/auth/jwt-utils';
import { formatApiResponse, ApiError, HttpStatus, ErrorCode } from '@/lib/api/response';
import { validateRequest } from '@/lib/api/validator';
import { z } from 'zod';
import { initializeDbConnection } from "@/lib/db";
import { isProduction } from "@/lib/config";
import app from "@/config/app.json";
import { parseSizeToBytes } from "@/lib/utils/common";

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = await validateRequest(loginSchema, await req.body);
    const { email, password } = data;

    await initializeDbConnection();

    // Find user with all the fields including password
    const user = await User.findOne({ email }).setOptions({ includeAll: true }) as IUser;
    if (!user) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED
      );
    }

    if (user.authType !== "password") {
      throw new ApiError(
        ErrorCode.FORBIDDEN,
        'Mismatched auth method, please use ' + user.authProvider + ' method to login',
        HttpStatus.FORBIDDEN
      );
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED,
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Generate JWT token
    const [token, filteredUser] = await Promise.all([
      generateToken(user),
      User.findById(user._id).select("-_id -__v").lean()
    ]);

    // Store token securely in an HTTP-only cookie
    res.setHeader("Set-Cookie",
      serialize("token", token, {
        path: "/",
        httpOnly: true,
        secure: isProduction(),
        sameSite: "strict",
        maxAge: ms(app.cookie.maxAge as ms.StringValue),
      })
    );

    // Return user payload (without token)
    return formatApiResponse(res, {
      token,
      user: {
        ...filteredUser,
        id: user._id,
        storageLimit: parseSizeToBytes(app.maxStoragePerUser)
      },
    }, String(req.url), startTime, HttpStatus.OK);
  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error, String(req.url), startTime, error.status);
    }
    return formatApiResponse(res, error as Error, String(req.url), startTime, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
