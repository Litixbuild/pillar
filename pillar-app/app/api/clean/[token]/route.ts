import { createServiceClient } from '@/lib/supabase';
import { getPropertySlugForToken } from '@/lib/cleanerTokens';
import { getActiveStay } from '@/lib/stays';
import { addCleaningPhoto } from '@/lib/stayCleaningPhotos';
import { getPropertyBySlug } from '@/lib/properties';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';
const MAX_PHOTO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILES = 12;

function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  return null;
}

function extForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

async function ensureBucket(supabase: ReturnType<typeof createServiceClient>) {
  const { error } = await supabase.storage.getBucket(BUCKET);
  if (!error) return;
  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createError) throw new Error(`Could not create storage bucket: ${createError.message}`);
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await ctx.params;
    const slug = await getPropertySlugForToken(token);
    if (!slug) return Response.json({ error: 'This link is invalid.' }, { status: 404 });

    const [property, activeStay] = await Promise.all([
      getPropertyBySlug(slug),
      getActiveStay(slug),
    ]);

    return Response.json({
      propertyName: property?.PropertyName ?? slug,
      hasActiveStay: !!activeStay,
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await ctx.params;
    const slug = await getPropertySlugForToken(token);
    if (!slug) return Response.json({ error: 'This link is invalid.' }, { status: 404 });

    const stay = await getActiveStay(slug);
    if (!stay) {
      return Response.json(
        { error: 'There is no active stay for this property right now. Ask the manager to confirm the new tenant first.' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    const uploaderLabel = (formData.get('name') as string | null)?.trim() || null;

    if (files.length === 0) return Response.json({ error: 'No photos selected.' }, { status: 400 });
    if (files.length > MAX_FILES) {
      return Response.json({ error: `Please upload ${MAX_FILES} photos or fewer at a time.` }, { status: 400 });
    }

    const supabase = createServiceClient();
    await ensureBucket(supabase);

    let uploaded = 0;
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > MAX_PHOTO_SIZE) continue;
      const mime = detectImageMime(buffer);
      if (!mime) continue;

      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const path = `${slug}/cleaning/${stay.id}/${id}.${extForMime(mime)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: mime, upsert: true });
      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await addCleaningPhoto(stay.id, slug, publicUrl, uploaderLabel);
      uploaded++;
    }

    if (uploaded === 0) {
      return Response.json(
        { error: 'No valid photos were uploaded. Please use JPEG, PNG, WebP, or GIF images.' },
        { status: 400 }
      );
    }

    return Response.json({ ok: true, uploaded }, { status: 200 });
  } catch (e) {
    console.error('[clean token POST]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
