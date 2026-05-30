import nodemailer from 'nodemailer';
import { submitWorkOrder, getRoutingContactForCategory } from '@/lib/workOrders';
import { sendSms } from '@/lib/twilio';

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

async function notifyByEmail(to: string, slug: string, categoryName: string, description: string | null, otherMessage: string | null) {
  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPass = process.env.ZOHO_SMTP_PASS;
  if (!smtpUser || !smtpPass) throw new Error('Email service not configured');

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"Pillar Work Orders" <${smtpUser}>`,
    to,
    subject: `New Work Order: ${categoryName} — ${slug}`,
    html: `
      <p><strong>Property:</strong> ${slug}</p>
      <p><strong>Category:</strong> ${categoryName}</p>
      ${description ? `<p><strong>Description:</strong> ${description.replace(/\n/g, '<br />')}</p>` : ''}
      ${otherMessage ? `<p><strong>Note:</strong> ${otherMessage}</p>` : ''}
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    `,
  });
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

    const description = typeof body.description === 'string' ? body.description.trim() || null : null;
    const otherMessage = typeof body.other_message === 'string' ? body.other_message.trim() || null : null;

    const workOrder = await submitWorkOrder(slug, categoryName, description, otherMessage);
    const routing = await getRoutingContactForCategory(slug, categoryName);

    if (routing) {
      const notifyJobs: Promise<void>[] = [];

      if (routing.phone) {
        notifyJobs.push(
          notifyBySms(routing.phone, slug, categoryName, description, otherMessage)
            .catch((e) => console.error('[work-order] SMS notification failed:', e))
        );
      }

      if (routing.email) {
        notifyJobs.push(
          notifyByEmail(routing.email, slug, categoryName, description, otherMessage)
            .catch((e) => console.error('[work-order] Email notification failed:', e))
        );
      }

      await Promise.allSettled(notifyJobs);
    }

    return Response.json({ ok: true, id: workOrder.id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
