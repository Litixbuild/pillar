"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import type { AmenityWindow } from "@/lib/types";

export const dynamic = "force-dynamic";

const WORK_ORDER_CATEGORIES = [
  "Housekeeping",
  "Maintenance",
  "Room Service",
  "Extra Towels / Amenities",
  "Temperature / Climate",
  "Noise Complaint",
  "Internet / TV",
  "Security",
  "Other",
];

interface RoomLookupResult {
  found: boolean;
  roomTypeName: string | null;
  hotelName: string;
  accentColor?: string;
  headingColor?: string;
  textColor?: string;
  windows: AmenityWindow[];
}

interface CheckoutStatus {
  status: "pending" | "approved" | "denied";
  expiresAt: string;
}

function WindowCard({ w, accent }: { w: AmenityWindow; accent: string }) {
  const [expanded, setExpanded] = useState(false);

  if (w.type === "text") {
    return (
      <div className="rounded-2xl border border-black/8 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
        <p className="text-sm font-semibold text-slate-900" style={{ color: "#1a1a1a" }}>{w.title}</p>
        {w.body && <p className="mt-2 text-sm leading-relaxed text-slate-700">{w.body}</p>}
      </div>
    );
  }

  if (w.type === "video" && w.url) {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white/90 shadow-sm">
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{w.title}</p>
        </div>
        <div className="aspect-video w-full">
          <iframe src={w.url} className="h-full w-full" allowFullScreen title={w.title} />
        </div>
      </div>
    );
  }

  if (w.type === "image" && w.url) {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white/90 shadow-sm">
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">{w.title}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={w.url} alt={w.title} className="w-full object-cover" />
      </div>
    );
  }

  if (w.type === "pdf" && w.url) {
    return (
      <div className="rounded-2xl border border-black/8 bg-white/90 shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex w-full items-center justify-between px-5 py-4"
          style={{ color: accent }}
        >
          <span className="text-sm font-semibold text-slate-900">{w.title}</span>
          <span className="text-xs font-semibold">{expanded ? "Hide" : "View PDF"}</span>
        </button>
        {expanded && (
          <div className="border-t border-black/6">
            <iframe src={w.url} className="h-[400px] w-full" title={w.title} />
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function HotelGuestPortal() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;

  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [roomInput,  setRoomInput]  = useState("");
  const [lookupResult, setLookupResult] = useState<RoomLookupResult | null>(null);
  const [lookupError,  setLookupError]  = useState<string | null>(null);
  const [looking,      setLooking]      = useState(false);
  const [activeTab,    setActiveTab]    = useState<"amenities" | "request" | "checkout">("amenities");
  // Work order form
  const [woCategory,  setWoCategory]  = useState(WORK_ORDER_CATEGORIES[0]);
  const [woDesc,      setWoDesc]      = useState("");
  const [woSending,   setWoSending]   = useState(false);
  const [woSent,      setWoSent]      = useState(false);
  const [woError,     setWoError]     = useState<string | null>(null);
  // Late checkout
  const [coSending,   setCoSending]   = useState(false);
  const [coStatus,    setCoStatus]    = useState<CheckoutStatus | null>(null);
  const [coError,     setCoError]     = useState<string | null>(null);
  const [coRequested, setCoRequested] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore room from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(`pillar_hotel_room_${slug}`);
    if (saved) {
      setRoomNumber(saved);
      void doLookup(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Check late checkout status when room is known
  useEffect(() => {
    if (!roomNumber) return;
    fetch(`/api/hotel-guest/late-checkout/status?hotelSlug=${encodeURIComponent(slug)}&roomNumber=${encodeURIComponent(roomNumber)}`)
      .then((r) => r.json())
      .then((d: { checkout?: CheckoutStatus }) => { if (d.checkout) setCoStatus(d.checkout); })
      .catch(console.error);
  }, [slug, roomNumber]);

  async function doLookup(room: string) {
    setLooking(true); setLookupError(null);
    const res  = await fetch("/api/hotel-guest/room-lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hotelSlug: slug, roomNumber: room }),
    });
    const data = (await res.json()) as RoomLookupResult & { error?: string };
    if (!res.ok || data.error) {
      setLookupError(data.error ?? "Couldn't find this hotel. Please check the URL and try again.");
      setLooking(false);
      return;
    }
    setLookupResult(data);
    setLooking(false);
  }

  function handleRoomSubmit() {
    const r = roomInput.trim();
    if (!r) return;
    sessionStorage.setItem(`pillar_hotel_room_${slug}`, r);
    setRoomNumber(r);
    void doLookup(r);
  }

  async function submitWorkOrder() {
    if (!roomNumber) return;
    setWoSending(true); setWoError(null); setWoSent(false);
    const res = await fetch("/api/hotel-guest/work-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hotelSlug: slug, roomNumber, categoryName: woCategory, description: woDesc.trim() || null }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) { setWoError(data.error ?? "Failed to submit. Please try again."); setWoSending(false); return; }
    setWoSent(true); setWoSending(false); setWoDesc("");
    setTimeout(() => setWoSent(false), 4000);
  }

  async function requestLateCheckout() {
    if (!roomNumber) return;
    setCoSending(true); setCoError(null);
    const res = await fetch("/api/hotel-guest/late-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hotelSlug: slug, roomNumber }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) { setCoError(data.error ?? "Failed to submit."); setCoSending(false); return; }
    setCoRequested(true); setCoSending(false);
    // Refresh status
    setTimeout(async () => {
      const r = await fetch(`/api/hotel-guest/late-checkout/status?hotelSlug=${encodeURIComponent(slug)}&roomNumber=${encodeURIComponent(roomNumber)}`);
      const d = (await r.json()) as { checkout?: CheckoutStatus };
      if (d.checkout) setCoStatus(d.checkout);
    }, 1000);
  }

  const accent = lookupResult?.accentColor || "#3d2a0a";
  const textColor = lookupResult?.textColor || "#334155";

  // ── Room number entry screen ────────────────────────────────
  if (!roomNumber || (!lookupResult && !looking)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5EDD5] px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black/10">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#3d2a0a]" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V21H15v-5h-6v5H3V9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3d2a0a]">Welcome</h1>
          <p className="mt-2 text-sm text-[#3d2a0a]/65">Enter your room number to access hotel services, amenity information, and request assistance.</p>
          <div className="mt-8 space-y-3">
            <input
              ref={inputRef}
              autoFocus
              type="number"
              inputMode="numeric"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRoomSubmit(); }}
              placeholder="Room number"
              className="h-14 w-full rounded-2xl border border-[#3d2a0a]/16 bg-white/80 px-5 text-center text-2xl font-bold tracking-widest text-[#3d2a0a] outline-none focus:border-[#3d2a0a]/40"
            />
            {lookupError && <p className="text-sm text-rose-600">{lookupError}</p>}
            <button
              type="button"
              onClick={handleRoomSubmit}
              disabled={!roomInput.trim() || looking}
              className="h-13 w-full rounded-2xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: accent, height: "3.25rem" }}
            >
              {looking ? "Looking up room…" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (looking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EDD5]">
        <p className="text-sm text-[#3d2a0a]/60">Loading your room info…</p>
      </div>
    );
  }

  // ── Main portal ─────────────────────────────────────────────
  const hotel = lookupResult;

  return (
    <div className="min-h-screen bg-[#F5EDD5]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/8 bg-[#F5EDD5]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3d2a0a]/50">Room {roomNumber}</p>
            <p className="text-base font-bold text-[#3d2a0a]">{hotel?.hotelName ?? slug}</p>
          </div>
          <button
            type="button"
            onClick={() => { sessionStorage.removeItem(`pillar_hotel_room_${slug}`); setRoomNumber(null); setLookupResult(null); setRoomInput(""); }}
            className="rounded-xl border border-black/10 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-[#3d2a0a]/55 transition hover:bg-white/80"
          >
            Change Room
          </button>
        </div>
      </header>

      {/* Room type banner */}
      {hotel?.found && hotel.roomTypeName && (
        <div className="mx-auto max-w-lg px-5 pt-4">
          <div className="rounded-xl px-4 py-2.5" style={{ background: `${accent}18` }}>
            <p className="text-xs font-semibold" style={{ color: accent }}>{hotel.roomTypeName}</p>
          </div>
        </div>
      )}

      {/* Tab strip */}
      <div className="sticky top-[65px] z-10 mx-auto max-w-lg px-5 pt-4">
        <div className="flex gap-1.5 rounded-2xl border border-black/8 bg-white/80 p-1.5 shadow-sm backdrop-blur">
          {(["amenities", "request", "checkout"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className="h-9 flex-1 rounded-xl text-xs font-semibold capitalize transition-all"
              style={activeTab === t ? { background: accent, color: "#fff" } : { color: `${textColor}99` }}
            >
              {t === "amenities" ? "Amenities" : t === "request" ? "Request Help" : "Late Checkout"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-5 pb-16 pt-5 space-y-4">
        {/* ── Amenities ── */}
        {activeTab === "amenities" && (
          <>
            {(hotel?.windows ?? []).length === 0 ? (
              <div className="rounded-2xl border border-black/8 bg-white/90 px-5 py-10 text-center shadow-sm">
                <p className="text-sm text-slate-500">Amenity information is being set up. Check back soon.</p>
              </div>
            ) : (
              (hotel?.windows ?? []).map((w) => <WindowCard key={w.id} w={w} accent={accent} />)
            )}
          </>
        )}

        {/* ── Request Help ── */}
        {activeTab === "request" && (
          <div className="rounded-2xl border border-black/8 bg-white/90 shadow-sm">
            <div className="px-5 py-5">
              <h2 className="text-base font-bold text-slate-900">Submit a Request</h2>
              <p className="mt-1 text-sm text-slate-500">We'll send your request to hotel staff right away.</p>
            </div>
            <div className="space-y-4 border-t border-black/6 px-5 py-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Category</label>
                <select value={woCategory} onChange={(e) => setWoCategory(e.target.value)} className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-slate-900 outline-none">
                  {WORK_ORDER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Details (optional)</label>
                <textarea rows={4} value={woDesc} onChange={(e) => setWoDesc(e.target.value)} placeholder="Describe the issue or what you need…" className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none" />
              </div>
              {woError && <p className="text-sm text-rose-600">{woError}</p>}
              {woSent && <p className="text-sm font-semibold text-emerald-600">Request submitted! Staff will be with you shortly.</p>}
              <button
                type="button"
                onClick={submitWorkOrder}
                disabled={woSending}
                className="h-12 w-full rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                style={{ background: accent }}
              >
                {woSending ? "Submitting…" : "Submit Request"}
              </button>
              <p className="text-center text-[11px] text-slate-400">Room {roomNumber} · {hotel?.hotelName}</p>
            </div>
          </div>
        )}

        {/* ── Late Checkout ── */}
        {activeTab === "checkout" && (
          <div className="rounded-2xl border border-black/8 bg-white/90 shadow-sm">
            <div className="px-5 py-5">
              <h2 className="text-base font-bold text-slate-900">Late Checkout</h2>
              <p className="mt-1 text-sm text-slate-500">Request extra time before checking out. Hotel staff will approve or deny your request.</p>
            </div>
            <div className="border-t border-black/6 px-5 py-5 space-y-4">
              {coStatus ? (
                <div className={`rounded-xl px-4 py-3.5 ${coStatus.status === "approved" ? "bg-emerald-50 border border-emerald-200" : coStatus.status === "denied" ? "bg-rose-50/80 border border-rose-200/60" : "bg-amber-50 border border-amber-200"}`}>
                  <p className={`text-sm font-bold ${coStatus.status === "approved" ? "text-emerald-700" : coStatus.status === "denied" ? "text-rose-600" : "text-amber-700"}`}>
                    {coStatus.status === "approved" ? "Late checkout approved!" : coStatus.status === "denied" ? "Late checkout request denied." : "Request pending — awaiting staff approval."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Expires {new Date(coStatus.expiresAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
              ) : coRequested ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                  <p className="text-sm font-bold text-amber-700">Request submitted!</p>
                  <p className="mt-1 text-xs text-slate-500">Staff will review your request. Check back here for updates.</p>
                </div>
              ) : (
                <>
                  {coError && <p className="text-sm text-rose-600">{coError}</p>}
                  <button
                    type="button"
                    onClick={requestLateCheckout}
                    disabled={coSending}
                    className="h-12 w-full rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                    style={{ background: accent }}
                  >
                    {coSending ? "Submitting…" : "Request Late Checkout"}
                  </button>
                  <p className="text-center text-[11px] text-slate-400">Room {roomNumber} · {hotel?.hotelName}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 text-center">
        <p className="text-[10px] text-[#3d2a0a]/25">Powered by Pillar</p>
      </div>
    </div>
  );
}
