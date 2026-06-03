'use client';

import type { DashboardStats } from '@/lib/propertyEvents';
import Link from 'next/link';

const DONUT_COLORS = ['#C8B89A', '#B09878', '#A08868', '#D4C4A8', '#907858', '#BCA888'];

function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-black/5 dark:border-white/8">
      <span className="text-[10px] text-black/30 dark:text-white/30">No data</span>
    </div>
  );

  const radius = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;

  let offset = 0;
  const paths = slices.map((slice) => {
    const pct = slice.value / total;
    const dash = pct * circumference - gap;
    const path = (
      <circle
        key={slice.label}
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={slice.color}
        strokeWidth="13"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
      />
    );
    offset += pct * circumference;
    return path;
  });

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth="13" className="text-black/5 dark:text-white/8" />
      {paths}
    </svg>
  );
}

function TrendArrow({ current, prev }: { current: number | null; prev: number | null }) {
  if (current === null || prev === null || prev === 0) return null;
  const improved = current < prev;
  const pct = Math.round(Math.abs(((current - prev) / prev) * 100));
  if (pct === 0) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${improved ? 'text-emerald-500' : 'text-rose-400'}`}>
      {improved ? '↓' : '↑'} {pct}% vs last month
    </span>
  );
}

function HealthDot({ openCount }: { openCount: number }) {
  const color = openCount === 0 ? 'bg-emerald-400' : openCount <= 2 ? 'bg-amber-400' : 'bg-rose-400';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color} shrink-0`} />;
}

export default function HomeStats({ stats }: { stats: DashboardStats; managerName: string }) {
  const donutSlices = stats.issueBreakdown.slice(0, 6).map((item, i) => ({
    label: item.category,
    value: item.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const resolutionLabel = stats.avgResolutionHours === null
    ? '—'
    : stats.avgResolutionHours < 1
      ? `${Math.round(stats.avgResolutionHours * 60)}m`
      : `${stats.avgResolutionHours}h`;

  return (
    <div className="space-y-4">
      {/* Saved calls — full width hero card */}
      <div className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, #C8B89A 0%, #B09878 55%, #A08868 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)' }} />
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">This Month</p>
        <p className="relative mt-1 text-5xl font-light leading-none tracking-tight text-white">
          {stats.savedCallsThisMonth}
        </p>
        <p className="relative mt-2 text-sm font-medium text-white/80">
          calls you didn&apos;t have to answer
        </p>
        <p className="relative mt-1 text-[11px] text-white/55">
          Tenants self-served via amenities, work orders &amp; AI concierge
        </p>
      </div>

      {/* Resolution time + Issue breakdown — side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Avg resolution time */}
        <div className="flex flex-col justify-between rounded-3xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-5 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/45">Avg. Resolution</p>
          <div className="mt-3">
            <p className="text-4xl font-light tracking-tight text-slate-900 dark:text-white">{resolutionLabel}</p>
            <div className="mt-1.5">
              <TrendArrow current={stats.avgResolutionHours} prev={stats.avgResolutionHoursPrev} />
              {(stats.avgResolutionHours === null) && (
                <p className="text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">No resolved orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Issue breakdown donut */}
        <div className="flex flex-col rounded-3xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-5 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/45">Issues</p>
          <div className="mt-3 flex flex-1 items-center justify-center">
            <DonutChart slices={donutSlices} />
          </div>
          {donutSlices.length > 0 && (
            <div className="mt-3 space-y-1">
              {donutSlices.slice(0, 3).map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-[10px] text-[rgba(100,80,40,0.65)] dark:text-white/50">{s.label}</span>
                  <span className="ml-auto text-[10px] font-semibold text-slate-700 dark:text-white/70">{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-property health */}
      {stats.propertyHealth.length > 0 && (
        <div className="rounded-3xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-5 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)]">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/45">Property Health</p>
          <div className="space-y-3">
            {stats.propertyHealth.map((p) => (
              <Link
                key={p.slug}
                href={`/manager/activity/${encodeURIComponent(p.slug)}`}
                className="flex items-center gap-3 rounded-2xl transition-colors duration-150 hover:bg-[rgba(100,80,40,0.04)] dark:hover:bg-white/[0.03] -mx-2 px-2 py-1.5"
              >
                {/* Thumbnail */}
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-[rgba(100,80,40,0.08)] dark:bg-white/8">
                  {p.heroImage
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.heroImage} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full" />}
                </div>
                <span className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-white/85">{p.name}</span>
                <HealthDot openCount={p.openCount} />
                <span className="w-16 text-right text-xs text-[rgba(100,80,40,0.50)] dark:text-white/35">
                  {p.openCount === 0 ? 'All clear' : `${p.openCount} open`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
