import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import { deletePropertyPhoto, getPhotoUrl } from '@/lib/propertyPhotos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug, id } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Try to clean up storage (best-effort — don't fail if it errors)
    const url = await getPhotoUrl(id, slug);
    if (url) {
      try {
        const supabase = createServiceClient();
        // Extract the storage path from the public URL
        const marker = `/object/public/${BUCKET}/`;
        const markerIdx = url.indexOf(marker);
        if (markerIdx !== -1) {
          const storagePath = url.slice(markerIdx + marker.length);
          await supabase.storage.from(BUCKET).remove([storagePath]);
        }
      } catch {
        // Storage cleanup is best-effort
      }
    }

    await deletePropertyPhoto(id, slug);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
