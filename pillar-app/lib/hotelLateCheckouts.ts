import { createServiceClient } from "@/lib/supabase";

export interface HotelLateCheckout {
  id: string;
  hotelSlug: string;
  roomNumber: string;
  status: "pending" | "approved" | "denied";
  submittedAt: string;
  actionedAt: string | null;
  expiresAt: string;
}

type CheckoutRow = Record<string, unknown>;

function rowToCheckout(row: CheckoutRow): HotelLateCheckout {
  return {
    id:          String(row.id || ""),
    hotelSlug:   String(row.hotel_slug || ""),
    roomNumber:  String(row.room_number || ""),
    status:      row.status === "approved" ? "approved" : row.status === "denied" ? "denied" : "pending",
    submittedAt: String(row.submitted_at || ""),
    actionedAt:  typeof row.actioned_at === "string" ? row.actioned_at : null,
    expiresAt:   String(row.expires_at || ""),
  };
}

export async function getPendingHotelCheckouts(hotelSlug: string): Promise<HotelLateCheckout[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_late_checkout_requests")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return (data as CheckoutRow[]).map(rowToCheckout);
}

export async function getActionedHotelCheckouts(hotelSlug: string): Promise<HotelLateCheckout[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_late_checkout_requests")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .in("status", ["approved", "denied"])
    .order("actioned_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return (data as CheckoutRow[]).map(rowToCheckout);
}

export async function createHotelLateCheckout(hotelSlug: string, roomNumber: string): Promise<HotelLateCheckout | null> {
  const supabase = createServiceClient();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("hotel_late_checkout_requests")
    .insert({ hotel_slug: hotelSlug, room_number: roomNumber, expires_at: expiresAt })
    .select()
    .single();
  if (error || !data) return null;
  return rowToCheckout(data as CheckoutRow);
}

export async function actionHotelLateCheckout(
  id: string,
  hotelSlug: string,
  action: "approved" | "denied",
): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("hotel_late_checkout_requests")
    .update({ status: action, actioned_at: new Date().toISOString() })
    .eq("id", id)
    .eq("hotel_slug", hotelSlug);
  return !error;
}

export async function getLatestHotelCheckoutStatus(
  hotelSlug: string,
  roomNumber: string,
): Promise<HotelLateCheckout | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_late_checkout_requests")
    .select("*")
    .eq("hotel_slug", hotelSlug)
    .eq("room_number", roomNumber)
    .gt("expires_at", new Date().toISOString())
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCheckout(data as CheckoutRow);
}
