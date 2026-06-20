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

// GET — current onboarding tour status for the logged-in manager
export async function GET() {
  const session = await requireSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("onboarding_tour_status")
    .eq("id", session.userId)
    .single();

  const status = typeof profile?.onboarding_tour_status === "string" ? profile.onboarding_tour_status : "pending";
  return Response.json({ status });
}
