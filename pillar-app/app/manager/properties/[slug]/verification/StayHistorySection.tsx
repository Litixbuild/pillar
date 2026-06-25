'use client';

import { useState } from 'react';
import type { PropertyStay } from '@/lib/stays';
import type { StayReport } from '@/lib/stayReports';

export interface StayHistoryEntry {
  stay: PropertyStay;
  consentCount: number;
  cleaningPhotoCount: number;
  damagePhotoCount: number;
  report: StayReport | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Pill({ label, count, alert }: { label: string; count: number; alert?: boolean }) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
        alert && count > 0
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          : 'bg-[rgba(100,80,40,0.06)] text-[rgba(100,80,40,0.60)] dark:bg-white/7 dark:text-white/50'
      }`}
    >
      {label} {count}
    </span>
  );
}

function HistoryRow({ entry }: { entry: StayHistoryEntry }) {
  const { stay, consentCount, cleaningPhotoCount, damagePhotoCount, report } = entry;
  return (
    <div className="border-b border-[rgba(100,80,40,0.07)] px-5 py-3 last:border-b-0 dark:border-white/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[#1e293b] dark:text-white/75">
          {formatDate(stay.started_at)}{stay.ended_at ? ` – ${formatDate(stay.ended_at)}` : ''}
        </p>
        {report ? (
          <a
            href={report.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none text-[11px] font-semibold text-[#7a5c08] underline decoration-[#D4AF37]/40 underline-offset-2 hover:decoration-[#D4AF37] dark:text-[#D4AF37]"
          >
            Download report
          </a>
        ) : (
          <span className="flex-none text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/25">No report generated</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Pill label="Consent" count={consentCount} />
        <Pill label="Cleaning photos" count={cleaningPhotoCount} />
        <Pill label="Damage photos" count={damagePhotoCount} alert />
      </div>
    </div>
  );
}

export default function StayHistorySection({ entries }: { entries: StayHistoryEntry[] }) {
  const [open, setOpen] = useState(false);
  const hasEntries = entries.length > 0;

  return (
    <div className="border-b border-[rgba(100,80,40,0.07)] last:border-b-0 dark:border-white/5">
      <button
        type="button"
        onClick={() => hasEntries && setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[rgba(100,80,40,0.025)] dark:hover:bg-white/2"
      >
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[rgba(100,80,40,0.08)] text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">
          <ClockIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#1e293b] dark:text-white/80">Stay History</p>
          <p className="mt-0.5 text-[11px] text-[rgba(100,80,40,0.55)] dark:text-white/40">
            {hasEntries ? `${entries.length} past ${entries.length === 1 ? 'stay' : 'stays'}` : 'No past stays yet'}
          </p>
        </div>
        {hasEntries && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`h-4 w-4 flex-none text-[rgba(100,80,40,0.35)] transition-transform duration-200 dark:text-white/25 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && hasEntries && (
        <div className="border-t border-[rgba(100,80,40,0.09)] dark:border-white/7">
          {entries.map((entry) => (
            <HistoryRow key={entry.stay.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
