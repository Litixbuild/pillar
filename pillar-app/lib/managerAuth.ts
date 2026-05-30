import crypto from "crypto";

const COOKIE_NAME = "pillar_manager";
const DEVICE_COOKIE_NAME = "pillar_device";
const TEMP_COOKIE_NAME = "pillar_mfa_pending";

function getSecretOrNull(): string | null {
  const s = process.env.MANAGER_SESSION_SECRET?.trim();
  return s ? s : null;
}

function getSecretRequired(): string {
  const s = getSecretOrNull();
  if (!s) {
    throw new Error(
      "Missing MANAGER_SESSION_SECRET. Set it in .env.local or in your host env vars (Netlify: Site settings → Environment variables). After adding it, trigger a new deploy."
    );
  }
  return s;
}

export function getManagerCookieName() { return COOKIE_NAME; }
export function getDeviceCookieName()  { return DEVICE_COOKIE_NAME; }
export function getTempCookieName()    { return TEMP_COOKIE_NAME; }

// ── OTP helpers ───────────────────────────────────────────────────

export function generateOtp(): string {
  // Cryptographically random 6-digit code
  const n = crypto.randomInt(100000, 1000000);
  return n.toString();
}

export function hashOtp(code: string): string {
  return crypto.createHmac('sha256', getSecretRequired() + ':otp').update(code).digest('hex');
}

// ── Temp token (holds OTP hash between login and MFA verify) ─────

export function signTempToken(payload: {
  userId: string;
  email: string;
  name?: string;
  codeHash: string;
  iat: number;
}): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const h = crypto.createHmac('sha256', getSecretRequired() + ':mfa').update(b64).digest('base64url');
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
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac('sha256', secret + ':mfa').update(b64).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const d = JSON.parse(json) as { userId?: unknown; email?: unknown; name?: unknown; codeHash?: unknown; iat?: unknown };
    if (
      typeof d.email !== 'string' ||
      typeof d.userId !== 'string' ||
      typeof d.codeHash !== 'string' ||
      typeof d.iat !== 'number'
    ) return null;
    if (Date.now() - d.iat > 15 * 60 * 1000) return null; // 15-min expiry
    return {
      userId: d.userId,
      email: d.email,
      name: typeof d.name === 'string' ? d.name : undefined,
      codeHash: d.codeHash,
      iat: d.iat,
    };
  } catch {
    return null;
  }
}

// ── Full session token ────────────────────────────────────────────

export function signManagerSession(payload: { email: string; name?: string; userId?: string; iat: number }): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  const h = crypto.createHmac("sha256", getSecretRequired()).update(b64).digest("base64url");
  return `${b64}.${h}`;
}

export function verifyManagerSession(token: string): { email: string; name?: string; userId?: string; iat: number } | null {
  const secret = getSecretOrNull();
  if (!secret) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(b64).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const data = JSON.parse(json) as { email?: unknown; name?: unknown; userId?: unknown; iat?: unknown };
    if (typeof data.email !== "string" || typeof data.iat !== "number") return null;
    return {
      email: data.email,
      name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : undefined,
      userId: typeof data.userId === "string" ? data.userId : undefined,
      iat: data.iat,
    };
  } catch {
    return null;
  }
}
