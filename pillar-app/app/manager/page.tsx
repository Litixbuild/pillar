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
    supabase
      .from("profiles")
      .select("is_subscribed, stripe_subscription_status, stripe_customer_id")
      .eq("id", session.userId)
      .single(),
  ]);
  const profile = profileResult.data;
  const isSubscribed = profile?.is_subscribed === true;
  const subscriptionStatus = (profile?.stripe_subscription_status as string | null) ?? null;
  const hasStripeCustomer = !!profile?.stripe_customer_id;
  const managerName = (session.name || "").trim() || "Manager";

  return (
    <ManagerDashboardClient
      properties={properties}
      isSubscribed={isSubscribed}
      subscriptionStatus={subscriptionStatus}
      hasStripeCustomer={hasStripeCustomer}
      managerName={managerName}
    />
  );
}
