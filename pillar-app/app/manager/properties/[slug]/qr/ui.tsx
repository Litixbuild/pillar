'use client';

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
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      {/* Screen-only top bar */}
      <div className="print:hidden flex items-center justify-between border-b border-black/10 bg-[#F5F3EE] px-5 py-3">
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

      {/* Printable content — centered on A4/letter */}
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-8 py-16 print:min-h-screen print:py-12">

        {/* Brand mark */}
        <p
          className="mb-10 text-xs font-bold uppercase tracking-[0.4em] text-[#D4AF6A]"
          style={{ letterSpacing: '0.4em' }}
        >
          Pillar
        </p>

        {/* QR code */}
        <div className="rounded-3xl border-2 border-[#D4AF6A]/60 p-6 shadow-sm">
          <QRCodeSVG
            value={publicUrl}
            size={260}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="H"
          />
        </div>

        {/* Property info */}
        <h1 className="mt-8 text-center text-2xl font-bold tracking-tight text-[#1a1a1a]">
          {propertyName}
        </h1>
        {propertyAddress ? (
          <p className="mt-1.5 text-center text-sm text-black/45">{propertyAddress}</p>
        ) : null}

        {/* Divider */}
        <div className="my-7 h-px w-24 bg-[#D4AF6A]/40" />

        {/* Instructions */}
        <p className="max-w-[260px] text-center text-sm leading-relaxed text-black/55">
          Scan to access WiFi, house rules, and property information.
        </p>

      </div>

      {/* Print-only page styles */}
      <style>{`
        @media print {
          @page { margin: 0.75in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
