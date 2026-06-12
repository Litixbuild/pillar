import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { resolveHotelWorkOrder } from "@/lib/hotelWorkOrders";

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
  const body = (await req.json().catch(() => null)) as { note?: unknown } | null;
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;
  const ok = await resolveHotelWorkOrder(id, slug, note);
  if (!ok) return Response.json({ error: "Failed to resolve" }, { status: 500 });
  return Response.json({ ok: true });
}
