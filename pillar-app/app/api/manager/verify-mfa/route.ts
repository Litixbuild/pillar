import crypto from "crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import {
  getManagerCookieName,
  signManagerSession,
  getDeviceCookieName,
  getTempCookieName,
  verifyTempToken,
  hashOtp,
} from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.replace(/\s/g, '') : "";

  if (!code || !/^\d{6}$/.test(code)) {
    return Response.json({ error: "Enter a valid 6-digit code." }, { status: 400 });
  }

  const jar = await cookies();
  const tempTokenValue = jar.get(getTempCookieName())?.value;
  if (!tempTokenValue) {
    return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  const pending = verifyTempToken(tempTokenValue);
  if (!pending) {
    return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  // Constant-time comparison of hashed codes
  const submittedHash = hashOtp(code);
  const storedHash = pending.codeHash;
  let match = false;
  try {
    match = crypto.timingSafeEqual(Buffer.from(submittedHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    match = false;
  }

  if (!match) {
    return Response.json({ error: "Incorrect code. Please try again." }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === "production";
  jar.delete(getTempCookieName());

  const deviceToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const service = createServiceClient();
  await service.from("mfa_trusted_devices").insert({
    manager_id: pending.userId,
    device_token: deviceToken,
    expires_at: expiresAt.toISOString(),
  });
  jar.set({
    name: getDeviceCookieName(),
    value: deviceToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  const sessionToken = signManagerSession({ email: pending.email, name: pending.name, userId: pending.userId, iat: Date.now() });
  jar.set({ name: getManagerCookieName(), value: sessionToken, httpOnly: true, sameSite: "lax", secure: isProd, path: "/" });

  return Response.json({ ok: true }, { status: 200 });
}
