import { cookies } from "next/headers";
import { getAdminCookieName } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const jar = await cookies();
  const name = getAdminCookieName();
  // Clear cookie for both the old path ("/admin") and current path ("/")
  jar.set({ name, value: "", path: "/admin", maxAge: 0 });
  jar.set({ name, value: "", path: "/", maxAge: 0 });
  return Response.json({ ok: true }, { status: 200 });
}
