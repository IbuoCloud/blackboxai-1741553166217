import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register")

  if (isAuthPage) {
    if (token) {
      // If user is already logged in, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Allow access to auth pages if not logged in
    return NextResponse.next()
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/projects/:path*",
    "/bookings/:path*",
    // Auth routes
    "/login",
    "/register",
  ],
}
