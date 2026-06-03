import { cookies } from "next/headers";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmpillar.com";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.userId)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;

  if (!customerId && session.email) {
    // No customer ID in DB — try to find by email in Stripe before giving up
    const existing = await stripe.customers.list({ email: session.email, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", session.userId);
    }
  }

  if (!customerId) {
    return Response.json({ error: "No Stripe billing account found. Please subscribe first to access billing management." }, { status: 400 });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/manager`,
    });
    return Response.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    console.error('[billing/portal] Stripe error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
