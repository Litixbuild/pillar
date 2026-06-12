import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { verifyHotelAccess } from "@/lib/hotelProperties";
import { createServiceClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "hotel-media";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const FIELD_TO_COLUMN: Record<string, string> = {
  hero:      "hero_image_url",
  logo:      "logo_url",
  logo_dark: "logo_url_dark",
};

function detectMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  return null;
}

async function ensureBucket(supabase: SupabaseClient) {
  const { error } = await supabase.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: null });
  if (!error) return;
  await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: null });
}

async function uploadToStorage(supabase: SupabaseClient, path: string, buf: Buffer, mime: string): Promise<string> {
  await ensureBucket(supabase);
  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType: mime,
    upsert: true,
    cacheControl: "public, max-age=31536000",
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
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
    const allowed = await verifyHotelAccess(session.userId, slug);
    if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const file  = formData.get("file") as File | null;
    const field = ((formData.get("field") as string | null) ?? "").trim();

    if (!file || !field) return Response.json({ error: "Missing file or field" }, { status: 400 });

    const rawExt = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) return Response.json({ error: "File too large. Maximum 50 MB." }, { status: 400 });

    const mime = detectMime(buffer);
    if (!mime || !IMAGE_MIME_TYPES.has(mime)) return Response.json({ error: "Images only (JPEG, PNG, WebP, GIF)." }, { status: 400 });

    const column = FIELD_TO_COLUMN[field];
    if (!column) return Response.json({ error: `Unknown field: ${field}` }, { status: 400 });

    const supabase  = createServiceClient();
    const path      = `${session.userId}/${slug}/${field}_${Date.now()}.${rawExt}`;
    const publicUrl = await uploadToStorage(supabase, path, buffer, mime);

    const { error: updateErr } = await supabase
      .from("hotel_properties")
      .update({ [column]: publicUrl })
      .eq("slug", slug);

    if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });
    return Response.json({ url: publicUrl }, { status: 200 });

  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
