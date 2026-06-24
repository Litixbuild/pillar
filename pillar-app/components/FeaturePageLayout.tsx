'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomeNav from './HomeNav';

const SANDY = '#F5EDD5';
const GOLD_LIGHT = '#7A5A1E';
const THEME_KEY = 'pillar-theme';

/* ── Shared dark-mode detector — these helper components render outside FeaturePageLayout's
   own render tree (as page-level siblings passed in as children), so each reads the toggle
   independently rather than via prop-threading, matching the pattern used elsewhere in the app. ── */
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

function theme(dark: boolean) {
  return {
    accent: dark ? SANDY : GOLD_LIGHT,
    heading: dark ? '#ffffff' : '#1a1410',
    body: dark ? 'rgba(255,255,255,0.90)' : 'rgba(28,20,10,0.76)',
    bodyMuted: dark ? 'rgba(255,255,255,0.72)' : 'rgba(28,20,10,0.62)',
    bodyFaint: dark ? 'rgba(255,255,255,0.50)' : 'rgba(28,20,10,0.50)',
    ring: dark ? 'rgba(245,237,213,0.40)' : 'rgba(28,20,10,0.28)',
    cardBorder: dark ? 'rgba(245,237,213,0.08)' : 'rgba(28,20,10,0.10)',
    cardBg: dark ? 'rgba(245,237,213,0.03)' : 'rgba(28,20,10,0.025)',
    divider: dark ? 'rgba(245,237,213,0.14)' : 'rgba(28,20,10,0.12)',
    footerDivider: dark ? 'rgba(245,237,213,0.16)' : 'rgba(28,20,10,0.12)',
    footerLink: dark ? 'rgba(245,237,213,0.40)' : 'rgba(28,20,10,0.45)',
    footerText: dark ? 'rgba(255,255,255,0.22)' : 'rgba(28,20,10,0.35)',
  };
}

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

  const t = theme(dark);
  const logoSrc = dark ? '/images/pillarlogowhite.png' : '/images/pillarlogoblack.png';

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100"
          style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0"
          style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      </div>

      <HomeNav dark={dark} onToggleDark={toggleDark} />

      <main style={{ minHeight: '100vh', color: t.heading, paddingTop: 64 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ paddingTop: 48, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${t.footerDivider}, transparent)`, marginBottom: 40 }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <Image src={logoSrc} alt="Pillar" width={72} height={48} style={{ objectFit: 'contain', opacity: 0.22 }} />
            <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 24px' }}>
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/refund', label: 'Refund Policy' },
                { href: '/cookies', label: 'Cookie Policy' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.20em', color: t.footerLink, textDecoration: 'none', transition: 'opacity 0.2s' }}>
                  {label}
                </Link>
              ))}
            </nav>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.25em', color: t.footerText }}>
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
  const dark = useDark();
  const t = theme(dark);
  const glow = dark ? 'rgba(245,237,213,0.12)' : 'rgba(122,90,30,0.14)';
  return (
    <section style={{ position: 'relative', padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 64px)', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
      <div aria-hidden className="pf-glow" style={{ position: 'absolute', top: '-10%', left: '20%', right: '20%', bottom: '10%', background: `radial-gradient(55% 60% at 50% 35%, ${glow}, transparent 70%)`, filter: 'blur(40px)', zIndex: -1 }} />
      <p style={{ fontSize: 10, letterSpacing: '0.40em', textTransform: 'uppercase', color: t.accent, marginBottom: 20 }}>{eyebrow}</p>
      <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 400, lineHeight: 1.12, color: t.heading, marginBottom: 20 }}>
        {title}<br /><span style={{ color: t.accent }}>{titleAccent}</span>
      </h1>
      <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: t.bodyMuted, maxWidth: 600, margin: '0 auto', marginBottom: cta ? 36 : 0 }}>
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

/* ── Plain portrait image — PNGs that already have a phone frame baked in ── */
function PortraitImage({ src, width = 'min(380px, 80vw)', alt = 'Pillar guest portal screenshot' }: { src: string; width?: string; alt?: string }) {
  return <img src={src} alt={alt} style={{ width, height: 'auto', display: 'block' }} />;
}

/* ── CSS phone frame — wraps raw screenshots/videos that have no frame baked in ── */
function PhoneFrame({ src, alt = 'Pillar app screenshot' }: { src: string; alt?: string }) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  return (
    <div style={{
      position: 'relative',
      width: 'min(260px, 62vw)',
      borderRadius: 'min(40px, 10vw)',
      border: '7px solid #1a1a1a',
      background: '#111',
      boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {isVideo
        ? <video src={src} autoPlay loop muted playsInline preload="auto" style={{ width: '100%', height: 'auto', display: 'block' }} />
        : <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
      }
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: '30%', height: 22, background: '#111', borderRadius: 20, zIndex: 3,
      }} />
    </div>
  );
}

export function ScreenshotPlaceholder({ label, aspect = '16/9', src, phone }: {
  label?: string; aspect?: string; src?: string; phone?: boolean;
}) {
  const dark = useDark();
  const t = theme(dark);
  if (src && phone) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(16px, 4vw, 40px) 0' }}>
        <PhoneFrame src={src} alt={label ?? 'Pillar app screenshot'} />
      </div>
    );
  }
  if (src) {
    const isVideo = src.endsWith('.webm') || src.endsWith('.mp4') || src.endsWith('.mov');
    const base: React.CSSProperties = { width: '100%', height: 'auto', display: 'block', borderRadius: 16, maxHeight: '72vh' };
    if (isVideo) return <video src={src} autoPlay loop muted playsInline style={base}><source src={src} type="video/mp4" /></video>;
    return <img src={src} alt={label ?? 'Screenshot'} style={{ ...base, objectFit: 'contain', objectPosition: 'top' }} />;
  }
  return (
    <div style={{
      width: '100%', aspectRatio: aspect, borderRadius: 16,
      border: `1px solid ${t.cardBorder}`,
      background: t.cardBg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color: t.bodyFaint }}>
        <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.bodyFaint }}>
        {label ?? 'Screenshot Preview'}
      </p>
    </div>
  );
}

/* ── One or two portrait screenshots for full-width hero sections ── */
export function PhoneHero({ left, right, leftAlt, rightAlt }: { left: string; right?: string; leftAlt?: string; rightAlt?: string }) {
  const imgWidth = right ? 'min(300px, 42vw)' : 'min(420px, 72vw)';
  const deriveAlt = (src: string) => src.split('/').pop()?.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') ?? 'Pillar app screenshot';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 32px)', padding: 'clamp(16px, 4vw, 40px) 0' }}>
      <div style={{ transform: 'translateY(20px) rotate(-4deg)', transformOrigin: 'bottom center' }}>
        <PortraitImage src={left} width={imgWidth} alt={leftAlt ?? deriveAlt(left)} />
      </div>
      {right && (
        <div style={{ transform: 'translateY(-8px) rotate(3deg)', transformOrigin: 'bottom center' }}>
          <PortraitImage src={right} width={imgWidth} alt={rightAlt ?? deriveAlt(right)} />
        </div>
      )}
    </div>
  );
}

export function Divider() {
  const dark = useDark();
  const t = theme(dark);
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
      <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${t.divider}, transparent)` }} />
    </div>
  );
}

