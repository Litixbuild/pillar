'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PropertyStay } from '@/lib/stays';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 11l9-7 9 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CurrentStayCard({
  slug,
  activeStay,
}: {
  slug: string;
  activeStay: PropertyStay | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/stays`, {
      method: 'POST',
    });
    if (res.ok) {
      setConfirming(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? 'Failed. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <div
      data-tour="verification-current-stay"
      className="mb-3 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]"
    >
      <div className="flex items-center justify-between border-b border-[rgba(100,80,40,0.09)] px-5 py-2.5 dark:border-white/7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
          Current Stay
        </p>
        {activeStay && (
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
            Active
          </span>
        )}
      </div>

      <div className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[rgba(100,80,40,0.08)] text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">
            <HomeIcon />
          </span>
          <div className="min-w-0 flex-1">
            {activeStay ? (
              <>
                <p className="text-sm font-medium text-[#1e293b] dark:text-white/80">Tenant in residence</p>
                <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.55)] dark:text-white/40">
                  Active since {formatDate(activeStay.started_at)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#1e293b] dark:text-white/80">No active stay</p>
                <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.55)] dark:text-white/40">
                  Confirm when a new tenant arrives to start tracking this stay.
                </p>
              </>
            )}
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
          >
            Confirm New Tenant Arrived
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-[rgba(100,80,40,0.65)] dark:text-white/45">
              {activeStay
                ? 'This closes out the current stay and starts a new one. Continue?'
                : 'This starts tracking a new tenant stay for this property. Continue?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="h-9 flex-1 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
              >
                {submitting ? 'Confirming…' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => { setConfirming(false); setError(null); }}
                disabled={submitting}
                className="h-9 rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] px-3 text-xs font-semibold text-[rgba(100,80,40,0.60)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] disabled:opacity-50 dark:border-white/8 dark:bg-white/3 dark:text-white/45"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
