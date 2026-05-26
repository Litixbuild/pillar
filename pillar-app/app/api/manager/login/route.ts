import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase";
import { getManagerCookieName, signManagerSession } from "@/lib/managerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const msg = error?.message ?? "Invalid credentials";
    if (msg.toLowerCase().includes("email not confirmed")) {
      return Response.json({ error: "Please verify your email before signing in. Check your inbox for a confirmation link." }, { status: 401 });
    }
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .single();

  const managerName = profile?.full_name ?? undefined;

  let token = "";
  try {
    token = signManagerSession({
      email,
      name: managerName,
      userId: data.user.id,
      iat: Date.now(),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Missing MANAGER_SESSION_SECRET." },
      { status: 500 }
    );
  }

  const jar = await cookies();
  jar.set({
    name: getManagerCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return Response.json({ ok: true }, { status: 200 });
}
