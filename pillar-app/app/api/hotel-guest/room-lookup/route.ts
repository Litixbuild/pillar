import { getHotelBySlug } from "@/lib/hotelProperties";
import { lookupRoomType } from "@/lib/roomAssignments";
import { getHotelWindows, getRoomTypeWindows } from "@/lib/hotelWindows";
import type { AmenityWindow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { hotelSlug?: unknown; roomNumber?: unknown } | null;
  const hotelSlug  = typeof body?.hotelSlug  === "string" ? body.hotelSlug.trim()  : "";
  const roomNumber = typeof body?.roomNumber === "string" ? body.roomNumber.trim() : String(body?.roomNumber ?? "").trim();

  if (!hotelSlug || !roomNumber) {
    return Response.json({ error: "hotelSlug and roomNumber are required" }, { status: 400 });
  }

  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return Response.json({ error: "Hotel not found" }, { status: 404 });

  const [hotelWide, roomTypeMatch] = await Promise.all([
    getHotelWindows(hotelSlug),
    lookupRoomType(hotelSlug, roomNumber),
  ]);

  let roomTypeWindows: AmenityWindow[] = [];
  let roomTypeName: string | null = null;

  if (roomTypeMatch) {
    roomTypeWindows = await getRoomTypeWindows(roomTypeMatch.roomTypeId);
    roomTypeName    = roomTypeMatch.roomTypeName;
  }

  return Response.json({
    found:           !!roomTypeMatch,
    roomTypeName,
    hotelName:       hotel.name,
    accentColor:     hotel.accentColor,
    headingColor:    hotel.headingColor,
    textColor:       hotel.textColor,
    windows:         [...hotelWide, ...roomTypeWindows],
  });
}
