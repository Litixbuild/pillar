import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { getMostRecentStay } from '@/lib/stays';
import { getLatestReportForStay } from '@/lib/stayReports';
import { generateStayReport } from '@/lib/stayReportGenerator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const stay = await getMostRecentStay(slug);
    if (!stay) return Response.json({ report: null, hasStay: false }, { status: 200 });

    const report = await getLatestReportForStay(stay.id);
    return Response.json({ report, hasStay: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const stay = await getMostRecentStay(slug);
    if (!stay) {
      return Response.json(
        { error: 'No tenant stay exists yet for this property. Confirm a new tenant first.' },
        { status: 404 }
      );
    }

    const report = await generateStayReport(slug, stay);
    return Response.json({ report }, { status: 200 });
  } catch (e) {
    console.error('[report POST]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Failed to generate report' }, { status: 500 });
  }
}
