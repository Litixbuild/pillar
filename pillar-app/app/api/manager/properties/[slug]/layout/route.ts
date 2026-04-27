import { cookies } from "next/headers";
import {
  getManagerLayoutBySlug,
  getPropertiesByManagerEmail,
  parseManagerLayout,
  setManagerLayoutBySlug,
  type ManagerLayoutItem,
} from "@/lib/airtable";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireManagerSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;
  if (!session) {
    return null;
  }
  return session;
}

async function requirePropertyAccess(email: string, slug: string): Promise<boolean> {
  const props = await getPropertiesByManagerEmail(email);
  return props.some((p) => (p.Slug || "").trim() === slug.trim());
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const ok = await requirePropertyAccess(session.email, slug);
  if (!ok) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const layout = await getManagerLayoutBySlug(slug);
  if (!layout) {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }

  return Response.json({ layout }, { status: 200 });
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireManagerSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.email, slug);
    if (!ok) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as
      | { layout?: unknown }
      | null;

    const layoutRaw = body?.layout;
    const layout: ManagerLayoutItem[] = Array.isArray(layoutRaw)
      ? layoutRaw
          .map((x) => {
            if (!x || typeof x !== "object") return null;
            const f = (x as { field?: unknown }).field;
            if (typeof f !== "string" || !f.trim()) return null;
            return { field: f.trim() } satisfies ManagerLayoutItem;
          })
          .filter((x): x is ManagerLayoutItem => Boolean(x))
      : typeof layoutRaw === "string"
        ? parseManagerLayout(layoutRaw)
        : [];

    await setManagerLayoutBySlug(slug, layout);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
