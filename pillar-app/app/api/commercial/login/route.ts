import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase";
import {
  getCommercialCookieName,
  getCommercialDeviceCookieName,
  getCommercialTempCookieName,
  signCommercialSession,
  signTempToken,
  generateOtp,
  hashOtp,
} from "@/lib/commercialAuth";
import { sendOtpEmail } from "@/lib/mailer";
import { logAuditEvent, getClientIp } from "@/lib/auditLog";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email    = typeof body?.email    === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const allowed = await checkRateLimit(`commercial-login:${email}`, 5, 900);
  if (!allowed) {
    return Response.json({ error: "Too many login attempts. Please wait 15 minutes." }, { status: 429 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await logAuditEvent({ eventType: "commercial.login", status: "failure", ipAddress: getClientIp(req) });
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Verify this user has the 'commercial' role
  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "commercial") {
    await logAuditEvent({ eventType: "commercial.login", status: "failure", ipAddress: getClientIp(req) });
    return Response.json({ error: "Access denied." }, { status: 403 });
  }

  const managerName = (profile.full_name as string | null) ?? undefined;
  const jar = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // Check for trusted device
  const deviceToken = jar.get(getCommercialDeviceCookieName())?.value;
  if (deviceToken) {
    const { data: device } = await service
      .from("mfa_trusted_devices")
      .select("id, expires_at")
      .eq("device_token", deviceToken)
      .eq("manager_id", data.user.id)
      .single();

    if (device && new Date((device as { expires_at: string }).expires_at) > new Date()) {
      const token = signCommercialSession({ email, name: managerName, userId: data.user.id, iat: Date.now() });
      jar.set({ name: getCommercialCookieName(), value: token, httpOnly: true, sameSite: "lax", secure: isProd, path: "/" });
      await logAuditEvent({ userId: data.user.id, eventType: "commercial.login", status: "success", ipAddress: getClientIp(req), metadata: { method: "trusted_device" } });
      return Response.json({ ok: true }, { status: 200 });
    }
    if (device) await service.from("mfa_trusted_devices").delete().eq("id", (device as { id: string }).id);
    jar.delete(getCommercialDeviceCookieName());
  }

  // Unknown device — send OTP
  const code     = generateOtp();
  const codeHash = hashOtp(code);
  try {
    await sendOtpEmail(email, managerName, code);
  } catch (e) {
    console.error("[commercial/login] OTP email error:", e);
    return Response.json({ error: "Failed to send verification email. Please try again." }, { status: 503 });
  }

  const tempToken = signTempToken({ userId: data.user.id, email, name: managerName, codeHash, iat: Date.now() });
  jar.set({ name: getCommercialTempCookieName(), value: tempToken, httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 15 * 60 });

  const [local, domain] = email.split("@");
  const masked = `${local[0]}${"*".repeat(Math.max(2, (local?.length ?? 1) - 1))}@${domain}`;

  await logAuditEvent({ userId: data.user.id, eventType: "commercial.login", status: "success", ipAddress: getClientIp(req), metadata: { method: "otp_required" } });
  return Response.json({ mfa_required: true, email_hint: masked }, { status: 200 });
}
