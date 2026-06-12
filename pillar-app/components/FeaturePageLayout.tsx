'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomeNav from './HomeNav';

const SANDY = '#F5EDD5';
const THEME_KEY = 'pillar-theme';

export default function FeaturePageLayout({ children }: { children: React.ReactNode }) {
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
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100"
          style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0"
          style={{ backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      </div>

      <HomeNav dark={dark} onToggleDark={toggleDark} />

      <main style={{ minHeight: '100vh', color: '#fff', paddingTop: 64 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ paddingTop: 48, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(245,237,213,0.16), transparent)', marginBottom: 40 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <Image src="/images/pillarlogowhite.png" alt="Pillar" width={72} height={48} style={{ objectFit: 'contain', opacity: 0.22 }} />
            <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 24px' }}>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/refund', label: 'Refund Policy' },
                { href: '/cookies', label: 'Cookie Policy' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.20em', color: 'rgba(245,237,213,0.40)', textDecoration: 'none', transition: 'opacity 0.2s' }}>
                  {label}
                </Link>
              ))}
            </nav>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.22)' }}>
              © 2026 Pillar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ── Shared page building blocks ── */

export function PageHero({ eyebrow, title, titleAccent, subtitle, cta, ctaHref }: {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 64px)', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.40em', textTransform: 'uppercase', color: SANDY, marginBottom: 20 }}>{eyebrow}</p>
      <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 400, lineHeight: 1.12, color: '#fff', marginBottom: 20 }}>
        {title}<br /><span style={{ color: SANDY }}>{titleAccent}</span>
      </h1>
      <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', maxWidth: 600, margin: '0 auto', marginBottom: cta ? 36 : 0 }}>
        {subtitle}
      </p>
      {cta && ctaHref && (
        <Link href={ctaHref}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>
          {cta}
        </Link>
      )}
    </section>
  );
}

export function ScreenshotPlaceholder({ label, aspect = '16/9' }: { label?: string; aspect?: string }) {
  return (
    <div style={{
      width: '100%', aspectRatio: aspect, borderRadius: 16,
      border: '1px solid rgba(245,237,213,0.12)',
      background: 'rgba(245,237,213,0.03)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color: 'rgba(245,237,213,0.22)' }}>
        <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(245,237,213,0.28)' }}>
        {label ?? 'Screenshot Preview'}
      </p>
    </div>
  );
}

export function Divider() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(245,237,213,0.14), transparent)' }} />
    </div>
  );
}

export function FeatureGrid({ features }: { features: { icon: React.ReactNode; title: string; desc: string }[] }) {
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} style={{ padding: '24px 22px', borderRadius: 14, border: '1px solid rgba(245,237,213,0.08)', background: 'rgba(245,237,213,0.03)' }}>
            <div style={{ color: '#D4AF6A', marginBottom: 14 }}>{icon}</div>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.92)', marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SplitSection({ eyebrow, title, titleAccent, body, screenshotLabel, reverse }: {
  eyebrow: string; title: string; titleAccent: string; body: string[]; screenshotLabel?: string; reverse?: boolean;
}) {
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap: 'clamp(32px, 5vw, 72px)', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: SANDY, marginBottom: 16 }}>{eyebrow}</p>
          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: '#fff', marginBottom: 20 }}>
            {title}<br /><span style={{ color: SANDY }}>{titleAccent}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {body.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(245,237,213,0.40)', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: SANDY }} />
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <ScreenshotPlaceholder label={screenshotLabel} aspect="4/3" />
        </div>
      </div>
    </section>
  );
}

export function CTASection({ title, subtitle, buttonText, buttonHref }: { title: string; subtitle: string; buttonText: string; buttonHref: string }) {
  return (
    <section style={{ padding: 'clamp(60px, 8vw, 96px) clamp(16px, 4vw, 40px)', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.60)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>{subtitle}</p>
      <Link href={buttonHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '13px 32px', borderRadius: 10, textDecoration: 'none' }}>
        {buttonText}
      </Link>
    </section>
  );
}
