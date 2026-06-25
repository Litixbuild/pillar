'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Phase = 'cleaning' | 'consent' | 'damage' | 'report';

const SEQUENCE: { phase: Phase; duration: number }[] = [
  { phase: 'cleaning', duration: 3200 },
  { phase: 'consent', duration: 3000 },
  { phase: 'damage', duration: 3600 },
  { phase: 'report', duration: 5200 },
];

const DAMAGE_CAPTION = 'Broken vase found in living room';

const GOLD = '#A8895E';
const GOLD_LIGHT = '#D9C4A0';

function CheckBadge() {
  return (
    <span
      className="flex h-6 w-6 flex-none items-center justify-center rounded-full"
      style={{ background: 'rgba(34,197,94,0.18)', color: '#15803d' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ScreenHeader({ label, accent, ink }: { label: string; accent: string; ink: string }) {
  return (
    <div className="shrink-0 pb-5 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>{label}</p>
      <div className="mt-3 h-px w-10 mx-auto" style={{ background: `${ink}22` }} />
    </div>
  );
}

/* ── A self-contained, looping mockup of the Verification feature — cleaning
   crew upload, guest consent, damage documentation, and the assembled report —
   used on the marketing homepage as a floating panel (no device chrome) so it
   sits directly against the page background. ── */
export default function VerificationDemoWindow({ dark }: { dark: boolean }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [reportStep, setReportStep] = useState(0);

  const phase = SEQUENCE[phaseIdx].phase;

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhaseIdx((i) => (i + 1) % SEQUENCE.length);
    }, SEQUENCE[phaseIdx].duration);
    return () => clearTimeout(timer);
  }, [phaseIdx]);

  // Typed-out caption during the damage phase
  useEffect(() => {
    if (phase !== 'damage') { setTypedLen(0); return; }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setTypedLen(n);
      if (n >= DAMAGE_CAPTION.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [phase]);

  // Rows reveal one at a time during the report phase
  useEffect(() => {
    if (phase !== 'report') { setReportStep(0); return; }
    const steps = [350, 1050, 1750, 2500, 3300];
    const timers = steps.map((delay, i) => setTimeout(() => setReportStep(i + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const ink = dark ? '#ffffff' : '#1e293b';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(30,41,59,0.55)';
  const hairline = dark ? 'rgba(255,255,255,0.10)' : 'rgba(100,80,40,0.14)';
  const panelTint = dark ? 'rgba(255,255,255,0.04)' : 'rgba(100,80,40,0.035)';

  return (
    <div className="relative w-full h-full">
      <div className="flex h-full flex-col px-4 py-4">
        {/* ── Cleaning crew upload ── */}
        {phase === 'cleaning' && (
          <>
            <ScreenHeader label="Cleaning Crew Upload" accent={GOLD} ink={ink} />
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ width: 220, height: 168, border: `1px solid ${hairline}`, boxShadow: '0 10px 30px rgba(0,0,0,0.16)' }}
              >
                <Image src="/images/notbrokenvase.png" alt="" fill className="object-cover" />
              </div>
              <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: 'rgba(34,197,94,0.14)' }}>
                <CheckBadge />
                <span className="text-sm font-semibold" style={{ color: '#15803d' }}>Uploaded</span>
              </div>
              <p className="text-xs" style={{ color: muted }}>No account needed</p>
            </div>
          </>
        )}

        {/* ── Guest consent ── */}
        {phase === 'consent' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em]" style={{ color: GOLD }}>Before You Get Started</p>
            <div
              className="flex w-full max-w-xs items-start gap-3 rounded-2xl px-4 py-4 text-left"
              style={{ border: `1px solid ${hairline}`, background: panelTint }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-[5px]"
                style={{ background: GOLD_LIGHT }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm leading-snug" style={{ color: ink }}>
                I confirm this home was <strong>clean and undamaged</strong> when I arrived.
              </span>
            </div>
            <p className="text-xs" style={{ color: muted }}>Confirmed 2:14 PM &middot; timestamped automatically</p>
          </div>
        )}

        {/* ── Damage documentation ── */}
        {phase === 'damage' && (
          <>
            <ScreenHeader label="Damage Documentation" accent={GOLD} ink={ink} />
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ width: 220, height: 168, border: `1px solid ${hairline}`, boxShadow: '0 10px 30px rgba(0,0,0,0.16)' }}
              >
                <Image src="/images/brokenvase.png" alt="" fill className="object-cover" />
              </div>
              <div
                className="w-full max-w-xs rounded-xl px-4 py-3"
                style={{ border: `1px solid ${hairline}`, background: panelTint, minHeight: 44 }}
              >
                <p className="text-sm" style={{ color: ink }}>
                  {DAMAGE_CAPTION.slice(0, typedLen)}
                  <span style={{ opacity: typedLen < DAMAGE_CAPTION.length ? 1 : 0 }}>|</span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Assembled report ── */}
        {phase === 'report' && (
          <>
            <ScreenHeader label="Summary Report" accent={GOLD} ink={ink} />
            <div className="flex-1 flex flex-col gap-2.5">
              {reportStep >= 1 && (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${hairline}` }}>
                  <div className="relative h-11 w-11 flex-none overflow-hidden rounded-lg">
                    <Image src="/images/notbrokenvase.png" alt="" fill className="object-cover" />
                  </div>
                  <span className="text-sm flex-1" style={{ color: ink }}>Pre-arrival photo</span>
                  <CheckBadge />
                </div>
              )}
              {reportStep >= 2 && (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${hairline}` }}>
                  <span className="text-sm flex-1" style={{ color: ink }}>Guest consent &middot; 2:14 PM</span>
                  <CheckBadge />
                </div>
              )}
              {reportStep >= 3 && (
                <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: `1px solid ${hairline}` }}>
                  <div className="relative h-11 w-11 flex-none overflow-hidden rounded-lg">
                    <Image src="/images/brokenvase.png" alt="" fill className="object-cover" />
                  </div>
                  <span className="text-sm flex-1" style={{ color: ink }}>Damage documented</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: '#e11d48' }}>1</span>
                </div>
              )}
              {reportStep >= 4 && (
                <div className="rounded-xl px-4 py-3" style={{ border: `1px solid ${hairline}`, background: panelTint }}>
                  <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>Narrative</p>
                  <p className="mt-1.5 text-xs leading-snug" style={{ color: muted }}>
                    Unit confirmed clean at arrival. One incident documented post-checkout…
                  </p>
                </div>
              )}
              {reportStep >= 5 && (
                <div
                  className="mt-1 flex items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)` }}
                >
                  Download Report
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
