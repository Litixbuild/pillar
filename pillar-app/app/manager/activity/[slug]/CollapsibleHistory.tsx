'use client';

import { useState } from 'react';
import type { WorkOrder } from '@/lib/workOrders';
import WorkOrderList from './WorkOrderList';

export default function CollapsibleHistory({
  orders,
  slug,
  propertyName = '',
}: {
  orders: WorkOrder[];
  slug: string;
  propertyName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-b border-[rgba(100,80,40,0.09)] px-6 py-4 transition-colors hover:bg-[rgba(100,80,40,0.02)] dark:border-white/7 dark:hover:bg-white/2"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
          Work Order History
        </p>
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-[rgba(100,80,40,0.40)] dark:text-white/30">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
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

      {open && <WorkOrderList orders={orders} slug={slug} mode="resolved" propertyName={propertyName} />}
    </div>
  );
}
