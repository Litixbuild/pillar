import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface PropertyPhoto {
  id: string;
  url: string;
  display_order: number;
}

function rowToPhoto(r: Row): PropertyPhoto {
  return {
    id: String(r.id ?? ''),
    url: String(r.url ?? ''),
    display_order: typeof r.display_order === 'number' ? r.display_order : 0,
  };
}

export async function getPropertyPhotos(slug: string): Promise<PropertyPhoto[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('property_photos')
    .select('id, url, display_order')
    .eq('property_slug', slug.trim())
    .order('display_order', { ascending: true });
  if (error) console.error('[getPropertyPhotos]', error.message);
  return (data as Row[] | null)?.map(rowToPhoto) ?? [];
}

export async function addPropertyPhoto(
  slug: string,
  url: string,
  displayOrder: number
): Promise<PropertyPhoto> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('property_photos')
    .insert({ property_slug: slug.trim(), url, display_order: displayOrder })
    .select('id, url, display_order')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add photo');
  return rowToPhoto(data as Row);
}

export async function deletePropertyPhoto(id: string, slug: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('property_photos')
    .delete()
    .eq('id', id)
    .eq('property_slug', slug.trim());
  if (error) throw new Error(error.message);
}

export async function getNextPhotoOrder(slug: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_photos')
    .select('display_order')
    .eq('property_slug', slug.trim())
    .order('display_order', { ascending: false })
    .limit(1);
  const max = (data as Row[] | null)?.[0]?.display_order;
  return typeof max === 'number' ? max + 1 : 0;
}

export async function getPhotoUrl(id: string, slug: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_photos')
    .select('url')
    .eq('id', id)
    .eq('property_slug', slug.trim())
    .single();
  if (!data) return null;
  return typeof (data as Row).url === 'string' ? String((data as Row).url) : null;
}
