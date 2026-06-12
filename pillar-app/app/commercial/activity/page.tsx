"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CommercialBottomNav from "../CommercialBottomNav";
import type { HotelWorkOrder } from "@/lib/hotelWorkOrders";
import type { HotelLateCheckout } from "@/lib/hotelLateCheckouts";

export const dynamic = "force-dynamic";

type WorkOrderWithHotel  = HotelWorkOrder  & { hotelName: string };
type CheckoutWithHotel   = HotelLateCheckout & { hotelName: string };

type Tab = "open" | "checkout" | "history";

export default function CrossHotelActivityPage() {
  const [tab, setTab] = useState<Tab>("open");
  const [workOrders,    setWorkOrders]    = useState<WorkOrderWithHotel[]>([]);
  const [pendingCOs,    setPendingCOs]    = useState<CheckoutWithHotel[]>([]);
  const [actionedCOs,   setActionedCOs]   = useState<CheckoutWithHotel[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [resolveNote,   setResolveNote]   = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/commercial/activity");
      const data = (await res.json()) as { workOrders?: WorkOrderWithHotel[]; pendingCheckouts?: CheckoutWithHotel[]; actionedCheckouts?: CheckoutWithHotel[] };
      setWorkOrders(data.workOrders ?? []);
      setPendingCOs(data.pendingCheckouts ?? []);
      setActionedCOs(data.actionedCheckouts ?? []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function resolveOrder(wo: WorkOrderWithHotel) {
    await fetch(`/api/commercial/hotels/${wo.hotelSlug}/work-orders/${wo.id}/resolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note: resolveNote[wo.id] ?? "" }),
    });
    void load();
  }

  async function actionCO(co: CheckoutWithHotel, action: "approved" | "denied") {
    await fetch(`/api/commercial/hotels/${co.hotelSlug}/late-checkout/${co.id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    void load();
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  const openOrders     = workOrders.filter((o) => o.status === "open");
  const resolvedOrders = workOrders.filter((o) => o.status === "resolved");

  const tabCls = (t: Tab) =>
    `h-8 flex-1 rounded-lg text-xs font-semibold transition-all ${tab === t ? "bg-[#111] text-white dark:bg-[#F5EDD5] dark:text-[#3d2a0a]" : "text-[rgba(100,80,40,0.55)] hover:text-[rgba(100,80,40,0.80)] dark:text-white/40"}`;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 space-y-5">
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">All Hotels</p>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">Activity</h1>
        </div>

        <div className="flex gap-1.5 rounded-xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-1.5 shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <button className={tabCls("open")} onClick={() => setTab("open")}>
            Open {openOrders.length > 0 && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white">{openOrders.length}</span>}
          </button>
          <button className={tabCls("checkout")} onClick={() => setTab("checkout")}>
            Checkout {pendingCOs.length > 0 && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white">{pendingCOs.length}</span>}
          </button>
          <button className={tabCls("history")} onClick={() => setTab("history")}>History</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><p className="text-sm text-[rgba(100,80,40,0.45)] dark:text-white/35">Loading…</p></div>
        ) : (
          <>
            {tab === "open" && (
              <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
                {openOrders.length === 0 ? (
                  <div className="px-6 py-12 text-center"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">All clear across all hotels</p></div>
                ) : (
                  <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
                    {openOrders.map((wo) => (
                      <div key={wo.id} className="px-6 py-5 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/commercial/hotels/${wo.hotelSlug}/activity`} className="text-[11px] font-semibold text-[rgba(100,80,40,0.65)] underline-offset-2 hover:underline dark:text-white/50">{wo.hotelName}</Link>
                            <span className="inline-flex h-6 items-center rounded-md bg-[rgba(100,80,40,0.08)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">Room {wo.roomNumber}</span>
                            <span className="text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">{wo.categoryName}</span>
                          </div>
                          {wo.description && <p className="mt-1.5 text-sm text-slate-800 dark:text-white/80">{wo.description}</p>}
                          {wo.otherMessage && <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.50)] dark:text-white/40">{wo.otherMessage}</p>}
                          <p className="mt-1 text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">{fmt(wo.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <input value={resolveNote[wo.id] ?? ""} onChange={(e) => setResolveNote((p) => ({ ...p, [wo.id]: e.target.value }))} placeholder="Resolution note (optional)" className="h-8 flex-1 rounded-lg border border-[rgba(100,80,40,0.14)] bg-[rgba(100,80,40,0.03)] px-3 text-xs outline-none dark:border-white/8 dark:bg-white/4 dark:text-white dark:placeholder:text-white/25" />
                          <button type="button" onClick={() => void resolveOrder(wo)} className="h-8 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white hover:bg-emerald-600">Resolve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "checkout" && (
              <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
                {pendingCOs.length === 0 ? (
                  <div className="px-6 py-12 text-center"><p className="text-sm text-[rgba(100,80,40,0.45)] dark:text-white/35">No pending late checkout requests.</p></div>
                ) : (
                  <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
                    {pendingCOs.map((lc) => (
                      <div key={lc.id} className="px-6 py-5 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/commercial/hotels/${lc.hotelSlug}/activity`} className="text-[11px] font-semibold text-[rgba(100,80,40,0.65)] underline-offset-2 hover:underline dark:text-white/50">{lc.hotelName}</Link>
                            <span className="inline-flex h-6 items-center rounded-md bg-amber-100/80 px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">Room {lc.roomNumber}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">Requested {fmt(lc.submittedAt)} · Expires {fmt(lc.expiresAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => void actionCO(lc, "approved")} className="h-8 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white hover:bg-emerald-600">Approve</button>
                          <button type="button" onClick={() => void actionCO(lc, "denied")} className="h-8 rounded-lg border border-rose-200/60 bg-rose-50/80 px-3 text-[11px] font-semibold text-rose-500 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/8 dark:text-rose-400">Deny</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-3">
                {resolvedOrders.length === 0 && actionedCOs.length === 0 ? (
                  <div className="rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-12 text-center shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
                    <p className="text-sm text-[rgba(100,80,40,0.45)] dark:text-white/35">No history yet.</p>
                  </div>
                ) : (
                  <>
                    {resolvedOrders.length > 0 && (
                      <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
                        <div className="border-b border-[rgba(100,80,40,0.08)] px-6 py-3 dark:border-white/5"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/40">Resolved Work Orders</p></div>
                        <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
                          {resolvedOrders.map((wo) => (
                            <div key={wo.id} className="px-6 py-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-semibold text-[rgba(100,80,40,0.60)] dark:text-white/45">{wo.hotelName}</span>
                                <span className="text-[11px] text-[rgba(100,80,40,0.45)] dark:text-white/35">Room {wo.roomNumber} · {wo.categoryName}</span>
                              </div>
                              {wo.description && <p className="mt-1 text-xs text-slate-700 dark:text-white/65">{wo.description}</p>}
                              <p className="mt-0.5 text-[10px] text-[rgba(100,80,40,0.35)] dark:text-white/25">{fmt(wo.createdAt)}{wo.resolvedAt ? ` → ${fmt(wo.resolvedAt)}` : ""}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {actionedCOs.length > 0 && (
                      <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
                        <div className="border-b border-[rgba(100,80,40,0.08)] px-6 py-3 dark:border-white/5"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/40">Late Checkout History</p></div>
                        <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
                          {actionedCOs.map((lc) => (
                            <div key={lc.id} className="px-6 py-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex h-5 items-center rounded px-2 text-[10px] font-semibold ${lc.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50/80 text-rose-500 dark:bg-rose-500/8 dark:text-rose-400"}`}>{lc.status}</span>
                                <span className="text-[11px] font-semibold text-[rgba(100,80,40,0.60)] dark:text-white/45">{lc.hotelName}</span>
                                <span className="text-[11px] text-[rgba(100,80,40,0.45)] dark:text-white/35">Room {lc.roomNumber}</span>
                              </div>
                              <p className="mt-0.5 text-[10px] text-[rgba(100,80,40,0.35)] dark:text-white/25">{fmt(lc.submittedAt)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <CommercialBottomNav />
    </div>
  );
}
