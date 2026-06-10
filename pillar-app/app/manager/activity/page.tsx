import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertiesByManagerId } from '@/lib/properties';
import { getOpenWorkOrderCounts } from '@/lib/workOrders';
import { getPendingLateCheckoutCounts } from '@/lib/lateCheckouts';
import ManagerBottomNav from '@/app/manager/ManagerBottomNav';

export const dynamic = 'force-dynamic';

function activityLabel(workOrders: number, checkouts: number): string {
  if (workOrders === 0 && checkouts === 0) return 'No open activity';
  const parts: string[] = [];
  if (workOrders > 0) parts.push(`${workOrders} ${workOrders === 1 ? 'order' : 'orders'}`);
  if (checkouts > 0) parts.push(`${checkouts} ${checkouts === 1 ? 'checkout req' : 'checkout reqs'}`);
  return parts.join(' · ');
}

export default async function ActivityPage() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;
  if (!session?.userId) redirect('/manager/login');

  const properties = await getPropertiesByManagerId(session.userId);
  const slugs = properties.map((p) => p.Slug ?? '').filter(Boolean);

  const [openCounts, checkoutCounts] = slugs.length > 0
    ? await Promise.all([getOpenWorkOrderCounts(slugs), getPendingLateCheckoutCounts(slugs)])
    : [{} as Record<string, number>, {} as Record<string, number>];

  const totalOpen = slugs.reduce((s, slug) => s + (openCounts[slug] ?? 0) + (checkoutCounts[slug] ?? 0), 0);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/60">
              Manager Portal
            </p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">
              Activity
            </h1>
          </div>
          {totalOpen > 0 && (
            <span className="mb-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
              {totalOpen} open
            </span>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <p className="text-sm font-medium text-[#1e293b] dark:text-white/70">No properties yet</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-[rgba(100,80,40,0.55)] dark:text-white/40">
                Add a property to start receiving work orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {properties.map((p) => {
              const slug = p.Slug ?? '';
              const woCount = openCounts[slug] ?? 0;
              const lcCount = checkoutCounts[slug] ?? 0;
              const totalCount = woCount + lcCount;
              return (
                <Link
                  key={slug}
                  href={`/manager/activity/${encodeURIComponent(slug)}`}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.05)] shadow-[0_4px_16px_rgba(100,80,40,0.08)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(100,80,40,0.14)] dark:border-white/8 dark:bg-[rgba(255,255,255,0.03)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.50)]"
                >
                  {/* Hero image */}
                  {p.HeroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.HeroImage}
                      alt={p.PropertyName || ''}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(100,80,40,0.06)] dark:bg-white/3">
                      <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-[rgba(100,80,40,0.20)] dark:text-white/15" aria-hidden="true">
                        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Combined badge */}
                  {totalCount > 0 && (
                    <span className="absolute right-2.5 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-lg">
                      {totalCount}
                    </span>
                  )}

                  {/* Property name + activity label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="truncate text-xs font-semibold leading-tight text-white drop-shadow-sm">
                      {p.PropertyName || slug}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-white/60">
                      {activityLabel(woCount, lcCount)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>

      <ManagerBottomNav />
    </div>
  );
}
