import { cookies } from "next/headers";
import { getTempCookieName, signTempToken, verifyTempToken, generateOtp, hashOtp } from "@/lib/managerAuth";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST() {
  const jar = await cookies();
  const tempTokenValue = jar.get(getTempCookieName())?.value;
  if (!tempTokenValue) return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });

  const pending = verifyTempToken(tempTokenValue);
  if (!pending) return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });

  const code = generateOtp();
  const codeHash = hashOtp(code);

  try {
    await sendOtpEmail(pending.email, pending.name, code);
  } catch (e) {
    console.error("[resend-mfa] Email error:", e);
    return Response.json({ error: "Failed to resend. Please try again." }, { status: 503 });
  }

  // Issue a fresh temp token with new code hash and reset the 15-min clock
  const isProd = process.env.NODE_ENV === "production";
  const newToken = signTempToken({ userId: pending.userId, email: pending.email, name: pending.name, codeHash, iat: Date.now() });
  jar.set({ name: getTempCookieName(), value: newToken, httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 15 * 60 });

  return Response.json({ ok: true });
}
