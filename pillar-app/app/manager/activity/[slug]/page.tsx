import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertyAccessWithName } from '@/lib/properties';
import { getWorkOrdersByProperty } from '@/lib/workOrders';
import { getPendingLateCheckoutsByProperty, getActionedLateCheckoutsByProperty } from '@/lib/lateCheckouts';
import ManagerBottomNav from '@/app/manager/ManagerBottomNav';
import WorkOrderList from './WorkOrderList';
import CollapsibleHistory from './CollapsibleHistory';
import { PendingLateCheckoutList, ActionedLateCheckoutHistory } from './LateCheckoutList';

export const dynamic = 'force-dynamic';

export default async function PropertyActivityPage(
  props: { params: Promise<{ slug: string }> }
) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;
  if (!session?.userId) redirect('/manager/login');

  const { slug } = await props.params;
  const { allowed, propertyName } = await getPropertyAccessWithName(session.userId, slug);
  if (!allowed) notFound();

  const [allOrders, pendingCheckouts, actionedCheckouts] = await Promise.all([
    getWorkOrdersByProperty(slug),
    getPendingLateCheckoutsByProperty(slug),
    getActionedLateCheckoutsByProperty(slug),
  ]);

  const open = allOrders.filter((o) => o.status === 'open');
  const resolved = allOrders.filter((o) => o.status === 'resolved');

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">

        {/* Back + header */}
        <div className="mb-8">
          <Link
            href="/manager/activity"
            className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(100,80,40,0.55)] transition-colors hover:text-[rgba(100,80,40,0.80)] dark:text-white/40 dark:hover:text-white/65"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Activity
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/60">
            Activity
          </p>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">
            {propertyName ?? decodeURIComponent(slug)}
          </h1>
        </div>

        {/* Open work orders — always first */}
        <div data-tour="activity-open-orders" className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
          <div className="flex items-center justify-between border-b border-[rgba(100,80,40,0.09)] px-6 py-4 dark:border-white/7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
              Open
            </p>
            {open.length > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {open.length}
              </span>
            )}
          </div>

          {open.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <p className="text-sm font-medium text-[#1e293b] dark:text-white/70">All clear</p>
              <p className="mt-1 text-xs text-[rgba(100,80,40,0.55)] dark:text-white/40">
                No open work orders for this property.
              </p>
            </div>
          ) : (
            <WorkOrderList orders={open} slug={slug} mode="open" />
          )}
        </div>

        {/* Pending late checkout requests — open items, shown below work orders */}
        {pendingCheckouts.length > 0 && (
          <div
            data-tour="activity-late-checkout"
            className="mb-4 overflow-hidden rounded-2xl bg-white/88 backdrop-blur-xl dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]"
            style={{ border: '1px solid rgba(212,175,55,0.28)', boxShadow: '0 4px 20px rgba(212,175,55,0.10)' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.14)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a5c08] dark:text-[#D4AF37]/80">
                Late Checkout Requests
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #A87C0A 100%)' }}
              >
                {pendingCheckouts.length}
              </span>
            </div>
            <PendingLateCheckoutList requests={pendingCheckouts} />
          </div>
        )}

        {/* Checkout History */}
        {actionedCheckouts.length > 0 && (
          <div className="mb-4">
            <ActionedLateCheckoutHistory requests={actionedCheckouts} propertyName={propertyName ?? decodeURIComponent(slug)} />
          </div>
        )}

        {/* Work Order History */}
        {resolved.length > 0 && (
          <CollapsibleHistory orders={resolved} slug={slug} propertyName={propertyName ?? decodeURIComponent(slug)} />
        )}

      </div>

      <ManagerBottomNav />
    </div>
  );
}
