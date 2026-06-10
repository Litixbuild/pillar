import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

const EXPIRY_HOURS = 8;

export interface LateCheckoutRequest {
  id: string;
  property_slug: string;
  status: string; // 'pending' | 'approved' | 'denied'
  submitted_at: string;
  actioned_at: string | null;
  expires_at: string;
}

function rowToRequest(row: Row): LateCheckoutRequest {
  return {
    id: String(row.id),
    property_slug: String(row.property_slug),
    status: String(row.status),
    submitted_at: String(row.submitted_at),
    actioned_at: typeof row.actioned_at === 'string' ? row.actioned_at : null,
    expires_at: String(row.expires_at),
  };
}

export async function createLateCheckoutRequest(slug: string): Promise<LateCheckoutRequest> {
  const supabase = createServiceClient();
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('late_checkout_requests')
    .insert({ property_slug: slug, expires_at: expiresAt })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create request');
  return rowToRequest(data as Row);
}

export async function getLateCheckoutRequest(id: string): Promise<LateCheckoutRequest | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('late_checkout_requests')
    .select('*')
    .eq('id', id)
    .single();
  return data ? rowToRequest(data as Row) : null;
}

export async function getPendingLateCheckoutsByProperty(slug: string): Promise<LateCheckoutRequest[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('late_checkout_requests')
    .select('*')
    .eq('property_slug', slug)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('submitted_at', { ascending: false });
  return (data as Row[] | null)?.map(rowToRequest) ?? [];
}

export async function getActionedLateCheckoutsByProperty(slug: string): Promise<LateCheckoutRequest[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('late_checkout_requests')
    .select('*')
    .eq('property_slug', slug)
    .in('status', ['approved', 'denied'])
    .order('submitted_at', { ascending: false })
    .limit(20);
  return (data as Row[] | null)?.map(rowToRequest) ?? [];
}

export async function actionLateCheckoutRequest(
  id: string,
  managerId: string,
  action: 'approved' | 'denied'
): Promise<void> {
  const supabase = createServiceClient();

  const { data: req } = await supabase
    .from('late_checkout_requests')
    .select('property_slug')
    .eq('id', id)
    .single();
  if (!req) throw new Error('Request not found');

  const { data: prop } = await supabase
    .from('properties')
    .select('slug')
    .eq('slug', (req as Row).property_slug)
    .eq('manager_id', managerId)
    .single();
  if (!prop) throw new Error('Forbidden');

  const { error } = await supabase
    .from('late_checkout_requests')
    .update({ status: action, actioned_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getPendingLateCheckoutCounts(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('late_checkout_requests')
    .select('property_slug')
    .in('property_slug', slugs)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  const counts: Record<string, number> = {};
  for (const slug of slugs) counts[slug] = 0;
  for (const row of (data as Row[] | null) ?? []) {
    const s = String(row.property_slug);
    counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

export async function getTotalPendingLateCheckoutsByManager(managerId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data: props } = await supabase
    .from('properties')
    .select('slug')
    .eq('manager_id', managerId);

  const slugs = ((props as Row[] | null) ?? []).map((r) => String(r.slug)).filter(Boolean);
  if (slugs.length === 0) return 0;

  const { count } = await supabase
    .from('late_checkout_requests')
    .select('id', { count: 'exact', head: true })
    .in('property_slug', slugs)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  return count ?? 0;
}
