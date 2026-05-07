import { createServiceClient } from '@/lib/supabase';
import {
  parseManagerLayout,
  serializeManagerLayout,
  isValidWindowType,
  type FieldValue,
  type PropertyFields,
  type ManagerLayoutItem,
  type Property,
  type AmenityWindow,
} from '@/lib/types';

type SupabaseRow = Record<string, unknown>;

function rowToWindow(row: SupabaseRow): AmenityWindow {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    type: isValidWindowType(row.type) ? (row.type as AmenityWindow['type']) : 'text',
    body: typeof row.body === 'string' && row.body ? row.body : undefined,
    url: typeof row.url === 'string' && row.url ? row.url : undefined,
  };
}

function rowToProperty(row: SupabaseRow, windows: AmenityWindow[] = []): Property {
  return {
    Slug: typeof row.slug === 'string' && row.slug ? row.slug : undefined,
    PropertyName: (row.name as string) || '',
    PropertyAddress: (row.address as string) || 'Not provided',
    PropertyZipCode: (row.property_zip_code as string) || 'Not provided',
    DetailedHouseBio: (row.description as string) || 'Not provided',
    WiFiName: (row.wifi_name as string) || '',
    WiFiPassword: (row.wifi_password as string) || '',
    GarageCode: (row.garage_code as string) || '',
    HouseRules: (row.house_rules as string) || '',
    ManagerPhone: (row.manager_phone as string) || '',
    ManagerName: (row.manager_name as string) || undefined,
    HeroImage: (row.hero_image_url as string) || undefined,
    LogoUrl: (row.logo_url as string) || undefined,
    LogoSize: typeof row.logo_size === 'number' ? row.logo_size : undefined,
    windows,
  };
}

function rowToPropertyFields(row: SupabaseRow): PropertyFields {
  const out: Record<string, FieldValue> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v;
    }
  }
  return out;
}

const COLUMN_MAP: Record<string, string> = {
  PropertyName: 'name',
  PropertyAddress: 'address',
  PropertyZipCode: 'property_zip_code',
  DetailedHouseBio: 'description',
  WiFiName: 'wifi_name',
  WiFiPassword: 'wifi_password',
  GarageCode: 'garage_code',
  HouseRules: 'house_rules',
  ManagerPhone: 'manager_phone',
  LogoSize: 'logo_size',
};

async function fetchWindowsBySlug(slug: string): Promise<AmenityWindow[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('property_windows')
    .select('*')
    .eq('property_slug', slug.trim())
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  return data ? (data as SupabaseRow[]).map(rowToWindow) : [];
}

export async function getPropertiesByManagerId(managerId: string): Promise<Property[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return (data as SupabaseRow[]).map((row) => rowToProperty(row));
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createServiceClient();
  const trimmed = slug.trim();

  const [{ data, error }, windows] = await Promise.all([
    supabase.from('properties').select('*').eq('slug', trimmed).single(),
    fetchWindowsBySlug(trimmed),
  ]);

  if (error || !data) return null;
  return rowToProperty(data as SupabaseRow, windows);
}

export async function getPropertyFieldsBySlug(slug: string): Promise<PropertyFields | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug.trim())
    .single();

  if (error || !data) return null;
  return rowToPropertyFields(data as SupabaseRow);
}

export async function getManagerLayoutBySlug(slug: string): Promise<ManagerLayoutItem[] | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('properties')
    .select('manager_layout')
    .eq('slug', slug.trim())
    .single();

  if (error || !data) return null;
  const row = data as SupabaseRow;
  if (!row.manager_layout) return [];
  return parseManagerLayout(row.manager_layout);
}

export async function setManagerLayoutBySlug(slug: string, items: ManagerLayoutItem[]): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('properties')
    .update({ manager_layout: serializeManagerLayout(items) })
    .eq('slug', slug.trim());

  if (error) throw new Error(`Failed to update layout: ${error.message}`);
}

export async function updatePropertyFieldsBySlug(
  slug: string,
  fields: Record<string, FieldValue>
): Promise<void> {
  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    const col = COLUMN_MAP[key];
    if (col !== undefined) updateData[col] = value;
  }

  if (!Object.keys(updateData).length) return;

  const { error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('slug', slug.trim());

  if (error) throw new Error(`Failed to update property: ${error.message}`);
}

// ─── property_windows table CRUD ──────────────────────────────────

export async function createPropertyWindow(
  slug: string,
  window: AmenityWindow,
  displayOrder: number
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from('property_windows').insert({
    id: window.id,
    property_slug: slug.trim(),
    title: window.title,
    type: window.type,
    body: window.body ?? null,
    url: window.url ?? null,
    display_order: displayOrder,
  });
  if (error) throw new Error(`Failed to create window: ${error.message}`);
}

export async function savePropertyWindows(
  slug: string,
  windows: AmenityWindow[]
): Promise<void> {
  if (!windows.length) return;
  const supabase = createServiceClient();

  const rows = windows.map((w, idx) => ({
    id: w.id,
    property_slug: slug.trim(),
    title: w.title,
    type: w.type,
    body: w.body ?? null,
    url: w.url ?? null,
    display_order: idx,
  }));

  const { error } = await supabase
    .from('property_windows')
    .upsert(rows, { onConflict: 'id' });

  if (error) throw new Error(`Failed to save windows: ${error.message}`);
}

export async function deletePropertyWindow(windowId: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('property_windows')
    .delete()
    .eq('id', windowId);
  if (error) throw new Error(`Failed to delete window: ${error.message}`);
}

export async function updateWindowUrl(slug: string, windowId: string, url: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('property_windows')
    .update({ url })
    .eq('id', windowId)
    .eq('property_slug', slug.trim());
  if (error) throw new Error(`Failed to update window URL: ${error.message}`);
}

export async function requirePropertyAccess(managerId: string, slug: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('properties')
    .select('id')
    .eq('slug', slug.trim())
    .eq('manager_id', managerId)
    .single();

  return !error && !!data;
}

export type { FieldValue, PropertyFields, ManagerLayoutItem, Property, AmenityWindow };
