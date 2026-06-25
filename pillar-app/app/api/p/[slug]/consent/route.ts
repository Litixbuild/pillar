import { getActiveStay } from '@/lib/stays';
import { recordConsent } from '@/lib/stayConsent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    // Resolve the active stay server-side — never trust a client-supplied
    // stay id for what becomes evidence in a damage report.
    const stay = await getActiveStay(slug);
    if (!stay) return Response.json({ error: 'No active stay for this property' }, { status: 404 });

    const xff = req.headers.get('x-forwarded-for');
    const ipAddress = xff ? xff.split(',')[0].trim() : req.headers.get('x-real-ip');
    const userAgent = req.headers.get('user-agent');

    await recordConsent(stay.id, slug, ipAddress, userAgent);
    return Response.json({ ok: true, stayId: stay.id }, { status: 200 });
  } catch (e) {
    console.error('[consent POST]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
