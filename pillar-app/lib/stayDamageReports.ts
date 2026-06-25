import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface StayDamagePhoto {
  id: string;
  stay_id: string;
  property_slug: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

function rowToPhoto(row: Row): StayDamagePhoto {
  return {
    id: String(row.id),
    stay_id: String(row.stay_id),
    property_slug: String(row.property_slug),
    photo_url: String(row.photo_url),
    caption: typeof row.caption === 'string' && row.caption ? row.caption : null,
    created_at: String(row.created_at),
  };
}

export async function addDamagePhoto(
  stayId: string,
  propertySlug: string,
  photoUrl: string,
  caption: string | null
): Promise<StayDamagePhoto> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('stay_damage_reports')
    .insert({
      stay_id: stayId,
      property_slug: propertySlug,
      photo_url: photoUrl,
      caption,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to save damage photo');
  return rowToPhoto(data as Row);
}

export async function getDamagePhotosForStay(stayId: string): Promise<StayDamagePhoto[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('stay_damage_reports')
    .select('*')
    .eq('stay_id', stayId)
    .order('created_at', { ascending: true });
  return (data as Row[] | null)?.map(rowToPhoto) ?? [];
}
