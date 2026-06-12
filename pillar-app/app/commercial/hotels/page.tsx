import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelsByManagerId } from "@/lib/hotelProperties";
import HotelsClient from "./HotelsClient";

export const dynamic = "force-dynamic";

export default async function HotelsPage() {
  const jar     = await cookies();
  const token   = jar.get(getCommercialCookieName())?.value || "";
  const session = token ? verifyCommercialSession(token) : null;
  if (!session?.userId) redirect("/commercial/login");

  const hotels = await getHotelsByManagerId(session.userId);
  return <HotelsClient hotels={hotels} />;
}
