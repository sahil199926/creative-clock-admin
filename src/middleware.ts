import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For client-side authentication with localStorage, we can't check auth status in middleware
  // The ProtectedRoute component will handle the authentication check
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
