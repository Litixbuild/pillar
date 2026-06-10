import { createServiceClient } from '@/lib/supabase';
import { sendSms } from '@/lib/twilio';
import { sendLateCheckoutEmail } from '@/lib/mailer';
import { getClientIp } from '@/lib/auditLog';
import { checkRateLimit } from '@/lib/rateLimit';
import { createLateCheckoutRequest } from '@/lib/lateCheckouts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { slug?: unknown } | null;
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    const ip = getClientIp(req) ?? 'unknown';
    const allowed = await checkRateLimit(`late-checkout:${slug}:${ip}`, 3, 3600);
    if (!allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const service = createServiceClient();
    const { data: property } = await service
      .from('properties')
      .select('name, manager_phone, manager_id')
      .eq('slug', slug)
      .single();

    if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });

    const propertyName = (property.name as string) || slug;
    const managerPhone = typeof property.manager_phone === 'string' ? property.manager_phone.trim() : null;
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const notifyJobs: Promise<void>[] = [];

    // SMS to manager's property phone
    if (managerPhone) {
      const smsBody = `Pillar: Late checkout requested at ${propertyName}. Submitted ${now}. Manage at pmpillar.com. Reply STOP to opt out.`;
      notifyJobs.push(
        sendSms(managerPhone, smsBody).catch((e) =>
          console.error('[late-checkout] SMS error:', e)
        )
      );
    }

    // Email to manager if configured
    if (property.manager_id) {
      const { data: profile } = await service
        .from('profiles')
        .select('email')
        .eq('id', property.manager_id)
        .single();

      const managerEmail = typeof profile?.email === 'string' ? profile.email.trim() : null;

      if (managerEmail) {
        notifyJobs.push(
          sendLateCheckoutEmail(managerEmail, propertyName, now)
            .catch((e) => console.error('[late-checkout] Email error:', e))
        );
      }
    }

    const request = await createLateCheckoutRequest(slug).catch(() => null);
    await Promise.allSettled(notifyJobs);
    return Response.json({ ok: true, requestId: request?.id ?? null }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
