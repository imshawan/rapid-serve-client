import { NextApiRequest, NextApiResponse } from "next";
import { User } from '@/lib/models/user';
import { formatApiResponse, ApiError, HttpStatus, ErrorCode } from '@/lib/api/response';
import { validateRequest } from '@/lib/api/validator';
import { z } from 'zod';
import { initializeDbConnection } from "@/lib/db";
import { PasswordResetToken } from "@/lib/models/password-token";
import { getPublicURL } from "@/lib/config";
import { sendEmail } from "@/lib/email/emailer";
import { getRenderedTemplate } from "@/lib/email/templates";

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const InvalidTokenError = new ApiError(
    ErrorCode.UNAUTHORIZED,
    'Invalid or expired reset token',
    HttpStatus.UNAUTHORIZED
  )

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = await validateRequest(passwordResetSchema, await req.body);
    const { password, token } = data;

    await initializeDbConnection();

    const tokenPayload = await PasswordResetToken.findOne({ token })
    if (!tokenPayload) {
      throw InvalidTokenError
    }

    const user = await User.findById(tokenPayload.userId) as IUser
    if (!user) {
      throw InvalidTokenError
    }

    user.password = password
    user.isEmailVerified = true // Mark email as verified if not already

    const emailContent = getRenderedTemplate("password-reset-success", {
      userName: user.name,
      loginLink: `${getPublicURL()}/login`,
    })

    await Promise.all([
      user.save(),
      PasswordResetToken.deleteOne({ _id: tokenPayload._id }),
      sendEmail({
        to: user.email,
        subject: 'Password Reset Successful',
        html: emailContent.html,
        text: emailContent.text,
      })
    ])

    formatApiResponse(res, { message: "Password reset successfully" })

  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error, String(req.url), startTime, error.status);
    }
    return formatApiResponse(res, error as Error, String(req.url), startTime, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}