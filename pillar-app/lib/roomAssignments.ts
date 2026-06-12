import { createServiceClient } from "@/lib/supabase";

export interface RoomAssignment {
  id: string;
  hotelSlug: string;
  roomTypeId: string;
  roomTypeName: string;
  assignmentType: "range" | "individual";
  rangeStart?: number;
  rangeEnd?: number;
  roomNumber?: number;
  label?: string;
  createdAt: string;
}

type AssignmentRow = Record<string, unknown>;

function rowToAssignment(row: AssignmentRow): RoomAssignment {
  const rt = row.room_types as { name?: string } | null;
  return {
    id:             String(row.id || ""),
    hotelSlug:      String(row.hotel_slug || ""),
    roomTypeId:     String(row.room_type_id || ""),
    roomTypeName:   rt?.name ?? String(row.room_type_name || ""),
    assignmentType: row.assignment_type === "individual" ? "individual" : "range",
    rangeStart:     typeof row.range_start === "number" ? row.range_start : undefined,
    rangeEnd:       typeof row.range_end   === "number" ? row.range_end   : undefined,
    roomNumber:     typeof row.room_number === "number" ? row.room_number : undefined,
    label:          typeof row.label === "string" && row.label ? row.label : undefined,
    createdAt:      String(row.created_at || ""),
  };
}

export async function getRoomAssignments(hotelSlug: string): Promise<RoomAssignment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_assignments")
    .select("*, room_types(name)")
    .eq("hotel_slug", hotelSlug)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as AssignmentRow[]).map(rowToAssignment);
}

export async function createRangeAssignment(
  hotelSlug: string,
  roomTypeId: string,
  rangeStart: number,
  rangeEnd: number,
  label?: string,
): Promise<RoomAssignment | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_assignments")
    .insert({
      hotel_slug: hotelSlug,
      room_type_id: roomTypeId,
      assignment_type: "range",
      range_start: rangeStart,
      range_end: rangeEnd,
      label: label || null,
    })
    .select("*, room_types(name)")
    .single();
  if (error || !data) return null;
  return rowToAssignment(data as AssignmentRow);
}

export async function createIndividualAssignment(
  hotelSlug: string,
  roomTypeId: string,
  roomNumber: number,
  label?: string,
): Promise<RoomAssignment | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_assignments")
    .insert({
      hotel_slug: hotelSlug,
      room_type_id: roomTypeId,
      assignment_type: "individual",
      room_number: roomNumber,
      label: label || null,
    })
    .select("*, room_types(name)")
    .single();
  if (error || !data) return null;
  return rowToAssignment(data as AssignmentRow);
}

export async function deleteRoomAssignment(id: string, hotelSlug: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("room_assignments")
    .delete()
    .eq("id", id)
    .eq("hotel_slug", hotelSlug);
  return !error;
}

export async function lookupRoomType(
  hotelSlug: string,
  roomNumberStr: string,
): Promise<{ roomTypeId: string; roomTypeName: string } | null> {
  const roomNum = parseInt(roomNumberStr, 10);
  if (isNaN(roomNum)) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("room_assignments")
    .select("room_type_id, assignment_type, range_start, range_end, room_number, room_types(name)")
    .eq("hotel_slug", hotelSlug);

  if (error || !data) return null;

  for (const row of data as AssignmentRow[]) {
    if (row.assignment_type === "individual") {
      if (row.room_number === roomNum) {
        const rt = row.room_types as { name?: string } | null;
        return { roomTypeId: String(row.room_type_id), roomTypeName: rt?.name ?? "" };
      }
    } else {
      const start = typeof row.range_start === "number" ? row.range_start : null;
      const end   = typeof row.range_end   === "number" ? row.range_end   : null;
      if (start !== null && end !== null && roomNum >= start && roomNum <= end) {
        const rt = row.room_types as { name?: string } | null;
        return { roomTypeId: String(row.room_type_id), roomTypeName: rt?.name ?? "" };
      }
    }
  }
  return null;
}
