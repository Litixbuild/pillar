import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelsByManagerId, createHotel } from "@/lib/hotelProperties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const hotels = await getHotelsByManagerId(session.userId);
  return Response.json({ hotels });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "Hotel name is required" }, { status: 400 });
  const hotel = await createHotel(session.userId, name);
  if (!hotel) return Response.json({ error: "Failed to create hotel" }, { status: 500 });
  return Response.json({ hotel }, { status: 201 });
}
