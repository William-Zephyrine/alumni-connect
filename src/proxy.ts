import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                     request.nextUrl.pathname.startsWith("/register");
  
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
                           request.nextUrl.pathname.startsWith("/server");

  if (isProtectedRoute) {
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuthPage && token && verifyToken(token)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/server/:path*",
    "/login",
    "/register",
  ],
};
