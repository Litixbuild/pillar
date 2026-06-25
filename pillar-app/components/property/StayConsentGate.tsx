'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Property } from '@/lib/types';

function consentKey(stayId: string) {
  return `pillar_stay_consent_${stayId}`;
}

function ChecklistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[#7a5c08] dark:text-[#D4AF37]" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8.5l1.5 1.5L12 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14.5l1.5 1.5L12 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8.5h3M14 14.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GateBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
    </>
  );
}

export default function StayConsentGate({
  slug,
  stayId,
  property,
  children,
}: {
  slug: string;
  stayId: string | null;
  property: Property;
  children: ReactNode;
}) {
  // No active stay tracked for this property yet (manager hasn't turned the
  // feature on) — stay fully backward compatible and skip the gate.
  const [consented, setConsented] = useState<boolean | null>(stayId ? null : true);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stayId) return;
    setConsented(sessionStorage.getItem(consentKey(stayId)) === 'true');
  }, [stayId]);

  async function handleConfirm() {
    if (!stayId || !checked || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/p/${encodeURIComponent(slug)}/consent`, { method: 'POST' });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { stayId?: string };
      sessionStorage.setItem(consentKey(data.stayId ?? stayId), 'true');
      setConsented(true);
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }

  // Briefly unknown while we check sessionStorage on mount.
  if (consented === null) {
    return <div className="relative min-h-screen"><GateBackground /></div>;
  }

  if (consented) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <GateBackground />

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
        <div className="flex flex-col items-center px-7 py-8 text-center">
          <span
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(168,126,10,0.10) 100%)' }}
          >
            <ChecklistIcon />
          </span>

          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">
            Before You Get Started
          </p>
          <h1 className="mt-1 text-xl font-light leading-tight tracking-tight text-slate-900 dark:text-white">
            {property.PropertyName || 'Welcome'}
          </h1>
          <p className="mt-2 text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
            Please confirm the condition of the home before viewing your guide.
          </p>

          <label className="mt-7 flex w-full items-start gap-3 rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] px-4 py-4 text-left dark:border-white/8 dark:bg-white/3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-none accent-[#D4AF37]"
            />
            <span className="text-sm text-[#1e293b] dark:text-white/80">
              I confirm that this home was <strong>clean and undamaged</strong> when I arrived.
            </span>
          </label>

          {error && <p className="mt-3 text-xs text-rose-500 dark:text-rose-400">{error}</p>}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!checked || submitting}
            className="mt-5 h-12 w-full rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
          >
            {submitting ? 'Confirming…' : 'Continue to Property Guide'}
          </button>

          <p className="mt-4 text-[10px] text-[rgba(100,80,40,0.45)] dark:text-white/30">
            This confirmation is shared with your host and may be used to document the home&apos;s condition during your stay.
          </p>
        </div>
      </div>
    </div>
  );
}
