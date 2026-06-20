'use client';

import { useEffect, useState } from 'react';

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

export default function TourPromptModal({
  busy,
  onStart,
  onDecline,
}: {
  busy: boolean;
  onStart: () => void;
  onDecline: () => void;
}) {
  const dark = useDark();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-5"
      style={{
        background: 'rgba(5,10,16,0.82)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.30s ease-out',
      }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        style={{
          ...(dark
            ? { background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }
            : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.09)' }),
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'transform 0.36s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,106,0.55), transparent)' }} />
        <div className="p-7">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: dark ? 'rgba(212,175,106,0.75)' : 'rgba(184,148,90,0.95)' }}
          >
            Welcome to Pillar
          </p>
          <h2
            className="lux-title mt-2 text-[1.5rem] font-light leading-tight"
            style={{ color: dark ? 'rgba(255,255,255,0.95)' : '#1e293b' }}
          >
            Want a quick tour?
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(30,41,59,0.62)' }}>
            We&apos;ll set up a sample property so you can see exactly how everything works — your dashboard,
            tenant requests, and billing — before you build your first real one. Takes about two minutes.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={onStart}
              disabled={busy}
              className="h-11 w-full rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF6A 0%, #B8945A 100%)', boxShadow: '0 4px 20px rgba(212,175,106,0.30)' }}
            >
              {busy ? 'Setting up…' : 'Yes, show me around'}
            </button>
            <button
              type="button"
              onClick={onDecline}
              disabled={busy}
              className="h-11 w-full rounded-xl border text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={dark
                ? { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.55)' }
                : { borderColor: 'rgba(0,0,0,0.09)', background: 'rgba(0,0,0,0.03)', color: 'rgba(30,41,59,0.60)' }}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
