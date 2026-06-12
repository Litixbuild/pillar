'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import IntroSplash from './IntroSplash';
import HomeNav from '../components/HomeNav';

const SANDY = '#F5EDD5';

const THEME_KEY = 'pillar-theme';

export default function HomeDarkWrapper() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') setDark(true);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <>
      <IntroSplash />

      {/* Fixed background — two layers crossfade on toggle via CSS dark class */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      </div>

      <HomeNav dark={dark} onToggleDark={toggleDark} />

      <main className="min-h-screen" style={{ color: '#fff' }}>

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
                'Forgettable stays don’t create repeat guests, referrals, or 5-star reviews',
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
                src="/images/newbg1.png"
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
            <div className="relative w-full" style={{ maxWidth: '375px', aspectRatio: '375/500', maskImage: 'linear-gradient(to left, transparent, black 6%)', WebkitMaskImage: 'linear-gradient(to left, transparent, black 6%)' }}>
              <Image
                src="/images/newbg2.png"
                alt="Guest scanning QR code to access property guide"
                fill
                className="object-cover"
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
                ['Always up to date', 'Guests always see the latest house info and recommendations'],
                ['Built to impress guests', 'Create a smoother stay that leads to better reviews'],
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
            <div className="relative w-full" style={{ maxWidth: '375px', aspectRatio: '375/525', maskImage: 'linear-gradient(to right, transparent, black 9%, black 91%, transparent), linear-gradient(to bottom, black 91%, transparent)', maskComposite: 'intersect', WebkitMaskImage: 'linear-gradient(to right, transparent, black 9%, black 91%, transparent), linear-gradient(to bottom, black 91%, transparent)', WebkitMaskComposite: 'destination-in' }}>
              <Image
                src="/images/newbg3.png"
                alt="Guest planning their perfect day with AI concierge"
                fill
                className="object-cover"
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
                ['Experiences worth five stars', 'When guests feel genuinely looked after, they say so. Those reviews are what future tenants read before they book'],
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
      <footer className="pt-10 pb-12 lg:pt-12 lg:pb-16">
        {/* Divider */}
        <div className="max-w-7xl mx-auto px-8 lg:px-16 mb-10 lg:mb-12">
          <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(245,237,213,0.18), transparent)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col items-center gap-8">
          {/* Logo + tagline */}
          <Image
            src="/images/pillarlogowhite.png"
            alt="Pillar"
            width={80}
            height={53}
            className="opacity-25"
          />

          {/* Policy links */}
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
              { href: '/refund', label: 'Refund Policy' },
              { href: '/cookies', label: 'Cookie Policy' },
              { href: '/contact', label: 'Contact Us' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[10px] uppercase tracking-[0.20em] transition-opacity duration-200 hover:opacity-80"
                style={{ color: 'rgba(245,237,213,0.45)' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; 2026 Pillar. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}
