import { getWorkOrderCategories } from '@/lib/workOrders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/guest/work-order-categories?slug=xxx
// Returns category names only — NO phone/email ever exposed to tenant.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug')?.trim() ?? '';
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    const categories = await getWorkOrderCategories(slug);
    return Response.json(
      { categories: categories.map((c) => ({ id: c.id, name: c.name })) },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
