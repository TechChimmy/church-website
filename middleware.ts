import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow login page
  if (pathname === "/admin/login") return NextResponse.next();

  // Protect admin and studio UI routes
  if ((pathname.startsWith("/admin") || pathname.startsWith("/studio")) && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Protect admin and studio UI pages
  matcher: ["/admin/:path*", "/studio/:path*"],
};
