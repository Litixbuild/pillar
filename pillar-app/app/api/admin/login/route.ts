import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase";
import { getAdminCookieName, signAdminSession } from "@/lib/adminAuth";
import { logAuditEvent, getClientIp } from "@/lib/auditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const supabase = createClient();

  // Step 1: verify the password with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await logAuditEvent({ eventType: 'admin.login', status: 'failure', ipAddress: getClientIp(req), metadata: { reason: 'invalid_credentials' } });
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Step 2: check that this account has the admin role using the service client so RLS never blocks it
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await logAuditEvent({ userId: data.user.id, eventType: 'admin.login', status: 'failure', ipAddress: getClientIp(req), metadata: { reason: 'not_admin' } });
    return Response.json({ error: "Not authorised" }, { status: 403 });
  }

  // Step 3: create a signed admin session cookie
  const token = signAdminSession({ email, userId: data.user.id, iat: Date.now() });

  const jar = await cookies();
  jar.set({
    name: getAdminCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  await logAuditEvent({ userId: data.user.id, eventType: 'admin.login', status: 'success', ipAddress: getClientIp(req) });
  return Response.json({ ok: true }, { status: 200 });
}
