import { getLateCheckoutRequest } from '@/lib/lateCheckouts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim() ?? '';
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

    const request = await getLateCheckoutRequest(id);
    if (!request) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({
      status: request.status,
      expires_at: request.expires_at,
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
