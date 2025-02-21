import { SignJWT, jwtVerify } from "jose";
import { getJwtExpiry, getJwtSecret } from "../config";

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());
const EXPIRY = getJwtExpiry();

export async function generateToken(user: IUser): Promise<string> {
  return new SignJWT({
    userId: user._id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    });
    return payload as unknown as JwtClaims;
  } catch (error) {
    return null;
  }
}
