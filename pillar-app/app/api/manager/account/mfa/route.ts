import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  return token ? verifyManagerSession(token) : null;
}

// GET — return current MFA status
export async function GET() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("mfa_enabled")
    .eq("id", session.userId)
    .single();

  return Response.json({ mfa_enabled: profile?.mfa_enabled === true });
}

// POST — enable MFA
export async function POST() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ mfa_enabled: true })
    .eq("id", session.userId);

  if (error) return Response.json({ error: "Failed to enable. Please try again." }, { status: 500 });
  return Response.json({ ok: true });
}

// DELETE — disable MFA and revoke all trusted devices
export async function DELETE() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  await Promise.all([
    service.from("profiles").update({ mfa_enabled: false }).eq("id", session.userId),
    service.from("mfa_trusted_devices").delete().eq("manager_id", session.userId),
  ]);

  return Response.json({ ok: true });
}
