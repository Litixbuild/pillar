-- =============================================================
-- Activity Breakdown dashboard — performance indexes
-- Paste into Supabase SQL Editor and run.
-- No new tables/columns — these just speed up the all-time
-- history queries the new "Activity Breakdown" chart runs
-- against tables you already have.
-- =============================================================

-- property_events: powers the "Amenities" + "AI Concierge" bars
CREATE INDEX IF NOT EXISTS idx_property_events_slug_type_created
  ON public.property_events (property_slug, event_type, created_at);

-- work_orders: powers the "Work Orders" bar (and existing Issues/resolution charts)
CREATE INDEX IF NOT EXISTS idx_work_orders_slug_created
  ON public.work_orders (property_slug, created_at);

-- late_checkout_requests: counted into the "Work Orders" bar
CREATE INDEX IF NOT EXISTS idx_late_checkout_requests_slug_submitted
  ON public.late_checkout_requests (property_slug, submitted_at);

-- =============================================================
-- END
-- =============================================================
