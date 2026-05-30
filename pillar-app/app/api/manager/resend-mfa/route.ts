import nodemailer from 'nodemailer';
import { cookies } from "next/headers";
import { getTempCookieName, signTempToken, verifyTempToken, generateOtp, hashOtp } from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendOtpEmail(to: string, name: string | undefined, code: string) {
  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPass = process.env.ZOHO_SMTP_PASS;
  if (!smtpUser || !smtpPass) throw new Error('Email service not configured');

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"Pillar" <${smtpUser}>`,
    to,
    subject: `Your Pillar verification code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
        <p style="margin:0 0 8px;font-size:13px;color:#888">Pillar Security</p>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:#1e293b">
          Your new verification code
        </h2>
        <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1e293b;margin:0 0 24px">
          ${code}
        </div>
        <p style="margin:0 0 8px;font-size:14px;color:#64748b">
          ${name ? `Hi ${name}, enter` : 'Enter'} this code on the Pillar login screen.
          It expires in <strong>15 minutes</strong>.
        </p>
        <p style="margin:0;font-size:13px;color:#94a3b8">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

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
