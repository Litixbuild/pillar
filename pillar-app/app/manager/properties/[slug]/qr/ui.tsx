'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRPrintClient({
  propertyName,
  propertyAddress,
  publicUrl,
  slug,
}: {
  propertyName: string;
  propertyAddress: string;
  publicUrl: string;
  slug: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = confirmText === 'Generate';

  async function handleRegenerate() {
    if (!confirmed || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/regenerate`, {
      method: 'POST',
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || 'Failed to regenerate. Please try again.');
      setIsGenerating(false);
      return;
    }

    const { slug: newSlug } = (await res.json()) as { slug: string };
    window.location.href = `/manager/properties/${encodeURIComponent(newSlug)}/qr`;
  }

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      {/* Screen-only top bar */}
      <div className="print:hidden flex items-center justify-between border-b border-black/10 bg-[#F5F3EE] px-5 py-3">
        <div className="flex items-center gap-2">
          <a
            href="/manager"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#7A5A1E] hover:underline decoration-[#D4AF6A]/50"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </a>
          <button
            type="button"
            onClick={() => { setShowModal(true); setConfirmText(''); setError(null); }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#D4AF6A]/40 bg-[#D4AF6A]/10 px-4 text-sm font-semibold text-[#7A5A1E] transition hover:bg-[#D4AF6A]/20"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Regenerate QR
          </button>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#2C2C2C] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Print
        </button>
      </div>

      {/* Printable content */}
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-8 py-16 print:min-h-screen print:py-12">

        {/* Brand mark */}
        <p className="mb-10 text-[10px] font-semibold uppercase tracking-[0.5em] text-[#D4AF6A]">
          Pillar
        </p>

        {/* Hook — sets intent before the QR */}
        <p className="mb-2 text-center font-serif text-[1.6rem] leading-snug tracking-[-0.01em] text-[#1a1a1a]">
          Everything you need<br />to enjoy your stay.
        </p>
        <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-black/35">
          WiFi · house guide · local tips
        </p>

        {/* QR code */}
        <div className="rounded-3xl border border-[#D4AF6A]/55 p-7 shadow-[0_2px_24px_rgba(0,0,0,0.07)]">
          <QRCodeSVG
            value={publicUrl}
            size={240}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="H"
          />
        </div>

        {/* Scan CTA */}
        <div className="mt-6 flex items-center gap-2.5">
          <div className="h-px w-10 bg-[#D4AF6A]/40" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#B8945A]">
            Scan with your camera
          </p>
          <div className="h-px w-10 bg-[#D4AF6A]/40" />
        </div>

        {/* Property name + address */}
        <h1 className="mt-8 text-center font-serif text-xl tracking-tight text-[#1a1a1a]/80">
          {propertyName}
        </h1>
        {propertyAddress ? (
          <p className="mt-1 text-center text-xs tracking-wide text-black/35">{propertyAddress}</p>
        ) : null}

      </div>

      {/* Print-only page styles */}
      <style>{`
        @media print {
          @page { margin: 0.75in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Regenerate confirmation modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">

            {/* Warning stripe */}
            <div className="h-1 w-full bg-amber-400" />

            <div className="p-6">
              <h2 className="text-base font-bold tracking-tight text-[#1a1a1a]">Regenerate QR Code?</h2>
              <p className="mt-2 text-sm leading-relaxed text-black/55">
                This creates a new unique link for this property. <span className="font-semibold text-black/75">Any previously printed QR codes will stop working</span> and will need to be reprinted.
              </p>

              <div className="mt-5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">
                  Type <span className="text-amber-600">Generate</span> to confirm
                </p>
                <input
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleRegenerate(); }}
                  placeholder="Generate"
                  className="h-11 w-full rounded-xl border border-black/12 bg-black/3 px-4 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-black/20 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {error ? (
                <p className="mt-3 text-xs text-red-500">{error}</p>
              ) : null}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRegenerate()}
                  disabled={!confirmed || isGenerating}
                  className="h-10 flex-1 rounded-xl bg-amber-400 text-sm font-bold text-[#1a1a1a] shadow-sm transition hover:bg-amber-500 disabled:opacity-40"
                >
                  {isGenerating ? 'Generating…' : 'Generate New QR Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 rounded-xl border border-black/10 bg-black/4 px-4 text-sm font-semibold text-black/50 transition hover:bg-black/8"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
