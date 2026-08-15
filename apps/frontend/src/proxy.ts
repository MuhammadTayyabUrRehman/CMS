// =============================================
// Server-side route protection (Next 16 "proxy", formerly middleware)
//
// Gates /admin/* (ADMIN only) and /staff/* (IT_STAFF or ADMIN) BEFORE the
// page shell is delivered. Unauthenticated and wrong-role visitors are
// redirected to /login with the original path in ?next= so login can return
// them. The token is read from the complaint_portal_token cookie (mirrored
// from localStorage by src/lib/api.js) and its signature + role are verified
// with the shared JWT_SECRET.
//
// This is a UX/defense-in-depth layer: the NestJS API independently enforces
// JWT + role guards on every protected route.
// =============================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_COOKIE = "complaint_portal_token";
const ADMIN_ROLE = "ADMIN";
const STAFF_ROLE = "IT_STAFF";

async function getVerifiedRole(request) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function redirectToLogin(request, pathname) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const role = await getVerifiedRole(request);

  if (pathname === "/staff/login") {
    // Staff login page: allow guests through, bounce already-authed staff to
    // the queue and admins to the console.
    if (role === STAFF_ROLE || role === ADMIN_ROLE) {
      return NextResponse.redirect(new URL("/staff/queue", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (role !== ADMIN_ROLE) {
      return redirectToLogin(request, pathname);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff")) {
    if (role !== STAFF_ROLE && role !== ADMIN_ROLE) {
      return redirectToLogin(request, pathname);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*"],
};
