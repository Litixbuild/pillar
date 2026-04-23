import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPropertiesByManagerEmail } from "@/lib/airtable";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import ManagerThemeToggle from "@/components/ManagerThemeToggle";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session) {
    redirect("/manager/login");
  }

  const properties = await getPropertiesByManagerEmail(session.email);
  const managerName =
    (session.name || "").trim() ||
    (properties.find((p) => (p.ManagerName || "").trim())?.ManagerName || "").trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3EE] via-white to-[#F5F3EE] text-[#2C2C2C] dark:from-[#0F0F0F] dark:via-[#1B1B1B] dark:to-black dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6">
        <div className="relative">
          <div>
            <h1 className="lux-title mt-2 text-3xl">Hello {managerName || "Manager"}</h1>
          </div>

          <div className="absolute right-0 top-0">
            <ManagerThemeToggle className="shrink-0" />
          </div>
        </div>

        <div className="mt-12 grid gap-4">
          <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="lux-title text-lg">Your properties</div>
                <div className="mt-1 text-xs text-black/50 dark:text-white/60">
                  Click a property to open the guest-facing experience.
                </div>
              </div>
              <div className="whitespace-nowrap rounded-full bg-[#D4AF6A]/15 px-3 py-1 text-xs font-semibold text-[#7A5A1E] dark:text-[#E8D4A8]">
                {properties.length} total
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {properties.map((p) => {
                const slug = (p.Slug || "").trim();
                const href = slug ? `/p/${slug}` : null;

                return (
                  <div
                    key={`${p.PropertyName}-${p.PropertyAddress}`}
                    className="rounded-2xl border border-black/5 bg-white/70 p-4 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                  >
                    <div className="lux-title text-base">{p.PropertyName || "—"}</div>
                    <div className="mt-1 text-xs text-black/55 dark:text-white/65">
                      {(p.PropertyAddress || "").trim()}
                    </div>
                    <div className="mt-3">
                      {href ? (
                        <Link
                          href={href}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7A5A1E] underline decoration-[#D4AF6A]/60 underline-offset-4 hover:decoration-[#D4AF6A] dark:text-[#E8D4A8]"
                        >
                          Open property
                          <span aria-hidden>
                            →
                          </span>
                        </Link>
                      ) : (
                        <span className="text-xs text-black/50 dark:text-white/50">
                          (Missing Slug field in Airtable record)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {!properties.length ? (
                <div className="text-sm text-black/60 dark:text-white/70">
                  No properties found for this manager email.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="lux-title text-lg">Billing</div>
            <p className="mt-2 text-sm text-black/60 dark:text-white/70">
              Stripe integration will live here. Once you add Stripe keys, we’ll enable subscription checkout + invoices.
            </p>
            <div className="mt-4 text-xs text-black/45 dark:text-white/55">
              (Scaffold only — no payments are being collected yet.)
            </div>
          </div>
        </div>

        <div className="pt-5">
          <form action={"/api/manager/logout"} method="post" className="flex flex-col items-center gap-1.5">
            <button
              type="submit"
              className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-2xl bg-[#2C2C2C] text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-black dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Sign out
            </button>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40 dark:text-white/55">
              Powered by Pillar
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
