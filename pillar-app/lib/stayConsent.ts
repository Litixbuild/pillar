import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface StayConsent {
  id: string;
  stay_id: string;
  property_slug: string;
  consented_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

function rowToConsent(row: Row): StayConsent {
  return {
    id: String(row.id),
    stay_id: String(row.stay_id),
    property_slug: String(row.property_slug),
    consented_at: String(row.consented_at),
    ip_address: typeof row.ip_address === 'string' ? row.ip_address : null,
    user_agent: typeof row.user_agent === 'string' ? row.user_agent : null,
  };
}

export async function recordConsent(
  stayId: string,
  propertySlug: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<StayConsent> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('stay_consent')
    .insert({
      stay_id: stayId,
      property_slug: propertySlug,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to record consent');
  return rowToConsent(data as Row);
}

export async function getConsentsForStay(stayId: string): Promise<StayConsent[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('stay_consent')
    .select('*')
    .eq('stay_id', stayId)
    .order('consented_at', { ascending: true });
  return (data as Row[] | null)?.map(rowToConsent) ?? [];
}
