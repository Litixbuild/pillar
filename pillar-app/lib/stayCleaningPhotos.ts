import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface StayCleaningPhoto {
  id: string;
  stay_id: string;
  property_slug: string;
  photo_url: string;
  uploaded_at: string;
  uploader_label: string | null;
}

function rowToPhoto(row: Row): StayCleaningPhoto {
  return {
    id: String(row.id),
    stay_id: String(row.stay_id),
    property_slug: String(row.property_slug),
    photo_url: String(row.photo_url),
    uploaded_at: String(row.uploaded_at),
    uploader_label: typeof row.uploader_label === 'string' && row.uploader_label ? row.uploader_label : null,
  };
}

export async function addCleaningPhoto(
  stayId: string,
  propertySlug: string,
  photoUrl: string,
  uploaderLabel: string | null
): Promise<StayCleaningPhoto> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('stay_cleaning_photos')
    .insert({
      stay_id: stayId,
      property_slug: propertySlug,
      photo_url: photoUrl,
      uploader_label: uploaderLabel,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to save photo');
  return rowToPhoto(data as Row);
}

export async function getCleaningPhotosForStay(stayId: string): Promise<StayCleaningPhoto[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('stay_cleaning_photos')
    .select('*')
    .eq('stay_id', stayId)
    .order('uploaded_at', { ascending: true });
  return (data as Row[] | null)?.map(rowToPhoto) ?? [];
}
