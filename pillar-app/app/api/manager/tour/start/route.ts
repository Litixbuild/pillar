import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { seedDemoProperty } from "@/lib/tourDemo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  return token ? verifyManagerSession(token) : null;
}

// POST — seed the demo property/work order/late checkout and mark the tour in progress
export async function POST() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let slug: string;
  try {
    slug = await seedDemoProperty(session.userId);
  } catch {
    return Response.json({ error: "Failed to set up the tutorial. Please try again." }, { status: 500 });
  }

  const service = createServiceClient();
  await service
    .from("profiles")
    .update({ onboarding_tour_status: "in_progress" })
    .eq("id", session.userId);

  return Response.json({ ok: true, slug });
}
