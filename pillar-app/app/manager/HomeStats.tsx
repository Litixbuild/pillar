'use client';

import type { DashboardStats, MonthlyResolutionPoint } from '@/lib/propertyEvents';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

function useDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    );
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

function ResolutionHistoryModal({
  data,
  onClose,
}: {
  data: MonthlyResolutionPoint[];
  onClose: () => void;
}) {
  const dark = useDark();
  const [visible, setVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [barsKey, setBarsKey] = useState(0);

  const allYears = [...new Set([new Date().getFullYear(), ...data.map((d) => d.year)])].sort((a, b) => a - b);
  const canPrev = selectedYear > allYears[0];
  const canNext = selectedYear < allYears[allYears.length - 1];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 290);
  }

  function changeYear(delta: number) {
    setSelectedYear((y) => y + delta);
    setBarsKey((k) => k + 1);
  }

  const yearData = Array.from({ length: 12 }, (_, i) => {
    return data.find((d) => d.year === selectedYear && d.month === i + 1) ?? null;
  });

  const hasAnyData = yearData.some(Boolean);
  const maxHours = hasAnyData
    ? Math.max(...yearData.filter(Boolean).map((d) => d!.avgHours))
    : 1;

  const currentMonth = new Date().getMonth(); // 0-indexed

  function formatHours(h: number) {
    return h < 1 ? `${Math.round(h * 60)}m` : `${h}h`;
  }

  // Theme tokens
  const cardBg    = dark ? '#0d0d0d'                    : 'rgba(255,252,245,0.99)';
  const cardBorder = dark ? 'rgba(255,255,255,0.07)'    : 'rgba(100,80,40,0.14)';
  const cardShadow = dark ? '0 32px 80px rgba(0,0,0,0.75)' : '0 32px 80px rgba(100,80,40,0.14)';
  const gradientLine = dark
    ? 'linear-gradient(to right, transparent, rgba(200,184,154,0.40), transparent)'
    : 'linear-gradient(to right, transparent, rgba(180,145,90,0.55), transparent)';
  const tooltipBg     = dark ? '#1c1c1c'                  : 'rgba(255,252,245,0.99)';
  const tooltipBorder = dark ? 'rgba(255,255,255,0.10)'   : 'rgba(100,80,40,0.16)';
  const tooltipLine   = dark
    ? 'linear-gradient(to right, transparent, rgba(200,184,154,0.30), transparent)'
    : 'linear-gradient(to right, transparent, rgba(180,145,90,0.45), transparent)';
  const ghostBarBg    = dark ? 'rgba(255,255,255,0.06)'   : 'rgba(100,80,40,0.09)';
  const barDefault    = dark
    ? 'linear-gradient(to top, #786050, #A89070)'
    : 'linear-gradient(to top, #A08060, #C8A070)';
  const barCurrent    = dark
    ? 'linear-gradient(to top, #B09878, #D4C4A8)'
    : 'linear-gradient(to top, #B89060, #D8B880)';
  const barHovered    = dark
    ? 'linear-gradient(to top, #C8B89A, #E0D0B8)'
    : 'linear-gradient(to top, #C0A070, #DCC890)';
  const barHoverShadow = dark
    ? '0 0 12px rgba(200,184,154,0.25)'
    : '0 0 14px rgba(180,145,90,0.35)';
  function monthLabelColor(i: number) {
    const isCur = selectedYear === new Date().getFullYear() && i === currentMonth;
    if (hoveredBar === i) return dark ? 'rgba(200,184,154,0.80)' : 'rgba(140,105,60,0.80)';
    if (isCur)            return dark ? 'rgba(255,255,255,0.55)' : 'rgba(100,80,40,0.65)';
    return                       dark ? 'rgba(255,255,255,0.22)' : 'rgba(100,80,40,0.32)';
  }

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center px-4"
      style={{
        background: `rgba(5,10,16,${visible ? 0.72 : 0})`,
        transition: 'background 0.29s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-4xl sm:rounded-4xl pb-safe"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.975)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.26s ease',
        }}
      >
        {/* Top gradient line */}
        <div className="h-px w-full" style={{ background: gradientLine }} />

        <div className="p-6 pb-7">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(100,80,40,0.50)' }}
              >
                Work Orders
              </p>
              <h2
                className="mt-1 text-lg font-light tracking-tight"
                style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}
              >
                Resolution Time
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-150"
              style={{
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(100,80,40,0.13)'}`,
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(100,80,40,0.05)',
                color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(100,80,40,0.45)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Year toggle */}
          <div className="flex items-center justify-center gap-5 mb-7">
            <button
              type="button"
              onClick={() => canPrev && changeYear(-1)}
              disabled={!canPrev}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 disabled:pointer-events-none disabled:opacity-20"
              style={{
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(100,80,40,0.13)'}`,
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(100,80,40,0.04)',
                color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(100,80,40,0.45)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span
              className="w-12 text-center text-xl font-light tabular-nums tracking-tight"
              style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}
            >
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => canNext && changeYear(1)}
              disabled={!canNext}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150 disabled:pointer-events-none disabled:opacity-20"
              style={{
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(100,80,40,0.13)'}`,
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(100,80,40,0.04)',
                color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(100,80,40,0.45)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Bar chart area */}
          {!hasAnyData ? (
            <div className="flex h-44 flex-col items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" style={{ color: dark ? 'rgba(255,255,255,0.10)' : 'rgba(100,80,40,0.18)' }}>
                <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(100,80,40,0.38)' }}>
                No resolved orders in {selectedYear}
              </p>
            </div>
          ) : (
            <div key={barsKey} style={{ animation: 'resolutionFadeUp 0.22s ease forwards' }}>
              {/* Bars */}
              <div className="flex items-end gap-1 h-40 px-0.5">
                {yearData.map((point, i) => {
                  const isCurrentMonth =
                    selectedYear === new Date().getFullYear() && i === currentMonth;
                  const isHovered = hoveredBar === i;
                  const heightPct = point ? Math.max((point.avgHours / maxHours) * 100, 4) : 0;

                  return (
                    <div
                      key={i}
                      className="relative flex flex-1 flex-col items-center justify-end h-full"
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Hover tooltip */}
                      {isHovered && point && (
                        <div
                          className="pointer-events-none absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap overflow-hidden rounded-xl shadow-xl"
                          style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}` }}
                        >
                          <div className="h-px w-full" style={{ background: tooltipLine }} />
                          <div className="px-3 py-2 text-center">
                            <p
                              className="text-xs font-semibold"
                              style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}
                            >
                              {formatHours(point.avgHours)}
                            </p>
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(100,80,40,0.50)' }}
                            >
                              {point.count} {point.count === 1 ? 'order' : 'orders'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bar */}
                      {point ? (
                        <div
                          className="w-full rounded-t-md transition-all duration-200"
                          style={{
                            height: `${heightPct}%`,
                            background: isHovered ? barHovered : isCurrentMonth ? barCurrent : barDefault,
                            opacity: isHovered ? 1 : isCurrentMonth ? 0.92 : 0.72,
                            boxShadow: isHovered ? barHoverShadow : 'none',
                          }}
                        />
                      ) : (
                        <div
                          className="w-full rounded-t-sm"
                          style={{ height: '3px', background: ghostBarBg }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Month labels */}
              <div className="flex gap-1 px-0.5 mt-2.5">
                {MONTH_LABELS.map((m, i) => {
                  return (
                    <div key={i} className="flex flex-1 justify-center">
                      <span
                        className="text-[9px] font-medium transition-colors duration-150"
                        style={{ color: monthLabelColor(i) }}
                      >
                        {m.slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footnote */}
          {hasAnyData && (
            <p
              className="mt-4 text-center text-[10px]"
              style={{ color: dark ? 'rgba(255,255,255,0.18)' : 'rgba(100,80,40,0.30)' }}
            >
              avg. hours from submission to resolution
            </p>
          )}
        </div>
      </div>

      {/* Keyframe definition for bar chart entrance */}
      <style>{`
        @keyframes resolutionFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function HomeStats({ stats }: { stats: DashboardStats; managerName: string }) {
  const [showResolutionModal, setShowResolutionModal] = useState(false);

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

  const monthlyData = stats.monthlyResolution ?? [];

  return (
    <>
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
          {/* Avg resolution time — clickable */}
          <button
            type="button"
            onClick={() => setShowResolutionModal(true)}
            className="group flex flex-col justify-between rounded-3xl border border-[rgba(100,80,40,0.10)] bg-white/88 p-5 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl transition-all duration-200 hover:border-[rgba(100,80,40,0.22)] hover:shadow-[0_6px_28px_rgba(100,80,40,0.13)] dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:hover:border-white/15 text-left"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/45">Avg. Resolution</p>
            <div className="mt-3">
              <p className="text-4xl font-light tracking-tight text-slate-900 dark:text-white">{resolutionLabel}</p>
              <div className="mt-1.5">
                <TrendArrow current={stats.avgResolutionHours} prev={stats.avgResolutionHoursPrev} />
                {stats.avgResolutionHours === null && (
                  <p className="text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">No resolved orders yet</p>
                )}
              </div>
            </div>
            {/* Subtle tap hint */}
            <p className="mt-3 text-[10px] text-[rgba(100,80,40,0.30)] group-hover:text-[rgba(100,80,40,0.55)] dark:text-white/18 dark:group-hover:text-white/35 transition-colors duration-200">
              View history →
            </p>
          </button>

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
                  className="flex items-center gap-3 rounded-2xl transition-colors duration-150 hover:bg-[rgba(100,80,40,0.04)] dark:hover:bg-white/3 -mx-2 px-2 py-1.5"
                >
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

      {showResolutionModal && (
        <ResolutionHistoryModal
          data={monthlyData}
          onClose={() => setShowResolutionModal(false)}
        />
      )}
    </>
  );
}
