import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import {
  requirePropertyAccess,
  createPropertyWindow,
  savePropertyWindows,
  deletePropertyWindow,
} from '@/lib/properties';
import { isValidWindowType, generateWindowId } from '@/lib/types';
import type { AmenityWindow } from '@/lib/types';

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

// POST — create a new window row in property_windows
export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    if (!isPlainObject(body)) return Response.json({ error: 'Invalid body' }, { status: 400 });

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });

    const type = isValidWindowType(body.type) ? body.type : 'text';
    const id = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : generateWindowId();
    const displayOrder = typeof body.displayOrder === 'number' ? body.displayOrder : 0;

    const window: AmenityWindow = {
      id,
      title,
      type,
      body: typeof body.body === 'string' && body.body.trim() ? body.body.trim() : undefined,
    };

    await createPropertyWindow(slug, window, displayOrder);
    return Response.json({ ok: true, window }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

// PATCH — save content + order changes for all windows
export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    if (!isPlainObject(body) || !Array.isArray(body.windows)) {
      return Response.json({ error: 'Expected { windows: [...] }' }, { status: 400 });
    }

    const windows: AmenityWindow[] = (body.windows as unknown[])
      .filter(isPlainObject)
      .map((w) => ({
        id: String(w.id || ''),
        title: String(w.title || ''),
        type: isValidWindowType(w.type) ? w.type : 'text',
        body: typeof w.body === 'string' && w.body.trim() ? w.body.trim() : undefined,
        url: typeof w.url === 'string' && w.url.trim() ? w.url.trim() : undefined,
      }))
      .filter((w) => w.id);

    await savePropertyWindows(slug, windows);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE — remove a single window by id
export async function DELETE(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    const id = isPlainObject(body) && typeof body.id === 'string' ? body.id.trim() : '';
    if (!id) return Response.json({ error: 'Window id is required' }, { status: 400 });

    await deletePropertyWindow(id);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
