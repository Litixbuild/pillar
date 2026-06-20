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

// POST — declined the prompt, or exited mid-tour: clean up any demo data and never ask again
export async function POST() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await cleanupDemoProperty(session.userId);
  } catch {
    // Best-effort — don't block on cleanup failure
  }

  const service = createServiceClient();
  await service
    .from("profiles")
    .update({ onboarding_tour_status: "skipped" })
    .eq("id", session.userId);

  return Response.json({ ok: true });
}
