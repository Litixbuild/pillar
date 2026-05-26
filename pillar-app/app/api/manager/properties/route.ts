import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createProperty, slugExists } from "@/lib/properties";

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

  // UUID makes the URL unguessable — collision is astronomically unlikely but we still check
  let slug = randomUUID();
  for (let i = 0; i < 3; i++) {
    if (!(await slugExists(slug))) break;
    slug = randomUUID();
  }

  await createProperty(session.userId, name, slug);

  return Response.json({ slug }, { status: 200 });
}
