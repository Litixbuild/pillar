import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import { getPropertyPhotos, addPropertyPhoto, getNextPhotoOrder } from '@/lib/propertyPhotos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const photos = await getPropertyPhotos(slug);
    return Response.json({ photos }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireSession();
    if (!session?.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ error: 'Missing file' }, { status: 400 });

    const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg';
    const photoId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const path = `${session.userId}/${slug}/photos/${photoId}.${rawExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createServiceClient();

    // Upload file
    let { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      // Ensure bucket exists and retry
      await supabase.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: null })
        .catch(() => supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: null }));
      ({ error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: true }));
    }
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const displayOrder = await getNextPhotoOrder(slug);
    const photo = await addPropertyPhoto(slug, publicUrl, displayOrder);

    return Response.json({ photo }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
