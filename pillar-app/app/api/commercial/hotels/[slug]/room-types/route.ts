import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { getRoomTypesByHotel, createRoomType } from "@/lib/roomTypes";

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
  const roomTypes = await getRoomTypesByHotel(slug);
  return Response.json({ roomTypes });
}

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "Room type name is required" }, { status: 400 });
  const roomType = await createRoomType(slug, name);
  if (!roomType) return Response.json({ error: "Failed to create room type" }, { status: 500 });
  return Response.json({ roomType }, { status: 201 });
}
