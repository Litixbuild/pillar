import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPropertiesByManagerId } from "@/lib/properties";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import { createServiceClient } from "@/lib/supabase";
import ManagerDashboardClient from "./ManagerDashboardClient";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) {
    redirect("/manager/login");
  }

  const supabase = createServiceClient();
  const [properties, profileResult] = await Promise.all([
    getPropertiesByManagerId(session.userId),
    supabase.from("profiles").select("is_subscribed").eq("id", session.userId).single(),
  ]);
  const isSubscribed = profileResult.data?.is_subscribed === true;
  const managerName = (session.name || "").trim() || "Manager";

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(160deg, #070e17 0%, #0a1720 50%, #060d14 100%)" }}
    >
      {/* Ambient teal glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 40% at 50% -5%, rgba(20,184,166,0.07) 0%, transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-400/50">
            Manager Portal
          </p>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-white">
            Hello, {managerName}
          </h1>
        </div>

        <div className="space-y-4">
          {/* Properties card */}
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">
                Your Properties
              </p>
              <span className="rounded-full border border-teal-500/20 bg-teal-500/8 px-2.5 py-0.5 text-[10px] font-semibold text-teal-300/60">
                {properties.length} total
              </span>
            </div>
            <div className="p-6">
              <ManagerDashboardClient properties={properties} isSubscribed={isSubscribed} />
            </div>
          </div>

          {/* Billing placeholder */}
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <div className="border-b border-white/5 px-6 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">
                Billing
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/40">
                Stripe integration coming soon. Once connected, subscription checkout and invoices
                will appear here.
              </p>
              <p className="mt-2 text-xs text-white/22">No payments are being collected yet.</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <form action="/api/manager/logout" method="post" className="w-full max-w-xs">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/[0.07] bg-white/4 text-sm font-semibold text-white/55 transition-all duration-200 hover:bg-white/8 hover:text-white/75"
            >
              Sign out
            </button>
          </form>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/20">
            Powered by Pillar
          </p>
        </div>
      </div>
    </div>
  );
}
