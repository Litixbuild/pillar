import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { actionHotelLateCheckout } from "@/lib/hotelLateCheckouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function POST(req: Request, props: { params: Promise<{ slug: string; id: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, id } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
  const action = body?.action === "approved" ? "approved" : body?.action === "denied" ? "denied" : null;
  if (!action) return Response.json({ error: "action must be 'approved' or 'denied'" }, { status: 400 });
  const ok = await actionHotelLateCheckout(id, slug, action);
  if (!ok) return Response.json({ error: "Action failed" }, { status: 500 });
  return Response.json({ ok: true });
}
