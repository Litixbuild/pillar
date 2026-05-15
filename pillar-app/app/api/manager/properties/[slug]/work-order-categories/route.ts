import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import {
  getWorkOrderCategoriesWithContacts,
  createWorkOrderCategory,
} from '@/lib/workOrders';

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

// GET — list all categories with routing contacts (manager only)
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const categories = await getWorkOrderCategoriesWithContacts(slug);
    return Response.json({ categories }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

// POST — create a new custom category
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    if (!isPlainObject(body)) return Response.json({ error: 'Invalid body' }, { status: 400 });

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });

    const phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
    const email = typeof body.email === 'string' ? body.email.trim() || null : null;

    const category = await createWorkOrderCategory(slug, name, phone, email);
    return Response.json({ category }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
