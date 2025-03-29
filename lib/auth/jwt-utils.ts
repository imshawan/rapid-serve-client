import { SignJWT, jwtVerify } from "jose";
import { getJwtExpiry, getJwtSecret } from "../config";

interface JwtClaims {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());
const EXPIRY = getJwtExpiry();

export async function generateToken(user: any): Promise<string> {
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
  let secret = JWT_SECRET.length ? JWT_SECRET : new TextEncoder().encode(getJwtSecret());
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"]
    });
    return payload as unknown as JwtClaims;
  } catch (error) {
    return null;
  }
}
