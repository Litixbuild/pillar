import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface PropertyStay {
  id: string;
  property_slug: string;
  status: string; // 'active' | 'closed'
  started_at: string;
  ended_at: string | null;
}

function rowToStay(row: Row): PropertyStay {
  return {
    id: String(row.id),
    property_slug: String(row.property_slug),
    status: String(row.status),
    started_at: String(row.started_at),
    ended_at: typeof row.ended_at === 'string' ? row.ended_at : null,
  };
}

export async function getActiveStay(slug: string): Promise<PropertyStay | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_stays')
    .select('*')
    .eq('property_slug', slug)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? rowToStay(data as Row) : null;
}

export async function getMostRecentStay(slug: string): Promise<PropertyStay | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_stays')
    .select('*')
    .eq('property_slug', slug)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? rowToStay(data as Row) : null;
}

export async function getStayHistory(slug: string, limit = 20): Promise<PropertyStay[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_stays')
    .select('*')
    .eq('property_slug', slug)
    .eq('status', 'closed')
    .order('started_at', { ascending: false })
    .limit(limit);
  return (data as Row[] | null)?.map(rowToStay) ?? [];
}

export async function startNewStay(slug: string): Promise<PropertyStay> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  await supabase
    .from('property_stays')
    .update({ status: 'closed', ended_at: now })
    .eq('property_slug', slug)
    .eq('status', 'active');

  const { data, error } = await supabase
    .from('property_stays')
    .insert({ property_slug: slug, status: 'active', started_at: now })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to start new stay');
  return rowToStay(data as Row);
}
