import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess, slugExists, regeneratePropertySlug } from '@/lib/properties';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toSlugBase(slug: string): string {
  // Strip existing 4-char hex suffix (e.g. "beach-house-a3f1" → "beach-house")
  return slug.replace(/-[0-9a-f]{4}$/, '');
}

function randomSuffix(): string {
  return Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
}

export async function POST(
  _req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug: oldSlug } = await props.params;

  const hasAccess = await requirePropertyAccess(session.userId, oldSlug);
  if (!hasAccess) {
    return Response.json({ error: 'Property not found' }, { status: 404 });
  }

  const base = toSlugBase(oldSlug) || 'property';

  let newSlug = `${base}-${randomSuffix()}`;
  for (let i = 0; i < 5; i++) {
    if (newSlug !== oldSlug && !(await slugExists(newSlug))) break;
    newSlug = `${base}-${randomSuffix()}`;
  }

  try {
    await regeneratePropertySlug(session.userId, oldSlug, newSlug);
  } catch (e) {
    console.error('[regenerate] failed:', e);
    return Response.json({ error: 'Failed to regenerate. Please try again.' }, { status: 500 });
  }

  return Response.json({ slug: newSlug }, { status: 200 });
}
