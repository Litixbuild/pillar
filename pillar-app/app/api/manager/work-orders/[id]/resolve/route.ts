import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { resolveWorkOrder } from '@/lib/workOrders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const jar = await cookies();
    const token = jar.get(getManagerCookieName())?.value || '';
    const session = token ? verifyManagerSession(token) : null;
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({})) as { note?: string };
    const note = typeof body.note === 'string' ? body.note : null;

    await resolveWorkOrder(id, session.userId, note);
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'Forbidden' ? 403 : msg === 'Work order not found' ? 404 : 500;
    return Response.json({ error: msg }, { status });
  }
}
