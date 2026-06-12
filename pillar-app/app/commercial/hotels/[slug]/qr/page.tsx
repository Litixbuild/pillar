"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommercialBottomNav from "../../../CommercialBottomNav";

export default function HotelQrPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;
  const [hotelName, setHotelName] = useState("");
  const [guestUrl, setGuestUrl]   = useState("");
  const [qrSrc, setQrSrc]         = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = window.location.origin;
    const url  = `${base}/h/${slug}`;
    setGuestUrl(url);
    fetch(`/api/commercial/hotels/${slug}`)
      .then((r) => r.json())
      .then((d: { hotel?: { name: string } }) => { setHotelName(d.hotel?.name ?? ""); })
      .catch(console.error);
    setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`);
  }, [slug]);

  function handlePrint() {
    const content = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>QR Code — ${hotelName}</title><style>
      body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;background:#fff;}
      .wrap{text-align:center;padding:40px;}
      img{width:320px;height:320px;display:block;margin:0 auto 24px;}
      h2{font-size:24px;font-weight:700;margin:0 0 8px;color:#111;}
      p{font-size:13px;color:#666;margin:0;}
      .url{margin-top:12px;font-size:11px;font-family:monospace;color:#888;word-break:break-all;}
    </style></head><body><div class="wrap">${content}</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  async function handleDownload() {
    if (!qrSrc) return;
    const res   = await fetch(qrSrc);
    const blob  = await res.blob();
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href      = url;
    a.download  = `${slug}-qr-code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 space-y-6">
        <div>
          <Link href={`/commercial/hotels/${slug}`} className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(100,80,40,0.55)] transition-colors hover:text-[rgba(100,80,40,0.80)] dark:text-white/40 dark:hover:text-white/65">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {hotelName}
          </Link>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">QR Code</h1>
          <p className="mt-1 text-sm text-[rgba(100,80,40,0.50)] dark:text-white/40">One universal code for every room — guests type their room number on the portal.</p>
        </div>

        {/* QR card */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <div className="flex justify-center px-8 py-10">
            <div ref={printRef} className="text-center">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="Guest portal QR code" width={280} height={280} className="mx-auto rounded-xl" />
              ) : (
                <div className="flex h-[280px] w-[280px] items-center justify-center rounded-xl bg-[rgba(100,80,40,0.06)]">
                  <p className="text-sm text-[rgba(100,80,40,0.40)] dark:text-white/35">Generating…</p>
                </div>
              )}
              <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{hotelName}</h2>
              <p className="mt-1 text-sm text-[rgba(100,80,40,0.55)] dark:text-white/45">Scan to access hotel services</p>
              {guestUrl && <p className="url mt-3 break-all font-mono text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">{guestUrl}</p>}
            </div>
          </div>

          <div className="border-t border-[rgba(100,80,40,0.08)] px-8 py-5 dark:border-white/5">
            <div className="flex gap-3">
              <button type="button" onClick={handlePrint} className="h-10 flex-1 rounded-xl bg-[#111] text-sm font-semibold text-white transition hover:bg-black dark:bg-[#F5EDD5] dark:text-[#3d2a0a]">
                Print QR Code
              </button>
              <button type="button" onClick={handleDownload} className="h-10 flex-1 rounded-xl border border-[rgba(100,80,40,0.22)] bg-[rgba(100,80,40,0.05)] text-sm font-semibold text-[rgba(100,80,40,0.70)] transition hover:bg-[rgba(100,80,40,0.10)] dark:border-white/12 dark:bg-white/5 dark:text-white/60">
                Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* Tip card */}
        <div className="rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-5 shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/40">How It Works</p>
          <ul className="mt-3 space-y-2 text-sm text-[rgba(100,80,40,0.65)] dark:text-white/50">
            <li className="flex gap-2"><span className="shrink-0 font-bold">1.</span> Print this single QR code and place it in every room.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">2.</span> Guests scan it and enter their room number.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">3.</span> The portal loads the correct amenities for their room type.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold">4.</span> Work orders and late checkouts auto-include the room number.</li>
          </ul>
        </div>
      </div>

      <CommercialBottomNav />
    </div>
  );
}
