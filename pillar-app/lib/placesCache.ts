import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface PlacesCacheEntry<T> {
  results: T[];
  shownOffset: number;
}

const DEFAULT_TTL_MS = Math.max(60_000, Number(process.env.PLACES_DB_CACHE_TTL_MS || 6 * 60 * 60 * 1000));

export function placesCacheKey(query: string): string {
  return `places:${query.trim().toLowerCase()}`;
}

// Best-effort durable cache shared across every guest/conversation/Lambda instance —
// unlike an in-memory cache, this survives cold starts and is visible to concurrent requests.
export async function getPlacesCache<T>(cacheKey: string): Promise<PlacesCacheEntry<T> | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('places_cache')
      .select('results, shown_offset, expires_at')
      .eq('cache_key', cacheKey)
      .single();

    if (!data) return null;
    const row = data as Row;
    if (new Date(String(row.expires_at)).getTime() <= Date.now()) return null;

    return {
      results: (row.results as T[] | null) ?? [],
      shownOffset: typeof row.shown_offset === 'number' ? row.shown_offset : 0,
    };
  } catch {
    return null; // Fail open — a cache miss just means we fetch fresh from Google.
  }
}

export async function savePlacesCache<T>(cacheKey: string, results: T[], ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from('places_cache').upsert(
      {
        cache_key: cacheKey,
        results,
        shown_offset: 0,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + ttlMs).toISOString(),
      },
      { onConflict: 'cache_key' }
    );
  } catch {
    // Cache writes are best-effort — never let a Supabase hiccup break the concierge.
  }
}

export async function advancePlacesCacheOffset(cacheKey: string, newOffset: number): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from('places_cache').update({ shown_offset: newOffset }).eq('cache_key', cacheKey);
  } catch {
    // Best-effort — rotation just restarts from the top next time if this fails.
  }
}
