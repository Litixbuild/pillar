import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminSession } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "qr-codes";

async function requireAdminSession() {
  const jar = await cookies();
  const token = jar.get(getAdminCookieName())?.value ?? "";
  if (!token) return null;
  const session = verifyAdminSession(token);
  if (!session) return null;
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .single();
  if (profile?.role !== "admin") return null;
  return session;
}

async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  const { error: updateErr } = await supabase.storage.updateBucket(BUCKET, { public: true });
  if (!updateErr) return;
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (createErr && !createErr.message.toLowerCase().includes("already exist")) {
    throw new Error(`Could not create storage bucket: ${createErr.message}`);
  }
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("qr_codes")
    .select("id, label, url, public_url, created_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    label?: unknown;
    url?: unknown;
    imageDataUrl?: unknown;
  } | null;

  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : "";

  if (!label || !url || !imageDataUrl) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const base64 = imageDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  const supabase = createServiceClient();
  const id = randomUUID();
  const storagePath = `${id}.png`;

  await ensureBucket(supabase);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "image/png", upsert: false });

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data, error: dbError } = await supabase
    .from("qr_codes")
    .insert({ id, label, url, storage_path: storagePath, public_url: urlData.publicUrl })
    .select("id, label, url, public_url, created_at")
    .single();

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 });

  return Response.json(data, { status: 201 });
}
