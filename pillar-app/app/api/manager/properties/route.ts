import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createProperty, slugExists, getPropertiesByManagerId } from "@/lib/properties";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return Response.json({ error: "Property name is required" }, { status: 400 });
  }

  // Enforce property slot limit
  const supabase = createServiceClient();
  const [properties, profileResult] = await Promise.all([
    getPropertiesByManagerId(session.userId),
    supabase
      .from("profiles")
      .select("property_slots")
      .eq("id", session.userId)
      .single(),
  ]);

  const slots = (profileResult.data?.property_slots as number) ?? 1;
  if (properties.length >= slots) {
    return Response.json({ error: "slot_limit_reached" }, { status: 403 });
  }

  let slug = randomUUID();
  for (let i = 0; i < 3; i++) {
    if (!(await slugExists(slug))) break;
    slug = randomUUID();
  }

  await createProperty(session.userId, name, slug);

  return Response.json({ slug }, { status: 200 });
}
