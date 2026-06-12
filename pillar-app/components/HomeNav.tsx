'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SANDY = '#F5EDD5';
const GOLD  = '#D4AF6A';

/* ── Icons ── */
function SunIcon()  { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function QRIcon()   { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="5.5" y="5.5" width="2" height="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="16.5" y="5.5" width="2" height="2" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="5.5" y="16.5" width="2" height="2" fill="currentColor"/><path d="M14 14h2v2h-2zM18 14h3M18 16v2h3M14 18v3h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SparkleIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>; }
function BookIcon()    { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function WrenchIcon()  { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ClockIcon()   { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

const PLATFORM = [
  { Icon: QRIcon,      title: 'QR Guest Portal',  desc: 'One scan. Everything they need.',      href: '/platform/qr-portal',       tag: 'Core'    },
  { Icon: SparkleIcon, title: 'AI Concierge',      desc: '24/7 personalised hospitality.',      href: '/platform/ai-concierge',    tag: 'AI'      },
  { Icon: BookIcon,    title: 'Property Guides',   desc: 'WiFi, codes, rules — one place.',     href: '/platform/property-guides', tag: 'Content' },
  { Icon: WrenchIcon,  title: 'Work Orders',       desc: 'Maintenance with auto routing.',      href: '/platform/work-orders',     tag: 'Ops'     },
  { Icon: ClockIcon,   title: 'Late Checkout',     desc: 'Flexible departures, zero friction.', href: '/platform/late-checkout',   tag: 'Guest'   },
];

const SOLUTIONS = [
  { label: 'Airbnb Hosts',                  desc: 'Turn one-time guests into repeat bookings.',   href: '/solutions/airbnb-hosts'     },
  { label: 'Vacation Rental Managers',      desc: 'Scale your portfolio without the overhead.',   href: '/solutions/vacation-rentals' },
  { label: 'Residential Property Managers', desc: 'Modern tools for modern landlords.',           href: '/solutions/residential'      },
  { label: 'Hotels',                        desc: 'Enterprise-grade hospitality for every room.', href: '/solutions/hotels'           },
];

/* ── Theme tokens — passed down so every panel respects light/dark ── */
type Theme = {
  panelBg:    string;
  panelBorder:string;
  heading:    string;
  body:       string;
  muted:      string;
  cardBorder: string;
  cardHoverBorder: string;
  cardBg:     string;
  cardHoverBg:string;
  cardFeatBorder: string;
  cardFeatHoverBorder: string;
  cardFeatBg: string;
  cardFeatHoverBg: string;
};

function mkTheme(dark: boolean): Theme {
  if (dark) return {
    panelBg:    'rgba(13,11,8,0.97)',
    panelBorder:'rgba(245,237,213,0.07)',
    heading:    'rgba(245,237,213,0.38)',
    body:       'rgba(255,255,255,0.92)',
    muted:      'rgba(255,255,255,0.46)',
    cardBorder: 'rgba(245,237,213,0.08)',
    cardHoverBorder: 'rgba(245,237,213,0.22)',
    cardBg:     'rgba(245,237,213,0.03)',
    cardHoverBg:'rgba(245,237,213,0.08)',
    cardFeatBorder: 'rgba(212,175,106,0.20)',
    cardFeatHoverBorder: 'rgba(212,175,106,0.40)',
    cardFeatBg: 'rgba(212,175,106,0.04)',
    cardFeatHoverBg: 'rgba(212,175,106,0.10)',
  };
  return {
    panelBg:    'rgba(250,247,241,0.98)',
    panelBorder:'rgba(44,34,20,0.09)',
    heading:    'rgba(44,34,20,0.42)',
    body:       'rgba(28,20,10,0.90)',
    muted:      'rgba(44,34,20,0.52)',
    cardBorder: 'rgba(44,34,20,0.08)',
    cardHoverBorder: 'rgba(44,34,20,0.20)',
    cardBg:     'rgba(44,34,20,0.02)',
    cardHoverBg:'rgba(44,34,20,0.06)',
    cardFeatBorder: 'rgba(180,140,60,0.25)',
    cardFeatHoverBorder: 'rgba(180,140,60,0.45)',
    cardFeatBg: 'rgba(180,140,60,0.05)',
    cardFeatHoverBg: 'rgba(180,140,60,0.11)',
  };
}

/* ── Dropdown card ── */
function DropdownCard({ href, onClose, children, featured, t }: {
  href: string; onClose: () => void; children: React.ReactNode; featured?: boolean; t: Theme;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={href} onClick={onClose} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: '16px 18px', borderRadius: 12, height: '100%', boxSizing: 'border-box',
          border: `1px solid ${hov ? (featured ? t.cardFeatHoverBorder : t.cardHoverBorder) : (featured ? t.cardFeatBorder : t.cardBorder)}`,
          background: hov ? (featured ? t.cardFeatHoverBg : t.cardHoverBg) : (featured ? t.cardFeatBg : t.cardBg),
          transition: 'border-color 0.18s, background 0.18s',
          cursor: 'pointer',
        }}
      >
        {children}
      </div>
    </Link>
  );
}

/* ── Main export ── */
export default function HomeNav({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [scrolled, setScrolled]             = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const t = mkTheme(dark);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdown when clicking outside the nav */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasOverlay = scrolled || !!activeDropdown;

  /* Header bg adapts to theme */
  const headerBg = hasOverlay
    ? (dark ? 'rgba(13,11,8,0.92)' : 'rgba(250,247,241,0.92)')
    : 'transparent';
  const headerBorder = hasOverlay
    ? (dark ? '1px solid rgba(245,237,213,0.07)' : '1px solid rgba(44,34,20,0.09)')
    : '1px solid transparent';

  const toggle = (name: string) =>
    setActiveDropdown(prev => prev === name ? null : name);

  /* Nav button style — adapts to theme + active state */
  const navBtn = (name: string): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 'clamp(9px, 1.2vw, 11px)',
    letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
    color: activeDropdown === name
      ? (dark ? SANDY : '#2C2C2C')
      : (dark ? 'rgba(255,255,255,0.72)' : 'rgba(44,34,20,0.65)'),
    padding: 'clamp(4px,0.6vw,6px) clamp(6px,1vw,12px)',
    borderRadius: 6,
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <header
      ref={headerRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: headerBg,
        backdropFilter: hasOverlay ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: hasOverlay ? 'blur(20px)' : 'none',
        borderBottom: headerBorder,
        transition: 'background 0.35s ease, border-color 0.3s ease',
      }}
    >
      {/* ── Single row — everything always visible, spread across full width ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 'clamp(52px, 7vw, 64px)',
        padding: '0 clamp(12px, 3.5vw, 48px)',
        gap: 8,
        minWidth: 0,
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image
            src="/images/pillarlogowhite.png"
            alt="Pillar"
            width={52} height={35} priority
            style={{
              objectFit: 'contain',
              width: 'auto',
              height: 'clamp(20px, 3.2vw, 26px)',
              filter: dark ? 'none' : 'invert(1) sepia(0.2) brightness(0.25)',
            }}
          />
        </Link>

        {/* Centre nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button type="button" onClick={() => toggle('platform')}  style={navBtn('platform')}>Platform</button>
          <button type="button" onClick={() => toggle('solutions')} style={navBtn('solutions')}>Solutions</button>
          <button type="button" onClick={() => toggle('pricing')}   style={navBtn('pricing')}>Pricing</button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 'clamp(28px,3.5vw,34px)', height: 'clamp(28px,3.5vw,34px)',
              borderRadius: 8, flexShrink: 0,
              border: dark ? '1px solid rgba(245,237,213,0.22)' : '1px solid rgba(44,34,20,0.18)',
              background: dark ? 'rgba(245,237,213,0.07)' : 'rgba(44,34,20,0.06)',
              color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(44,34,20,0.70)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Sign In / Sign Up */}
          <Link
            href="/manager/login"
            style={{
              display: 'flex', alignItems: 'center',
              height: 'clamp(28px,3.5vw,34px)',
              padding: '0 clamp(10px,1.8vw,16px)',
              fontSize: 'clamp(8px,1.1vw,10px)',
              letterSpacing: '0.13em', textTransform: 'uppercase',
              fontWeight: 600,
              color: dark ? '#1a1410' : '#fff',
              background: dark ? SANDY : '#2C2C2C',
              borderRadius: 8, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>

      {/* ── Dropdown panels ── */}
      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 99 }}>

        {/* Platform */}
        <div style={{
          overflow: 'hidden',
          maxHeight: activeDropdown === 'platform' ? 500 : 0,
          opacity: activeDropdown === 'platform' ? 1 : 0,
          transition: 'max-height 0.36s cubic-bezier(0.4,0,0.2,1), opacity 0.24s ease',
          background: t.panelBg,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: activeDropdown === 'platform' ? `1px solid ${t.panelBorder}` : 'none',
          boxShadow: activeDropdown === 'platform' ? '0 12px 40px rgba(0,0,0,0.12)' : 'none',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px clamp(16px,4vw,40px) 32px' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: t.heading, marginBottom: 20 }}>Platform Features</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {PLATFORM.map(({ Icon, title, desc, href, tag }) => (
                <DropdownCard key={href} href={href} onClose={() => setActiveDropdown(null)} t={t}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ color: GOLD }}><Icon /></div>
                    <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(212,175,106,0.80)', background: 'rgba(212,175,106,0.12)', padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap' }}>{tag}</span>
                  </div>
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: t.body, marginBottom: 5, lineHeight: 1.35 }}>{title}</p>
                  <p style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.55 }}>{desc}</p>
                </DropdownCard>
              ))}
            </div>
          </div>
        </div>

        {/* Solutions */}
        <div style={{
          overflow: 'hidden',
          maxHeight: activeDropdown === 'solutions' ? 380 : 0,
          opacity: activeDropdown === 'solutions' ? 1 : 0,
          transition: 'max-height 0.36s cubic-bezier(0.4,0,0.2,1), opacity 0.24s ease',
          background: t.panelBg,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: activeDropdown === 'solutions' ? `1px solid ${t.panelBorder}` : 'none',
          boxShadow: activeDropdown === 'solutions' ? '0 12px 40px rgba(0,0,0,0.12)' : 'none',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px clamp(16px,4vw,40px) 32px' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: t.heading, marginBottom: 20 }}>Who We Help</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {SOLUTIONS.map(({ label, desc, href }) => (
                <DropdownCard key={href} href={href} onClose={() => setActiveDropdown(null)} t={t}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: t.body, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.55, marginBottom: 14 }}>{desc}</p>
                  <p style={{ fontSize: 11, color: GOLD, letterSpacing: '0.05em' }}>Learn more →</p>
                </DropdownCard>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{
          overflow: 'hidden',
          maxHeight: activeDropdown === 'pricing' ? 300 : 0,
          opacity: activeDropdown === 'pricing' ? 1 : 0,
          transition: 'max-height 0.36s cubic-bezier(0.4,0,0.2,1), opacity 0.24s ease',
          background: t.panelBg,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: activeDropdown === 'pricing' ? `1px solid ${t.panelBorder}` : 'none',
          boxShadow: activeDropdown === 'pricing' ? '0 12px 40px rgba(0,0,0,0.12)' : 'none',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px clamp(16px,4vw,40px) 32px' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: t.heading, marginBottom: 20 }}>Pricing</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              <DropdownCard href="/pricing" onClose={() => setActiveDropdown(null)} featured t={t}>
                <p style={{ fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>Base Plan</p>
                <p style={{ fontSize: 28, fontWeight: 300, color: t.body, lineHeight: 1, marginBottom: 4 }}>
                  $14.99<span style={{ fontSize: 13, color: t.muted, fontWeight: 400 }}>/mo</span>
                </p>
                <p style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.55, marginTop: 10 }}>Full platform for your first property. Every feature included.</p>
              </DropdownCard>
              <DropdownCard href="/pricing" onClose={() => setActiveDropdown(null)} t={t}>
                <p style={{ fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>Additional Properties</p>
                <p style={{ fontSize: 28, fontWeight: 300, color: t.body, lineHeight: 1, marginBottom: 4 }}>
                  $9.99<span style={{ fontSize: 13, color: t.muted, fontWeight: 400 }}>/mo each</span>
                </p>
                <p style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.55, marginTop: 10 }}>Scale your portfolio at a reduced rate per property.</p>
              </DropdownCard>
              <DropdownCard href="/pricing#referral" onClose={() => setActiveDropdown(null)} t={t}>
                <p style={{ fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD, marginBottom: 10 }}>Referral Program</p>
                <p style={{ fontSize: 22, fontWeight: 300, color: t.body, lineHeight: 1.2, marginBottom: 4 }}>Earn Credits</p>
                <p style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.55, marginTop: 10 }}>Refer a host and earn account credits when they subscribe.</p>
              </DropdownCard>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
