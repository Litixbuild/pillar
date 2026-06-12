import crypto from "crypto";

const COOKIE_NAME        = "pillar_commercial";
const DEVICE_COOKIE_NAME = "pillar_commercial_device";
const TEMP_COOKIE_NAME   = "pillar_commercial_mfa_pending";

function getSecretOrNull(): string | null {
  const s = process.env.COMMERCIAL_SESSION_SECRET?.trim();
  return s ? s : null;
}

function getSecretRequired(): string {
  const s = getSecretOrNull();
  if (!s) throw new Error("Missing COMMERCIAL_SESSION_SECRET. Add it to .env.local and to your hosting environment variables.");
  return s;
}

export function getCommercialCookieName()       { return COOKIE_NAME; }
export function getCommercialDeviceCookieName() { return DEVICE_COOKIE_NAME; }
export function getCommercialTempCookieName()   { return TEMP_COOKIE_NAME; }

// ── OTP helpers ───────────────────────────────────────────────

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string): string {
  return crypto.createHmac("sha256", getSecretRequired() + ":otp").update(code).digest("hex");
}

// ── Temp token (holds OTP hash between login and MFA verify) ──

export function signTempToken(payload: {
  userId: string;
  email: string;
  name?: string;
  codeHash: string;
  iat: number;
}): string {
  const json = JSON.stringify(payload);
  const b64  = Buffer.from(json, "utf8").toString("base64url");
  const h    = crypto.createHmac("sha256", getSecretRequired() + ":mfa").update(b64).digest("base64url");
  return `${b64}.${h}`;
}

export function verifyTempToken(token: string): {
  userId: string;
  email: string;
  name?: string;
  codeHash: string;
  iat: number;
} | null {
  const secret = getSecretOrNull();
  if (!secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", secret + ":mfa").update(b64).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const d = JSON.parse(json) as { userId?: unknown; email?: unknown; name?: unknown; codeHash?: unknown; iat?: unknown };
    if (typeof d.email !== "string" || typeof d.userId !== "string" || typeof d.codeHash !== "string" || typeof d.iat !== "number") return null;
    if (Date.now() - d.iat > 15 * 60 * 1000) return null;
    return { userId: d.userId, email: d.email, name: typeof d.name === "string" ? d.name : undefined, codeHash: d.codeHash, iat: d.iat };
  } catch { return null; }
}

// ── Full session token ────────────────────────────────────────

export function signCommercialSession(payload: { email: string; name?: string; userId?: string; iat: number }): string {
  const json = JSON.stringify(payload);
  const b64  = Buffer.from(json, "utf8").toString("base64url");
  const h    = crypto.createHmac("sha256", getSecretRequired()).update(b64).digest("base64url");
  return `${b64}.${h}`;
}

export function verifyCommercialSession(token: string): { email: string; name?: string; userId?: string; iat: number } | null {
  const secret = getSecretOrNull();
  if (!secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const b64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const data = JSON.parse(json) as { email?: unknown; name?: unknown; userId?: unknown; iat?: unknown };
    if (typeof data.email !== "string" || typeof data.iat !== "number") return null;
    if (Date.now() - data.iat > 24 * 60 * 60 * 1000) return null;
    return {
      email:  data.email,
      name:   typeof data.name   === "string" && data.name.trim()   ? data.name.trim()             : undefined,
      userId: typeof data.userId === "string" && data.userId.trim() ? data.userId.trim()            : undefined,
      iat:    data.iat,
    };
  } catch { return null; }
}
