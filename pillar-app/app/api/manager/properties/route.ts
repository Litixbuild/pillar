import { cookies } from "next/headers";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createProperty, slugExists } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function randomSuffix(): string {
  return Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
}

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

  const base = toSlug(name) || "property";

  // Generate a unique slug, retrying if there's a collision
  let slug = `${base}-${randomSuffix()}`;
  for (let i = 0; i < 5; i++) {
    if (!(await slugExists(slug))) break;
    slug = `${base}-${randomSuffix()}`;
  }

  await createProperty(session.userId, name, slug);

  return Response.json({ slug }, { status: 200 });
}
