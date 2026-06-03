import { logPropertyEvent, type EventType } from '@/lib/propertyEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set<EventType>(['amenity_view', 'concierge_message', 'work_order_submitted']);

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    const eventType = typeof body?.event_type === 'string' ? body.event_type : '';

    if (!slug || !VALID_TYPES.has(eventType as EventType)) {
      return Response.json({ ok: false }, { status: 400 });
    }

    await logPropertyEvent(slug, eventType as EventType);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
