import jwt from "jsonwebtoken";
import { getJwtExpiry, getJwtSecret } from "../config";

const JWT_SECRET = getJwtSecret(), EXPIRY = getJwtExpiry();

export async function generateToken(user: IUser): Promise<string> {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: EXPIRY }
  );
}

export async function verifyToken(token: string): Promise<JwtClaims | null> {
  return new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(payload as JwtClaims)
    })
  })
}