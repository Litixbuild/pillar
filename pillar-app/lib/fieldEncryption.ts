import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:';

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY?.trim();
  if (!hex || hex.length !== 64) {
    throw new Error('FIELD_ENCRYPTION_KEY must be a 64-character hex string.');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptField(value: string): string {
  if (!value) return value;
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptField(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value; // plaintext passthrough for existing data
  try {
    const [ivB64, authTagB64, ciphertextB64] = value.slice(PREFIX.length).split(':');
    if (!ivB64 || !authTagB64 || !ciphertextB64) return value;
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return value; // if decryption fails, return as-is rather than crashing
  }
}
