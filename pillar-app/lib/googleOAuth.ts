const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GOOGLE_STATE_COOKIE = "pillar_google_state";

export function getGoogleClientConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/**
 * Base URL for OAuth redirect URIs. Local dev keeps localhost so the flow works
 * without deploying; everything else uses the canonical domain, which must match
 * the redirect URI registered in Google Console exactly.
 */
export function getOAuthBaseUrl(req: Request): string {
  const url = new URL(req.url);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return url.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://pmpillar.com";
}

export function buildGoogleAuthUrl(opts: { clientId: string; redirectUri: string; state: string }): string {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: opts.state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleIdentity = {
  email: string;
  emailVerified: boolean;
  name: string | null;
};

/**
 * Exchange an authorization code for the user's identity. The id_token comes
 * straight from Google's token endpoint over TLS, so decoding its payload
 * without signature verification is safe here.
 */
export async function exchangeGoogleCode(opts: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleIdentity | null> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    console.error("[googleOAuth] token exchange failed:", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json().catch(() => null)) as { id_token?: string } | null;
  const idToken = data?.id_token;
  if (!idToken) return null;

  const parts = idToken.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      email?: unknown;
      email_verified?: unknown;
      name?: unknown;
    };
    if (typeof payload.email !== "string" || !payload.email) return null;
    return {
      email: payload.email.trim().toLowerCase(),
      emailVerified: payload.email_verified === true || payload.email_verified === "true",
      name: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : null,
    };
  } catch {
    return null;
  }
}
