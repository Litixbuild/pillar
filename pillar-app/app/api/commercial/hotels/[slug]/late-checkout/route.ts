import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { getPendingHotelCheckouts, getActionedHotelCheckouts } from "@/lib/hotelLateCheckouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const [pending, actioned] = await Promise.all([
    getPendingHotelCheckouts(slug),
    getActionedHotelCheckouts(slug),
  ]);
  return Response.json({ checkouts: [...pending, ...actioned] });
}
