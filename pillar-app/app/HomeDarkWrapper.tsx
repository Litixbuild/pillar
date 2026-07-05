'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomeNav from '../components/HomeNav';
import HomeDemoWindow from '../components/HomeDemoWindow';
import VerificationDemoWindow from '../components/VerificationDemoWindow';

const SANDY = '#F5EDD5';
const GOLD_LIGHT = '#7A5A1E';

const THEME_KEY = 'pillar-theme';

const AMENITIES = ['WiFi', 'Pool Heater', 'Television', 'Thermostat', 'Garage Code', 'Fireplace'];

const TESTIMONIALS = [
  {
    quote: "My guests stopped messaging me about WiFi and door codes the same week I set Pillar up. They scan in on arrival and everything they need is already there.",
    name: "Sarah M.",
    role: "Vacation Rental Host — 3 Properties",
  },
  {
    quote: "The AI concierge genuinely impressed my guests. Multiple people mentioned it in their reviews. I had no idea it would make that kind of difference.",
    name: "James R.",
    role: "Short-Term Rental Manager",
  },
  {
    quote: "Setup took me about 10 minutes per property. Now I spend a fraction of the time I used to on guest communication.",
    name: "Priya K.",
    role: "Rental Host — 6 Properties",
  },
];

export default function HomeDarkWrapper() {
  const [dark, setDark] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialKey, setTestimonialKey] = useState(0);
  const [amenityIndex, setAmenityIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') setDark(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex(i => (i + 1) % TESTIMONIALS.length);
      setTestimonialKey(k => k + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAmenityIndex(i => (i + 1) % AMENITIES.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    setDark(next);
  };

  const t = TESTIMONIALS[testimonialIndex];

  /* ── Theme tokens — light mode reads dark ink on the white background, dark mode keeps the existing look ── */
  const accent = dark ? SANDY : GOLD_LIGHT;
  const heading = dark ? '#ffffff' : '#1a1410';
  const body = dark ? 'rgba(255,255,255,0.90)' : 'rgba(28,20,10,0.76)';
  const bodyMuted = dark ? 'rgba(255,255,255,0.80)' : 'rgba(28,20,10,0.62)';
  const bodyFaint = dark ? 'rgba(255,255,255,0.38)' : 'rgba(28,20,10,0.42)';
  const ring = dark ? 'rgba(245,237,213,0.5)' : 'rgba(28,20,10,0.28)';
  const divider = dark ? 'rgba(245,237,213,0.25)' : 'rgba(28,20,10,0.14)';
  const dividerFaint = dark ? 'rgba(245,237,213,0.18)' : 'rgba(28,20,10,0.10)';
  const footerLink = dark ? 'rgba(245,237,213,0.45)' : 'rgba(28,20,10,0.45)';
  const footerText = dark ? 'rgba(255,255,255,0.25)' : 'rgba(28,20,10,0.35)';
  const logoSrc = dark ? '/images/pillarlogowhite.png' : '/images/pillarlogoblack.png';

  return (
    <>
      {/* Fixed background — two layers crossfade on toggle via CSS dark class */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      </div>

      <HomeNav dark={dark} onToggleDark={toggleDark} />

      <main className="min-h-screen" style={{ color: heading }}>

      {/* ── Hero ── */}
      <section className="relative flex items-center overflow-hidden lg:min-h-[84vh]">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-16 pt-28 pb-4 flex flex-col lg:flex-row items-center gap-10 lg:gap-20 xl:gap-28">
          <div className="flex-1 w-full max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.8rem] leading-[1.12] mb-5 lg:mb-7" style={{ color: heading }}>
              Tired of Endless<br />
              <span style={{ color: accent }}>Guest Calls?</span>
            </h1>
            <p className="text-lg lg:text-xl leading-snug italic mb-3" style={{ color: body }}>
              &ldquo;How does the{' '}
              <span className="inline-block overflow-hidden align-bottom" style={{ height: '1.4em', verticalAlign: 'bottom' }}>
                <span className="inline-grid whitespace-nowrap font-semibold">
                  {/* Invisible sizers — every amenity stacked in the same grid cell, so the
                      cell auto-sizes to whichever one actually renders widest (measured by
                      the browser, not guessed by character count) and the sentence never reflows. */}
                  {AMENITIES.map((a) => (
                    <span key={a} className="invisible" style={{ gridArea: '1 / 1' }}>{a}</span>
                  ))}
                  <span
                    key={amenityIndex}
                    className="amenity-drop-in"
                    style={{ gridArea: '1 / 1', justifySelf: 'center', color: accent }}
                  >
                    {AMENITIES[amenityIndex]}
                  </span>
                </span>
              </span>
              {' '}work?&rdquo;
            </p>
            <p className="text-lg lg:text-xl font-medium" style={{ color: heading }}>
              Pillar answers — so you don&apos;t have to.
            </p>
            <div className="mt-7 lg:mt-9 flex justify-center">
              <Link
                href="/manager/login"
                className="inline-flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.03]"
                style={{
                  height: 'clamp(42px,4.8vw,48px)', lineHeight: 1, boxSizing: 'border-box',
                  fontSize: 'clamp(12px,1.3vw,13px)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600,
                  color: '#3d2a0a',
                  background: 'linear-gradient(135deg, #F5EDD5 0%, #E3D3AC 55%, #CDB283 100%)',
                  padding: '0 clamp(24px,3vw,34px)',
                  borderRadius: 11, textDecoration: 'none',
                  boxShadow: dark ? '0 4px 24px rgba(245,237,213,0.25)' : '0 4px 20px rgba(122,90,30,0.22)',
                }}
              >
                Try Free Today
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 13, height: 13, flexShrink: 0 }}>
                  <path d="M9 5l7 7-7 7" stroke="#3d2a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-80 lg:max-w-87 xl:max-w-93" style={{ aspectRatio: '320/650' }}>
              {/* Desktop-only ambient glow — fills the dead space around the phone on wide screens; invisible on mobile */}
              <div
                aria-hidden
                className="hidden lg:block absolute -z-10"
                style={{
                  top: '-8%', left: '-35%', right: '-35%', bottom: '-8%',
                  background: `radial-gradient(60% 55% at 50% 45%, ${accent}26, transparent 70%)`,
                  filter: 'blur(40px)',
                }}
              />
              <HomeDemoWindow dark={dark} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: QR Instant Access ── */}
      <section className="pt-2 pb-6 lg:py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-16 flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-20">
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-[375px] lg:max-w-[430px] lg:drop-shadow-2xl" style={{ aspectRatio: '375/500', maskImage: 'linear-gradient(to left, transparent, black 6%)', WebkitMaskImage: 'linear-gradient(to left, transparent, black 6%)' }}>
              <Image
                src="/images/newbg2.png"
                alt="Guest scanning QR code to access property guide"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 lg:mb-7" style={{ color: heading }}>
              One Scan.<br />
              <span style={{ color: accent }}>Zero Questions.</span>
            </h2>
            <p className="text-sm lg:text-base leading-snug mb-2" style={{ color: bodyMuted }}>
              No Downloads, or Accounts needed.
            </p>
            <p className="text-lg lg:text-xl leading-snug" style={{ color: heading }}>
              Your guests get instant answers — so you don&apos;t have to.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${divider}, transparent)` }} />
      </div>

      {/* ── Section 3: Verification & Damage Claim Protection ── */}
      <section className="py-6 lg:py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-16 flex flex-col-reverse lg:flex-row-reverse items-center gap-6 lg:gap-20">
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-lg" style={{ height: 460 }}>
              <VerificationDemoWindow dark={dark} />
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 lg:mb-7" style={{ color: heading }}>
              Damage Claims.<br />
              <span style={{ color: accent }}>Finally Backed Up.</span>
            </h2>
            <p className="text-lg lg:text-xl leading-snug mb-2" style={{ color: heading }}>
              Cleaning photos, guest consent, and damage evidence — timestamped automatically and bundled into one report your platform can&apos;t wave away.
            </p>
            <p className="text-sm lg:text-base leading-snug" style={{ color: bodyMuted }}>
              Because a legitimate claim shouldn&apos;t cost you a five-star rating.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${divider}, transparent)` }} />
      </div>

      {/* ── Testimonials ── */}
      <section className="py-12 lg:py-20">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.45em] mb-10 lg:mb-14" style={{ color: accent }}>What Hosts Are Saying</p>

          <div style={{ overflow: 'hidden', minHeight: 140 }}>
            <div key={testimonialKey} className="testimonial-slide-in">
              <p className="text-base lg:text-lg leading-relaxed mb-7" style={{ color: bodyMuted, fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-sm font-medium" style={{ color: body }}>{t.name}</p>
              <p className="text-xs mt-1" style={{ color: bodyFaint }}>{t.role}</p>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setTestimonialIndex(i); setTestimonialKey(k => k + 1); }}
                aria-label={`Go to testimonial ${i + 1}`}
                style={{
                  width: i === testimonialIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === testimonialIndex ? accent : dividerFaint,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.35s ease, background 0.35s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${divider}, transparent)` }} />
      </div>

      {/* ── Contact ── */}
      <section className="py-8 lg:py-16">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 text-center">
          <p className="text-[10px] lg:text-xs uppercase tracking-[0.45em] mb-5 lg:mb-6" style={{ color: accent }}>
            Contact
          </p>
          <a
            href="mailto:support@pmpillar.com"
            className="text-base lg:text-xl tracking-wide transition-all duration-300 hover:opacity-70 break-all"
            style={{ color: accent, borderBottom: `1px solid ${ring}` }}
          >
            support@pmpillar.com
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-10 pb-12 lg:pt-12 lg:pb-16">
        {/* Divider */}
        <div className="max-w-7xl mx-auto px-8 lg:px-16 mb-10 lg:mb-12">
          <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${dividerFaint}, transparent)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col items-center gap-8">
          {/* Logo + tagline */}
          <Image
            src={logoSrc}
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
                style={{ color: footerLink }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: footerText }}>
            &copy; 2026 Pillar. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}
