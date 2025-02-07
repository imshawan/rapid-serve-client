import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, password } = req.body;

    try {
        // Send login request to backend
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulate API response

        const data = {
            token: 'mock-jwt-token',
            user: {
                id: '1',
                name: 'John Doe',
                email,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
            }
        }

        // Store token securely in an HTTP-only cookie
        res.setHeader("Set-Cookie",
            serialize("token", data.token, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        );

        // Return user data (without token)
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
