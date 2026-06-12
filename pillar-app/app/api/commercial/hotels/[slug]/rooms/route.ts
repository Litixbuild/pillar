import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { getRoomAssignments, createRangeAssignment, createIndividualAssignment } from "@/lib/roomAssignments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSession() {
  const jar = await cookies();
  const token = jar.get(getCommercialCookieName())?.value;
  if (!token) return null;
  return verifyCommercialSession(token);
}

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });
  const assignments = await getRoomAssignments(slug);
  return Response.json({ assignments });
}

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await props.params;
  const allowed = await verifyHotelAccess(session.userId, slug);
  if (!allowed) return Response.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as {
    type?: unknown;
    roomTypeId?: unknown;
    rangeStart?: unknown;
    rangeEnd?: unknown;
    roomNumber?: unknown;
    label?: unknown;
  } | null;

  const roomTypeId = typeof body?.roomTypeId === "string" ? body.roomTypeId : "";
  if (!roomTypeId) return Response.json({ error: "roomTypeId is required" }, { status: 400 });

  if (body?.type === "individual") {
    const roomNumber = typeof body?.roomNumber === "number" ? body.roomNumber : parseInt(String(body?.roomNumber ?? ""), 10);
    if (isNaN(roomNumber)) return Response.json({ error: "Valid room number is required" }, { status: 400 });
    const label = typeof body?.label === "string" ? body.label : undefined;
    const assignment = await createIndividualAssignment(slug, roomTypeId, roomNumber, label);
    if (!assignment) return Response.json({ error: "Failed to create assignment" }, { status: 500 });
    return Response.json({ assignment }, { status: 201 });
  } else {
    const rangeStart = typeof body?.rangeStart === "number" ? body.rangeStart : parseInt(String(body?.rangeStart ?? ""), 10);
    const rangeEnd   = typeof body?.rangeEnd   === "number" ? body.rangeEnd   : parseInt(String(body?.rangeEnd   ?? ""), 10);
    if (isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart > rangeEnd) {
      return Response.json({ error: "Valid range (start ≤ end) is required" }, { status: 400 });
    }
    const label = typeof body?.label === "string" ? body.label : undefined;
    const assignment = await createRangeAssignment(slug, roomTypeId, rangeStart, rangeEnd, label);
    if (!assignment) return Response.json({ error: "Failed to create assignment" }, { status: 500 });
    return Response.json({ assignment }, { status: 201 });
  }
}
