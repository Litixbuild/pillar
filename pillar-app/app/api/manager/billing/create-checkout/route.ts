import { cookies } from "next/headers";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import { getReferralCouponId } from "@/lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmpillar.com";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId || !session.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const basePriceId = process.env.STRIPE_BASE_PRICE_ID;
  if (!basePriceId) {
    return Response.json({ error: "Billing not configured" }, { status: 500 });
  }

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, referral_discount_cents")
    .eq("id", session.userId)
    .single();

  let customerId: string | undefined = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      metadata: { userId: session.userId },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", session.userId);
  }

  const discountCents: number = (profile?.referral_discount_cents as number) ?? 0;
  const couponId = await getReferralCouponId(discountCents);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: basePriceId, quantity: 1 }],
    success_url: `${APP_URL}/manager?billing=success`,
    cancel_url: `${APP_URL}/manager?billing=cancel`,
    ...(couponId
      ? { discounts: [{ coupon: couponId }] }
      : { allow_promotion_codes: true }),
    subscription_data: {
      metadata: { userId: session.userId },
    },
  });

  return Response.json({ url: checkoutSession.url });
}
