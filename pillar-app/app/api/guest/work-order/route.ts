import { submitWorkOrder, getRoutingContactForCategory } from '@/lib/workOrders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

// POST /api/guest/work-order
// Tenant submits a work order. Routing contacts are looked up server-side
// and NEVER returned in the response — tenant only sees a success/failure.
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

    // Look up routing contact server-side (never sent to client)
    const _routing = await getRoutingContactForCategory(slug, categoryName);
    // TODO: when messaging is added, use _routing.phone / _routing.email to notify here

    return Response.json({ ok: true, id: workOrder.id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
