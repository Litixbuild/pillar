import { createServiceClient } from "@/lib/supabase";
import { isValidWindowType, type AmenityWindow } from "@/lib/types";

type WindowRow = Record<string, unknown>;

function rowToWindow(row: WindowRow): AmenityWindow {
  return {
    id:    String(row.id || ""),
    title: String(row.title || ""),
    type:  isValidWindowType(row.type) ? row.type : "text",
    icon:  typeof row.icon === "string" && row.icon ? row.icon : undefined,
    body:  typeof row.body === "string" && row.body ? row.body : undefined,
    url:   typeof row.url  === "string" && row.url  ? row.url  : undefined,
  };
}

// ── Hotel-wide windows (shown to all guests) ─────────────────

export async function getHotelWindows(hotelSlug: string): Promise<AmenityWindow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_windows")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .order("display_order", { ascending: true });
  if (error || !data) return [];
  return (data as WindowRow[]).map(rowToWindow);
}

export async function upsertHotelWindows(hotelSlug: string, windows: AmenityWindow[]): Promise<boolean> {
  const supabase = createServiceClient();
  await supabase.from("hotel_windows").delete().eq("hotel_slug", hotelSlug);
  if (windows.length === 0) return true;
  // Omit `id` — let Supabase generate a valid UUID for each row.
  // The client-side id is only used for in-memory tracking (reorder/edit/delete).
  const rows = windows.map((w, i) => ({
    hotel_slug:    hotelSlug,
    title:         w.title,
    type:          w.type,
    body:          w.body  || null,
    url:           w.url   || null,
    icon:          w.icon  || null,
    display_order: i,
  }));
  const { error } = await supabase.from("hotel_windows").insert(rows);
  return !error;
}

// ── Room-type-specific windows ────────────────────────────────

export async function getRoomTypeWindows(roomTypeId: string): Promise<AmenityWindow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_type_windows")
    .select("*")
    .eq("room_type_id", roomTypeId)
    .order("display_order", { ascending: true });
  if (error || !data) return [];
  return (data as WindowRow[]).map(rowToWindow);
}

export async function upsertRoomTypeWindows(
  roomTypeId: string,
  hotelSlug: string,
  windows: AmenityWindow[],
): Promise<boolean> {
  const supabase = createServiceClient();
  await supabase.from("room_type_windows").delete().eq("room_type_id", roomTypeId);
  if (windows.length === 0) return true;
  // Omit `id` — let Supabase generate valid UUIDs.
  const rows = windows.map((w, i) => ({
    room_type_id:  roomTypeId,
    hotel_slug:    hotelSlug,
    title:         w.title,
    type:          w.type,
    body:          w.body  || null,
    url:           w.url   || null,
    icon:          w.icon  || null,
    display_order: i,
  }));
  const { error } = await supabase.from("room_type_windows").insert(rows);
  return !error;
}
