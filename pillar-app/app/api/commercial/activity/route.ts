import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelsByManagerId } from "@/lib/hotelProperties";
import { getHotelWorkOrders } from "@/lib/hotelWorkOrders";
import { getPendingHotelCheckouts, getActionedHotelCheckouts } from "@/lib/hotelLateCheckouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar   = await cookies();
  const token = jar.get(getCommercialCookieName())?.value || "";
  return token ? verifyCommercialSession(token) : null;
}

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hotels = await getHotelsByManagerId(session.userId);
  const slugs  = hotels.map((h) => h.slug);
  const nameMap = Object.fromEntries(hotels.map((h) => [h.slug, h.name]));

  const [workOrders, pendingCOs, actionedCOs] = await Promise.all([
    Promise.all(slugs.map((s) => getHotelWorkOrders(s))).then((all) => all.flat()),
    Promise.all(slugs.map((s) => getPendingHotelCheckouts(s))).then((all) => all.flat()),
    Promise.all(slugs.map((s) => getActionedHotelCheckouts(s))).then((all) => all.flat()),
  ]);

  return NextResponse.json({
    workOrders:       workOrders.map((o) => ({ ...o, hotelName: nameMap[o.hotelSlug] ?? "" })),
    pendingCheckouts: pendingCOs.map((c) => ({ ...c, hotelName: nameMap[c.hotelSlug] ?? "" })),
    actionedCheckouts: actionedCOs.map((c) => ({ ...c, hotelName: nameMap[c.hotelSlug] ?? "" })),
  });
}
