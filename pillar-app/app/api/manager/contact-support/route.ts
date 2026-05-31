import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { sendSupportEmail } from '@/lib/mailer';

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

  try {
    await sendSupportEmail({
      replyTo: session.email,
      fromName: session.name ?? session.email,
      slug,
      propertyName,
      topic,
      description,
    });
  } catch (err) {
    console.error('[contact-support] SMTP error:', err);
    return Response.json({ error: 'Failed to send. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
