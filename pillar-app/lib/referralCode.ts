import { randomBytes } from "crypto";
import type { createServiceClient } from "@/lib/supabase";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes).map((b) => chars[b % chars.length]).join("");
}

export async function getUniqueReferralCode(service: ReturnType<typeof createServiceClient>): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    const { data } = await service.from("profiles").select("id").eq("referral_code", code).maybeSingle();
    if (!data) return code;
  }
  return generateReferralCode();
}

/** Resolve the pillar_ref cookie (if any) to the referrer's profile id. */
export async function resolveReferrer(
  service: ReturnType<typeof createServiceClient>,
  refCookieCode: string | null,
  newUserId: string
): Promise<string | null> {
  if (!refCookieCode) return null;
  const { data: referrer } = await service
    .from("profiles")
    .select("id")
    .eq("referral_code", refCookieCode)
    .maybeSingle();
  if (referrer?.id && referrer.id !== newUserId) return referrer.id as string;
  return null;
}
