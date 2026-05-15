'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IntroSplash from './IntroSplash';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SANDY = '#F5EDD5';

export default function HomeDarkWrapper() {
  const [dark, setDark] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    // Match IntroSplash done timing exactly
    const t = setTimeout(() => setShowToggle(true), 3700);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <IntroSplash />

      {/* Fixed background — two layers crossfade on toggle */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top', opacity: dark ? 1 : 0 }} />
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top', opacity: dark ? 0 : 1 }} />
      </div>

      <main className="min-h-screen" style={{ color: '#fff' }}>
      {/* ── Navigation ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 pt-6">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-8 w-8 items-center justify-center rounded-xl border transition-opacity duration-500"
          style={{
            opacity: showToggle ? 1 : 0,
            pointerEvents: showToggle ? 'auto' : 'none',
            borderColor: 'rgba(245,237,213,0.28)',
            background: 'rgba(245,237,213,0.08)',
            color: SANDY,
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Login link */}
        <Link
          href="/manager/login"
          className="group flex items-center gap-2 text-[11px] lg:text-xs uppercase tracking-[0.22em] transition-opacity duration-300 hover:opacity-70"
          style={{ color: SANDY }}
        >
          Login / Sign Up
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ fontSize: '13px' }}>
            →
          </span>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-16 pt-32 pb-4 flex flex-col lg:flex-row items-center gap-4 lg:gap-16">
          <div className="flex-1 w-full max-w-2xl">
            <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-7" style={{ color: SANDY }}>
              Luxury Property Hospitality
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.8rem] leading-[1.12] mb-5 lg:mb-7 text-white">
              Hospitality<br />
              <span style={{ color: SANDY }}>Reimagined.</span>
            </h1>
            <p className="text-base lg:text-lg leading-relaxed mb-8 lg:mb-10" style={{ color: 'rgba(255,255,255,0.90)' }}>
              Your guests are paying for exceptional. Their experience
              shouldn&apos;t depend on whether you picked up the phone.
            </p>
            <div className="space-y-3 lg:space-y-4 mb-10 lg:mb-12">
              {[
                'Late-night calls for the WiFi password — every single stay',
                'Guests wandering aimlessly, missing the best your area has to offer',
                'Check-in confusion that poisons the first impression',
              ].map((pain) => (
                <div key={pain} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                  <span className="mt-0.5 shrink-0" style={{ color: SANDY }}>✕</span>
                  <span>{pain}</span>
                </div>
              ))}
            </div>
            <div className="w-14 h-px" style={{ background: SANDY }} />
          </div>

          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div className="relative w-full" style={{ maxWidth: '400px', aspectRatio: '400/525' }}>
              <Image
                src="/images/splashhome.png"
                alt="Guest arriving at a luxury property"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: QR Instant Access ── */}
      <section className="pt-2 pb-6 lg:py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-16 flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-20">
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full" style={{ maxWidth: '375px', aspectRatio: '375/500' }}>
              <Image
                src="/images/splashqr.png"
                alt="Guest scanning QR code to access property guide"
                fill
                className="object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-7" style={{ color: SANDY }}>
              Zero Friction Access
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 lg:mb-7 text-white">
              Arrive. Scan.<br />
              <span style={{ color: SANDY }}>Experience.</span>
            </h2>
            <p className="text-base lg:text-lg leading-relaxed mb-8 lg:mb-10" style={{ color: 'rgba(255,255,255,0.88)' }}>
              No app to download. No account to create. No passwords to forget.
              The moment your guest steps through the door, a single QR code
              on the kitchen counter connects them to everything your property
              has to offer — house guides, local favorites, and their personal
              AI host. Instant. Effortless. Impressive.
            </p>
            <div className="space-y-4 lg:space-y-5">
              {[
                ['No download required', 'Works on any smartphone, the moment they arrive'],
                ['No account creation', 'Zero barriers between guests and their experience'],
                ['Always current', 'Updates you make go live immediately'],
                ['Any device, any time', 'iPhone, Android, or any browser — it just works'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 lg:gap-4">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(245,237,213,0.5)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: SANDY }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs lg:text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.80)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(245,237,213,0.25), transparent)' }} />
      </div>

      {/* ── Section 3: AI Concierge ── */}
      <section className="py-6 lg:py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-16 flex flex-col-reverse lg:flex-row-reverse items-center gap-6 lg:gap-20">
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full" style={{ maxWidth: '375px', aspectRatio: '375/525' }}>
              <Image
                src="/images/splashplan.png"
                alt="Guest planning their perfect day with AI concierge"
                fill
                className="object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-7" style={{ color: SANDY }}>
              AI Concierge
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 lg:mb-7 text-white">
              Their Perfect Day,<br />
              <span style={{ color: SANDY }}>On Demand.</span>
            </h2>
            <p className="text-base lg:text-lg leading-relaxed mb-8 lg:mb-10" style={{ color: 'rgba(255,255,255,0.88)' }}>
              Pillar&apos;s built-in AI concierge is always on hand for your
              guests. Ask about local restaurants, nearby attractions, things
              to do, or get help planning the perfect day — and receive
              thoughtful, curated answers in seconds. From building a full
              itinerary to answering late-night questions about what&apos;s
              still open, your property&apos;s concierge never sleeps and
              never misses a beat.
            </p>
            <div className="space-y-4 lg:space-y-5">
              {[
                ["Personalised itinerary planning", "Guests describe their mood and the AI builds their perfect day"],
                ["Local dining & attraction discovery", "Curated recommendations tailored to your property's location"],
                ['24 / 7 availability', 'No more midnight texts to you — the AI has it covered'],
                ['Contextual property knowledge', 'House rules, check-out reminders, appliance how-tos — all in one place'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 lg:gap-4">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(245,237,213,0.5)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: SANDY }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs lg:text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.80)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-12 lg:py-24 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-7" style={{ color: SANDY }}>
            Get Started
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-6xl text-white mb-5 lg:mb-6 leading-tight">
            Ready to Elevate<br />Your Property?
          </h2>
          <p className="text-base lg:text-lg mb-10 lg:mb-14" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Join properties already delivering five-star guest experiences
            with Pillar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/manager/login"
              className="group flex items-center gap-2 text-sm uppercase tracking-[0.18em] pb-0.5 transition-all duration-300 hover:opacity-70"
              style={{ color: SANDY, borderBottom: '1px solid rgba(245,237,213,0.45)' }}
            >
              Already Signed Up? Login Here
              <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ fontSize: '13px' }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="py-8 lg:py-16">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 text-center">
          <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-6" style={{ color: SANDY }}>
            Contact
          </p>
          <h2 className="font-serif text-2xl lg:text-4xl text-white mb-4 lg:mb-5">
            Let&apos;s Talk
          </h2>
          <p className="text-sm lg:text-base leading-relaxed mb-8 lg:mb-10" style={{ color: 'rgba(255,255,255,0.82)' }}>
            Interested in bringing Pillar to your property? Reach out directly
            and we&apos;ll get back to you promptly.
          </p>
          <a
            href="mailto:support@pmpillar.com"
            className="text-base lg:text-xl tracking-wide transition-all duration-300 hover:opacity-70 break-all"
            style={{ color: SANDY, borderBottom: '1px solid rgba(245,237,213,0.35)' }}
          >
            support@pmpillar.com
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 lg:py-10 text-center">
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={70}
          height={46}
          className="mx-auto mb-3 lg:mb-4 opacity-30"
        />
        <p className="text-[10px] lg:text-xs uppercase tracking-[0.35em]" style={{ color: 'rgba(255,255,255,0.50)' }}>
          Luxury Property Hospitality Management
        </p>
      </footer>
    </main>
    </>
  );
}
