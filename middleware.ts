import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth/jwt-utils'

const authRoutes = [
  '/login',
  '/signup',
]
const protectedRoutes = [
  '/dashboard',
  '/file',
  '/folder',
]

const isProtectedPage = (pathname: string) => {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

const isAuthPage = (pathname: string) => {
  return authRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const authPage = isAuthPage(request.nextUrl.pathname)
  const protectedPage = isProtectedPage(request.nextUrl.pathname)

  if (!token && protectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && authPage) {
    if (!await verifyToken(token)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/file/:path*',
    '/folder/:path*',
    '/login',
    '/signup',
    '/api/user/:path*',
    '/api/files/:path*'
  ]
}