import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin routes ---
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("pillar_admin")?.value || "";
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // --- Manager routes ---
  if (
    pathname === "/manager/login" ||
    pathname === "/manager/forgot-password" ||
    pathname === "/manager/reset-password"
  ) {
    return NextResponse.next();
  }

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
  matcher: ["/manager/:path*", "/admin/:path*"],
};
