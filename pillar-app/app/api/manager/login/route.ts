import { cookies } from "next/headers";
import { getPropertiesByManagerEmail } from "@/lib/airtable";
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

  // Demo fallback (optional)
  const demoEmail = process.env.MANAGER_DEMO_EMAIL?.trim().toLowerCase();
  const demoPassword = process.env.MANAGER_DEMO_PASSWORD || "";
  const demoOk = demoEmail && demoPassword && email === demoEmail && password === demoPassword;

  let ok = demoOk;
  let managerName: string | undefined = undefined;

  // Pull manager name from Airtable whenever possible (even when demo creds are used).
  // Also use Airtable-backed password verification when demo creds are not enabled.
  const props = await getPropertiesByManagerEmail(email);
  managerName = props.find((p) => (p.ManagerName || "").trim())?.ManagerName;

  if (!ok) {
    const expected = props.find((p) => (p.ManagerPassword || "").trim())?.ManagerPassword || "";
    ok = Boolean(expected) && expected === password;
  }

  if (!ok) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let token = "";
  try {
    token = signManagerSession({ email, name: managerName, iat: Date.now() });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Missing MANAGER_SESSION_SECRET. Set it in .env.local / host env vars.",
        debug: {
          hasManagerSessionSecret: Boolean(process.env.MANAGER_SESSION_SECRET?.trim()),
          nodeEnv: process.env.NODE_ENV,
          netlify: {
            CONTEXT: process.env.CONTEXT,
            NETLIFY: process.env.NETLIFY,
            SITE_NAME: process.env.SITE_NAME,
            BRANCH: process.env.BRANCH,
          },
        },
      },
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
