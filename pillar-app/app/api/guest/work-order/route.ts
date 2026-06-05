import { submitWorkOrder, getRoutingContactForCategory } from '@/lib/workOrders';
import { sendSms } from '@/lib/twilio';
import { sendWorkOrderEmail } from '@/lib/mailer';
import { logPropertyEvent } from '@/lib/propertyEvents';
import { getClientIp } from '@/lib/auditLog';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

async function notifyBySms(to: string, slug: string, categoryName: string, description: string | null, otherMessage: string | null) {
  const lines = [
    `Pillar: New work order submitted - ${categoryName} at [${slug}].`,
    description ? `Details: ${description}.` : null,
    otherMessage ? `Note: ${otherMessage}.` : null,
    `Manage at pmpillar.com. Reply STOP to opt out.`,
  ].filter(Boolean);
  await sendSms(to, lines.join(' '));
}


// POST /api/guest/work-order
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    if (!isPlainObject(body)) return Response.json({ error: 'Invalid body' }, { status: 400 });

    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const categoryName = typeof body.category_name === 'string' ? body.category_name.trim() : '';

    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });
    if (!categoryName) return Response.json({ error: 'category_name is required' }, { status: 400 });

    const ip = getClientIp(req) ?? 'unknown';
    const allowed = await checkRateLimit(`work-order:${slug}:${ip}`, 5, 3600);
    if (!allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const description = typeof body.description === 'string' ? body.description.trim() || null : null;
    const otherMessage = typeof body.other_message === 'string' ? body.other_message.trim() || null : null;

    const workOrder = await submitWorkOrder(slug, categoryName, description, otherMessage);
    void logPropertyEvent(slug, 'work_order_submitted');
    const routing = await getRoutingContactForCategory(slug, categoryName);

    const smsError: string[] = [];

    if (routing) {
      const notifyJobs: Promise<void>[] = [];

      if (routing.phone) {
        notifyJobs.push(
          notifyBySms(routing.phone, slug, categoryName, description, otherMessage)
            .catch((e) => {
              const msg = e instanceof Error ? e.message : String(e);
              console.error('[work-order] SMS failed:', msg);
              smsError.push(msg);
            })
        );
      }

      if (routing.email) {
        notifyJobs.push(
          sendWorkOrderEmail(routing.email, slug, categoryName, description, otherMessage)
            .catch((e) => console.error('[work-order] Email notification failed:', e))
        );
      }

      await Promise.allSettled(notifyJobs);
    }

    return Response.json({
      ok: true,
      id: workOrder.id,
      ...(smsError.length ? { sms_error: smsError[0] } : {}),
    }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
