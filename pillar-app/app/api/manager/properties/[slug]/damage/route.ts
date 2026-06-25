import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import { getMostRecentStay } from '@/lib/stays';
import { addDamagePhoto } from '@/lib/stayDamageReports';

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
  const { data, error } = await supabase.storage.getBucket(BUCKET);
  if (data) return; // bucket confirmed to exist — nothing to do

  // Only the bucket genuinely not existing should trigger creation. Any other
  // error (network blip, rate limit, transient API hiccup) must not block the
  // upload — assume the bucket is fine and proceed straight to the file upload,
  // which will surface its own real error if something is actually wrong.
  if (error && !/not.?found/i.test(error.message)) {
    console.error('[ensureBucket] getBucket check failed, proceeding anyway:', error.message);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`Could not create storage bucket: ${createError.message}`);
  }
}

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
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

    const stay = await getMostRecentStay(slug);
    if (!stay) {
      return Response.json(
        { error: 'No tenant stay exists yet for this property. Confirm a new tenant first.' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    const caption = (formData.get('caption') as string | null)?.trim() || null;

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
      const path = `${slug}/damage/${stay.id}/${id}.${extForMime(mime)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: mime, upsert: true });
      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await addDamagePhoto(stay.id, slug, publicUrl, caption);
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
    console.error('[damage POST]', e);
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
