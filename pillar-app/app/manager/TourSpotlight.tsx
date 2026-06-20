'use client';

import { useEffect, useRef, useState } from 'react';
import { TOUR_STEPS, type TourStep } from '@/lib/tourSteps';
import { useTour } from './TourProvider';

function useDark() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

type Rect = { top: number; left: number; width: number; height: number };

const OUTSET = 8;
const RING_RADIUS = 18;

export default function TourSpotlight({ step }: { step: TourStep }) {
  const tour = useTour();
  const dark = useDark();
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure the target element, polling briefly since pages fade/mount asynchronously.
  useEffect(() => {
    setVisible(false);
    let attempts = 0;
    let cancelled = false;

    function measure() {
      if (cancelled) return;
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          requestAnimationFrame(() => setVisible(true));
          return;
        }
      }
      attempts += 1;
      if (attempts < 60) {
        timeoutRef.current = setTimeout(measure, 50);
      }
    }
    measure();

    function reMeasure() {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    }
    window.addEventListener('resize', reMeasure);
    window.addEventListener('scroll', reMeasure, true);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('resize', reMeasure);
      window.removeEventListener('scroll', reMeasure, true);
    };
  }, [step.selector]);

  // For click-to-advance steps, watch for the user clicking the real highlighted element.
  useEffect(() => {
    if (step.advance !== 'click' || !tour) return;
    const activeTour = tour;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(step.selector)) {
        activeTour.advance();
      }
    }
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [step.advance, step.selector, tour]);

  if (!tour) return null;
  const stepNum = TOUR_STEPS.findIndex((s) => s.id === step.id) + 1;

  const card = dark
    ? { background: 'rgba(10,10,10,0.96)', border: '1px solid rgba(255,255,255,0.10)' }
    : { background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(100,80,40,0.14)' };
  const titleColor = dark ? 'rgba(255,255,255,0.95)' : '#1e293b';
  const bodyColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(30,41,59,0.62)';
  const labelColor = dark ? 'rgba(212,175,106,0.80)' : 'rgba(184,148,90,0.95)';

  const ringStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: rect.top - OUTSET,
        left: rect.left - OUTSET,
        width: rect.width + OUTSET * 2,
        height: rect.height + OUTSET * 2,
        borderRadius: RING_RADIUS,
        boxShadow: '0 0 0 9999px rgba(8,8,6,0.58), 0 0 0 2px rgba(212,175,106,0.95), 0 0 28px 6px rgba(212,175,106,0.45)',
        pointerEvents: 'none',
        zIndex: 9990,
        opacity: visible ? 1 : 0,
        transition: 'top 0.45s cubic-bezier(0.16,1,0.3,1), left 0.45s cubic-bezier(0.16,1,0.3,1), width 0.45s cubic-bezier(0.16,1,0.3,1), height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.30s ease',
      }
    : { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990, opacity: 0 };

  // Tooltip position derived from the rect + placement.
  let tooltipStyle: React.CSSProperties = { position: 'fixed', zIndex: 9992, maxWidth: 320, opacity: visible ? 1 : 0, transition: 'opacity 0.30s ease 0.05s, top 0.45s cubic-bezier(0.16,1,0.3,1), bottom 0.45s cubic-bezier(0.16,1,0.3,1)' };
  if (!rect || step.placement === 'center') {
    tooltipStyle = { ...tooltipStyle, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
  } else if (step.placement === 'bottom') {
    const left = Math.min(Math.max(rect.left + rect.width / 2 - 160, 16), window.innerWidth - 336);
    tooltipStyle = { ...tooltipStyle, top: rect.top + rect.height + OUTSET + 14, left };
  } else {
    const left = Math.min(Math.max(rect.left + rect.width / 2 - 160, 16), window.innerWidth - 336);
    tooltipStyle = { ...tooltipStyle, bottom: window.innerHeight - (rect.top - OUTSET) + 14, left };
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9989,
          pointerEvents: step.advance === 'click' ? 'none' : 'auto',
        }}
      />
      <div style={ringStyle} />
      <div className="rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl" style={{ ...card, ...tooltipStyle }}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
            Step {stepNum} of {TOUR_STEPS.length}
          </p>
          <button
            type="button"
            onClick={tour.exitTour}
            disabled={tour.busy}
            className="flex-none text-[11px] font-medium underline-offset-2 hover:underline disabled:opacity-50"
            style={{ color: bodyColor }}
          >
            Exit tour
          </button>
        </div>
        <h3 className="lux-title mt-2 text-base font-light leading-snug" style={{ color: titleColor }}>
          {step.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: bodyColor }}>
          {step.body}
        </p>
        {step.advance === 'click' ? (
          <p className="mt-3 text-[11px] font-semibold" style={{ color: labelColor, animation: 'tourPulse 1.6s ease-in-out infinite' }}>
            Tap the highlighted item to continue →
          </p>
        ) : (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={step.advance === 'finish' ? tour.finishTour : tour.advance}
              disabled={tour.busy}
              className="h-9 rounded-xl px-4 text-xs font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF6A 0%, #B8945A 100%)' }}
            >
              {step.advance === 'finish' ? (tour.busy ? 'Finishing…' : 'Finish tour') : 'Next'}
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes tourPulse {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
