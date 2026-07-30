import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  console.log(`[Middleware] Request: ${pathname}, hasAuth: ${!!req.auth}`);

  // Allow login page
  if (pathname === "/admin/login") {
    console.log(`[Middleware] Allow login page: ${pathname}`);
    return NextResponse.next();
  }

  // Protect admin UI routes
  if (pathname.startsWith("/admin") && !req.auth) {
    console.log(`[Middleware] Redirect admin to login: ${pathname}`);
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Handle studio routes
  if (pathname.startsWith("/studio")) {
    // Only require auth for non-assets to prevent asset fetches from failing if session cookies are absent/unprocessed
    const isAsset = pathname.includes("/static/") || pathname.includes("/assets/") || pathname.endsWith(".ico") || pathname.endsWith(".js") || pathname.endsWith(".css") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".svg");
    
    if (!isAsset && !req.auth) {
      console.log(`[Middleware] Redirect studio path to login: ${pathname}`);
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // If it is exactly /studio, redirect to /studio/ to avoid Vite base URL trailing slash issues
    if (pathname === "/studio") {
      console.log(`[Middleware] Redirect /studio to /studio/`);
      return NextResponse.redirect(new URL("/studio/", req.url));
    }

    // Rewrite /studio/ and subpaths to Sanity Studio port (3333)
    const studioPath = pathname.slice("/studio".length) || "/";
    const targetUrl = `http://127.0.0.1:3333/studio${studioPath}`;
    console.log(`[Middleware] Rewrite ${pathname} -> ${targetUrl}`);
    return NextResponse.rewrite(new URL(targetUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Protect admin UI pages and studio
  matcher: ["/admin/:path*", "/studio/:path*"],
};
