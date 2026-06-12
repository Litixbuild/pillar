import { createServiceClient } from "@/lib/supabase";

export interface HotelWorkOrder {
  id: string;
  hotelSlug: string;
  roomNumber: string;
  categoryName: string;
  description: string | null;
  otherMessage: string | null;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
  resolvedNote: string | null;
}

type WorkOrderRow = Record<string, unknown>;

function rowToWorkOrder(row: WorkOrderRow): HotelWorkOrder {
  return {
    id:           String(row.id || ""),
    hotelSlug:    String(row.hotel_slug || ""),
    roomNumber:   String(row.room_number || ""),
    categoryName: String(row.category_name || ""),
    description:  typeof row.description   === "string" ? row.description   : null,
    otherMessage: typeof row.other_message === "string" ? row.other_message : null,
    status:       row.status === "resolved" ? "resolved" : "open",
    createdAt:    String(row.created_at || ""),
    resolvedAt:   typeof row.resolved_at   === "string" ? row.resolved_at   : null,
    resolvedNote: typeof row.resolved_note === "string" ? row.resolved_note : null,
  };
}

export async function getHotelWorkOrders(hotelSlug: string): Promise<HotelWorkOrder[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_work_orders")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as WorkOrderRow[]).map(rowToWorkOrder);
}

export async function createHotelWorkOrder(
  hotelSlug: string,
  roomNumber: string,
  categoryName: string,
  description: string | null,
  otherMessage: string | null,
): Promise<HotelWorkOrder | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_work_orders")
    .insert({ hotel_slug: hotelSlug, room_number: roomNumber, category_name: categoryName, description, other_message: otherMessage })
    .select()
    .single();
  if (error || !data) return null;
  return rowToWorkOrder(data as WorkOrderRow);
}

export async function resolveHotelWorkOrder(id: string, hotelSlug: string, note: string | null): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("hotel_work_orders")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_note: note })
    .eq("id", id)
    .eq("hotel_slug", hotelSlug);
  return !error;
}

export async function getOpenHotelWorkOrderCount(managerId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data: hotels } = await supabase
    .from("hotel_properties")
    .select("slug")
    .eq("manager_id", managerId);
  if (!hotels || hotels.length === 0) return 0;
  const slugs = (hotels as { slug: string }[]).map((h) => h.slug);
  const { count } = await supabase
    .from("hotel_work_orders")
    .select("id", { count: "exact", head: true })
    .in("hotel_slug", slugs)
    .eq("status", "open");
  return count ?? 0;
}
