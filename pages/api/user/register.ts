import { NextApiRequest, NextApiResponse } from "next";
import { initializeDbConnection } from '@/lib/db';
import { User } from '@/lib/models/user';
import { generateToken } from '@/lib/auth/jwt-utils';
import { formatApiResponse, ApiError, HttpStatus, ErrorCode } from '@/lib/api/response';
import { validateRequest } from '@/lib/api/validator';
import { z } from 'zod';
import { serialize } from "cookie";
import { isProduction } from "@/lib/config";
import { parseSizeToBytes } from "@/lib/utils/common";
import app from "@/config/app.json"

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const startTime = Date.now();
    try {
        const data = await validateRequest(registerSchema, req.body);
        const { email, password, name } = data;

        await initializeDbConnection();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(
                ErrorCode.CONFLICT,
                'Email already registered',
                HttpStatus.CONFLICT
            );
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            name,
        });

        // Generate JWT token
        const token = await generateToken(user);

        // Store token securely in an HTTP-only cookie
        res.setHeader("Set-Cookie",
            serialize("token", token, {
                path: "/",
                httpOnly: true,
                secure: isProduction(),
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        );

        return formatApiResponse(res, {
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                storageLimit: parseSizeToBytes(app.maxStoragePerUser)
            },
        }, String(req.url), startTime, HttpStatus.CREATED);
    } catch (error) {
        if (error instanceof ApiError) {
            return formatApiResponse(res, error, String(req.url), startTime, error.status);
        }
        return formatApiResponse(res, error as Error, String(req.url), startTime);
    }
}