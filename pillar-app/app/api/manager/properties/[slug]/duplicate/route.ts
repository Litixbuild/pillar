import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess, slugExists, getPropertiesByManagerId } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';
const STORAGE_MARKER = '/object/public/property-media/';

async function requireManagerSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

function extractStoragePath(url: string): string | null {
  const idx = url.indexOf(STORAGE_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + STORAGE_MARKER.length);
}

function rewriteSlugInPath(storagePath: string, oldSlug: string, newSlug: string): string {
  // Paths are: userId/slug/subpath — replace the slug segment (index 1)
  const parts = storagePath.split('/');
  if (parts.length >= 2 && parts[1] === oldSlug) {
    parts[1] = newSlug;
  }
  return parts.join('/');
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireManagerSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug: oldSlug } = await ctx.params;
    const hasAccess = await requirePropertyAccess(session.userId, oldSlug);
    if (!hasAccess) return Response.json({ error: 'Property not found' }, { status: 404 });

    const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
    const newName = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!newName) return Response.json({ error: 'New property name is required' }, { status: 400 });

    const supabase = createServiceClient();

    // Enforce property slot limit — duplicating consumes a slot
    const [allProperties, profileResult] = await Promise.all([
      getPropertiesByManagerId(session.userId),
      supabase.from('profiles').select('property_slots').eq('id', session.userId).single(),
    ]);
    const slots = (profileResult.data?.property_slots as number) ?? 1;
    if (allProperties.length >= slots) {
      return Response.json({ error: 'slot_limit_reached' }, { status: 403 });
    }

    // Fetch everything from the source property in parallel
    const [sourceResult, windowsResult, categoriesResult, photosResult] = await Promise.all([
      supabase.from('properties').select('*').eq('slug', oldSlug).single(),
      supabase.from('property_windows').select('*').eq('property_slug', oldSlug).order('display_order', { ascending: true }),
      supabase.from('work_order_categories').select('*').eq('property_slug', oldSlug).order('display_order', { ascending: true }),
      supabase.from('property_photos').select('*').eq('property_slug', oldSlug).order('display_order', { ascending: true }),
    ]);

    if (!sourceResult.data) return Response.json({ error: 'Source property not found' }, { status: 404 });
    const src = sourceResult.data as Record<string, unknown>;

    // Generate a unique slug for the new property
    let newSlug = randomUUID();
    for (let i = 0; i < 5; i++) {
      if (!(await slugExists(newSlug))) break;
      newSlug = randomUUID();
    }

    // Create the new property — copy all branding/settings, blank out location-specific fields
    const { error: createError } = await supabase.from('properties').insert({
      slug: newSlug,
      manager_id: session.userId,
      name: newName,
      // location-specific fields — left blank for manager to fill in
      address: '',
      property_zip_code: '',
      wifi_name: '',
      wifi_password: '',
      garage_code: '',
      // copy everything else
      description: src.description ?? null,
      house_rules: src.house_rules ?? null,
      manager_phone: src.manager_phone ?? null,
      hero_image_url: src.hero_image_url ?? null,
      logo_url: src.logo_url ?? null,
      logo_url_dark: src.logo_url_dark ?? null,
      logo_size: src.logo_size ?? null,
      background_key: src.background_key ?? null,
      accent_color: src.accent_color ?? null,
      heading_color: src.heading_color ?? null,
      text_color: src.text_color ?? null,
      checkout_instructions: src.checkout_instructions ?? null,
      rooms: src.rooms ?? [],
      manager_layout: src.manager_layout ?? null,
    });

    if (createError) throw new Error(`Failed to create property: ${createError.message}`);

    // Copy windows — give each a new ID, point to new slug
    const windows = windowsResult.data ?? [];
    if (windows.length > 0) {
      const newWindows = windows.map((w) => {
        const wRow = w as Record<string, unknown>;
        const oldUrl = typeof wRow.url === 'string' ? wRow.url : null;
        return {
          id: randomUUID(),
          property_slug: newSlug,
          title: wRow.title,
          type: wRow.type,
          icon: wRow.icon ?? null,
          body: wRow.body ?? null,
          url: oldUrl, // will be updated after storage copy below
          room: wRow.room ?? null,
          display_order: wRow.display_order,
          _old_url: oldUrl, // temp field for storage copy (stripped before insert)
        };
      });

      // Copy window storage files in parallel (best-effort)
      await Promise.allSettled(
        newWindows.map(async (w) => {
          if (!w._old_url) return;
          const oldPath = extractStoragePath(w._old_url);
          if (!oldPath) return;
          const newPath = rewriteSlugInPath(oldPath, oldSlug, newSlug);
          const { error } = await supabase.storage.from(BUCKET).copy(oldPath, newPath);
          if (!error) {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
            w.url = data.publicUrl;
          }
        })
      );

      const insertRows = newWindows.map(({ _old_url: _unused, ...w }) => w);
      await supabase.from('property_windows').insert(insertRows);
    }

    // Copy work order categories — preserve contact routing
    const categories = categoriesResult.data ?? [];
    if (categories.length > 0) {
      const newCats = categories.map((c) => {
        const cRow = c as Record<string, unknown>;
        return {
          property_slug: newSlug,
          name: cRow.name,
          is_builtin: cRow.is_builtin ?? false,
          display_order: cRow.display_order,
          phone: cRow.phone ?? null,
          email: cRow.email ?? null,
        };
      });
      await supabase.from('work_order_categories').insert(newCats);
    }

    // Copy photos — copy storage files to new paths
    const photos = photosResult.data ?? [];
    await Promise.allSettled(
      photos.map(async (photo) => {
        const pRow = photo as Record<string, unknown>;
        const oldUrl = typeof pRow.url === 'string' ? pRow.url : null;
        if (!oldUrl) return;
        const oldPath = extractStoragePath(oldUrl);
        if (!oldPath) return;
        const newPath = rewriteSlugInPath(oldPath, oldSlug, newSlug);
        const { error } = await supabase.storage.from(BUCKET).copy(oldPath, newPath);
        if (error) return;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(newPath);
        await supabase.from('property_photos').insert({
          property_slug: newSlug,
          url: data.publicUrl,
          display_order: pRow.display_order,
        });
      })
    );

    return Response.json({ slug: newSlug }, { status: 200 });
  } catch (e) {
    console.error('[duplicate]', e);
    return Response.json({ error: 'Failed to duplicate property. Please try again.' }, { status: 500 });
  }
}
