import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { cleanupDemoProperty } from "@/lib/tourDemo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  return token ? verifyManagerSession(token) : null;
}

// POST — tour completed naturally: delete the demo property and mark completed
export async function POST() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await cleanupDemoProperty(session.userId);
  } catch {
    // Best-effort — don't block the manager from finishing the tour over cleanup failure
  }

  const service = createServiceClient();
  await service
    .from("profiles")
    .update({ onboarding_tour_status: "completed" })
    .eq("id", session.userId);

  return Response.json({ ok: true });
}
