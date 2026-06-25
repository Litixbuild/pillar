-- =============================================================
-- PILLAR STAY VERIFICATION & DAMAGE REPORT SYSTEM — Supabase SQL
-- Paste this entire file into the Supabase SQL Editor and run.
-- All statements are ADDITIVE. No existing tables are modified.
--
-- This file grows as each section of the feature is built.
-- Section 1 (below): property_stays — the "current tenant" concept
-- that the manager dashboard "Confirm New Tenant Arrived" button
-- creates/closes. Everything else (consent, cleaner photos, damage
-- photos, generated reports) hangs off this table's `id`.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PROPERTY STAYS
--    One row = one tenant/guest occupancy window for a property.
--    Only one 'active' row per property_slug at a time — starting
--    a new stay closes whatever was previously active.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.property_stays (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_slug TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'closed'
  started_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at      TIMESTAMPTZ
);

ALTER TABLE public.property_stays ENABLE ROW LEVEL SECURITY;
-- Service role (used by all API routes) bypasses RLS automatically —
-- no policies needed. Public anon key has no access.

CREATE INDEX IF NOT EXISTS idx_property_stays_slug_status
  ON public.property_stays(property_slug, status);

CREATE INDEX IF NOT EXISTS idx_property_stays_slug_started
  ON public.property_stays(property_slug, started_at DESC);


-- =============================================================
-- END OF SECTION 1
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 2. STAY CONSENT
--    One row per device/guest that checks "the home was clean
--    and undamaged" before viewing the property guide. This is
--    the core evidence record for the eventual damage report —
--    IP + user agent give it a lightweight authenticity trail.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stay_consent (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stay_id       UUID NOT NULL,
  property_slug TEXT NOT NULL,
  consented_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address    TEXT,
  user_agent    TEXT
);

ALTER TABLE public.stay_consent ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS. The public consent API route uses the
-- service role key (same as every other guest-facing write in this
-- app, e.g. work_orders), so no anon policies are needed.

CREATE INDEX IF NOT EXISTS idx_stay_consent_stay
  ON public.stay_consent(stay_id);


-- =============================================================
-- END OF SECTION 2
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 3. CLEANER UPLOAD TOKENS
--    One secret token per property — shared with the cleaning
--    crew (link or QR), separate from the public guest slug so
--    it can't be guessed from the guest-facing URL.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cleaner_upload_tokens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_slug TEXT UNIQUE NOT NULL,
  token         TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.cleaner_upload_tokens ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cleaner_upload_tokens_token
  ON public.cleaner_upload_tokens(token);


-- ─────────────────────────────────────────────────────────────
-- 4. STAY CLEANING PHOTOS
--    "Before" photos the cleaning crew submits via the no-account
--    upload link, tagged to whichever stay is active at the time
--    of upload.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stay_cleaning_photos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stay_id        UUID NOT NULL,
  property_slug  TEXT NOT NULL,
  photo_url      TEXT NOT NULL,
  uploaded_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  uploader_label TEXT
);

ALTER TABLE public.stay_cleaning_photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stay_cleaning_photos_stay
  ON public.stay_cleaning_photos(stay_id);


-- =============================================================
-- END OF SECTION 3
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 5. STAY DAMAGE REPORTS
--    "After" photos + captions documenting damage, entered by the
--    manager against whichever stay is most relevant (active, or
--    the most recently closed one if discovered after checkout).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stay_damage_reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stay_id       UUID NOT NULL,
  property_slug TEXT NOT NULL,
  photo_url     TEXT NOT NULL,
  caption       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.stay_damage_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stay_damage_reports_stay
  ON public.stay_damage_reports(stay_id);


-- =============================================================
-- END OF SECTION 4 (damage documentation)
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 6. STAY REPORTS
--    History of generated PDF summary reports, so a manager can
--    re-download a past report instead of regenerating it.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stay_reports (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stay_id        UUID NOT NULL,
  property_slug  TEXT NOT NULL,
  pdf_url        TEXT NOT NULL,
  narrative_text TEXT,
  generated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.stay_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stay_reports_stay
  ON public.stay_reports(stay_id, generated_at DESC);


-- =============================================================
-- END OF SECTION 5 (AI summary report generation)
-- =============================================================
