'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LateCheckoutRequest } from '@/lib/lateCheckouts';
import ActivityDetailModal from './ActivityDetailModal';

// Gold palette
const GOLD_GRADIENT  = 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(168,126,10,0.10) 100%)';
const GOLD_GRADIENT_HOVER = 'linear-gradient(135deg, rgba(212,175,55,0.28) 0%, rgba(168,126,10,0.18) 100%)';
const GOLD_BADGE     = 'linear-gradient(135deg, #D4AF37 0%, #A87C0A 100%)';
const GOLD_BORDER    = 'rgba(212,175,55,0.32)';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GoldChip() {
  return (
    <span
      className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a5c08] dark:text-[#D4AF37]"
      style={{ background: GOLD_GRADIENT, border: `1px solid ${GOLD_BORDER}` }}
    >
      <ClockIcon />
      Late Checkout
    </span>
  );
}

function PendingRow({ request }: { request: LateCheckoutRequest }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [hoverReview, setHoverReview] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approved' | 'denied' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: 'approved' | 'denied') {
    setSubmitting(true);
    setError(null);
    const res = await fetch(
      `/api/manager/late-checkout/${encodeURIComponent(request.id)}/action`,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      }
    );
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? 'Failed. Please try again.');
      setSubmitting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="border-b border-[rgba(100,80,40,0.07)] px-6 py-4 last:border-b-0 dark:border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <GoldChip />
            <span className="text-[10px] text-[rgba(100,80,40,0.45)] dark:text-white/30">
              {formatDate(request.submitted_at)}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#1e293b] dark:text-white/80">
            A guest has requested a late checkout for this property.
          </p>
        </div>

        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            onMouseEnter={() => setHoverReview(true)}
            onMouseLeave={() => setHoverReview(false)}
            className="flex-none rounded-xl px-3 py-1.5 text-xs font-semibold text-[#7a5c08] transition-all duration-200 dark:text-[#D4AF37]"
            style={{
              background: hoverReview ? GOLD_GRADIENT_HOVER : GOLD_GRADIENT,
              border: `1px solid ${GOLD_BORDER}`,
            }}
          >
            Review
          </button>
        )}
      </div>

      {confirming && (
        <div className="mt-3 space-y-2">
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setPendingAction('approved'); void handleAction('approved'); }}
              disabled={submitting}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-500/25 disabled:opacity-50 dark:text-emerald-400"
            >
              {submitting && pendingAction === 'approved' ? 'Approving…' : <><CheckIcon /> Approve</>}
            </button>
            <button
              type="button"
              onClick={() => { setPendingAction('denied'); void handleAction('denied'); }}
              disabled={submitting}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400"
            >
              {submitting && pendingAction === 'denied' ? 'Denying…' : <><XIcon /> Deny</>}
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
  );
}

function ActionedRow({ request, onDetail }: { request: LateCheckoutRequest; onDetail: () => void }) {
  const approved = request.status === 'approved';
  return (
    <button
      type="button"
      onClick={onDetail}
      className="flex w-full items-center gap-3 border-b border-[rgba(100,80,40,0.07)] px-5 py-2.5 text-left transition-colors hover:bg-[rgba(100,80,40,0.025)] last:border-b-0 dark:border-white/5 dark:hover:bg-white/2"
    >
      <div className={`h-1.5 w-1.5 flex-none rounded-full ${approved ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      <span className="min-w-0 flex-1 truncate text-[11px] text-[#1e293b] dark:text-white/65">Late Checkout</span>
      <span className="flex-none text-[10px] text-[rgba(100,80,40,0.38)] dark:text-white/25">
        {formatDate(request.submitted_at)}
      </span>
      <span
        className={`flex-none rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
          approved
            ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : 'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
        }`}
      >
        {approved ? 'Approved' : 'Denied'}
      </span>
    </button>
  );
}

export function PendingLateCheckoutList({ requests }: { requests: LateCheckoutRequest[] }) {
  return (
    <div>
      {requests.map((r) => (
        <PendingRow key={r.id} request={r} />
      ))}
    </div>
  );
}

export function ActionedLateCheckoutHistory({
  requests,
  propertyName = '',
}: {
  requests: LateCheckoutRequest[];
  propertyName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LateCheckoutRequest | null>(null);
  if (requests.length === 0) return null;

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl bg-white/88 backdrop-blur-xl dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]"
        style={{ border: `1px solid rgba(212,175,55,0.20)`, boxShadow: '0 4px 20px rgba(212,175,55,0.06)' }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3 transition-colors hover:bg-[rgba(212,175,55,0.03)]"
          style={{ borderBottom: open ? `1px solid rgba(212,175,55,0.14)` : undefined }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a5c08]/80 dark:text-[#D4AF37]/60">
            Checkout History
          </p>
          <span className="flex items-center gap-2">
            <span className="text-[10px] text-[rgba(100,80,40,0.40)] dark:text-white/30">
              {requests.length} {requests.length === 1 ? 'request' : 'requests'}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`h-3.5 w-3.5 text-[rgba(100,80,40,0.40)] transition-transform duration-200 dark:text-white/30 ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {open && (
          <div>
            {requests.map((r) => (
              <ActionedRow key={r.id} request={r} onDetail={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ActivityDetailModal
          type="checkout"
          item={selected}
          propertyName={propertyName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
