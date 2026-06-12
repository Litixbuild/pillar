import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCommercialCookieName, verifyCommercialSession } from "@/lib/commercialAuth";
import { getHotelBySlug } from "@/lib/hotelProperties";
import { getOpenHotelWorkOrderCount } from "@/lib/hotelWorkOrders";
import CommercialBottomNav from "../../CommercialBottomNav";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { label: "Hotel Settings",  sub: "Branding, contact, access codes", href: (s: string) => `/commercial/hotels/${s}/edit`,      icon: "⚙" },
  { label: "Amenities",       sub: "Hotel-wide guide shown to all guests", href: (s: string) => `/commercial/hotels/${s}/amenities`, icon: "✦" },
  { label: "Room Setup",      sub: "Room types and assignments",       href: (s: string) => `/commercial/hotels/${s}/rooms`,     icon: "▦" },
  { label: "Activity",        sub: "Work orders and late checkouts",   href: (s: string) => `/commercial/hotels/${s}/activity`,  icon: "◎" },
  { label: "QR Code",         sub: "Universal QR code for all rooms",  href: (s: string) => `/commercial/hotels/${s}/qr`,        icon: "⊞" },
];

export default async function HotelHubPage(props: { params: Promise<{ slug: string }> }) {
  const jar     = await cookies();
  const token   = jar.get(getCommercialCookieName())?.value || "";
  const session = token ? verifyCommercialSession(token) : null;
  if (!session?.userId) redirect("/commercial/login");

  const { slug } = await props.params;
  const hotel     = await getHotelBySlug(slug);
  if (!hotel || hotel.managerId !== session.userId) notFound();

  const openCount = await getOpenHotelWorkOrderCount(session.userId);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0"  style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">
        {/* Back + header */}
        <div className="mb-8">
          <Link href="/commercial/hotels" className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(100,80,40,0.55)] transition-colors hover:text-[rgba(100,80,40,0.80)] dark:text-white/40 dark:hover:text-white/65">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Hotels
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">Commercial</p>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">{hotel.name}</h1>
          {(hotel.city || hotel.address) && (
            <p className="mt-1 text-sm text-[rgba(100,80,40,0.50)] dark:text-white/40">{[hotel.city, hotel.state].filter(Boolean).join(", ") || hotel.address}</p>
          )}
        </div>

        {/* Quick stats */}
        {openCount > 0 && (
          <Link href={`/commercial/hotels/${slug}/activity`} className="mb-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-rose-200/60 bg-rose-50/80 px-5 py-4 shadow-sm backdrop-blur dark:border-rose-500/20 dark:bg-rose-500/8">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">{openCount}</span>
            <div>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Open work orders require attention</p>
              <p className="text-xs text-rose-500/70 dark:text-rose-400/60">Tap to view activity →</p>
            </div>
          </Link>
        )}

        {/* Nav cards */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
            {NAV_ITEMS.map(({ label, sub, href, icon }) => (
              <Link key={label} href={href(slug)} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[rgba(100,80,40,0.03)] dark:hover:bg-white/[0.025]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(100,80,40,0.07)] text-base text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/85">{label}</p>
                  <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">{sub}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[rgba(100,80,40,0.30)] dark:text-white/20" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Guest portal link */}
        <a
          href={`/h/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-4 shadow-[0_2px_12px_rgba(100,80,40,0.05)] backdrop-blur-xl transition hover:bg-white/95 dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)] dark:hover:bg-[rgba(14,14,14,0.95)]"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.50)] dark:text-white/40">
              Preview Guest Portal
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-white/55">
              /h/{slug}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="ml-4 h-4 w-4 shrink-0 text-[rgba(100,80,40,0.35)] dark:text-white/30" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <CommercialBottomNav />
    </div>
  );
}
