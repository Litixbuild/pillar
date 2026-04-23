import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/manager/login") {
    return NextResponse.next();
  }

  // Protect manager portal routes (except login + API auth endpoints)
  if (pathname.startsWith("/manager")) {
    const token = req.cookies.get("pillar_manager")?.value || "";
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/manager/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manager/:path*"],
};
