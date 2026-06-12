"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HotelProperty } from "@/lib/hotelProperties";
import CommercialBottomNav from "./CommercialBottomNav";

const SANDY     = "#F5EDD5";
const SANDY_RGB = "245,237,213";

function SunIcon()  { return <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function CommercialDashboardClient({
  hotels,
  openWorkOrderCount,
  managerName,
}: {
  hotels: HotelProperty[];
  openWorkOrderCount: number;
  managerName: string;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pillar-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pillar-theme", next ? "dark" : "light");
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const toggleStyle = dark
    ? { borderColor: "rgba(245,237,213,0.28)", background: "rgba(245,237,213,0.08)", color: SANDY }
    : { borderColor: "rgba(100,80,40,0.20)", background: "rgba(255,255,255,0.80)", color: "rgba(100,80,40,0.70)" };

  return (
    <div className="relative min-h-screen">
      {/* Backgrounds */}
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/6 bg-white/90 px-5 py-3 backdrop-blur-md dark:border-white/[0.06] dark:bg-[rgba(8,8,8,0.90)]">
        <Image src={dark ? "/images/pillarlogowhite.png" : "/images/pillarlogoblack.png"} alt="Pillar" width={80} height={26} className="h-5 w-auto opacity-85" />
        <button type="button" onClick={toggleMode} className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300" style={toggleStyle}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">

        {/* Greeting */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">Dashboard</p>
          <h1 className="mt-1 text-[1.85rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">
            {greeting},<br />{managerName.split(" ")[0]}
          </h1>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {[
            { label: "Hotels",       value: hotels.length,       sub: hotels.length === 1 ? "property" : "properties" },
            { label: "Open Orders",  value: openWorkOrderCount,  sub: "need attention",  alert: openWorkOrderCount > 0 },
          ].map(({ label, value, sub, alert }) => (
            <div key={label} className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-4 shadow-[0_2px_12px_rgba(100,80,40,0.06)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/45">{label}</p>
              <p className={["mt-1.5 text-3xl font-light", alert ? "text-rose-500" : "text-slate-900 dark:text-white"].join(" ")}>{value}</p>
              <p className="mt-0.5 text-[11px] text-[rgba(100,80,40,0.45)] dark:text-white/35">{sub}</p>
            </div>
          ))}
        </div>

        {/* Hotels list */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <div className="flex items-center justify-between border-b border-[rgba(100,80,40,0.08)] px-6 py-4 dark:border-white/6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.55)] dark:text-white/45">Your Hotels</p>
            <Link href="/commercial/hotels" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(100,80,40,0.55)] transition-opacity hover:opacity-80 dark:text-white/40">
              Manage →
            </Link>
          </div>

          {hotels.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-800 dark:text-white/70">No hotels yet</p>
              <p className="mt-1 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">Add your first hotel to get started.</p>
              <Link href="/commercial/hotels" className="mt-4 inline-flex h-9 items-center rounded-xl border border-[rgba(100,80,40,0.20)] bg-[rgba(100,80,40,0.05)] px-4 text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(100,80,40,0.70)] transition-all hover:bg-[rgba(100,80,40,0.10)] dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                Add Hotel
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
              {hotels.map((hotel) => (
                <Link key={hotel.slug} href={`/commercial/hotels/${hotel.slug}`} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[rgba(100,80,40,0.03)] dark:hover:bg-white/[0.025]">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white/85">{hotel.name}</p>
                    {(hotel.city || hotel.address) && (
                      <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">{hotel.city || hotel.address}</p>
                    )}
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[rgba(100,80,40,0.35)] dark:text-white/25" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick logout */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/commercial/logout", { method: "POST" });
              window.location.href = "/commercial/login";
            }}
            className="text-[11px] uppercase tracking-[0.18em] text-[rgba(100,80,40,0.40)] transition-opacity hover:opacity-70 dark:text-white/30"
          >
            Sign out
          </button>
        </div>
      </div>

      <CommercialBottomNav />
    </div>
  );
}
