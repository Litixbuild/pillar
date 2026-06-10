import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { actionLateCheckoutRequest } from '@/lib/lateCheckouts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const jar = await cookies();
    const token = jar.get(getManagerCookieName())?.value || '';
    const session = token ? verifyManagerSession(token) : null;
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await props.params;
    const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
    const action = body?.action;
    if (action !== 'approved' && action !== 'denied') {
      return Response.json({ error: 'action must be "approved" or "denied"' }, { status: 400 });
    }

    await actionLateCheckoutRequest(id, session.userId, action);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'Forbidden' ? 403 : msg === 'Request not found' ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
