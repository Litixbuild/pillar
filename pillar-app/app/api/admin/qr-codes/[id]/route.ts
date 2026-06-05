import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminSession } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

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

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const supabase = createServiceClient();

  const { data: record } = await supabase
    .from("qr_codes")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (record?.storage_path) {
    await supabase.storage.from(BUCKET).remove([record.storage_path]);
  }

  const { error } = await supabase.from("qr_codes").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
