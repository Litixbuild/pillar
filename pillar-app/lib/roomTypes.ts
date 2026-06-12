import { createServiceClient } from "@/lib/supabase";

export interface RoomType {
  id: string;
  hotelSlug: string;
  name: string;
  displayOrder: number;
  createdAt: string;
}

type RoomTypeRow = Record<string, unknown>;

function rowToRoomType(row: RoomTypeRow): RoomType {
  return {
    id:           String(row.id || ""),
    hotelSlug:    String(row.hotel_slug || ""),
    name:         String(row.name || ""),
    displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
    createdAt:    String(row.created_at || ""),
  };
}

export async function getRoomTypesByHotel(hotelSlug: string): Promise<RoomType[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .order("display_order", { ascending: true });
  if (error || !data) return [];
  return (data as RoomTypeRow[]).map(rowToRoomType);
}

export async function getRoomTypeById(id: string, hotelSlug: string): Promise<RoomType | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("id", id)
    .eq("hotel_slug", hotelSlug)
    .single();
  if (error || !data) return null;
  return rowToRoomType(data as RoomTypeRow);
}

export async function createRoomType(hotelSlug: string, name: string): Promise<RoomType | null> {
  const supabase = createServiceClient();
  const { count } = await supabase
    .from("room_types")
    .select("id", { count: "exact", head: true })
    .eq("hotel_slug", hotelSlug);
  const displayOrder = count ?? 0;
  const { data, error } = await supabase
    .from("room_types")
    .insert({ hotel_slug: hotelSlug, name, display_order: displayOrder })
    .select()
    .single();
  if (error || !data) return null;
  return rowToRoomType(data as RoomTypeRow);
}

export async function updateRoomType(id: string, hotelSlug: string, name: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("room_types")
    .update({ name })
    .eq("id", id)
    .eq("hotel_slug", hotelSlug);
  return !error;
}

export async function deleteRoomType(id: string, hotelSlug: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("room_types")
    .delete()
    .eq("id", id)
    .eq("hotel_slug", hotelSlug);
  return !error;
}
