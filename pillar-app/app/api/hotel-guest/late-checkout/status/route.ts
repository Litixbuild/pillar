import { getLatestHotelCheckoutStatus } from "@/lib/hotelLateCheckouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hotelSlug  = searchParams.get("hotelSlug")  ?? "";
  const roomNumber = searchParams.get("roomNumber") ?? "";
  if (!hotelSlug || !roomNumber) {
    return Response.json({ error: "hotelSlug and roomNumber are required" }, { status: 400 });
  }
  const checkout = await getLatestHotelCheckoutStatus(hotelSlug, roomNumber);
  return Response.json({ checkout });
}
