'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const GOLD = '#D4AF6A';

/* ── Icons ── */
function SunIcon()  { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function QRIcon()      { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="5.5" y="5.5" width="2" height="2" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="16.5" y="5.5" width="2" height="2" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="5.5" y="16.5" width="2" height="2" fill="currentColor"/><path d="M14 14h2v2h-2zM18 14h3M18 16v2h3M14 18v3h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SparkleIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>; }
function BookIcon()    { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function WrenchIcon()  { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ClockIcon()   { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 17, height: 17 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function MenuLinesIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>; }
function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PLATFORM = [
  { Icon: QRIcon,      title: 'QR Guest Portal',  href: '/platform/qr-portal'       },
  { Icon: SparkleIcon, title: 'AI Concierge',      href: '/platform/ai-concierge'    },
  { Icon: BookIcon,    title: 'Property Guides',   href: '/platform/property-guides' },
  { Icon: WrenchIcon,  title: 'Work Orders',       href: '/platform/work-orders'     },
  { Icon: ClockIcon,   title: 'Late Checkout',     href: '/platform/late-checkout'   },
];

const SOLUTIONS = [
  { label: 'Rental Hosts',           href: '/solutions/airbnb-hosts'     },
  { label: 'Vacation Rentals',       href: '/solutions/vacation-rentals' },
  { label: 'Residential Properties', href: '/solutions/residential'      },
  { label: 'Hotels',                 href: '/solutions/hotels'           },
];

/* ── Theme token set ── */
type T = {
  panelBg: string; panelBorder: string; label: string;
  body: string; muted: string;
  rowHoverBg: string;
};

function mkTheme(dark: boolean): T {
  return dark ? {
    panelBg: 'rgba(13,11,8,0.97)',     panelBorder: 'rgba(245,237,213,0.07)',
    label: 'rgba(245,237,213,0.38)',   body: 'rgba(255,255,255,0.92)',
    muted: 'rgba(255,255,255,0.46)',
    rowHoverBg: 'rgba(245,237,213,0.06)',
  } : {
    panelBg: 'rgba(250,247,241,0.98)', panelBorder: 'rgba(44,34,20,0.09)',
    label: 'rgba(44,34,20,0.40)',      body: 'rgba(28,20,10,0.90)',
    muted: 'rgba(44,34,20,0.52)',
    rowHoverBg: 'rgba(44,34,20,0.05)',
  };
}

/* ── Accordion row — label + chevron, expands in place to reveal its children ── */
function AccordionRow({ label, open, onToggle, t, children }: {
  label: string; open: boolean; onToggle: () => void; t: T; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${t.panelBorder}` }}>
      <button
        type="button" onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 4px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: t.body }}>{label}</span>
        <span style={{ color: t.muted }}><ChevronDownIcon open={open} /></span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 360 : 0, transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
      </div>
    </div>
  );
}

function MenuLinkRow({ href, onClose, icon, title, t }: {
  href: string; onClose: () => void; icon?: React.ReactNode; title: string; t: T;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href} onClick={onClose}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 8,
        textDecoration: 'none', background: hov ? t.rowHoverBg : 'transparent', transition: 'background 0.15s',
      }}
    >
      {icon && <span style={{ color: GOLD, flexShrink: 0, display: 'flex' }}>{icon}</span>}
      <span style={{ fontSize: 12.5, fontWeight: 500, color: t.body, flex: 1 }}>{title}</span>
    </Link>
  );
}

/* ── Main export ── */
export default function HomeNav({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<'product' | 'solutions' | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const t = mkTheme(dark);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setExpanded(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasOverlay = scrolled || menuOpen;
  const onLight = !dark; // light theme → use dark ink

  const headerBg     = hasOverlay ? (dark ? 'rgba(13,11,8,0.92)' : 'rgba(250,247,241,0.94)') : 'transparent';
  const headerBorder = hasOverlay ? (dark ? '1px solid rgba(245,237,213,0.07)' : '1px solid rgba(44,34,20,0.09)') : '1px solid transparent';
  const logoSrc       = dark ? '/images/pillarlogogoogle.png' : '/images/pillarlogogoogleblack.png';
  const iconColor      = onLight ? 'rgba(28,20,10,0.70)' : 'rgba(255,255,255,0.78)';
  const iconBorder     = onLight ? '1px solid rgba(44,34,20,0.18)' : '1px solid rgba(245,237,213,0.22)';
  const iconBg         = onLight ? 'rgba(44,34,20,0.06)' : 'rgba(245,237,213,0.08)';

  function closeAll() {
    setMenuOpen(false);
    setExpanded(null);
  }

  function toggleMenu() {
    setMenuOpen((o) => {
      if (o) setExpanded(null);
      return !o;
    });
  }

  const iconBtnStyle: React.CSSProperties = {
    width: 'clamp(28px,3.5vw,34px)', height: 'clamp(28px,3.5vw,34px)',
    borderRadius: 8, flexShrink: 0,
    border: iconBorder, background: iconBg, color: iconColor,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s', textDecoration: 'none',
  };

  /* Top-bar icons (sign-in, menu) — bigger, no border, more breathing room between them */
  const topBarIconStyle: React.CSSProperties = {
    width: 'clamp(34px,4.5vw,42px)', height: 'clamp(34px,4.5vw,42px)',
    flexShrink: 0,
    border: 'none', background: 'none', color: iconColor,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'opacity 0.2s', textDecoration: 'none',
  };

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
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 'clamp(72px,10vw,88px)',
        padding: '0 clamp(14px,3.5vw,48px)',
        gap: 8, minWidth: 0,
      }}>
        {/* Logo — half size */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Image
            src={logoSrc}
            alt="Pillar" width={80} height={54} priority
            style={{ objectFit: 'contain', width: 'auto', height: 'clamp(28px,4.5vw,40px)' }}
          />
        </Link>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button
            type="button" onClick={toggleMenu}
            aria-label="Menu" aria-expanded={menuOpen}
            style={topBarIconStyle}
          >
            <MenuLinesIcon />
          </button>
        </div>
      </div>

      {/* ── Consolidated dropdown ── */}
      <div
        style={{
          position: 'absolute', top: '100%', right: 0,
          width: 'min(248px, 88vw)', zIndex: 99,
          overflow: 'hidden',
          maxHeight: menuOpen ? 640 : 0,
          opacity: menuOpen ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease',
          background: t.panelBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16, border: `1px solid ${t.panelBorder}`,
          boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
        }}
      >
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Theme toggle — top right of the dropdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button" onClick={onToggleDark}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={iconBtnStyle}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <AccordionRow label="Product" open={expanded === 'product'} onToggle={() => setExpanded((e) => (e === 'product' ? null : 'product'))} t={t}>
            {PLATFORM.map(({ Icon, title, href }) => (
              <MenuLinkRow key={href} href={href} onClose={closeAll} icon={<Icon />} title={title} t={t} />
            ))}
          </AccordionRow>

          <AccordionRow label="Solutions" open={expanded === 'solutions'} onToggle={() => setExpanded((e) => (e === 'solutions' ? null : 'solutions'))} t={t}>
            {SOLUTIONS.map(({ label, href }) => (
              <MenuLinkRow key={href} href={href} onClose={closeAll} title={label} t={t} />
            ))}
          </AccordionRow>

          <Link
            href="/pricing" onClick={closeAll}
            style={{ display: 'block', padding: '13px 4px', fontSize: 13.5, fontWeight: 600, color: t.body, textDecoration: 'none' }}
          >
            Pricing
          </Link>
        </div>
      </div>
    </header>
  );
}
