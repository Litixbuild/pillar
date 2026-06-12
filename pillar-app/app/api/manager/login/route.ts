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
import { sendOtpEmail } from "@/lib/mailer";
import { logAuditEvent, getClientIp } from "@/lib/auditLog";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`login:${email}`, 5, 900);
  if (!allowed) {
    return Response.json({ error: 'Too many login attempts. Please wait 15 minutes before trying again.' }, { status: 429 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const msg = error?.message ?? "Invalid credentials";
    await logAuditEvent({ eventType: 'manager.login', status: 'failure', ipAddress: getClientIp(req) });
    if (msg.toLowerCase().includes("email not confirmed")) {
      return Response.json({ error: "Please verify your email before signing in. Check your inbox for a confirmation link." }, { status: 401 });
    }
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "commercial") {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

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
      await logAuditEvent({ userId: data.user.id, eventType: 'manager.login', status: 'success', ipAddress: getClientIp(req), metadata: { method: 'trusted_device' } });
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
  await logAuditEvent({ userId: data.user.id, eventType: 'manager.login', status: 'success', ipAddress: getClientIp(req), metadata: { method: 'otp_required' } });
  return Response.json({ mfa_required: true, email_hint: masked }, { status: 200 });
}
