import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { updateWorkOrderCategory, deleteWorkOrderCategory } from '@/lib/workOrders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

// PATCH — update phone/email for a category (builtin or custom)
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug, id } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    if (!isPlainObject(body)) return Response.json({ error: 'Invalid body' }, { status: 400 });

    const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
    const email = typeof body.email === 'string' ? body.email.trim() || null : null;

    await updateWorkOrderCategory(id, slug, phone, email);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

// DELETE — remove a custom category (builtin categories cannot be deleted)
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug, id } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    await deleteWorkOrderCategory(id, slug);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
