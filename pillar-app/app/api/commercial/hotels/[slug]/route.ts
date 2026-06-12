import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelBySlug, updateHotel, deleteHotel, verifyHotelAccess, type HotelUpdateFields } from "@/lib/hotelProperties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ hotel });
}

export async function PUT(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as HotelUpdateFields | null;
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });
  const ok = await updateHotel(session.userId, slug, body);
  if (!ok) return Response.json({ error: "Update failed" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const ok = await deleteHotel(session.userId, slug);
  if (!ok) return Response.json({ error: "Delete failed" }, { status: 500 });
  return Response.json({ ok: true });
}
