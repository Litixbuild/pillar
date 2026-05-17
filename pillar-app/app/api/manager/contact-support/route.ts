import { cookies } from 'next/headers';
import { Resend } from 'resend';
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Email service not configured.' }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: 'Pillar Support <noreply@pmpillar.com>',
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

  if (error) {
    console.error('[contact-support] Resend error:', error);
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
