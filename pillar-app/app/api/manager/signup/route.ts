import { createClient, createServiceClient } from "@/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pmpillar.com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
  } | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!name) return Response.json({ error: "Full name is required" }, { status: 400 });
  if (!email) return Response.json({ error: "Email is required" }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  if (password !== confirmPassword) return Response.json({ error: "Passwords do not match" }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${APP_URL}/manager/login`,
      data: { full_name: name },
    },
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Signup failed" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error: profileError } = await service.from("profiles").insert({
    id: data.user.id,
    email,
    full_name: name,
    role: "manager",
    is_subscribed: false,
  });

  if (profileError && !profileError.message.includes("duplicate")) {
    return Response.json({ error: "Account created but profile setup failed. Please contact support." }, { status: 500 });
  }

  return Response.json({ ok: true, requiresEmailVerification: true }, { status: 200 });
}
