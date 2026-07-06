import crypto from "crypto";
import { cookies } from "next/headers";
import { getGoogleClientConfig, getOAuthBaseUrl, buildGoogleAuthUrl, GOOGLE_STATE_COOKIE } from "@/lib/googleOAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = getOAuthBaseUrl(req);
  const config = getGoogleClientConfig();
  if (!config) {
    return Response.redirect(`${base}/manager/login?error=google`, 302);
  }

  const state = crypto.randomBytes(24).toString("hex");
  const jar = await cookies();
  jar.set({
    name: GOOGLE_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  const authUrl = buildGoogleAuthUrl({
    clientId: config.clientId,
    redirectUri: `${base}/api/manager/auth/google/callback`,
    state,
  });
  return Response.redirect(authUrl, 302);
}
