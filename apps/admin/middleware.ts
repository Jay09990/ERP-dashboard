import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("connect.sid");

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/company-register"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // If user is not authenticated and trying to access protected route
  if (!sessionCookie && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (sessionCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
