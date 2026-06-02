import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import { updateReferrerDiscount } from "@/lib/referral";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function deriveSlotsFromSub(sub: Stripe.Subscription): number {
  const propertyPriceId = process.env.STRIPE_PROPERTY_PRICE_ID;
  const propertyItem = propertyPriceId
    ? sub.items.data.find((item) => item.price.id === propertyPriceId)
    : null;
  return 1 + (propertyItem?.quantity ?? 0);
}

async function updateProfileFromSub(userId: string, sub: Stripe.Subscription) {
  const supabase = createServiceClient();
  const isActive = sub.status === "active" || sub.status === "trialing";
  await supabase.from("profiles").update({
    stripe_subscription_id: sub.id,
    stripe_subscription_status: sub.status,
    is_subscribed: isActive,
    property_slots: isActive ? deriveSlotsFromSub(sub) : 1,
  }).eq("id", userId);
}

async function getReferrerId(userId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", userId)
    .single();
  return (data?.referred_by as string | null) ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const subId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
      if (!subId) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await updateProfileFromSub(userId, sub);

      // Credit referrer when this manager's subscription first goes active
      if (sub.status === "active" || sub.status === "trialing") {
        const referrerId = await getReferrerId(userId);
        if (referrerId) await updateReferrerDiscount(referrerId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;
      await updateProfileFromSub(userId, sub);

      // Update referrer discount when subscription becomes inactive (e.g. goes past_due)
      const prevAttrs = event.data.previous_attributes as Record<string, unknown> | undefined;
      const statusChanged = prevAttrs?.status !== undefined;
      const isNowInactive = sub.status !== "active" && sub.status !== "trialing";
      if (statusChanged && isNowInactive) {
        const referrerId = await getReferrerId(userId);
        if (referrerId) await updateReferrerDiscount(referrerId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;
      await updateProfileFromSub(userId, sub);

      // Referrer loses credit when this manager cancels
      const referrerId = await getReferrerId(userId);
      if (referrerId) await updateReferrerDiscount(referrerId);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.type === "subscription_details"
        ? (invoice.parent as { type: string; subscription_details?: { subscription: string | Stripe.Subscription | null } }).subscription_details
        : null;
      const subId = typeof subDetails?.subscription === "string"
        ? subDetails.subscription
        : subDetails?.subscription?.id;
      if (!subId) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await updateProfileFromSub(userId, sub);

      // Re-credit referrer if payment success restored an active subscription
      if (sub.status === "active" || sub.status === "trialing") {
        const referrerId = await getReferrerId(userId);
        if (referrerId) await updateReferrerDiscount(referrerId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subDetails = invoice.parent?.type === "subscription_details"
        ? (invoice.parent as { type: string; subscription_details?: { subscription: string | Stripe.Subscription | null } }).subscription_details
        : null;
      const subId = typeof subDetails?.subscription === "string"
        ? subDetails.subscription
        : subDetails?.subscription?.id;
      if (!subId) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const supabase = createServiceClient();
      await supabase.from("profiles").update({
        stripe_subscription_status: sub.status,
        is_subscribed: false,
      }).eq("id", userId);
      break;
    }
  }

  return Response.json({ received: true });
}
