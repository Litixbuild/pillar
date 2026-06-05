import { createServiceClient } from './supabase';

export function getClientIp(req: Request): string | undefined {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? undefined;
}

export async function logAuditEvent(params: {
  userId?: string;
  eventType: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from('audit_logs').insert({
      user_id: params.userId ?? null,
      event_type: params.eventType,
      status: params.status,
      ip_address: params.ipAddress ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Audit logging must never crash the main request
  }
}
