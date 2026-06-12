import { getHotelBySlug } from "@/lib/hotelProperties";
import { createHotelWorkOrder } from "@/lib/hotelWorkOrders";
import { sendHotelWorkOrderEmail, sendHotelWorkOrderSms } from "@/lib/hotelMailer";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    hotelSlug?: unknown;
    roomNumber?: unknown;
    categoryName?: unknown;
    description?: unknown;
  } | null;

  const hotelSlug    = typeof body?.hotelSlug    === "string" ? body.hotelSlug.trim()    : "";
  const roomNumber   = typeof body?.roomNumber   === "string" ? body.roomNumber.trim()   : String(body?.roomNumber ?? "").trim();
  const categoryName = typeof body?.categoryName === "string" ? body.categoryName.trim() : "General";
  const description  = typeof body?.description  === "string" && body.description.trim() ? body.description.trim() : null;

  if (!hotelSlug || !roomNumber) {
    return Response.json({ error: "hotelSlug and roomNumber are required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const allowed = await checkRateLimit(`hotel-work-order:${hotelSlug}:${ip}`, 5, 3600);
  if (!allowed) {
    return Response.json({ error: "Too many requests. Please wait before submitting another work order." }, { status: 429 });
  }

  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return Response.json({ error: "Hotel not found" }, { status: 404 });

  const order = await createHotelWorkOrder(hotelSlug, roomNumber, categoryName, description, null);
  if (!order) return Response.json({ error: "Failed to submit work order" }, { status: 500 });

  // Notify manager (fire and forget — don't fail the request if notifications fail)
  if (hotel.managerEmail) {
    sendHotelWorkOrderEmail(hotel.managerEmail, hotel.name, roomNumber, categoryName, description).catch(console.error);
  }
  if (hotel.managerPhone) {
    sendHotelWorkOrderSms(hotel.managerPhone, hotel.name, roomNumber, categoryName).catch(console.error);
  }

  return Response.json({ ok: true, id: order.id }, { status: 201 });
}
