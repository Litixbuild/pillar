-- =============================================================
-- PILLAR ONBOARDING TOUR — Supabase SQL
-- Paste this entire file into the Supabase SQL Editor and run.
-- Purely additive: two new columns on tables you already have,
-- both defaulted so every existing row stays valid. No existing
-- data, rows, or constraints are touched or removed.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Track whether a manager has been offered / completed the
--    first-login guided tour.
--      pending     -> never asked yet (show the "Want a tour?" prompt)
--      in_progress -> said yes, tour underway (used to resume if they
--                     close the tab mid-tour instead of re-prompting)
--      completed   -> finished the tour, dummy data cleaned up
--      skipped     -> said no, never ask again
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_tour_status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_tour_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_tour_status_check
  CHECK (onboarding_tour_status IN ('pending', 'in_progress', 'completed', 'skipped'));


-- ─────────────────────────────────────────────────────────────
-- 2. Flag a property as the tutorial's throwaway dummy property —
--    unmistakable and trivial to find/clean up later, and easy to
--    exclude from real subscription slot counts or analytics.
--    At most one demo property per manager at a time, so a
--    re-triggered tour can never pile up duplicate dummy data.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_properties_one_demo_per_manager
  ON public.properties (manager_id) WHERE is_demo = TRUE;


-- =============================================================
-- OPTIONAL — run this too if you want your EXISTING managers
-- (anyone who signed up before today) to never see the tour
-- prompt at all, so it only greets brand-new signups going
-- forward. Safe to skip; you can always run it later.
-- =============================================================
-- UPDATE public.profiles SET onboarding_tour_status = 'skipped'
-- WHERE onboarding_tour_status = 'pending';

-- =============================================================
-- END
-- =============================================================
