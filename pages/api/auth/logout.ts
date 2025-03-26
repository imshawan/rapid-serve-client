import { isProduction } from "@/lib/config";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: isProduction(),
      sameSite: "strict",
    })
  );

  res.status(200).json({ message: "Logged out" });
}
