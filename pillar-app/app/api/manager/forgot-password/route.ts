import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };

  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const supabase = createClient();

  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${origin}/manager/reset-password`,
  });

  // Always return success so we don't reveal whether an account exists.
  return Response.json({ ok: true });
}
