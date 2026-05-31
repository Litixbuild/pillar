import nodemailer from 'nodemailer';
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase";
import {
  getManagerCookieName,
  signManagerSession,
  getDeviceCookieName,
  getTempCookieName,
  signTempToken,
  generateOtp,
  hashOtp,
} from "@/lib/managerAuth";

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
          Your verification code
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

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const msg = error?.message ?? "Invalid credentials";
    if (msg.toLowerCase().includes("email not confirmed")) {
      return Response.json({ error: "Please verify your email before signing in. Check your inbox for a confirmation link." }, { status: 401 });
    }
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .single();

  const managerName = profile?.full_name ?? undefined;

  const jar = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // ── Check for trusted device — skip OTP if recognised ────────────
  const deviceToken = jar.get(getDeviceCookieName())?.value;
  if (deviceToken) {
    const { data: device } = await service
      .from("mfa_trusted_devices")
      .select("id, expires_at")
      .eq("device_token", deviceToken)
      .eq("manager_id", data.user.id)
      .single();

    if (device && new Date(device.expires_at) > new Date()) {
      const token = signManagerSession({ email, name: managerName, userId: data.user.id, iat: Date.now() });
      jar.set({ name: getManagerCookieName(), value: token, httpOnly: true, sameSite: "lax", secure: isProd, path: "/" });
      return Response.json({ ok: true }, { status: 200 });
    }
    if (device) await service.from("mfa_trusted_devices").delete().eq("id", device.id);
    jar.delete(getDeviceCookieName());
  }

  // ── Unknown device — always require email OTP ─────────────────────
  const code = generateOtp();
  const codeHash = hashOtp(code);

  try {
    await sendOtpEmail(email, managerName, code);
  } catch (e) {
    console.error("[login] OTP email error:", e);
    return Response.json({ error: "Failed to send verification email. Please try again." }, { status: 503 });
  }

  const tempToken = signTempToken({ userId: data.user.id, email, name: managerName, codeHash, iat: Date.now() });
  jar.set({ name: getTempCookieName(), value: tempToken, httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 15 * 60 });

  const [local, domain] = email.split('@');
  const masked = `${local[0]}${'*'.repeat(Math.max(2, (local?.length ?? 1) - 1))}@${domain}`;
  return Response.json({ mfa_required: true, email_hint: masked }, { status: 200 });
}
