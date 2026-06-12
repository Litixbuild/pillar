import { getHotelBySlug } from "@/lib/hotelProperties";
import { createHotelLateCheckout } from "@/lib/hotelLateCheckouts";
import { sendHotelLateCheckoutEmail, sendHotelLateCheckoutSms } from "@/lib/hotelMailer";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { hotelSlug?: unknown; roomNumber?: unknown } | null;
  const hotelSlug  = typeof body?.hotelSlug  === "string" ? body.hotelSlug.trim()  : "";
  const roomNumber = typeof body?.roomNumber === "string" ? body.roomNumber.trim() : String(body?.roomNumber ?? "").trim();

  if (!hotelSlug || !roomNumber) {
    return Response.json({ error: "hotelSlug and roomNumber are required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const allowed = await checkRateLimit(`hotel-late-checkout:${hotelSlug}:${ip}`, 3, 3600);
  if (!allowed) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return Response.json({ error: "Hotel not found" }, { status: 404 });

  const checkout = await createHotelLateCheckout(hotelSlug, roomNumber);
  if (!checkout) return Response.json({ error: "Failed to submit request" }, { status: 500 });

  if (hotel.managerEmail) {
    sendHotelLateCheckoutEmail(hotel.managerEmail, hotel.name, roomNumber).catch(console.error);
  }
  if (hotel.managerPhone) {
    sendHotelLateCheckoutSms(hotel.managerPhone, hotel.name, roomNumber).catch(console.error);
  }

  return Response.json({ ok: true, id: checkout.id }, { status: 201 });
}
