import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { getRoomTypeWindows, upsertRoomTypeWindows } from "@/lib/hotelWindows";
import { generateWindowId, type AmenityWindow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function GET(req: Request, props: { params: Promise<{ slug: string; typeId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, typeId } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const windows = await getRoomTypeWindows(typeId);
  return Response.json({ windows });
}

export async function POST(req: Request, props: { params: Promise<{ slug: string; typeId: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, typeId } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { windows?: AmenityWindow[] } | null;
  if (!body?.windows || !Array.isArray(body.windows)) return Response.json({ error: "Invalid request" }, { status: 400 });
  const windows = body.windows.map((w) => ({ ...w, id: w.id || generateWindowId() }));
  const ok = await upsertRoomTypeWindows(typeId, slug, windows);
  if (!ok) return Response.json({ error: "Save failed" }, { status: 500 });
  return Response.json({ ok: true });
}
