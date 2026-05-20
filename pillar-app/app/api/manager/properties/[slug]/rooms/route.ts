import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess, savePropertyRooms } from '@/lib/properties';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    const raw = (body as Record<string, unknown>)?.rooms;
    const rooms = Array.isArray(raw)
      ? (raw as unknown[]).filter((r): r is string => typeof r === 'string' && r.trim().length > 0).map((r) => r.trim())
      : [];

    await savePropertyRooms(slug, rooms);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
