"use client";

import { useState } from "react";
import Link from "next/link";
import type { HotelProperty } from "@/lib/hotelProperties";
import CommercialBottomNav from "../CommercialBottomNav";

function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }

export default function HotelsClient({ hotels: initial }: { hotels: HotelProperty[] }) {
  const [hotels, setHotels]         = useState(initial);
  const [showModal, setShowModal]   = useState(false);
  const [newName, setNewName]       = useState("");
  const [creating, setCreating]     = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim() || creating) return;
    setCreating(true); setCreateError(null);
    const res = await fetch("/api/commercial/hotels", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = (await res.json().catch(() => ({}))) as { hotel?: HotelProperty; error?: string };
    if (!res.ok) { setCreateError(data.error ?? "Failed to create hotel."); setCreating(false); return; }
    if (data.hotel) setHotels((prev) => [...prev, data.hotel!]);
    setShowModal(false); setNewName(""); setCreating(false);
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">Commercial</p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">Hotels</h1>
          </div>
          <button
            type="button"
            onClick={() => { setShowModal(true); setNewName(""); setCreateError(null); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[rgba(100,80,40,0.22)] bg-[rgba(100,80,40,0.06)] px-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(100,80,40,0.75)] transition-all hover:bg-[rgba(100,80,40,0.12)] dark:border-white/12 dark:bg-white/6 dark:text-white/65"
          >
            <PlusIcon /> Add Hotel
          </button>
        </div>

        {hotels.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-16 text-center shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
            <p className="text-sm font-medium text-slate-800 dark:text-white/70">No hotels yet</p>
            <p className="mt-1 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">Add your first hotel to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hotels.map((hotel) => (
              <Link
                key={hotel.slug}
                href={`/commercial/hotels/${hotel.slug}`}
                className="flex items-center justify-between overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-5 shadow-[0_2px_12px_rgba(100,80,40,0.06)] backdrop-blur-xl transition-all hover:shadow-[0_4px_20px_rgba(100,80,40,0.10)] dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white/85">{hotel.name}</p>
                  {(hotel.city || hotel.address) && (
                    <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">{[hotel.city, hotel.state].filter(Boolean).join(", ") || hotel.address}</p>
                  )}
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-[rgba(100,80,40,0.35)] dark:text-white/25" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CommercialBottomNav />

      {/* Add Hotel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(0,0,0,0.55)" }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-[#111]">
            <div className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">Add Hotel</h2>
              <p className="mt-1 text-sm text-black/50 dark:text-white/45">Enter the hotel name to create a new property.</p>
              <div className="mt-5 space-y-1.5">
                <label htmlFor="hotel-name" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/45 dark:text-white/40">Hotel Name</label>
                <input
                  id="hotel-name"
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
                  placeholder="Grand Pillar Hotel"
                  className="h-11 w-full rounded-xl border border-black/12 bg-black/3 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-black/25 focus:border-[rgba(100,80,40,0.40)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25"
                />
              </div>
              {createError && <p className="mt-2 text-xs text-rose-500">{createError}</p>}
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={handleCreate} disabled={!newName.trim() || creating} className="h-10 flex-1 rounded-xl bg-[#111] text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40 dark:bg-[#F5EDD5] dark:text-[#3d2a0a]">
                  {creating ? "Creating…" : "Create Hotel"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="h-10 rounded-xl border border-black/10 bg-black/4 px-4 text-sm font-semibold text-black/50 transition hover:bg-black/8 dark:border-white/10 dark:bg-white/5 dark:text-white/45">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
