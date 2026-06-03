import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createProperty, slugExists, getPropertiesByManagerId } from "@/lib/properties";
import { createServiceClient } from "@/lib/supabase";
import { applyTemplateToProperty } from "@/lib/propertyTemplates";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { name?: unknown; templateId?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const templateId = typeof body?.templateId === "string" ? body.templateId.trim() : "blank";

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

  if (templateId && templateId !== "blank") {
    try {
      await applyTemplateToProperty(slug, templateId);
    } catch {
      // Template application failure is non-fatal — property still created
    }
  }

  return Response.json({ slug }, { status: 200 });
}
