import { NextApiRequest, NextApiResponse } from "next";
import { User } from '@/lib/models/user';
import { formatApiResponse, ApiError, HttpStatus, ErrorCode } from '@/lib/api/response';
import { validateRequest } from '@/lib/api/validator';
import { z } from 'zod';
import { initializeDbConnection } from "@/lib/db";
import { generateResetToken } from "@/lib/user/auth";
import { PasswordResetToken } from "@/lib/models/password-token";
import { getEnvValue } from "@/lib/config";
import { sendEmail } from "@/lib/email/emailer";
import { getRenderedTemplate } from "@/lib/email/templates";

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = await validateRequest(forgotPasswordSchema, await req.body);
    const { email } = data;

    await initializeDbConnection();

    // Find user with all the fields including password
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      return formatApiResponse(res, { message: "An email would be sent to your email address if the email matches in our records." });
    }

    const resetToken = generateResetToken()

    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
    })

     // Create reset link - make sure to use the actual frontend URL from environment
     const baseUrl = getEnvValue("NEXT_PUBLIC_SERVER_URL", "")
     const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

     const emailContent = getRenderedTemplate("password-reset", {
      resetLink,
      userName: user.name,
    })

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: emailContent.html,
      text: emailContent.text,
    })

    if (!emailSent) {
      throw new ApiError("Failed to send email", ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return formatApiResponse(res, { message: "An email would be sent to your email address if the email matches in our records." });

  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error, String(req.url), startTime, error.status);
    }
    return formatApiResponse(res, error as Error, String(req.url), startTime, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
