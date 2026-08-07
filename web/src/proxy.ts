import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect admin UI routes
  if (pathname.startsWith("/admin") && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Handle studio routes
  if (pathname.startsWith("/studio")) {
    const isAsset = pathname.includes("/static/") || pathname.includes("/assets/") || pathname.endsWith(".ico") || pathname.endsWith(".js") || pathname.endsWith(".css") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg");
    
    if (!isAsset && !req.auth) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (pathname === "/studio") {
      return NextResponse.redirect(new URL("/studio/", req.url));
    }

    const studioPath = pathname.slice("/studio".length) || "/";
    const targetUrl = `http://127.0.0.1:3333/studio${studioPath}`;
    return NextResponse.rewrite(new URL(targetUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*"],
};
