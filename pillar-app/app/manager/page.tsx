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
  const [properties, profileResult, referralCountResult] = await Promise.all([
    getPropertiesByManagerId(session.userId),
    supabase
      .from("profiles")
      .select("is_subscribed, stripe_subscription_status, stripe_customer_id, referral_code, referral_discount_cents, property_slots")
      .eq("id", session.userId)
      .single(),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", session.userId)
      .eq("is_subscribed", true),
  ]);

  const profile = profileResult.data;
  const isSubscribed = profile?.is_subscribed === true;
  const subscriptionStatus = (profile?.stripe_subscription_status as string | null) ?? null;
  const hasStripeCustomer = !!profile?.stripe_customer_id;
  const referralCode = (profile?.referral_code as string | null) ?? null;
  const referralDiscountCents = (profile?.referral_discount_cents as number) ?? 0;
  const propertySlots = (profile?.property_slots as number) ?? 1;
  const activeReferralCount = referralCountResult.count ?? 0;
  const managerName = (session.name || "").trim() || "Manager";

  return (
    <ManagerDashboardClient
      properties={properties}
      isSubscribed={isSubscribed}
      subscriptionStatus={subscriptionStatus}
      hasStripeCustomer={hasStripeCustomer}
      managerName={managerName}
      referralCode={referralCode}
      referralDiscountCents={referralDiscountCents}
      activeReferralCount={activeReferralCount}
      propertySlots={propertySlots}
    />
  );
}
