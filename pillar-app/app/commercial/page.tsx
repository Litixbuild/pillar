import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelsByManagerId } from "@/lib/hotelProperties";
import { getOpenHotelWorkOrderCount } from "@/lib/hotelWorkOrders";
import { createServiceClient } from "@/lib/supabase";
import CommercialDashboardClient from "./CommercialDashboardClient";

export const dynamic = "force-dynamic";

export default async function CommercialDashboardPage() {
  const jar   = await cookies();
  const token = jar.get(getCommercialCookieName())?.value || "";
  const session = token ? verifyCommercialSession(token) : null;
  if (!session?.userId) redirect("/commercial/login");

  const supabase = createServiceClient();
  const [hotels, openCount, profileResult] = await Promise.all([
    getHotelsByManagerId(session.userId),
    getOpenHotelWorkOrderCount(session.userId),
    supabase.from("profiles").select("full_name").eq("id", session.userId).single(),
  ]);

  const managerName = (profileResult.data?.full_name as string | null) ?? session.name ?? "Manager";

  return (
    <CommercialDashboardClient
      hotels={hotels}
      openWorkOrderCount={openCount}
      managerName={managerName}
    />
  );
}
