// getToken → retrieves the JWT token from cookies or headers for the current request.
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest){
    const { pathname } = req.nextUrl;

    // Always allow NextAuth endpoints.
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const isLoggedIn = !!token;

    const role=token?.role || "user";
    if(pathname.startsWith("/user") && role !== "user"){
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if(pathname.startsWith("/admin") && role !== "admin"){
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if(pathname.startsWith("/delivery") && role !== "deliveryboy"){
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If already logged in, block auth pages.
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const isPublic = pathname === "/login" || pathname === "/register";
    if (isPublic) {
      return NextResponse.next();
    }

    // Otherwise protect everything else.
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      // f the user is not logged in, redirect to /login.
     // callbackUrl allows the user to be redirected back to the original page after login.
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude paths that start with:
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    // The regex means:
    // /(: The start of the path)
    // (?! ... ): A negative lookahead to exclude patterns
    // api|_next/static|_next/image|favicon.ico|.*\.png$: Common static/system files
    // .*\\.\\w+(: any path with a file extension, e.g., .css, .js, etc.)
    // .*): Match any path that doesn't match the excluded patterns
  ],
}; 