import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { createClient } from "@supabase/supabase-js";

async function getSession() {
  const jar   = await cookies();
  const token = jar.get(getCommercialCookieName())?.value || "";
  return token ? verifyCommercialSession(token) : null;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { oldPassword?: string; newPassword?: string };
  if (!body.oldPassword || !body.newPassword) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  if (body.newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

  // Get user email from profiles
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data: profile } = await sb.from("profiles").select("email").eq("id", session.userId).single();
  if (!profile?.email) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Verify old password by signing in with the user credentials
  const anonSb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error: signInErr } = await anonSb.auth.signInWithPassword({ email: profile.email, password: body.oldPassword });
  if (signInErr) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

  // Update password via admin API
  const { error: updateErr } = await sb.auth.admin.updateUserById(session.userId, { password: body.newPassword });
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
