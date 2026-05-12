import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  jar.delete(getAdminCookieName());
  return Response.json({ ok: true }, { status: 200 });
}
