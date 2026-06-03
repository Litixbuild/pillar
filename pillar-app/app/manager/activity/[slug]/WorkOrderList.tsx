'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkOrder } from '@/lib/workOrders';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OrderRow({
  order,
  mode,
}: {
  order: WorkOrder;
  mode: 'open' | 'resolved';
}) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleResolve() {
    setResolving(true);
    setError(null);
    const res = await fetch(`/api/manager/work-orders/${encodeURIComponent(order.id)}/resolve`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note: note.trim() || null }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? 'Failed to resolve. Please try again.');
      setResolving(false);
    }
  }

  return (
    <div className="border-b border-[rgba(100,80,40,0.07)] px-6 py-4 last:border-b-0 dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Category + date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[rgba(100,80,40,0.14)] bg-[rgba(100,80,40,0.06)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(100,80,40,0.70)] dark:border-white/10 dark:bg-white/5 dark:text-white/55">
              {order.category_name}
            </span>
            <span className="text-[10px] text-[rgba(100,80,40,0.45)] dark:text-white/30">
              {formatDate(order.created_at)}
            </span>
          </div>

          {/* Description */}
          {order.description && (
            <p className="mt-2 text-sm text-[#1e293b] dark:text-white/80">
              {order.description}
            </p>
          )}
          {order.other_message && (
            <p className="mt-1 text-xs text-[rgba(100,80,40,0.65)] dark:text-white/45">
              {order.other_message}
            </p>
          )}

          {/* Resolved note */}
          {mode === 'resolved' && order.resolved_note && (
            <p className="mt-2 text-xs italic text-[rgba(100,80,40,0.55)] dark:text-white/35">
              Note: {order.resolved_note}
            </p>
          )}
          {mode === 'resolved' && order.resolved_at && (
            <p className="mt-1 text-[10px] text-[rgba(100,80,40,0.40)] dark:text-white/25">
              Resolved {formatDate(order.resolved_at)}
            </p>
          )}
        </div>

        {/* Resolve button (open mode only) */}
        {mode === 'open' && !showNote && (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="flex-none rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2 text-emerald-600 transition-all duration-200 hover:border-emerald-500/45 hover:bg-emerald-500/20 dark:border-emerald-400/20 dark:text-emerald-400"
            title="Mark as resolved"
          >
            <CheckIcon />
          </button>
        )}
      </div>

      {/* Inline resolve confirmation */}
      {mode === 'open' && showNote && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional resolution note…"
            className="h-9 w-full rounded-xl border border-[rgba(100,80,40,0.15)] bg-[rgba(100,80,40,0.04)] px-3 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-[rgba(100,80,40,0.30)] focus:border-[rgba(100,80,40,0.28)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/20"
            onKeyDown={(e) => { if (e.key === 'Enter') void handleResolve(); }}
            autoFocus
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleResolve()}
              disabled={resolving}
              className="h-8 flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-500/25 disabled:opacity-50 dark:text-emerald-400"
            >
              {resolving ? 'Resolving…' : 'Mark resolved'}
            </button>
            <button
              type="button"
              onClick={() => { setShowNote(false); setNote(''); setError(null); }}
              disabled={resolving}
              className="h-8 rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] px-3 text-xs font-semibold text-[rgba(100,80,40,0.60)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] dark:border-white/8 dark:bg-white/3 dark:text-white/45"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkOrderList({
  orders,
  slug,
  mode,
}: {
  orders: WorkOrder[];
  slug: string;
  mode: 'open' | 'resolved';
}) {
  void slug;
  return (
    <div>
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} mode={mode} />
      ))}
    </div>
  );
}
