import twilio from 'twilio';

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (_client) return _client;
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  _client = twilio(sid, token);
  return _client;
}

// Used for work order SMS notifications only
export async function sendSms(to: string, body: string): Promise<void> {
  const from = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!from) throw new Error('TWILIO_PHONE_NUMBER is not set');
  // Normalize to E.164 — strip spaces, dashes, parens, dots
  const digits = to.replace(/[^\d+]/g, '');
  const e164 = digits.startsWith('+') ? digits : `+1${digits}`;
  await getClient().messages.create({ to: e164, from, body });
}
