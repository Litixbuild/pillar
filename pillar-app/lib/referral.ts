import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";

// Coupons are created on-demand with IDs like PILLAR_REF_100 ($1 off), PILLAR_REF_200 ($2 off), etc.
async function ensureCoupon(amountOffCents: number): Promise<string> {
  const couponId = `PILLAR_REF_${amountOffCents}`;
  try {
    await stripe.coupons.retrieve(couponId);
  } catch {
    await stripe.coupons.create({
      id: couponId,
      amount_off: amountOffCents,
      currency: "usd",
      duration: "forever",
      name: `Referral Discount — $${(amountOffCents / 100).toFixed(0)} off/month`,
    });
  }
  return couponId;
}

export async function getReferralCouponId(amountOffCents: number): Promise<string | null> {
  if (amountOffCents <= 0) return null;
  return ensureCoupon(amountOffCents);
}

export async function updateReferrerDiscount(referrerId: string): Promise<void> {
  const supabase = createServiceClient();

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", referrerId)
    .eq("is_subscribed", true);

  const activeCount = count ?? 0;
  const amountOffCents = activeCount * 100; // $1 per active referral

  await supabase
    .from("profiles")
    .update({ referral_discount_cents: amountOffCents })
    .eq("id", referrerId);

  const { data: referrer } = await supabase
    .from("profiles")
    .select("stripe_subscription_id, stripe_subscription_status")
    .eq("id", referrerId)
    .single();

  const subId = referrer?.stripe_subscription_id as string | null;
  const subStatus = referrer?.stripe_subscription_status as string | null;

  if (subId && (subStatus === "active" || subStatus === "trialing")) {
    if (amountOffCents > 0) {
      const couponId = await ensureCoupon(amountOffCents);
      await stripe.subscriptions.update(subId, { coupon: couponId } as Parameters<typeof stripe.subscriptions.update>[1]);
    } else {
      try {
        await stripe.subscriptions.deleteDiscount(subId);
      } catch {
        // no discount to remove
      }
    }
  }
}
