import { cookies } from "next/headers";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyPriceId = process.env.STRIPE_PROPERTY_PRICE_ID;
  if (!propertyPriceId) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_subscription_status, property_slots")
    .eq("id", session.userId)
    .single();

  const subId = profile?.stripe_subscription_id as string | null;
  const subStatus = profile?.stripe_subscription_status as string | null;

  if (!subId || (subStatus !== "active" && subStatus !== "trialing")) {
    return Response.json({ error: "Active subscription required" }, { status: 400 });
  }

  const sub = await stripe.subscriptions.retrieve(subId);
  const existingItem = sub.items.data.find((item) => item.price.id === propertyPriceId);

  // The free trial covers a single property. Adding another ends the trial
  // and starts billing immediately: base plan + the new property slot.
  const endTrialNow = sub.status === "trialing" ? { trial_end: "now" as const } : {};

  let updatedSub;
  if (existingItem) {
    updatedSub = await stripe.subscriptions.update(subId, {
      ...endTrialNow,
      items: [{ id: existingItem.id, quantity: (existingItem.quantity ?? 0) + 1 }],
      proration_behavior: "create_prorations",
    });
  } else {
    updatedSub = await stripe.subscriptions.update(subId, {
      ...endTrialNow,
      items: [{ price: propertyPriceId, quantity: 1 }],
      proration_behavior: "create_prorations",
    });
  }

  // Derive new slot count from the updated subscription
  const propertyItem = updatedSub.items.data.find((item) => item.price.id === propertyPriceId);
  const newSlots = 1 + (propertyItem?.quantity ?? 0);

  await supabase
    .from("profiles")
    .update({ property_slots: newSlots })
    .eq("id", session.userId);

  return Response.json({ ok: true, propertySlots: newSlots });
}
