import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("token")?.value
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup")
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/habits") ||
    request.nextUrl.pathname.startsWith("/profile")

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if accessing auth pages while authenticated
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/habits/:path*", "/profile/:path*", "/login", "/signup"],
}
