import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPropertiesByManagerId } from "@/lib/properties";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createServiceClient } from "@/lib/supabase";
import ManagerDashboardClient from "./ManagerDashboardClient";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    redirect("/manager/login");
  }

  const supabase = createServiceClient();
  const [properties, profileResult] = await Promise.all([
    getPropertiesByManagerId(session.userId),
    supabase.from("profiles").select("is_subscribed").eq("id", session.userId).single(),
  ]);
  const isSubscribed = profileResult.data?.is_subscribed === true;
  const managerName = (session.name || "").trim() || "Manager";

  return (
    <ManagerDashboardClient
      properties={properties}
      isSubscribed={isSubscribed}
      managerName={managerName}
    />
  );
}
