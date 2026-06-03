import { createServiceClient } from '@/lib/supabase';

export type EventType = 'amenity_view' | 'concierge_message' | 'work_order_submitted';

type Row = Record<string, unknown>;

export async function logPropertyEvent(slug: string, eventType: EventType): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from('property_events').insert({ property_slug: slug, event_type: eventType });
  } catch {
    // Non-critical — never let tracking break the guest experience
  }
}

export interface DashboardStats {
  avgResolutionHours: number | null;
  avgResolutionHoursPrev: number | null;
  issueBreakdown: { category: string; count: number }[];
  savedCallsThisMonth: number;
  propertyHealth: { slug: string; name: string; heroImage: string | null; openCount: number }[];
}

export async function getDashboardStats(managerId: string): Promise<DashboardStats> {
  const supabase = createServiceClient();

  // Get manager's properties
  const { data: props } = await supabase
    .from('properties')
    .select('slug, name, hero_image_url')
    .eq('manager_id', managerId);

  const properties = (props as Row[] | null) ?? [];
  const slugs = properties.map((p) => String(p.slug)).filter(Boolean);

  if (slugs.length === 0) {
    return { avgResolutionHours: null, avgResolutionHoursPrev: null, issueBreakdown: [], savedCallsThisMonth: 0, propertyHealth: [] };
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = startOfThisMonth;

  const [resolvedThis, resolvedPrev, openOrders, breakdownData, eventsData, workOrderEvents] = await Promise.all([
    // Resolved this month — for avg resolution time
    supabase
      .from('work_orders')
      .select('created_at, resolved_at')
      .in('property_slug', slugs)
      .eq('status', 'resolved')
      .gte('resolved_at', startOfThisMonth),

    // Resolved last month — for trend comparison
    supabase
      .from('work_orders')
      .select('created_at, resolved_at')
      .in('property_slug', slugs)
      .eq('status', 'resolved')
      .gte('resolved_at', startOfLastMonth)
      .lt('resolved_at', endOfLastMonth),

    // Open count per property
    supabase
      .from('work_orders')
      .select('property_slug')
      .in('property_slug', slugs)
      .eq('status', 'open'),

    // Issue breakdown this month
    supabase
      .from('work_orders')
      .select('category_name')
      .in('property_slug', slugs)
      .gte('created_at', startOfThisMonth),

    // Amenity + concierge events this month
    supabase
      .from('property_events')
      .select('id', { count: 'exact', head: true })
      .in('property_slug', slugs)
      .in('event_type', ['amenity_view', 'concierge_message'])
      .gte('created_at', startOfThisMonth),

    // Work orders submitted this month (each one = a saved call)
    supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .in('property_slug', slugs)
      .gte('created_at', startOfThisMonth),
  ]);

  // Avg resolution time
  function avgHours(rows: Row[]): number | null {
    const times = rows
      .map((r) => {
        const created = new Date(String(r.created_at)).getTime();
        const resolved = new Date(String(r.resolved_at)).getTime();
        return isNaN(created) || isNaN(resolved) ? null : (resolved - created) / 3_600_000;
      })
      .filter((n): n is number => n !== null && n >= 0);
    if (times.length === 0) return null;
    return Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10;
  }

  const avgResolutionHours = avgHours((resolvedThis.data as Row[] | null) ?? []);
  const avgResolutionHoursPrev = avgHours((resolvedPrev.data as Row[] | null) ?? []);

  // Open counts per property
  const openCounts: Record<string, number> = {};
  for (const slug of slugs) openCounts[slug] = 0;
  for (const row of (openOrders.data as Row[] | null) ?? []) {
    const s = String(row.property_slug);
    openCounts[s] = (openCounts[s] ?? 0) + 1;
  }

  const propertyHealth = properties.map((p) => ({
    slug: String(p.slug),
    name: String(p.name || p.slug),
    heroImage: typeof p.hero_image_url === 'string' && p.hero_image_url ? p.hero_image_url : null,
    openCount: openCounts[String(p.slug)] ?? 0,
  }));

  // Issue breakdown
  const categoryCount: Record<string, number> = {};
  for (const row of (breakdownData.data as Row[] | null) ?? []) {
    const c = String(row.category_name || 'Other');
    categoryCount[c] = (categoryCount[c] ?? 0) + 1;
  }
  const issueBreakdown = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Saved calls = amenity/concierge events + work orders submitted
  const savedCallsThisMonth = (eventsData.count ?? 0) + (workOrderEvents.count ?? 0);

  return { avgResolutionHours, avgResolutionHoursPrev, issueBreakdown, savedCallsThisMonth, propertyHealth };
}
