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

// Verify HMAC-SHA256 signature using Web Crypto (Edge Runtime compatible)
async function verifyHmac(token: string, secret: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return false;
    const b64 = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    if (!b64 || !sig) return false;

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const rawSig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(b64));

    // Convert to base64url
    let binary = '';
    new Uint8Array(rawSig).forEach((b) => { binary += String.fromCharCode(b); });
    const expected = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Timing-safe comparison
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  } catch { return false; }
}

// Parse iat from token payload and check against max age
function isTokenExpired(token: string, maxAgeMs: number): boolean {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return true;
    const b64url = token.slice(0, lastDot);
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { iat?: unknown };
    if (typeof payload.iat !== 'number') return true;
    return Date.now() - payload.iat > maxAgeMs;
  } catch { return true; }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Admin auth ---
  if (pathname !== "/admin/login" && pathname.startsWith("/admin")) {
    const token = req.cookies.get("pillar_admin")?.value || "";
    const secret = process.env.ADMIN_SESSION_SECRET || "";
    if (!token || !secret || isTokenExpired(token, 8 * 60 * 60 * 1000) || !(await verifyHmac(token, secret))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // --- Manager auth ---
  if (!MANAGER_PUBLIC.has(pathname) && pathname.startsWith("/manager")) {
    const token = req.cookies.get("pillar_manager")?.value || "";
    const secret = process.env.MANAGER_SESSION_SECRET || "";
    if (!token || !secret || isTokenExpired(token, 24 * 60 * 60 * 1000) || !(await verifyHmac(token, secret))) {
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