export function FeatureGrid({ features }: { features: { icon: React.ReactNode; title: string; desc: string }[] }) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
      <div className="pf-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="pf-card-hover" style={{ padding: '24px 22px', borderRadius: 14, border: `1px solid ${t.cardBorder}`, background: t.cardBg }}>
            <div style={{ color: t.accent, marginBottom: 14 }}>{icon}</div>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: t.heading, marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 12.5, color: t.bodyFaint, lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SplitSection({ eyebrow, title, titleAccent, body, screenshotLabel, screenshotSrc, reverse, hideScreenshot, phoneScreenshot }: {
  eyebrow: string; title: string; titleAccent: string; body: string[]; screenshotLabel?: string; screenshotSrc?: string; reverse?: boolean; hideScreenshot?: boolean; phoneScreenshot?: boolean;
}) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', alignItems: 'center', gap: 'clamp(32px, 5vw, 72px)', flexWrap: 'wrap' }}>
        <div className={hideScreenshot ? undefined : 'pf-split-text'} style={{ flex: hideScreenshot ? '1 1 100%' : '1 1 300px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: t.accent, marginBottom: 16 }}>{eyebrow}</p>
          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: t.heading, marginBottom: 20 }}>
            {title}<br /><span style={{ color: t.accent }}>{titleAccent}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: hideScreenshot ? 720 : undefined }}>
            {body.map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${t.ring}`, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
                </div>
                <p style={{ fontSize: 13.5, color: t.bodyMuted, lineHeight: 1.6 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
        {!hideScreenshot && (
          <div className="pf-split-shot" style={{ flex: '1 1 300px', width: '100%', ...({ '--pf-shot-bg': t.cardBg, '--pf-shot-border': t.cardBorder } as React.CSSProperties) }}>
            <ScreenshotPlaceholder label={screenshotLabel} src={screenshotSrc} aspect="4/3" phone={phoneScreenshot} />
          </div>
        )}
      </div>
    </section>
  );
}

export function FAQSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  const dark = useDark();
  const t = theme(dark);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: t.accent, marginBottom: 16, textAlign: 'center' }}>FAQ</p>
      <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400, color: t.heading, textAlign: 'center', marginBottom: 40, lineHeight: 1.2 }}>
        Common Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map(({ q, a }, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '20px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 500, color: t.heading, lineHeight: 1.4 }}>{q}</span>
              <span style={{ fontSize: 22, color: t.accent, flexShrink: 0, display: 'inline-block', transform: openIndex === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
            </button>
            {openIndex === i && (
              <p style={{ fontSize: 13.5, color: t.bodyMuted, lineHeight: 1.72, paddingBottom: 20, marginTop: -4 }}>{a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CTASection({ title, subtitle, buttonText, buttonHref }: { title: string; subtitle: string; buttonText: string; buttonHref: string }) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(60px, 8vw, 96px) clamp(16px, 4vw, 40px)', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, color: t.heading, marginBottom: 16, lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ fontSize: 16, color: t.bodyMuted, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>{subtitle}</p>
      <Link href={buttonHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '13px 32px', borderRadius: 10, textDecoration: 'none' }}>
        {buttonText}
      </Link>
    </section>
  );
}

/* ── "Explore the Platform" link grid — identical pattern reused across solutions pages ── */
export function ExploreLinksSection({ eyebrow = 'Explore the Platform', links }: {
  eyebrow?: string; links: { href: string; label: string; desc: string }[];
}) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: t.accent, marginBottom: 20, textAlign: 'center' }}>{eyebrow}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {links.map(({ href, label, desc }) => (
          <a key={href} href={href} className="pf-card-hover" style={{ padding: '18px', borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.cardBg, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: t.heading, margin: 0 }}>{label}</p>
            <p style={{ fontSize: 12, color: t.bodyFaint, margin: 0 }}>{desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }}>
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Pricing cards — base plan + additional-property add-on, side by side ── */
export function PricingCardsSection({ basePlan, addonPlan }: {
  basePlan: { label: string; price: string; priceUnit: string; description: string; features: string[]; ctaText: string; ctaHref: string };
  addonPlan: { label: string; price: string; priceUnit: string; description: string; exampleRows: [string, string][]; ctaText: string; ctaHref: string };
}) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* Base plan */}
        <div className="pf-card-hover" style={{ padding: '36px 32px', borderRadius: 18, border: '1px solid rgba(212,175,106,0.30)', background: 'rgba(212,175,106,0.05)', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.30em', textTransform: 'uppercase', color: '#D4AF6A', marginBottom: 12 }}>{basePlan.label}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 52, fontWeight: 300, lineHeight: 1, color: t.heading }}>{basePlan.price}</span>
            <span style={{ fontSize: 13, color: t.bodyFaint, paddingBottom: 8 }}>{basePlan.priceUnit}</span>
          </div>
          <p style={{ fontSize: 13, color: t.bodyFaint, marginBottom: 32, lineHeight: 1.6 }}>{basePlan.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36, flex: 1 }}>
            {basePlan.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckIcon color="#D4AF6A" />
                <span style={{ fontSize: 13, color: t.bodyMuted, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
          <Link href={basePlan.ctaHref}
            style={{ display: 'block', textAlign: 'center', padding: '13px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, borderRadius: 10, textDecoration: 'none' }}>
            {basePlan.ctaText}
          </Link>
        </div>

        {/* Additional properties */}
        <div className="pf-card-hover" style={{ padding: '36px 32px', borderRadius: 18, border: `1px solid ${t.cardBorder}`, background: t.cardBg, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.30em', textTransform: 'uppercase', color: '#D4AF6A', marginBottom: 12 }}>{addonPlan.label}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 52, fontWeight: 300, lineHeight: 1, color: t.heading }}>{addonPlan.price}</span>
            <span style={{ fontSize: 13, color: t.bodyFaint, paddingBottom: 8 }}>{addonPlan.priceUnit}</span>
          </div>
          <p style={{ fontSize: 13, color: t.bodyFaint, marginBottom: 32, lineHeight: 1.6 }}>{addonPlan.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div style={{ padding: '20px', borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.cardBg }}>
              <p style={{ fontSize: 11, color: t.bodyFaint, marginBottom: 12, letterSpacing: '0.06em' }}>Example portfolio cost</p>
              {addonPlan.exampleRows.map(([label, cost]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${t.cardBorder}` }}>
                  <span style={{ fontSize: 13, color: t.bodyMuted }}>{label}</span>
                  <span style={{ fontSize: 13, color: t.heading, fontWeight: 500 }}>{cost}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 32 }}>
            <Link href={addonPlan.ctaHref}
              style={{ display: 'block', textAlign: 'center', padding: '13px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: t.heading, background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 10, textDecoration: 'none' }}>
              {addonPlan.ctaText}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Numbered steps block (e.g. referral "how it works") ── */
export function StepsSection({ eyebrow, title, titleAccent, intro, steps }: {
  eyebrow: string; title: string; titleAccent: string; intro: string; steps: { step: string; label: string; desc: string }[];
}) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section id="referral" style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: t.accent, marginBottom: 18 }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: t.heading, marginBottom: 18 }}>
        {title}<br /><span style={{ color: t.accent }}>{titleAccent}</span>
      </h2>
      <p style={{ fontSize: 15, color: t.bodyMuted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>{intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, maxWidth: 640, margin: '0 auto' }}>
        {steps.map(({ step, label, desc }) => (
          <div key={step} className="pf-card-hover" style={{ padding: '22px 20px', borderRadius: 14, border: `1px solid ${t.cardBorder}`, background: t.cardBg, textAlign: 'left' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.25em', color: t.accent, marginBottom: 10 }}>{step}</p>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: t.heading, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 12, color: t.bodyFaint, lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── "Sound familiar?" pain-point block ── */
export function PainPointsSection({ eyebrow, title, points }: {
  eyebrow: string; title: React.ReactNode; points: string[];
}) {
  const dark = useDark();
  const t = theme(dark);
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: t.accent, marginBottom: 20 }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, lineHeight: 1.2, color: t.heading, marginBottom: 36 }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
        {points.map(q => (
          <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 14, color: t.bodyFaint, flexShrink: 0 }}>✕</span>
            <p style={{ fontSize: 14, color: t.bodyMuted, fontStyle: 'italic' }}>{q}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
