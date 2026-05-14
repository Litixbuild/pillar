import { cookies } from 'next/headers';
import {
  deleteProperty,
  getManagerLayoutBySlug,
  getPropertyBySlug,
  getPropertyFieldsBySlug,
  requirePropertyAccess,
  updatePropertyFieldsBySlug,
} from '@/lib/properties';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import type { FieldValue, PropertyFields, Property } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireManagerSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function toStringOrNull(v: unknown): string | null {
  if (v === null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}

const CORE_EDITABLE_FIELDS = [
  'PropertyName',
  'PropertyAddress',
  'PropertyZipCode',
  'DetailedHouseBio',
  'HouseRules',
  'WiFiName',
  'WiFiPassword',
  'GarageCode',
  'ManagerPhone',
  'BackgroundKey',
  'AccentColor',
  'HeadingColor',
  'TextColor',
] as const;

const NUMERIC_EDITABLE_FIELDS = ['LogoSize'] as const;

function pickAllowedCoreFields(input: unknown): Partial<Record<string, FieldValue>> {
  if (!isPlainObject(input)) return {};
  const out: Partial<Record<string, FieldValue>> = {};
  for (const key of CORE_EDITABLE_FIELDS) {
    const v = toStringOrNull(input[key]);
    if (v === null) continue;
    out[key] = v;
  }
  for (const key of NUMERIC_EDITABLE_FIELDS) {
    const v = input[key];
    if (typeof v === 'number' && Number.isFinite(v)) out[key] = Math.round(v);
  }
  return out;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const session = await requireManagerSession();
  if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await ctx.params;
  const ok = await requirePropertyAccess(session.userId, slug);
  if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const [property, rawFields, layout] = await Promise.all([
    getPropertyBySlug(slug),
    getPropertyFieldsBySlug(slug),
    getManagerLayoutBySlug(slug),
  ]);

  if (!property || !rawFields) return Response.json({ error: 'Property not found' }, { status: 404 });

  const layoutFields = (layout ?? []).map((x) => (x.field || '').trim()).filter(Boolean);
  return Response.json(
    { property: property as Property, rawFields: rawFields as PropertyFields, layoutFields },
    { status: 200 }
  );
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireManagerSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    await deleteProperty(session.userId, slug);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireManagerSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as unknown;
    const fields = isPlainObject(body) ? body.fields : null;

    const core = pickAllowedCoreFields(fields);
    await updatePropertyFieldsBySlug(slug, core);

    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
