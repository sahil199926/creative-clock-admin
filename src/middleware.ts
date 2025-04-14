import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = request.nextUrl.pathname === "/login";

  // If trying to access dashboard without auth, redirect to login
  if (isDashboardRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If trying to access login while authenticated, redirect to dashboard
  if (isLoginRoute && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
