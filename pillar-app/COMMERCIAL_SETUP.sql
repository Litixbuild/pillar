-- =============================================================
-- PILLAR COMMERCIAL / HOTEL SYSTEM — Supabase SQL
-- Paste this entire file into the Supabase SQL Editor and run.
-- All statements are ADDITIVE. No existing tables are modified.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. HOTEL PROPERTIES
--    One row = one hotel. Separate from the existing `properties`
--    table — no shared columns, no joins, zero risk.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotel_properties (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  name                   TEXT NOT NULL DEFAULT '',
  address                TEXT NOT NULL DEFAULT '',
  city                   TEXT NOT NULL DEFAULT '',
  state                  TEXT NOT NULL DEFAULT '',
  description            TEXT NOT NULL DEFAULT '',

  -- Contact
  manager_name           TEXT NOT NULL DEFAULT '',
  manager_email          TEXT NOT NULL DEFAULT '',
  manager_phone          TEXT NOT NULL DEFAULT '',  -- AES-256-GCM encrypted
  front_desk_number      TEXT NOT NULL DEFAULT '',

  -- Access codes (AES-256-GCM encrypted)
  wifi_name              TEXT NOT NULL DEFAULT '',
  wifi_password          TEXT NOT NULL DEFAULT '',
  pool_code              TEXT NOT NULL DEFAULT '',
  gym_code               TEXT NOT NULL DEFAULT '',
  elevator_code          TEXT NOT NULL DEFAULT '',
  parking_instructions   TEXT NOT NULL DEFAULT '',

  -- Branding
  hero_image_url         TEXT,
  logo_url               TEXT,
  logo_url_dark          TEXT,
  logo_size              INTEGER,
  accent_color           TEXT,
  heading_color          TEXT,
  text_color             TEXT,

  -- Guest-facing content
  check_in_instructions  TEXT NOT NULL DEFAULT '',
  check_out_instructions TEXT NOT NULL DEFAULT '',
  house_rules            TEXT NOT NULL DEFAULT '',
  restaurant_info        TEXT NOT NULL DEFAULT '',

  created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─────────────────────────────────────────────────────────────
-- 2. ROOM TYPES
--    Tiers within a hotel: Standard, Deluxe, Suite, Penthouse…
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_types (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug    TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─────────────────────────────────────────────────────────────
-- 3. HOTEL-WIDE AMENITY WINDOWS
--    Shown to every guest regardless of room type.
--    (WiFi, Pool, Gym, Restaurant hours, Check-out policy…)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotel_windows (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug    TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'text',  -- 'text' | 'video' | 'pdf' | 'image'
  body          TEXT,
  url           TEXT,
  icon          TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─────────────────────────────────────────────────────────────
-- 4. ROOM-TYPE-SPECIFIC AMENITY WINDOWS
--    Shown only to guests in that room type.
--    (Suite hot tub guide, kitchenette, butler contact…)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_type_windows (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_type_id  UUID REFERENCES public.room_types(id) ON DELETE CASCADE NOT NULL,
  hotel_slug    TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'text',  -- 'text' | 'video' | 'pdf' | 'image'
  body          TEXT,
  url           TEXT,
  icon          TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─────────────────────────────────────────────────────────────
-- 5. ROOM ASSIGNMENTS
--    Maps room numbers (or ranges) to a room type.
--    assignment_type = 'range'      → use range_start + range_end
--    assignment_type = 'individual' → use room_number
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_assignments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug      TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  room_type_id    UUID REFERENCES public.room_types(id) ON DELETE CASCADE NOT NULL,
  assignment_type TEXT NOT NULL DEFAULT 'range',  -- 'range' | 'individual'
  range_start     INTEGER,   -- inclusive, used when type = 'range'
  range_end       INTEGER,   -- inclusive, used when type = 'range'
  room_number     INTEGER,   -- used when type = 'individual'
  label           TEXT,      -- optional label e.g. "Floor 1 - Standard"
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- ─────────────────────────────────────────────────────────────
-- 6. HOTEL WORK ORDERS
--    Submitted by guests. Always includes room_number.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotel_work_orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug    TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  room_number   TEXT NOT NULL,
  category_name TEXT NOT NULL DEFAULT 'General',
  description   TEXT,
  other_message TEXT,
  status        TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'resolved'
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at   TIMESTAMPTZ,
  resolved_note TEXT
);


-- ─────────────────────────────────────────────────────────────
-- 7. HOTEL LATE CHECKOUT REQUESTS
--    Submitted by guests. Always includes room_number.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotel_late_checkout_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_slug   TEXT REFERENCES public.hotel_properties(slug) ON DELETE CASCADE NOT NULL,
  room_number  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'denied'
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  actioned_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL
);


-- =============================================================
-- ROW LEVEL SECURITY
-- All API calls use the service role key which bypasses RLS.
-- Enabling RLS here is defence-in-depth best practice.
-- =============================================================
ALTER TABLE public.hotel_properties              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_windows                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_type_windows             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_assignments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_work_orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_late_checkout_requests  ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policies needed.
-- Public anon key has no access (no SELECT policies defined).


-- =============================================================
-- INDEXES (performance)
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_hotel_properties_manager
  ON public.hotel_properties(manager_id);

CREATE INDEX IF NOT EXISTS idx_room_types_hotel
  ON public.room_types(hotel_slug);

CREATE INDEX IF NOT EXISTS idx_hotel_windows_hotel
  ON public.hotel_windows(hotel_slug, display_order);

CREATE INDEX IF NOT EXISTS idx_room_type_windows_type
  ON public.room_type_windows(room_type_id, display_order);

CREATE INDEX IF NOT EXISTS idx_room_assignments_hotel
  ON public.room_assignments(hotel_slug);

CREATE INDEX IF NOT EXISTS idx_hotel_work_orders_slug_status
  ON public.hotel_work_orders(hotel_slug, status);

CREATE INDEX IF NOT EXISTS idx_hotel_checkouts_slug_status
  ON public.hotel_late_checkout_requests(hotel_slug, status);


-- =============================================================
-- HOW TO PROVISION A COMMERCIAL (HOTEL) ACCOUNT
-- =============================================================
--
-- Step 1: Create the user in Supabase Auth
--   → Authentication > Users > Add user
--   → Enter their email and a temporary password
--   → Copy the UUID shown in the user list
--
-- Step 2: Run the SQL below, replacing the placeholder values.
--   The ON CONFLICT clause handles whether or not a trigger
--   already created the profile row automatically.
--
-- ─────────────────────────────────────────────────────────────

-- TEMPLATE — edit and run once per hotel client:
/*
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'PASTE-AUTH-USER-UUID-HERE',   -- UUID from Supabase Auth user list
  'hotel@example.com',           -- their email (must match Auth email)
  'Hotel Manager Name',          -- their display name
  'commercial'                   -- must be exactly this value
)
ON CONFLICT (id) DO UPDATE
  SET role      = 'commercial',
      full_name = EXCLUDED.full_name,
      email     = EXCLUDED.email;
*/

-- EXAMPLE (replace all three values):
/*
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'manager@grandhotelpillar.com',
  'Grand Hotel Pillar',
  'commercial'
)
ON CONFLICT (id) DO UPDATE
  SET role      = 'commercial',
      full_name = EXCLUDED.full_name,
      email     = EXCLUDED.email;
*/

-- =============================================================
-- TO REVOKE COMMERCIAL ACCESS (deactivate a hotel client):
-- =============================================================
/*
UPDATE public.profiles
SET role = 'revoked'
WHERE id = 'PASTE-AUTH-USER-UUID-HERE';
*/

-- =============================================================
-- END OF COMMERCIAL SETUP SQL
-- =============================================================
