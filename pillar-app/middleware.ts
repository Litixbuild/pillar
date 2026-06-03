import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh', 'ko'];

const MANAGER_PUBLIC = new Set([
  "/manager/login",
  "/manager/signup",
  "/manager/forgot-password",
  "/manager/reset-password",
]);

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;

  const acceptLang = req.headers.get("accept-language") ?? "";
  for (const part of acceptLang.split(",")) {
    const tag = part.split(";")[0].trim().toLowerCase();
    const exact = LOCALES.find((l) => l === tag);
    if (exact) return exact;
    const prefix = LOCALES.find((l) => tag.startsWith(l + "-"));
    if (prefix) return prefix;
  }
  return "en";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin auth ---
  if (pathname !== "/admin/login" && pathname.startsWith("/admin")) {
    const token = req.cookies.get("pillar_admin")?.value || "";
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // --- Manager auth ---
  if (!MANAGER_PUBLIC.has(pathname) && pathname.startsWith("/manager")) {
    const token = req.cookies.get("pillar_manager")?.value || "";
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/manager/login";
      return NextResponse.redirect(url);
    }
  }

  // Detect locale and pass it to next-intl via header + cookie
  const locale = detectLocale(req);
  const response = NextResponse.next();
  response.headers.set("x-next-intl-locale", locale);
  if (!req.cookies.get("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
