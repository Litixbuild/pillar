import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getTotalOpenCountByManager } from '@/lib/workOrders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get(getManagerCookieName())?.value || '';
    const session = token ? verifyManagerSession(token) : null;
    if (!session?.userId) return Response.json({ count: 0 }, { status: 401 });

    const count = await getTotalOpenCountByManager(session.userId);
    return Response.json({ count });
  } catch {
    return Response.json({ count: 0 });
  }
}
