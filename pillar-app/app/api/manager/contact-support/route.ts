import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireManagerSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export async function POST(req: Request) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug, propertyName, topic, description } = (await req.json()) as {
    slug?: string;
    propertyName?: string;
    topic?: string;
    description?: string;
  };

  if (!topic || !description?.trim()) {
    return Response.json({ error: 'Topic and description are required.' }, { status: 400 });
  }

  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPass = process.env.ZOHO_SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return Response.json({ error: 'Email service not configured.' }, { status: 503 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: `"Pillar Support" <${smtpUser}>`,
      to: 'support@pmpillar.com',
      replyTo: session.email,
      subject: `[Support] ${topic} — ${propertyName ?? slug ?? 'Unknown'} (${slug ?? 'no-id'})`,
      html: `
        <p><strong>From:</strong> ${session.name ?? session.email} &lt;${session.email}&gt;</p>
        <p><strong>Property:</strong> ${propertyName ?? '—'}</p>
        <p><strong>Property ID:</strong> ${slug ?? '—'}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <hr />
        <p>${description.replace(/\n/g, '<br />')}</p>
      `,
    });
  } catch (err) {
    console.error('[contact-support] SMTP error:', err);
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
