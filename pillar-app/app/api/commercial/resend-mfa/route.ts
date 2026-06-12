import { cookies } from "next/headers";
import {
  getCommercialTempCookieName,
  verifyTempToken,
  signTempToken,
  generateOtp,
  hashOtp,
} from "@/lib/commercialAuth";
import { sendOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const tempTokenValue = jar.get(getCommercialTempCookieName())?.value;
  if (!tempTokenValue) {
    return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }
  const pending = verifyTempToken(tempTokenValue);
  if (!pending) {
    return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  const code     = generateOtp();
  const codeHash = hashOtp(code);
  try {
    await sendOtpEmail(pending.email, pending.name, code);
  } catch (e) {
    console.error("[commercial/resend-mfa] email error:", e);
    return Response.json({ error: "Failed to resend code. Please try again." }, { status: 503 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const newToken = signTempToken({ userId: pending.userId, email: pending.email, name: pending.name, codeHash, iat: Date.now() });
  jar.set({ name: getCommercialTempCookieName(), value: newToken, httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 15 * 60 });

  return Response.json({ ok: true }, { status: 200 });
}
