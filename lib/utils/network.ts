import { NextApiRequest } from "next"

export const getIpAddress = (req: NextApiRequest) => {
  let ip =
    String(req.headers["x-forwarded-for"]).split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers["cf-connecting-ip"] as string; // Cloudflare proxy

  // Convert IPv6 loopback (::1) to IPv4 (127.0.0.1)
  if (ip === "::1") ip = "127.0.0.1"

  // If the IP is in IPv6-mapped IPv4 format (e.g., ::ffff:192.168.1.4), extract only the IPv4 part
  if (ip.startsWith("::ffff:")) {
    ip = String(ip.split(":").pop())
  }

  return ip
}

/**
 * Retrieves the User-Agent string from the headers of a Next.js API request.
 *
 * @param req - The Next.js API request object.
 * @returns The User-Agent string from the request headers.
 */
export const getUserAgent = (req: NextApiRequest) => {
  return req.headers["user-agent"] as string
}