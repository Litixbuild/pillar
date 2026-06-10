'use client';

import { useEffect } from 'react';
import type { WorkOrder } from '@/lib/workOrders';
import type { LateCheckoutRequest } from '@/lib/lateCheckouts';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-[rgba(100,80,40,0.07)] py-3 last:border-b-0 dark:border-white/[0.055]">
      <span className="mt-0.5 w-28 flex-none text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(100,80,40,0.42)] dark:text-white/32">
        {label}
      </span>
      <div className="flex-1 text-sm leading-snug text-[#1e293b] dark:text-white/82">
        {children}
      </div>
    </div>
  );
}

type WorkOrderProps  = { type: 'workorder'; item: WorkOrder;           propertyName: string; onClose: () => void };
type CheckoutProps   = { type: 'checkout';  item: LateCheckoutRequest; propertyName: string; onClose: () => void };
type Props = WorkOrderProps | CheckoutProps;

export default function ActivityDetailModal(props: Props) {
  const { onClose, propertyName } = props;
  const isCheckout = props.type === 'checkout';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const accentBorder  = isCheckout ? 'rgba(212,175,55,0.26)' : 'rgba(100,80,40,0.14)';
  const headerDivider = isCheckout ? 'rgba(212,175,55,0.14)' : 'rgba(100,80,40,0.08)';
  const innerDivider  = isCheckout ? 'rgba(212,175,55,0.12)' : 'rgba(100,80,40,0.08)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div
        className="relative w-full overflow-hidden rounded-t-3xl bg-white shadow-[0_-4px_40px_rgba(0,0,0,0.13)] sm:max-w-md sm:rounded-3xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:bg-[rgba(13,13,13,0.99)] dark:shadow-[0_-4px_40px_rgba(0,0,0,0.55)] sm:dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
        style={{ border: `1px solid ${accentBorder}` }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[rgba(100,80,40,0.14)] dark:bg-white/14" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${headerDivider}` }}
        >
          {isCheckout ? (
            <span
              className="rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a5c08] dark:text-[#D4AF37]"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(168,126,10,0.10) 100%)', border: '1px solid rgba(212,175,55,0.30)' }}
            >
              Late Checkout
            </span>
          ) : (
            <span className="rounded-md border border-[rgba(100,80,40,0.14)] bg-[rgba(100,80,40,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgba(100,80,40,0.68)] dark:border-white/10 dark:bg-white/5 dark:text-white/52">
              Work Order
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(100,80,40,0.06)] text-[rgba(100,80,40,0.48)] transition-colors hover:bg-[rgba(100,80,40,0.12)] hover:text-[rgba(100,80,40,0.75)] dark:bg-white/5 dark:text-white/38 dark:hover:bg-white/10 dark:hover:text-white/68"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Property name */}
        <div className="px-6 pb-1 pt-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.38)] dark:text-white/28">
            Property
          </p>
          <h2 className="mt-0.5 text-lg font-semibold leading-tight text-[#1e293b] dark:text-white">
            {propertyName}
          </h2>
        </div>

        {/* Divider */}
        <div className="mx-6 mt-4 h-px" style={{ background: innerDivider }} />

        {/* Scrollable body */}
        <div className="max-h-[55vh] overflow-y-auto px-6 pb-7 pt-1 sm:max-h-none">
          {props.type === 'checkout'
            ? <CheckoutFields request={props.item} />
            : <WorkOrderFields order={props.item} />}
        </div>
      </div>
    </div>
  );
}

function WorkOrderFields({ order }: { order: WorkOrder }) {
  const resolved = order.status === 'resolved';
  return (
    <div>
      <FieldRow label="Category">{order.category_name}</FieldRow>
      <FieldRow label="Submitted">{formatDateTime(order.created_at)}</FieldRow>
      <FieldRow label="Status">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 flex-none rounded-full ${resolved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {resolved ? 'Resolved' : 'Open'}
        </span>
      </FieldRow>
      {order.resolved_at && (
        <FieldRow label="Resolved On">{formatDateTime(order.resolved_at)}</FieldRow>
      )}
      {order.description && (
        <FieldRow label="Description">
          <span className="whitespace-pre-wrap">{order.description}</span>
        </FieldRow>
      )}
      {order.other_message && (
        <FieldRow label="Details">
          <span className="whitespace-pre-wrap">{order.other_message}</span>
        </FieldRow>
      )}
      {order.resolved_note && (
        <FieldRow label="Note">
          <span className="italic text-[rgba(100,80,40,0.65)] dark:text-white/50">{order.resolved_note}</span>
        </FieldRow>
      )}
    </div>
  );
}

function CheckoutFields({ request }: { request: LateCheckoutRequest }) {
  const approved = request.status === 'approved';
  const denied   = request.status === 'denied';
  return (
    <div>
      <FieldRow label="Submitted">{formatDateTime(request.submitted_at)}</FieldRow>
      <FieldRow label="Status">
        {approved ? (
          <span className="inline-flex items-center rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Approved
          </span>
        ) : denied ? (
          <span className="inline-flex items-center rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            Denied
          </span>
        ) : (
          <span className="text-[rgba(100,80,40,0.55)] dark:text-white/40">Pending</span>
        )}
      </FieldRow>
      {request.actioned_at && (
        <FieldRow label={approved ? 'Approved On' : 'Denied On'}>
          {formatDateTime(request.actioned_at)}
        </FieldRow>
      )}
    </div>
  );
}
