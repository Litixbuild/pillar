import crypto from "crypto";

const COOKIE_NAME = "pillar_admin";

function getSecretOrNull(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  return s ? s : null;
}

function getSecretRequired(): string {
  const s = getSecretOrNull();
  if (!s) throw new Error("Missing ADMIN_SESSION_SECRET in environment variables.");
  return s;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function signAdminSession(payload: { email: string; userId: string; iat: number }): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const h = crypto.createHmac("sha256", getSecretRequired()).update(b64).digest("base64url");
  return `${b64}.${h}`;
}

export async function getAdminSession(): Promise<{ email: string; userId: string; iat: number } | null> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}

export function verifyAdminSession(token: string): { email: string; userId: string; iat: number } | null {
  const secret = getSecretOrNull();
  if (!secret) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(b64, "base64url").toString("utf8")) as {
      email?: unknown;
      userId?: unknown;
      iat?: unknown;
    };
    if (typeof data.email !== "string" || typeof data.userId !== "string" || typeof data.iat !== "number") return null;
    return { email: data.email, userId: data.userId, iat: data.iat };
  } catch {
    return null;
  }
}
