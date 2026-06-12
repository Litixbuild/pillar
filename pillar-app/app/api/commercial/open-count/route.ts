import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getOpenHotelWorkOrderCount } from "@/lib/hotelWorkOrders";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return Response.json({ count: 0 });
  const session = verifyCommercialSession(token);
  if (!session?.userId) return Response.json({ count: 0 });
  const count = await getOpenHotelWorkOrderCount(session.userId);
  return Response.json({ count });
}
