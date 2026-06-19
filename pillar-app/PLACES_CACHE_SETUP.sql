-- =============================================================
-- PILLAR PLACES CACHE — Supabase SQL
-- Paste this entire file into the Supabase SQL Editor and run.
-- Additive only — does not touch any existing table.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.places_cache (
  cache_key     TEXT PRIMARY KEY,
  results       JSONB NOT NULL,
  shown_offset  INTEGER NOT NULL DEFAULT 0,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_places_cache_expires
  ON public.places_cache (expires_at);

-- Row Level Security — all API calls use the service role key, which
-- bypasses RLS automatically. No SELECT/INSERT policies needed since
-- the anon (public) key never touches this table.
ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- OPTIONAL HOUSEKEEPING
-- Expired rows are already ignored by every read, so this is not
-- required for correctness — it just keeps the table tidy over time.
-- Run manually now and then, or schedule it with Supabase's pg_cron
-- extension (Database > Cron Jobs in the dashboard).
-- =============================================================
-- DELETE FROM public.places_cache WHERE expires_at < NOW();

-- =============================================================
-- END OF PLACES CACHE SETUP SQL
-- =============================================================
