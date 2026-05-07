'use client';

import Link from 'next/link';
import type { Property } from '@/lib/types';

export default function ManagerDashboardClient({ properties }: { properties: Property[] }) {
  if (!properties.length) {
    return <p className="text-sm text-white/35">No properties found for this account.</p>;
  }

  return (
    <div className="space-y-3">
      {properties.map((p) => {
        const slug = (p.Slug || '').trim();
        const liveHref = slug ? `/p/${encodeURIComponent(slug)}` : null;

        return (
          <div
            key={`${p.PropertyName}-${p.PropertyAddress}`}
            className="rounded-xl border border-white/[0.07] bg-[#080f18]/60 p-4 transition-all duration-200 hover:border-white/11 hover:bg-[#080f18]/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white/90">{p.PropertyName || '—'}</div>
                {p.PropertyAddress ? (
                  <div className="mt-0.5 truncate text-xs text-white/38">{p.PropertyAddress}</div>
                ) : null}
              </div>
              {slug ? <div className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-400/60" /> : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {liveHref ? (
                <Link
                  href={liveHref}
                  target="_blank"
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-teal-500/22 bg-teal-500/8 px-3 text-xs font-semibold text-teal-300/75 transition-all duration-200 hover:bg-teal-500/14 hover:text-teal-300"
                >
                  View live ↗
                </Link>
              ) : null}

              {slug ? (
                <Link
                  href={`/manager/properties/${encodeURIComponent(slug)}/edit`}
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-white/[0.07] bg-white/3 px-3 text-xs font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75"
                >
                  Edit property
                </Link>
              ) : null}

              {!slug ? (
                <span className="text-xs text-rose-400/55">Missing slug — add one in Supabase</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
