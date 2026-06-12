import { createServiceClient } from "@/lib/supabase";
import { encryptField, decryptField } from "@/lib/fieldEncryption";

const ENCRYPTED_FIELDS = new Set(["wifi_password", "pool_code", "gym_code", "elevator_code", "manager_phone"]);

type HotelRow = Record<string, unknown>;

export interface HotelProperty {
  id: string;
  slug: string;
  managerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  frontDeskNumber: string;
  wifiName: string;
  wifiPassword: string;
  poolCode: string;
  gymCode: string;
  elevatorCode: string;
  parkingInstructions: string;
  heroImageUrl?: string;
  logoUrl?: string;
  logoUrlDark?: string;
  logoSize?: number;
  accentColor?: string;
  headingColor?: string;
  textColor?: string;
  checkInInstructions: string;
  checkOutInstructions: string;
  houseRules: string;
  restaurantInfo: string;
  createdAt: string;
  updatedAt: string;
}

function rowToHotel(row: HotelRow): HotelProperty {
  return {
    id:                   String(row.id || ""),
    slug:                 String(row.slug || ""),
    managerId:            String(row.manager_id || ""),
    name:                 String(row.name || ""),
    address:              String(row.address || ""),
    city:                 String(row.city || ""),
    state:                String(row.state || ""),
    description:          String(row.description || ""),
    managerName:          String(row.manager_name || ""),
    managerEmail:         String(row.manager_email || ""),
    managerPhone:         decryptField(String(row.manager_phone || "")),
    frontDeskNumber:      String(row.front_desk_number || ""),
    wifiName:             String(row.wifi_name || ""),
    wifiPassword:         decryptField(String(row.wifi_password || "")),
    poolCode:             decryptField(String(row.pool_code || "")),
    gymCode:              decryptField(String(row.gym_code || "")),
    elevatorCode:         decryptField(String(row.elevator_code || "")),
    parkingInstructions:  String(row.parking_instructions || ""),
    heroImageUrl:  typeof row.hero_image_url  === "string" && row.hero_image_url  ? row.hero_image_url  : undefined,
    logoUrl:       typeof row.logo_url        === "string" && row.logo_url        ? row.logo_url        : undefined,
    logoUrlDark:   typeof row.logo_url_dark   === "string" && row.logo_url_dark   ? row.logo_url_dark   : undefined,
    logoSize:      typeof row.logo_size       === "number"                        ? row.logo_size       : undefined,
    accentColor:   typeof row.accent_color    === "string" && row.accent_color    ? row.accent_color    : undefined,
    headingColor:  typeof row.heading_color   === "string" && row.heading_color   ? row.heading_color   : undefined,
    textColor:     typeof row.text_color      === "string" && row.text_color      ? row.text_color      : undefined,
    checkInInstructions:  String(row.check_in_instructions  || ""),
    checkOutInstructions: String(row.check_out_instructions || ""),
    houseRules:           String(row.house_rules            || ""),
    restaurantInfo:       String(row.restaurant_info        || ""),
    createdAt:            String(row.created_at || ""),
    updatedAt:            String(row.updated_at || ""),
  };
}

export async function getHotelsByManagerId(managerId: string): Promise<HotelProperty[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_properties")
    .select("*")
    .eq("manager_id", managerId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as HotelRow[]).map(rowToHotel);
}

export async function getHotelBySlug(slug: string): Promise<HotelProperty | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("hotel_properties")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return rowToHotel(data as HotelRow);
}

export async function verifyHotelAccess(managerId: string, slug: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("hotel_properties")
    .select("id")
    .eq("slug", slug)
    .eq("manager_id", managerId)
    .single();
  return !!data;
}

export async function createHotel(managerId: string, name: string): Promise<HotelProperty | null> {
  const supabase = createServiceClient();
  const slug = crypto.randomUUID();
  const { data, error } = await supabase
    .from("hotel_properties")
    .insert({ manager_id: managerId, slug, name })
    .select()
    .single();
  if (error || !data) return null;
  return rowToHotel(data as HotelRow);
}

export type HotelUpdateFields = Partial<{
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  front_desk_number: string;
  wifi_name: string;
  wifi_password: string;
  pool_code: string;
  gym_code: string;
  elevator_code: string;
  parking_instructions: string;
  hero_image_url: string;
  logo_url: string;
  logo_url_dark: string;
  logo_size: number;
  accent_color: string;
  heading_color: string;
  text_color: string;
  check_in_instructions: string;
  check_out_instructions: string;
  house_rules: string;
  restaurant_info: string;
}>;

export async function updateHotel(managerId: string, slug: string, fields: HotelUpdateFields): Promise<boolean> {
  const supabase = createServiceClient();
  const payload: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  for (const field of ENCRYPTED_FIELDS) {
    if (typeof payload[field] === "string" && payload[field]) {
      payload[field] = encryptField(payload[field] as string);
    }
  }
  const { error } = await supabase
    .from("hotel_properties")
    .update(payload)
    .eq("slug", slug)
    .eq("manager_id", managerId);
  return !error;
}

export async function deleteHotel(managerId: string, slug: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("hotel_properties")
    .delete()
    .eq("slug", slug)
    .eq("manager_id", managerId);
  return !error;
}
