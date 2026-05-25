import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface WorkOrderCategory {
  id: string;
  property_slug: string;
  name: string;
  is_builtin: boolean;
  display_order: number;
  created_at: string;
}

export interface WorkOrderCategoryWithContacts extends WorkOrderCategory {
  phone: string | null;
  email: string | null;
}

export interface WorkOrder {
  id: string;
  property_slug: string;
  category_name: string;
  description: string | null;
  other_message: string | null;
  status: string;
  created_at: string;
}

const BUILTIN_CATEGORIES = [
  { name: 'Electric', display_order: 0 },
  { name: 'Air Conditioning', display_order: 1 },
  { name: 'Plumbing', display_order: 2 },
  { name: 'Other', display_order: 3 },
] as const;

function rowToCategory(row: Row): WorkOrderCategory {
  return {
    id: String(row.id || ''),
    property_slug: String(row.property_slug || ''),
    name: String(row.name || ''),
    is_builtin: Boolean(row.is_builtin),
    display_order: typeof row.display_order === 'number' ? row.display_order : 0,
    created_at: String(row.created_at || ''),
  };
}

function rowToCategoryWithContacts(row: Row): WorkOrderCategoryWithContacts {
  return {
    ...rowToCategory(row),
    phone: typeof row.phone === 'string' && row.phone ? row.phone : null,
    email: typeof row.email === 'string' && row.email ? row.email : null,
  };
}

export async function ensureBuiltinCategories(slug: string): Promise<void> {
  const supabase = createServiceClient();
  // Only seed builtins when the property has no categories at all — this lets
  // managers delete categories (including builtins) without them coming back.
  const { count } = await supabase
    .from('work_order_categories')
    .select('id', { count: 'exact', head: true })
    .eq('property_slug', slug);

  if ((count ?? 0) > 0) return;

  await supabase.from('work_order_categories').insert(
    BUILTIN_CATEGORIES.map((c) => ({
      property_slug: slug,
      name: c.name,
      is_builtin: true,
      display_order: c.display_order,
    }))
  );
}

export async function getWorkOrderCategories(slug: string): Promise<WorkOrderCategory[]> {
  await ensureBuiltinCategories(slug);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('work_order_categories')
    .select('id, property_slug, name, is_builtin, display_order, created_at')
    .eq('property_slug', slug)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  return (data as Row[] | null)?.map(rowToCategory) ?? [];
}

export async function getWorkOrderCategoriesWithContacts(
  slug: string
): Promise<WorkOrderCategoryWithContacts[]> {
  await ensureBuiltinCategories(slug);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('work_order_categories')
    .select('*')
    .eq('property_slug', slug)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  return (data as Row[] | null)?.map(rowToCategoryWithContacts) ?? [];
}

export async function createWorkOrderCategory(
  slug: string,
  name: string,
  phone: string | null,
  email: string | null
): Promise<WorkOrderCategoryWithContacts> {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from('work_order_categories')
    .select('display_order')
    .eq('property_slug', slug)
    .order('display_order', { ascending: false })
    .limit(1);
  const maxOrder =
    (existing as Row[] | null)?.[0]?.display_order;
  const nextOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 100;

  const { data, error } = await supabase
    .from('work_order_categories')
    .insert({
      property_slug: slug,
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      is_builtin: false,
      display_order: nextOrder,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create category');
  return rowToCategoryWithContacts(data as Row);
}

export async function updateWorkOrderCategory(
  id: string,
  slug: string,
  phone: string | null,
  email: string | null
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('work_order_categories')
    .update({
      phone: phone?.trim() || null,
      email: email?.trim() || null,
    })
    .eq('id', id)
    .eq('property_slug', slug);
  if (error) throw new Error(error.message);
}

export async function deleteWorkOrderCategory(id: string, slug: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('work_order_categories')
    .delete()
    .eq('id', id)
    .eq('property_slug', slug);
  if (error) throw new Error(error.message);
}

export async function submitWorkOrder(
  slug: string,
  categoryName: string,
  description: string | null,
  otherMessage: string | null
): Promise<WorkOrder> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      property_slug: slug,
      category_name: categoryName.trim(),
      description: description?.trim() || null,
      other_message: otherMessage?.trim() || null,
      status: 'open',
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to submit work order');
  const row = data as Row;
  return {
    id: String(row.id),
    property_slug: String(row.property_slug),
    category_name: String(row.category_name),
    description: typeof row.description === 'string' ? row.description : null,
    other_message: typeof row.other_message === 'string' ? row.other_message : null,
    status: String(row.status),
    created_at: String(row.created_at),
  };
}

export async function getRoutingContactForCategory(
  slug: string,
  categoryName: string
): Promise<{ phone: string | null; email: string | null }> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('work_order_categories')
    .select('phone, email')
    .eq('property_slug', slug)
    .eq('name', categoryName)
    .single();

  if (!data) return { phone: null, email: null };
  const row = data as Row;
  return {
    phone: typeof row.phone === 'string' && row.phone ? row.phone : null,
    email: typeof row.email === 'string' && row.email ? row.email : null,
  };
}
