import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  const isPublicPage =
    isAuthPage ||
    pathname.startsWith("/verify-email");

  // Not logged in + trying to visit protected page → go to login
  if (!isLoggedIn && !isPublicPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // Logged in + trying to visit login or signup only → go to dashboard
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};