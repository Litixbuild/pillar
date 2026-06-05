import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import { getPropertyPhotos, addPropertyPhoto, getNextPhotoOrder } from '@/lib/propertyPhotos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';

const MAX_PHOTO_SIZE = 50 * 1024 * 1024; // 50 MB

function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  return null;
}

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { error: getError } = await supabase.storage.getBucket(BUCKET);
  if (!getError) return; // bucket exists
  // Bucket doesn't exist — create it
  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createError) throw new Error(`Could not create storage bucket: ${createError.message}`);
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

    if (buffer.length > MAX_PHOTO_SIZE) {
      return Response.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 400 });
    }
    const detectedMime = detectImageMime(buffer);
    if (!detectedMime) {
      return Response.json({ error: 'Only JPEG, PNG, WebP, and GIF images are accepted.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Ensure the bucket exists before uploading
    await ensureBucket(supabase);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: detectedMime, upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const displayOrder = await getNextPhotoOrder(slug);
    const photo = await addPropertyPhoto(slug, publicUrl, displayOrder);

    return Response.json({ photo }, { status: 200 });
  } catch (e) {
    console.error('[photos POST]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
