import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function updateProfileFromSub(userId: string, sub: Stripe.Subscription) {
  const supabase = createServiceClient();
  await supabase.from("profiles").update({
    stripe_subscription_id: sub.id,
    stripe_subscription_status: sub.status,
    is_subscribed: sub.status === "active" || sub.status === "trialing",
  }).eq("id", userId);
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
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;
      await updateProfileFromSub(userId, sub);
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
