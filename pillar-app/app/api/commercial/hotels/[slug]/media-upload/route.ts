import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { createServiceClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime  = "nodejs";
export const dynamic  = "force-dynamic";

const BUCKET       = "hotel-media";
const MAX_SIZE     = 200 * 1024 * 1024; // 200 MB (generous for video)

const ALLOWED_VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]);
const EXT_MAP: Record<string, string> = {
  "video/mp4":        "mp4",
  "video/webm":       "webm",
  "video/quicktime":  "mov",
  "video/x-msvideo":  "avi",
  "image/jpeg":       "jpg",
  "image/png":        "png",
  "image/webp":       "webp",
  "image/gif":        "gif",
};

function detectImageMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)                      return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)   return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)   return "image/gif";
  return null;
}

async function ensureBucket(sb: SupabaseClient) {
  const { error } = await sb.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: null });
  if (!error) return;
  await sb.storage.createBucket(BUCKET, { public: true, fileSizeLimit: null });
}

async function getSession() {
  const jar   = await cookies();
  const token = jar.get(getCommercialCookieName())?.value || "";
  return token ? verifyCommercialSession(token) : null;
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await ctx.params;
    const allowed  = await verifyHotelAccess(session.userId, slug);
    if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });

    const formData  = await req.formData();
    const file      = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_SIZE) return Response.json({ error: "File too large (max 200 MB)." }, { status: 400 });

    // Determine MIME — use magic bytes for images, Content-Type for video
    let mime    = detectImageMime(buffer);
    let isVideo = false;

    if (!mime) {
      // Try as video via Content-Type
      const ct = file.type.split(";")[0].trim().toLowerCase();
      if (ALLOWED_VIDEO_MIME.has(ct)) {
        mime    = ct;
        isVideo = true;
      }
    }

    if (!mime) {
      return Response.json({ error: "Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WebM." }, { status: 400 });
    }

    void isVideo; // used implicitly via mime check
    const ext  = EXT_MAP[mime] ?? "bin";
    const path = `${session.userId}/${slug}/amenity_${Date.now()}.${ext}`;

    const sb = createServiceClient();
    await ensureBucket(sb);

    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType:  mime,
      upsert:       true,
      cacheControl: "public, max-age=31536000",
    });
    if (upErr) return Response.json({ error: upErr.message }, { status: 500 });

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return Response.json({ url: data.publicUrl });

  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
