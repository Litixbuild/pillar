import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase";
import { getManagerCookieName, signManagerSession } from "@/lib/managerAuth";
import { getGoogleClientConfig, getOAuthBaseUrl, exchangeGoogleCode, GOOGLE_STATE_COOKIE } from "@/lib/googleOAuth";
import { getUniqueReferralCode, resolveReferrer } from "@/lib/referralCode";
import { logAuditEvent, getClientIp } from "@/lib/auditLog";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const base = getOAuthBaseUrl(req);
  const failure = Response.redirect(`${base}/manager/login?error=google`, 302);

  const config = getGoogleClientConfig();
  if (!config) return failure;

  const allowed = await checkRateLimit(`google-oauth:${getClientIp(req)}`, 10, 900);
  if (!allowed) return failure;

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const expectedState = jar.get(GOOGLE_STATE_COOKIE)?.value ?? null;
  jar.delete(GOOGLE_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) return failure;

  const identity = await exchangeGoogleCode({
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: `${base}/api/manager/auth/google/callback`,
  });

  // Only accept Google-verified addresses — this is what lets us skip our own
  // email verification and safely link to existing accounts by email.
  if (!identity || !identity.emailVerified) return failure;

  const service = createServiceClient();

  const { data: existingProfile } = await service
    .from("profiles")
    .select("id, full_name, role")
    .eq("email", identity.email)
    .maybeSingle();

  let userId: string;
  let managerName: string | undefined;

  if (existingProfile) {
    // Existing account (password or Google) — link by verified email.
    if (existingProfile.role === "commercial") return failure;
    userId = existingProfile.id as string;
    managerName = (existingProfile.full_name as string | null) ?? undefined;

    if (!managerName && identity.name) {
      managerName = identity.name;
      await service.from("profiles").update({ full_name: identity.name }).eq("id", userId);
    }
  } else {
    // New account. Create the Supabase auth user first (no password — they sign
    // in with Google, or set a password later via forgot-password).
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: identity.email,
      email_confirm: true,
      user_metadata: identity.name ? { full_name: identity.name } : undefined,
    });

    if (createError || !created.user) {
      // Auth user may exist without a profile row (e.g. abandoned unverified
      // signup). Recover its id so we can attach a profile instead of failing.
      const { data: list } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const orphan = list?.users.find((u) => u.email?.toLowerCase() === identity.email);
      if (!orphan) {
        console.error("[google-oauth] createUser failed:", createError?.message);
        return failure;
      }
      userId = orphan.id;
    } else {
      userId = created.user.id;
    }

    managerName = identity.name ?? undefined;

    const referralCode = await getUniqueReferralCode(service);
    const refCookieCode = jar.get("pillar_ref")?.value ?? null;
    const referredBy = await resolveReferrer(service, refCookieCode, userId);

    const { error: profileError } = await service.from("profiles").insert({
      id: userId,
      email: identity.email,
      full_name: identity.name ?? "",
      role: "manager",
      is_subscribed: false,
      referral_code: referralCode,
      ...(referredBy ? { referred_by: referredBy } : {}),
    });

    if (profileError && !profileError.message.includes("duplicate")) {
      console.error("[google-oauth] profile insert failed:", profileError.message);
      return failure;
    }
  }

  // Google verified the user's identity, so the email-OTP step is skipped —
  // same trust level as a verified trusted device.
  const sessionToken = signManagerSession({ email: identity.email, name: managerName, userId, iat: Date.now() });
  jar.set({
    name: getManagerCookieName(),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  await logAuditEvent({
    userId,
    eventType: "manager.login",
    status: "success",
    ipAddress: getClientIp(req),
    metadata: { method: "google_oauth", newAccount: !existingProfile },
  });

  return Response.redirect(`${base}/manager`, 302);
}
