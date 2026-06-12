import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function getSession() {
  const jar   = await cookies();
  const token = jar.get(getCommercialCookieName())?.value || "";
  return token ? verifyCommercialSession(token) : null;
}

export async function GET() {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb  = getSupabase();
  const { data, error } = await sb.from("profiles").select("full_name, email").eq("id", session.userId).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ name: data.full_name ?? "", email: data.email ?? "" });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim();

  const sb  = getSupabase();
  const { error } = await sb.from("profiles").update({ full_name: name }).eq("id", session.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
