import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Paths that don't require authentication. */
const PUBLIC_PATHS = ["/login"];

/** Routes restricted to ADMIN and MANAGER roles only. */
const ADMIN_MANAGER_PATHS = [
  "/invoices",
  "/expenses",
  "/purchase-orders",
  "/reports",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For public paths (e.g. /login): let unauthenticated users through,
  // but redirect authenticated users to the dashboard.
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("auth-token")?.value;
    if (token) {
      // Quick expiry check before redirecting
      try {
        const payload = JSON.parse(atob(token.split(".")[1])) as {
          exp?: number;
        };
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch {
        /* malformed token — fall through to login */
      }
    }
    return NextResponse.next();
  }

  // Allow static files, Next.js internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files like favicon, images
  ) {
    return NextResponse.next();
  }

  // ── Auth check: read the auth-token cookie set by the client ──
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    // No token → redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-based route guard ──
  // Decode JWT payload (base64) to read the role claim without verification.
  // Full verification happens server-side on every API call.
  try {
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadB64)) as {
      role?: string;
      exp?: number;
    };

    // Check token expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("expired", "true");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth-token");
      return response;
    }

    // Block non-admin/manager from restricted routes
    const role = payload.role?.toUpperCase();
    if (
      ADMIN_MANAGER_PATHS.some((p) => pathname.startsWith(p)) &&
      role !== "ADMIN" &&
      role !== "MANAGER"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    // Malformed token → redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("auth-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
