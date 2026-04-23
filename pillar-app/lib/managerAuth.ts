import crypto from "crypto";

const COOKIE_NAME = "pillar_manager";

function getSecretOrNull(): string | null {
  const s = process.env.MANAGER_SESSION_SECRET?.trim();
  return s ? s : null;
}

function getSecretRequired(): string {
  const s = getSecretOrNull();
  if (!s) {
    throw new Error(
      "Missing MANAGER_SESSION_SECRET. Set it in .env.local / host env vars."
    );
  }
  return s;
}

export function getManagerCookieName() {
  return COOKIE_NAME;
}

export function signManagerSession(payload: { email: string; name?: string; iat: number }): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const h = crypto
    .createHmac("sha256", getSecretRequired())
    .update(b64)
    .digest("base64url");
  return `${b64}.${h}`;
}

export function verifyManagerSession(token: string): { email: string; name?: string; iat: number } | null {
  const secret = getSecretOrNull();
  if (!secret) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(b64)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const data = JSON.parse(json) as { email?: unknown; name?: unknown; iat?: unknown };
    if (typeof data.email !== "string" || typeof data.iat !== "number") return null;
    return {
      email: data.email,
      name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : undefined,
      iat: data.iat,
    };
  } catch {
    return null;
  }
}
