import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess, updateWindowUrl } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const WINDOW_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, 'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime']);

function detectMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf';
  if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return 'video/webm';
  if (buf.slice(4, 8).toString('ascii') === 'ftyp') return 'video/mp4'; // MP4/MOV: 'ftyp' box at offset 4
  return null;
}

// Fixed column uploads (hero image, logo)
const FIELD_TO_COLUMN: Record<string, string> = {
  hero: 'hero_image_url',
  logo: 'logo_url',
  logo_dark: 'logo_url_dark',
};

async function requireManagerSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  // Try updating first — works if bucket already exists and removes any size cap
  const { error: updateErr } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: null, // no bucket-level cap; plan limits apply
  });
  if (!updateErr) return;

  // Bucket doesn't exist yet — create it
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: null,
  });
  if (createErr && !createErr.message.toLowerCase().includes('already exist')) {
    throw new Error(`Could not create storage bucket: ${createErr.message}`);
  }
}

async function uploadToStorage(
  supabase: SupabaseClient,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  let { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  // Bucket missing or size limit hit — ensure bucket exists with no cap and retry
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('bucket') || msg.includes('size') || msg.includes('limit')) {
      await ensureBucket(supabase);
      ({ error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType, upsert: true }));
    }
  }

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await requireManagerSession();
    if (!session?.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await ctx.params;
    const ok = await requirePropertyAccess(session.userId, slug);
    if (!ok) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const field = ((formData.get('field') as string | null) ?? '').trim();

    if (!file || !field) {
      return Response.json({ error: 'Missing file or field' }, { status: 400 });
    }

    const rawExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin';
    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return Response.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 400 });
    }
    const detectedMime = detectMimeFromBytes(buffer);
    if (!detectedMime) {
      return Response.json({ error: 'Unsupported file type.' }, { status: 400 });
    }
    const isWindowUpload = field.startsWith('window/');
    const allowedTypes = isWindowUpload ? WINDOW_MIME_TYPES : IMAGE_MIME_TYPES;
    if (!allowedTypes.has(detectedMime)) {
      return Response.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Window file upload: field = "window/{windowId}"
    if (isWindowUpload) {
      const windowId = field.slice(7);
      if (!windowId) return Response.json({ error: 'Missing window ID' }, { status: 400 });

      const path = `${session.userId}/${slug}/windows/${windowId}.${rawExt}`;
      const publicUrl = await uploadToStorage(supabase, path, buffer, detectedMime);

      await updateWindowUrl(slug, windowId, publicUrl);
      return Response.json({ url: publicUrl }, { status: 200 });
    }

    // Fixed column upload (hero image)
    const column = FIELD_TO_COLUMN[field];
    if (!column) {
      return Response.json({ error: `Unknown field: ${field}` }, { status: 400 });
    }

    const path = `${session.userId}/${slug}/${field}_${Date.now()}.${rawExt}`;
    const publicUrl = await uploadToStorage(supabase, path, buffer, detectedMime);

    const { error: updateError } = await supabase
      .from('properties')
      .update({ [column]: publicUrl })
      .eq('slug', slug.trim());

    if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

    return Response.json({ url: publicUrl }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
