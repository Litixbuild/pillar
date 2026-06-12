import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { updateRoomType, deleteRoomType } from "@/lib/roomTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function PUT(req: Request, props: { params: Promise<{ slug: string; typeId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, typeId } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
  const ok = await updateRoomType(typeId, slug, name);
  if (!ok) return Response.json({ error: "Update failed" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, props: { params: Promise<{ slug: string; typeId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, typeId } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const ok = await deleteRoomType(typeId, slug);
  if (!ok) return Response.json({ error: "Delete failed" }, { status: 500 });
  return Response.json({ ok: true });
}
