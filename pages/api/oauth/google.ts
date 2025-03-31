import ms from "ms"
import { NextApiRequest, NextApiResponse } from "next"
import { serialize } from "cookie"
import { initializeDbConnection } from "@/lib/db"
import { User } from "@/lib/models/user"
import { generateToken } from "@/lib/auth/jwt-utils"
import { ApiError, ErrorCode, formatApiResponse, HttpStatus } from "@/lib/api/response"
import { OAuth2Client } from "google-auth-library"
import { getGoogleClientID, isProduction } from "@/lib/config"
import app from "@/config/app.json"

const client = new OAuth2Client(getGoogleClientID())

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    await initializeDbConnection()

    const { token } = req.body // Google ID token from frontend
    if (!token) {
      throw new ApiError(ErrorCode.BAD_REQUEST, "Token is required", HttpStatus.BAD_REQUEST)
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: getGoogleClientID(),
    })
    const payload = ticket.getPayload()

    if (!payload?.email) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid Google token", HttpStatus.UNAUTHORIZED)
    }
    if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token issuer", HttpStatus.UNAUTHORIZED)
    }
    if (payload.aud !== getGoogleClientID()) {
      throw new ApiError(ErrorCode.UNAUTHORIZED, "Invalid token audience", HttpStatus.UNAUTHORIZED)
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email })
    let message = "Logged in successfully"
    if (!user) {
      let registered = await User.create({
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        authType: "oauth",
        authProvider: "google",
        isEmailVerified: payload.email_verified,
        password: "", // No password for Google login
      }) as IUser

      user = registered.toSafeObject()
      message = "Registered successfully! Welcome to RapidServe."
    }

    // Generate JWT token
    const jwtToken = await generateToken(user)

    // Store token in HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", jwtToken, {
        path: "/",
        httpOnly: true,
        secure: isProduction(),
        sameSite: "strict",
        maxAge: ms(app.cookie.maxAge as ms.StringValue),
      })
    )

    return formatApiResponse(res, { user, token: jwtToken, message })
  } catch (error) {
    if (error instanceof ApiError) {
      return formatApiResponse(res, error)
    }
    console.error("Google Auth Error:", error, JSON.stringify(error))
    return formatApiResponse(res, new ApiError(ErrorCode.UNAUTHORIZED, "Google login failed", HttpStatus.UNAUTHORIZED))
  }
}
