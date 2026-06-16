'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import ChatConcierge from '@/components/ChatConcierge';
import CopyPasswordButton from './CopyPasswordButton';
import type { PropertyFields, ManagerLayoutItem, Property, AmenityWindow } from '@/lib/types';
import { AMENITY_ICONS_MAP } from '@/lib/amenityIcons';

const SANDY = '#F5EDD5';
const SANDY_RGB = '245,237,213';

/* ─── Icons ──────────────────────────────────────────────────── */

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

function ChevronDown({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperPlaneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M21 3L3.8 10.3c-.95.4-.9 1.78.08 2.12l6.55 2.24 2.24 6.55c.34.98 1.72 1.03 2.12.08L21 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M21 3L10.35 14.65" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Amenity icon colors ─────────────────────────────────────── */

const AMENITY_ICON_COLORS: Record<string, string> = {
  wifi: '#4A7EC7',
  key: '#3A8FA8',
  tv: '#6B5FB5',
  pool: '#2E8FAF',
  gym: '#2A9070',
  parking: '#5A7085',
  coffee: '#C06080',
  bed: '#7A5DAE',
  bath: '#3381A8',
  kitchen: '#B84C4C',
  laundry: '#3A9E7A',
  ac: '#2A9FAF',
  heat: '#C97030',
  fire: '#C05050',
  game: '#B84A8A',
  outdoor: '#3A8C55',
  garden: '#3A8C55',
  bike: '#6A9C2A',
  car: '#5A6B7A',
  music: '#7A4AAF',
  book: '#4A7AAA',
  pet: '#5A8A5A',
  baby: '#B85080',
  lock: '#5A5AAF',
  door: '#6A5AAA',
  note: '#2E7FAF',
  info: '#3A70B8',
  star: '#3A8FA8',
  bell: '#B84040',
  home: '#5050A0',
  phone: '#2A8A68',
  check: '#2A8A68',
  calendar: '#6A50A0',
};

const ICON_COLOR_PALETTE = [
  '#4A7EC7','#2A9070','#B8860B','#B84C4C','#6B5FB5',
  '#B84A8A','#2E8FAF','#C97030','#6A9C2A','#5A5AAF',
];

/* ─── Light-mode theme palettes ──────────────────────────────── */

interface LightTheme {
  accentRGB: string;
  headingColor: string;
  addressText: string;
  dividerFrom: string;
  buttonBg: string;
  buttonBorder: string;
  buttonShadow: string;
  iconBg: string;
  iconColor: string;
  titleText: string;
  subtitleText: string;
  chevronColor: string;
  toggleColor: string;
  whiteOverlayOpacity: number;
}

const DEFAULT_LIGHT: LightTheme = {
  accentRGB: '100,80,40',
  headingColor: '#1e293b',
  addressText: 'rgba(100,80,40,0.70)',
  dividerFrom: 'rgba(100,80,40,0.35)',
  buttonBg: 'rgba(255,255,255,0.82)',
  buttonBorder: 'rgba(0,0,0,0.07)',
  buttonShadow: '0 4px 20px rgba(0,0,0,0.08)',
  iconBg: 'rgba(100,80,40,0.08)',
  iconColor: 'rgba(100,80,40,0.75)',
  titleText: '#1e293b',
  subtitleText: 'rgba(100,80,40,0.55)',
  chevronColor: 'rgba(100,80,40,0.35)',
  toggleColor: 'rgba(30,41,59,0.40)',
  whiteOverlayOpacity: 1,
};

const LIGHT_THEMES: Record<string, LightTheme> = {
  // Azure — sky blue watercolor
  bg1: {
    accentRGB: '20,76,140',
    headingColor: '#0f2d5c',
    addressText: 'rgba(20,76,140,0.62)',
    dividerFrom: 'rgba(20,76,140,0.28)',
    buttonBg: 'rgba(235,244,255,0.88)',
    buttonBorder: 'rgba(20,76,140,0.14)',
    buttonShadow: '0 4px 20px rgba(20,76,140,0.09)',
    iconBg: 'rgba(20,76,140,0.10)',
    iconColor: '#144c8c',
    titleText: '#0f2d5c',
    subtitleText: 'rgba(20,76,140,0.62)',
    chevronColor: 'rgba(20,76,140,0.42)',
    toggleColor: 'rgba(20,76,140,0.45)',
    whiteOverlayOpacity: 0.55,
  },
  // Sage — sage green watercolor
  bg2: {
    accentRGB: '30,90,55',
    headingColor: '#0f2e1c',
    addressText: 'rgba(30,90,55,0.62)',
    dividerFrom: 'rgba(30,90,55,0.28)',
    buttonBg: 'rgba(235,248,240,0.88)',
    buttonBorder: 'rgba(30,90,55,0.14)',
    buttonShadow: '0 4px 20px rgba(30,90,55,0.09)',
    iconBg: 'rgba(30,90,55,0.10)',
    iconColor: '#1e5a37',
    titleText: '#0f2e1c',
    subtitleText: 'rgba(30,90,55,0.62)',
    chevronColor: 'rgba(30,90,55,0.42)',
    toggleColor: 'rgba(30,90,55,0.45)',
    whiteOverlayOpacity: 0.55,
  },
  // Ember — warm orange watercolor
  bg4: {
    accentRGB: '150,65,16',
    headingColor: '#3d1a05',
    addressText: 'rgba(150,65,16,0.62)',
    dividerFrom: 'rgba(150,65,16,0.28)',
    buttonBg: 'rgba(255,247,237,0.88)',
    buttonBorder: 'rgba(150,65,16,0.14)',
    buttonShadow: '0 4px 20px rgba(150,65,16,0.09)',
    iconBg: 'rgba(150,65,16,0.10)',
    iconColor: '#964110',
    titleText: '#3d1a05',
    subtitleText: 'rgba(150,65,16,0.62)',
    chevronColor: 'rgba(150,65,16,0.42)',
    toggleColor: 'rgba(150,65,16,0.45)',
    whiteOverlayOpacity: 0.60,
  },
  // Blush — soft pink watercolor
  bg5: {
    accentRGB: '155,40,85',
    headingColor: '#3d0d24',
    addressText: 'rgba(155,40,85,0.62)',
    dividerFrom: 'rgba(155,40,85,0.28)',
    buttonBg: 'rgba(255,241,247,0.88)',
    buttonBorder: 'rgba(155,40,85,0.14)',
    buttonShadow: '0 4px 20px rgba(155,40,85,0.09)',
    iconBg: 'rgba(155,40,85,0.10)',
    iconColor: '#9b2855',
    titleText: '#3d0d24',
    subtitleText: 'rgba(155,40,85,0.62)',
    chevronColor: 'rgba(155,40,85,0.42)',
    toggleColor: 'rgba(155,40,85,0.45)',
    whiteOverlayOpacity: 0.55,
  },
  // Sandstone — warm beige watercolor
  bg6: {
    accentRGB: '110,75,30',
    headingColor: '#2d1a08',
    addressText: 'rgba(110,75,30,0.65)',
    dividerFrom: 'rgba(110,75,30,0.30)',
    buttonBg: 'rgba(255,250,241,0.88)',
    buttonBorder: 'rgba(110,75,30,0.14)',
    buttonShadow: '0 4px 20px rgba(110,75,30,0.09)',
    iconBg: 'rgba(110,75,30,0.10)',
    iconColor: '#6e4b1e',
    titleText: '#2d1a08',
    subtitleText: 'rgba(110,75,30,0.65)',
    chevronColor: 'rgba(110,75,30,0.42)',
    toggleColor: 'rgba(110,75,30,0.45)',
    whiteOverlayOpacity: 0.58,
  },
};

const THEME_BG_KEYS = new Set(['bg1', 'bg2', 'bg4', 'bg5', 'bg6']);

function getIconColor(iconKey?: string): string {
  if (!iconKey) return '#6B7280';
  if (AMENITY_ICON_COLORS[iconKey]) return AMENITY_ICON_COLORS[iconKey];
  let hash = 0;
  for (let i = 0; i < iconKey.length; i++) hash = (hash * 31 + iconKey.charCodeAt(i)) | 0;
  return ICON_COLOR_PALETTE[Math.abs(hash) % ICON_COLOR_PALETTE.length];
}

/* ─── Amenity icon renderer ───────────────────────────────────── */

function AmenityIconSvg({ iconKey, className }: { iconKey?: string; className?: string }) {
  const def = iconKey ? AMENITY_ICONS_MAP[iconKey] : undefined;
  if (!def) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {def.paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ─── Primitive UI pieces ─────────────────────────────────────── */

function GradientButton({
  children,
  variant = 'primary',
  onClick,
  type,
  className,
  disabled,
}: {
  children: ReactNode;
  variant?: 'primary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none ';

  if (variant === 'danger') {
    return (
      <button
        type={type ?? 'button'}
        onClick={onClick}
        className={
          base +
          'border border-rose-500/20 bg-linear-to-r from-[#1c0d18] to-[#130d15] text-rose-300/75 shadow-[0_0_20px_rgba(244,63,94,0.06)] hover:border-rose-400/38 hover:shadow-[0_0_30px_rgba(244,63,94,0.18)] ' +
          (className ?? '')
        }
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={base + 'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ' + (className ?? '')}
      style={{
        background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`,
        color: '#3d2a0a',
        boxShadow: `0 0 20px rgba(${SANDY_RGB},0.25)`,
      }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold tracking-wide text-white/90" style={{ color: 'var(--heading-color)' }}>{children}</h2>;
}

function ReviewPromptBanner({ reviewUrl, onDismiss }: { reviewUrl: string; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onDismiss, 380);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex w-full max-w-md items-center gap-4 rounded-3xl px-5 py-4"
        style={{
          background: 'linear-gradient(135deg, #F5EDD5 0%, #E8D5A0 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.20)',
          border: '1px solid rgba(200,175,120,0.35)',
        }}
      >
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="flex flex-1 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(180,145,70,0.18)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" style={{ color: '#A07830' }} aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight" style={{ color: '#4A3510' }}>Enjoying your stay?</p>
            <p className="mt-0.5 text-xs" style={{ color: '#7A6035' }}>Leave a review — it means a lot</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" style={{ color: '#9A7840' }} aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-opacity"
          style={{ background: 'rgba(0,0,0,0.07)', color: '#7A6035' }}
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function NeedHelpModal({ open, onClose, phone, dark, slug, lightTheme: modalTheme }: { open: boolean; onClose: () => void; phone: string; dark: boolean; slug: string; lightTheme?: LightTheme }) {
  const t = useTranslations('guest');
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [otherMessage, setOtherMessage] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lateCheckoutSent, setLateCheckoutSent] = useState(false);
  const [lateCheckoutLoading, setLateCheckoutLoading] = useState(false);
  const [lateCheckoutConfirm, setLateCheckoutConfirm] = useState(false);
  const [lateCheckoutStatus, setLateCheckoutStatus] = useState<'pending' | 'approved' | 'denied' | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) { setVisible(false); return; }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  // Check localStorage for an existing late checkout request and poll its status
  useEffect(() => {
    if (!open || !slug) return;
    const stored = localStorage.getItem(`pillar_lco_${slug}`);
    if (!stored) return;
    let parsed: { requestId?: string; submittedAt?: string } | null = null;
    try { parsed = JSON.parse(stored); } catch { return; }
    const { requestId, submittedAt } = parsed ?? {};
    if (!requestId || !submittedAt) return;
    // Client-side expiry guard (8 hours)
    if (Date.now() - new Date(submittedAt).getTime() > 8 * 60 * 60 * 1000) {
      localStorage.removeItem(`pillar_lco_${slug}`);
      return;
    }
    fetch(`/api/guest/late-checkout/status?id=${encodeURIComponent(requestId)}`)
      .then((r) => r.json().catch(() => ({})))
      .then((d: { status?: string; expires_at?: string }) => {
        const s = d.status;
        if (s === 'approved' || s === 'denied') {
          setLateCheckoutStatus(s);
          setLateCheckoutSent(true);
        } else if (s === 'pending') {
          // If server-side expiry has passed, clear and show button again
          if (d.expires_at && new Date(d.expires_at) < new Date()) {
            localStorage.removeItem(`pillar_lco_${slug}`);
          } else {
            setLateCheckoutStatus('pending');
            setLateCheckoutSent(true);
          }
        } else {
          localStorage.removeItem(`pillar_lco_${slug}`);
        }
      })
      .catch(() => undefined);
  }, [open, slug]);

  useEffect(() => {
    if (!open || !slug) return;
    fetch(`/api/guest/work-order-categories?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d: { categories?: { id: string; name: string }[] }) => {
        if (d.categories) setCategoryOptions(d.categories);
      })
      .catch(() => {
        setCategoryOptions([
          { id: 'electric', name: 'Electric' },
          { id: 'ac', name: 'Air Conditioning' },
          { id: 'plumbing', name: 'Plumbing' },
          { id: 'other', name: 'Other' },
        ]);
      });
  }, [open, slug]);

  if (!open) return null;

  const tel = phone.replace(/[^\d+]/g, '');

  const isModalThemed = !dark && !!modalTheme;
  const mRGB = isModalThemed ? modalTheme!.accentRGB : '100,80,40';
  const panelBg = dark ? 'rgba(10,10,10,0.97)' : (isModalThemed ? modalTheme!.buttonBg.replace(',0.88)', ',0.97)') : 'rgba(255,255,255,0.97)');
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : (isModalThemed ? `rgba(${mRGB},0.05)` : 'rgba(0,0,0,0.04)');
  const dropdownBg = dark ? 'rgba(14,14,14,0.99)' : (isModalThemed ? modalTheme!.buttonBg.replace(',0.88)', ',0.99)') : 'rgba(255,255,255,0.99)');
  const borderCol = dark ? 'rgba(255,255,255,0.08)' : (isModalThemed ? `rgba(${mRGB},0.12)` : 'rgba(0,0,0,0.08)');
  const labelCol = dark ? `rgba(${SANDY_RGB},0.55)` : (isModalThemed ? `rgba(${mRGB},0.62)` : 'rgba(100,80,40,0.60)');
  const textCol = dark ? 'rgba(255,255,255,0.90)' : (isModalThemed ? modalTheme!.titleText : '#1e293b');
  const mutedCol = dark ? 'rgba(255,255,255,0.35)' : (isModalThemed ? `rgba(${mRGB},0.48)` : 'rgba(30,41,59,0.40)');
  const dividerCol = dark ? 'rgba(255,255,255,0.06)' : (isModalThemed ? `rgba(${mRGB},0.09)` : 'rgba(0,0,0,0.06)');
  const closeBtnBg = dark ? 'rgba(255,255,255,0.05)' : (isModalThemed ? `rgba(${mRGB},0.06)` : 'rgba(0,0,0,0.04)');
  const overlayBg = dark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)';
  const sandyLabel = labelCol;
  const accentGlowRGB = isModalThemed ? mRGB : SANDY_RGB;
  const checkColor = isModalThemed ? modalTheme!.iconColor : SANDY;
  const selectedBg = `rgba(${isModalThemed ? mRGB : SANDY_RGB},0.12)`;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center px-6 pb-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: overlayBg, opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease-out' }}
        aria-label="Close"
      />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        style={{
          background: panelBg,
          border: `1px solid ${borderCol}`,
          transform: visible ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(${accentGlowRGB},0.25), transparent)` }} />

        <div className="max-h-[84vh] overflow-y-auto px-6 pb-7 pt-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="lux-title text-2xl" style={{ color: textCol }}>{t('needHelp')}</h2>
              <p className="mt-1 text-sm" style={{ color: mutedCol }}>{t('tellUsWhat')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl transition-all duration-200"
              style={{ background: closeBtnBg, border: `1px solid ${borderCol}`, color: mutedCol }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Work order form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>{t('type')}</div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: category ? textCol : mutedCol }}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                >
                  <span>{category || t('selectPlaceholder')}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} style={{ color: mutedCol }} />
                </button>

                {categoryOpen ? (
                  <div role="listbox" className="absolute z-5 mt-1.5 w-full overflow-hidden rounded-xl shadow-2xl backdrop-blur-xl" style={{ background: dropdownBg, border: `1px solid ${borderCol}` }}>
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setCategory(opt.name); setSent(false); setSubmitError(null); setCategoryOpen(false); if (opt.name !== 'Other') setOtherMessage(''); }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors duration-150"
                        style={category === opt.name
                          ? { backgroundColor: selectedBg, color: textCol }
                          : { color: mutedCol }}
                      >
                        <span>{opt.name}</span>
                        {category === opt.name ? <span style={{ color: checkColor }}>✓</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {category === 'Other' ? (
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>{t('message')}</div>
                <input
                  value={otherMessage}
                  onChange={(e) => { setOtherMessage(e.target.value); setSent(false); setSubmitError(null); }}
                  placeholder={t('messagePlaceholder')}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>{t('describeProblem')}</div>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setSent(false); }}
                placeholder={t('describePlaceholder')}
                className="min-h-25 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
              />
            </div>

            {sent ? <div className="text-sm text-emerald-500">{t('sent')}</div> : null}
            {submitError ? <div className="text-sm text-red-400">{submitError}</div> : null}

            <button
              type="button"
              onClick={() => {
                if (!category) { setSubmitError(t('selectCategory')); return; }
                setSubmitting(true); setSubmitError(null);
                fetch('/api/guest/work-order', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ slug, category_name: category, description: description || null, other_message: otherMessage || null }),
                })
                  .then((r) => r.json())
                  .then((d: { ok?: boolean; error?: string }) => {
                    if (d.ok) {
                      setSent(true);
                      window.setTimeout(() => { setCategory(''); setOtherMessage(''); setDescription(''); setSent(false); onClose(); }, 850);
                    } else {
                      setSubmitError(d.error ?? t('somethingWentWrong'));
                    }
                  })
                  .catch(() => setSubmitError(t('networkError')))
                  .finally(() => setSubmitting(false));
              }}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50"
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : (isModalThemed ? `rgba(${mRGB},0.10)` : 'rgba(0,0,0,0.07)'),
                border: dark ? '1px solid rgba(255,255,255,0.10)' : (isModalThemed ? `1px solid rgba(${mRGB},0.18)` : '1px solid rgba(0,0,0,0.08)'),
                color: textCol,
              }}
            >
              <PaperPlaneIcon className="h-4 w-4" />
              {submitting ? t('sending') : t('send')}
            </button>
          </div>

          {/* Late Checkout */}
          <div className="mt-5">
            <div className="h-px" style={{ backgroundColor: dividerCol }} />
            <div className="mt-5">
              {lateCheckoutStatus !== null ? (
                <div className="rounded-2xl px-4 py-3.5 text-sm font-medium leading-relaxed text-center" style={
                  lateCheckoutStatus === 'approved'
                    ? { background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(21,128,61,0.22) 100%)', border: '1px solid rgba(34,197,94,0.35)', color: dark ? '#86efac' : '#166534' }
                    : lateCheckoutStatus === 'denied'
                    ? { background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(185,28,28,0.20) 100%)', border: '1px solid rgba(239,68,68,0.32)', color: dark ? '#fca5a5' : '#991b1b' }
                    : { background: inputBg, border: `1px solid ${dark ? borderCol : 'rgba(0,0,0,0.18)'}`, color: dark ? mutedCol : 'rgba(0,0,0,0.82)' }
                }>
                  {lateCheckoutStatus === 'approved' ? t('lateCheckoutApproved') : lateCheckoutStatus === 'denied' ? t('lateCheckoutDenied') : t('lateCheckoutPending')}
                </div>
              ) : lateCheckoutSent ? (
                <div className="rounded-2xl px-4 py-3.5 text-sm leading-relaxed" style={{ background: inputBg, border: `1px solid ${borderCol}`, color: mutedCol }}>
                  {t('lateCheckoutPending')}
                </div>
              ) : lateCheckoutConfirm ? (
                <div className="rounded-2xl px-4 py-4 space-y-3" style={{ background: inputBg, border: `1px solid ${borderCol}` }}>
                  <p className="text-sm text-center" style={{ color: textCol }}>{t('confirmLateCheckout')}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={lateCheckoutLoading}
                      onClick={() => {
                        setLateCheckoutLoading(true);
                        fetch('/api/guest/late-checkout', {
                          method: 'POST',
                          headers: { 'content-type': 'application/json' },
                          body: JSON.stringify({ slug }),
                        })
                          .then((r) => r.json().catch(() => ({})))
                          .then((d: { requestId?: string }) => {
                            if (d.requestId) {
                              localStorage.setItem(`pillar_lco_${slug}`, JSON.stringify({ requestId: d.requestId, submittedAt: new Date().toISOString() }));
                              setLateCheckoutStatus('pending');
                            }
                          })
                          .catch(() => undefined)
                          .finally(() => {
                            setLateCheckoutLoading(false);
                            setLateCheckoutConfirm(false);
                            setLateCheckoutSent(true);
                          });
                      }}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      style={{ background: `rgba(${accentGlowRGB},${isModalThemed ? '0.07' : '0.15'})`, border: `1px solid rgba(${accentGlowRGB},${isModalThemed ? '0.18' : '0.25'})`, color: checkColor }}
                    >
                      {lateCheckoutLoading ? t('sending') : t('yes')}
                    </button>
                    <button
                      type="button"
                      disabled={lateCheckoutLoading}
                      onClick={() => setLateCheckoutConfirm(false)}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'transparent', border: `1px solid ${borderCol}`, color: mutedCol }}
                    >
                      {t('no')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLateCheckoutConfirm(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                >
                  {t('requestLateCheckout')}
                </button>
              )}
            </div>
          </div>

          {/* Manager contact */}
          {phone ? (
            <>
              <div className="mt-5 h-px" style={{ backgroundColor: dividerCol }} />
              <div className="mt-5 flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-semibold" style={{ color: textCol }}>{t('urgentCall')}</p>
                <a
                  href={tel ? `tel:${tel}` : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full shadow-[0_6px_24px_rgba(239,68,68,0.45)] transition-transform duration-200 active:scale-90"
                  style={{ background: '#ef4444' }}
                  aria-label="Call property manager"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.1 10.81 19.79 19.79 0 01.07 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <span className="text-sm" style={{ color: mutedCol }}>{phone}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ open, onClose, instructions, dark, lightTheme: modalTheme }: { open: boolean; onClose: () => void; instructions: string; dark: boolean; lightTheme?: LightTheme }) {
  const t = useTranslations('guest');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) { setVisible(false); return; }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  const isModalThemed = !dark && !!modalTheme;
  const mRGB = isModalThemed ? modalTheme!.accentRGB : '100,80,40';
  const panelBg = dark ? 'rgba(10,10,10,0.97)' : (isModalThemed ? modalTheme!.buttonBg.replace(',0.88)', ',0.97)') : 'rgba(255,255,255,0.97)');
  const borderCol = dark ? 'rgba(255,255,255,0.08)' : (isModalThemed ? `rgba(${mRGB},0.12)` : 'rgba(0,0,0,0.08)');
  const textCol = dark ? 'rgba(255,255,255,0.90)' : (isModalThemed ? modalTheme!.titleText : '#1e293b');
  const mutedCol = dark ? 'rgba(255,255,255,0.35)' : (isModalThemed ? `rgba(${mRGB},0.48)` : 'rgba(30,41,59,0.40)');
  const bodyCol = dark ? 'rgba(255,255,255,0.75)' : (isModalThemed ? `rgba(${mRGB},0.82)` : 'rgba(30,41,59,0.72)');
  const closeBtnBg = dark ? 'rgba(255,255,255,0.05)' : (isModalThemed ? `rgba(${mRGB},0.06)` : 'rgba(0,0,0,0.04)');
  const overlayBg = dark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)';
  const accentGlowRGB = isModalThemed ? mRGB : SANDY_RGB;

  return (
    <div
      className="fixed inset-0 z-60 flex items-end justify-center px-6 pb-6"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.45s ease-out' }}
    >
      <button type="button" onClick={onClose} className="absolute inset-0 backdrop-blur-sm" style={{ background: overlayBg }} aria-label="Close" />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        style={{
          background: panelBg,
          border: `1px solid ${borderCol}`,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.45s ease-out, transform 0.45s ease-out',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(${accentGlowRGB},0.25), transparent)` }} />
        <div className="max-h-[75vh] overflow-y-auto px-6 pb-7 pt-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="lux-title text-2xl" style={{ color: textCol }}>{t('checkoutInstructions')}</h2>
              <p className="mt-1 text-sm" style={{ color: mutedCol }}>{t('fromManager')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl transition-all duration-200"
              style={{ background: closeBtnBg, border: `1px solid ${borderCol}`, color: mutedCol }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: bodyCol }}>{instructions}</p>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm" style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}>
      {children}
    </section>
  );
}

function AmenityTile({
  id,
  iconKey,
  title,
  selected,
  onToggle,
  dark,
}: {
  id: string;
  iconKey?: string;
  title: string;
  selected: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  void id;
  void dark;
  const iconColor = getIconColor(iconKey);
  const shadow = selected
    ? `6px 6px 18px rgba(0,0,0,0.28), 3px 3px 6px rgba(0,0,0,0.14), 0 0 0 1.5px rgba(${SANDY_RGB},0.60)`
    : '6px 6px 18px rgba(0,0,0,0.20), 3px 3px 6px rgba(0,0,0,0.10)';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex flex-none items-center gap-2.5 rounded-2xl px-3 py-3 text-left transition-all duration-200 active:scale-[0.97]"
      style={{
        background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))',
        border: `1px solid var(--accent-18)`,
        boxShadow: shadow,
      }}
    >
      <div
        className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
        style={{ backgroundColor: iconColor, color: '#ffffff' }}
      >
        <AmenityIconSvg iconKey={iconKey} className="h-3.5 w-3.5" />
      </div>
      <p className="text-sm font-semibold whitespace-nowrap text-white">
        {title}
      </p>
    </button>
  );
}




function AmenitySquare({
  id,
  iconKey,
  title,
  selected,
  onToggle,
  dark = true,
  themeAccentRGB,
}: {
  id: string;
  iconKey?: string;
  title: string;
  selected: boolean;
  onToggle: () => void;
  dark?: boolean;
  themeAccentRGB?: string;
}) {
  void id;

  const isLightThemed = !dark && !!themeAccentRGB;

  const bg = dark
    ? selected ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,10,0.82)'
    : selected ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)';

  const border = dark
    ? `1px solid ${selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`
    : `1px solid ${selected
        ? (isLightThemed ? `rgba(${themeAccentRGB},0.32)` : 'rgba(0,0,0,0.12)')
        : (isLightThemed ? `rgba(${themeAccentRGB},0.12)` : 'rgba(0,0,0,0.07)')}`;

  const shadow = dark
    ? selected ? '0 4px 24px rgba(0,0,0,0.50)' : '0 4px 16px rgba(0,0,0,0.40)'
    : selected ? '0 4px 20px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.07)';

  const iconColor = dark
    ? selected ? 'rgba(245,237,213,0.92)' : 'rgba(255,255,255,0.75)'
    : isLightThemed
      ? selected ? `rgba(${themeAccentRGB},0.90)` : `rgba(${themeAccentRGB},0.62)`
      : selected ? 'rgba(100,80,40,0.90)' : 'rgba(30,41,59,0.65)';

  const labelColor = dark
    ? selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.72)'
    : isLightThemed
      ? selected ? `rgba(${themeAccentRGB},0.95)` : `rgba(${themeAccentRGB},0.70)`
      : selected ? '#1e293b' : 'rgba(30,41,59,0.65)';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl transition-all duration-200 active:scale-95"
      style={{
        width: '103px',
        height: '113px',
        flexShrink: 0,
        scrollSnapAlign: 'start',
        background: bg,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border,
        boxShadow: shadow,
      }}
    >
      <div style={{ color: iconColor }}>
        <AmenityIconSvg iconKey={iconKey} className="h-8 w-8" />
      </div>
      <span className="w-full px-2 text-center text-[12px] font-medium leading-tight" style={{ color: labelColor }}>
        {title}
      </span>
    </button>
  );
}

/* ─── Room ordering ───────────────────────────────────────────── */

const ROOM_PRIORITY: [RegExp, number][] = [
  [/entrance|foyer|entryway/i, 0],
  [/kitchen/i, 10],
  [/dining/i, 20],
  [/living|lounge/i, 30],
  [/family/i, 40],
  [/den|office|study/i, 50],
  [/master\s*(bed|suite)|primary\s*(bed|suite)/i, 55],
  [/bedroom|guest\s*room/i, 60],
  [/bathroom|bath|powder/i, 70],
  [/laundry/i, 80],
  [/basement/i, 90],
  [/garage/i, 100],
  [/patio|deck|balcony|backyard|outdoor|yard/i, 110],
];

function roomSortOrder(name: string): number {
  for (const [re, n] of ROOM_PRIORITY) if (re.test(name)) return n;
  return 120;
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function isAttachmentArray(v: unknown): v is Array<Record<string, unknown>> {
  return Array.isArray(v) && v.every((x) => x && typeof x === 'object');
}

function renderWindowContent(w: AmenityWindow, t: (key: string) => string): ReactNode {
  if (w.type === 'text') {
    return w.body
      ? <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--body-color)' }}>{w.body}</p>
      : <p className="text-sm text-white/35">{t('noContentAdded')}</p>;
  }
  if (w.type === 'pdf') {
    return w.url
      ? <a href={w.url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 transition-all duration-200" style={{ color: SANDY, textDecorationColor: `rgba(${SANDY_RGB},0.40)` }}>{t('openPdf')}</a>
      : <p className="text-sm text-white/35">{t('noPdfUploaded')}</p>;
  }
  if (w.type === 'image') {
    return w.url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={w.url} alt={w.title} className="w-full rounded-xl border border-white/[0.07]" loading="eager" />
      : <p className="text-sm text-white/35">{t('noImageUploaded')}</p>;
  }
  const videoMime = /\.webm(\?|$)/i.test(w.url ?? '') ? 'video/webm'
    : /\.mov(\?|$)/i.test(w.url ?? '') ? 'video/mp4'
    : 'video/mp4';
  return w.url
    ? <div className="rounded-xl border border-white/[0.07]"><video controls playsInline className="w-full rounded-xl" preload="auto" style={{ display: 'block' }}><source src={w.url} type={videoMime} />{t('browserNoVideo')}</video></div>
    : <p className="text-sm text-white/35">{t('noVideoUploaded')}</p>;
}

function guessAttachmentKind(url: string): 'image' | 'video' | 'other' {
  const u = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm)(\?|$)/.test(u)) return 'video';
  if (/(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?|$)/.test(u)) return 'image';
  return 'other';
}

/* ─── Weather Widget ─────────────────────────────────────────── */

function WxSunIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WxCloudIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WxRainIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13v4M8 13v4M12 15v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WxSnowIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="22" r="1" fill="currentColor" />
      <circle cx="12" cy="22" r="1" fill="currentColor" />
      <circle cx="16" cy="22" r="1" fill="currentColor" />
    </svg>
  );
}

function WxStormIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }} aria-hidden="true">
      <path d="M19 16.9A5 5 0 0018 7h-1.26A8 8 0 104 15.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="13 11 9 17 15 17 11 23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function wmoIcon(code: number, size?: number): ReactNode {
  if (code <= 1) return <WxSunIcon size={size} />;
  if (code >= 95) return <WxStormIcon size={size} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <WxSnowIcon size={size} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <WxRainIcon size={size} />;
  return <WxCloudIcon size={size} />;
}

function wmoLabel(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

function formatHour(isoTime: string): string {
  const h = parseInt(isoTime.slice(11, 13), 10);
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const today = new Date();
  if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function getWxTabIcon(idx: number): ReactNode {
  if (idx === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }} aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13v3M8 13v3M12 15v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

interface WxData {
  temp: number;
  feelsLike: number;
  code: number;
  hourly: { time: string; temp: number; code: number }[];
  daily: { date: string; high: number; low: number; code: number }[];
}

function WeatherWidget({ zipCode, dark, lightTheme: lTheme, isLightThemed }: {
  zipCode: string;
  dark: boolean;
  lightTheme: LightTheme;
  isLightThemed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tabIconIdx, setTabIconIdx] = useState(0);
  const [wx, setWx] = useState<WxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTabIconIdx((i) => (i + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void fetchWx();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchWx() {
    if (wx || loading || !zipCode) return;
    setLoading(true);
    setFetchError(null);
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zipCode)}&country=US&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const geoData = (await geoRes.json()) as Array<{ lat: string; lon: string }>;
      if (!geoData[0]) throw new Error('Location not found');
      const { lat, lon } = geoData[0];

      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`
      );
      const raw = (await wxRes.json()) as {
        current: { temperature_2m: number; apparent_temperature: number; weather_code: number; time: string };
        hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
        daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
      };

      const nowPrefix = raw.current.time.slice(0, 13);
      const hIdx = raw.hourly.time.findIndex((t) => t.slice(0, 13) === nowPrefix);
      const hStart = hIdx >= 0 ? hIdx : 0;

      setWx({
        temp: Math.round(raw.current.temperature_2m),
        feelsLike: Math.round(raw.current.apparent_temperature),
        code: raw.current.weather_code,
        hourly: raw.hourly.time.slice(hStart, hStart + 24).map((t, i) => ({
          time: t,
          temp: Math.round((raw.hourly.temperature_2m[hStart + i] as number) ?? 0),
          code: (raw.hourly.weather_code[hStart + i] as number) ?? 0,
        })),
        daily: raw.daily.time.map((t, i) => ({
          date: t,
          high: Math.round((raw.daily.temperature_2m_max[i] as number) ?? 0),
          low: Math.round((raw.daily.temperature_2m_min[i] as number) ?? 0),
          code: (raw.daily.weather_code[i] as number) ?? 0,
        })),
      });
    } catch {
      setFetchError('Unable to load weather.');
    } finally {
      setLoading(false);
    }
  }

  const panelBg = dark
    ? 'rgba(10,10,10,0.97)'
    : isLightThemed
    ? lTheme.buttonBg.replace(',0.88)', ',0.97)')
    : 'rgba(255,255,255,0.97)';
  const borderCol = dark
    ? 'rgba(255,255,255,0.08)'
    : isLightThemed
    ? `rgba(${lTheme.accentRGB},0.14)`
    : 'rgba(0,0,0,0.08)';
  const textCol = dark ? 'rgba(255,255,255,0.92)' : isLightThemed ? lTheme.titleText : '#1e293b';
  const mutedCol = dark
    ? 'rgba(255,255,255,0.42)'
    : isLightThemed
    ? `rgba(${lTheme.accentRGB},0.55)`
    : 'rgba(30,41,59,0.45)';
  const dividerCol = dark
    ? 'rgba(255,255,255,0.06)'
    : isLightThemed
    ? `rgba(${lTheme.accentRGB},0.09)`
    : 'rgba(0,0,0,0.06)';
  const accentRGB = isLightThemed ? lTheme.accentRGB : SANDY_RGB;
  const iconColor = dark
    ? `rgba(${SANDY_RGB},0.85)`
    : isLightThemed
    ? lTheme.iconColor
    : 'rgba(100,80,40,0.85)';
  const tabBg = dark
    ? 'rgba(10,10,10,0.82)'
    : isLightThemed
    ? lTheme.buttonBg
    : 'rgba(255,255,255,0.82)';

  return (
    <>
      {/* Floating weather tab — right edge, vertically centered */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View weather forecast"
        className="fixed right-0 z-20 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95"
        style={{
          top: '30%',
          transform: 'translateY(-50%)',
          width: 38,
          paddingTop: 14,
          paddingBottom: 14,
          borderRadius: '10px 0 0 10px',
          background: tabBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${borderCol}`,
          borderRight: 'none',
          boxShadow: dark ? '-4px 0 20px rgba(0,0,0,0.50)' : '-4px 0 16px rgba(0,0,0,0.10)',
          color: iconColor,
        }}
      >
        <div key={tabIconIdx} className="wx-tab-icon-fade">
          {getWxTabIcon(tabIconIdx)}
        </div>
      </button>

      {/* Backdrop */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
          aria-label="Close weather"
        />
      ) : null}

      {/* Drawer */}
      <div
        className="fixed z-40 flex flex-col overflow-hidden"
        style={{
          top: 20,
          bottom: 20,
          right: 0,
          width: 'min(85vw, 300px)',
          background: panelBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${borderCol}`,
          borderRight: 'none',
          borderRadius: '20px 0 0 20px',
          boxShadow: dark ? '-8px 0 48px rgba(0,0,0,0.65)' : '-8px 0 48px rgba(0,0,0,0.16)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.30s ease',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(${accentRGB},0.22), transparent)`, borderRadius: '20px 0 0 0' }} />

        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-5 pb-4 pt-5"
          style={{ borderBottom: `1px solid ${dividerCol}` }}
        >
          <p className="text-base font-semibold tracking-wide" style={{ color: textCol }}>Weather</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200"
            style={{ border: `1px solid ${borderCol}`, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: mutedCol }}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5 space-y-5" style={{ scrollbarWidth: 'none' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2"
                style={{ borderColor: `rgba(${accentRGB},0.25)`, borderTopColor: `rgba(${accentRGB},0.80)` }}
              />
              <p className="text-xs" style={{ color: mutedCol }}>Loading weather…</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm" style={{ color: mutedCol }}>{fetchError}</p>
            </div>
          ) : wx ? (
            <>
              {/* Current conditions */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[3.2rem] font-light leading-none tracking-tight" style={{ color: textCol }}>{wx.temp}°F</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: textCol }}>{wmoLabel(wx.code)}</p>
                  <p className="mt-0.5 text-xs" style={{ color: mutedCol }}>Feels like {wx.feelsLike}°</p>
                </div>
                <div style={{ color: iconColor }}>{wmoIcon(wx.code, 60)}</div>
              </div>

              <div className="h-px" style={{ background: dividerCol }} />

              {/* Hourly */}
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: mutedCol }}>Hourly</p>
                <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' } as React.CSSProperties}>
                  {wx.hourly.map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                      <p className="text-[10px] whitespace-nowrap" style={{ color: mutedCol }}>{i === 0 ? 'Now' : formatHour(h.time)}</p>
                      <div style={{ color: iconColor }}>{wmoIcon(h.code, 18)}</div>
                      <p className="text-xs font-semibold" style={{ color: textCol }}>{h.temp}°</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px" style={{ background: dividerCol }} />

              {/* 7-day */}
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: mutedCol }}>7-Day Forecast</p>
                <div className="space-y-3.5">
                  {wx.daily.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <p className="w-11 shrink-0 text-xs font-medium" style={{ color: textCol }}>{formatDayLabel(d.date)}</p>
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <div style={{ color: iconColor, flexShrink: 0 }}>{wmoIcon(d.code, 18)}</div>
                        <p className="text-[10px] truncate" style={{ color: mutedCol }}>{wmoLabel(d.code)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <p className="text-xs font-semibold" style={{ color: textCol }}>{d.high}°</p>
                        <span className="text-xs" style={{ color: dividerCol }}>|</span>
                        <p className="text-xs" style={{ color: mutedCol }}>{d.low}°</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function PropertyExperience({
  slug,
  property,
  managerLayout,
  rawFields,
  editableCustomWindows = false,
  onAddWindow,
  onRemoveWindow,
  onReorderWindows,
}: {
  slug: string;
  property: Property;
  managerLayout: ManagerLayoutItem[];
  rawFields: PropertyFields;
  editableCustomWindows?: boolean;
  onAddWindow?: () => void;
  onRemoveWindow?: (index: number) => void;
  onReorderWindows?: (fromIndex: number, toIndex: number) => void;
}) {
  const t = useTranslations('guest');
  const PREVIEW_FADE_MS = 220;
  const FULL_VIEW_FADE_MS = 220;

  const [expanded, setExpanded] = useState(editableCustomWindows ? true : false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fullView, setFullView] = useState<'content' | 'amenities'>('content');
  const [isFullViewTransitioning, setIsFullViewTransitioning] = useState(false);
  const [openAmenityId, setOpenAmenityId] = useState<string | null>(null);
  const [amenityAnimating, setAmenityAnimating] = useState(false);
  const [needHelpOpen, setNeedHelpOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [carouselDragStart, setCarouselDragStart] = useState<number | null>(null);
  const [carouselDragOffset, setCarouselDragOffset] = useState(0);
  const [showReviewBanner, setShowReviewBanner] = useState(false);
  const [carouselDragged, setCarouselDragged] = useState(false);
  const [sharing, setSharing] = useState(false);
  const photos = property.photos ?? [];

  const backgroundUrl = useMemo(
    () => property.HeroImage || '/images/heroimage.jpg',
    [property.HeroImage]
  );

  useEffect(() => {
    if (openAmenityId) {
      const raf = requestAnimationFrame(() => setAmenityAnimating(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [openAmenityId]);

  // Prevent iOS from scrolling the background when any overlay modal is open.
  // Capture scrollY before locking so we can restore exact position on close —
  // overflow:hidden on <html> resets the scroll container to 0.
  useEffect(() => {
    const isAnyModalOpen = needHelpOpen || checkoutOpen || !!openAmenityId || lightboxOpen;
    if (!isAnyModalOpen) return;
    const scrollY = window.scrollY;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
      window.scrollTo(0, scrollY);
    };
  }, [needHelpOpen, checkoutOpen, openAmenityId, lightboxOpen]);

  function openAmenity(id: string) {
    setAmenityAnimating(false);
    setOpenAmenityId(id);
  }

  function closeAmenity() {
    setAmenityAnimating(false);
    window.setTimeout(() => setOpenAmenityId(null), 270);
  }

  async function sharePhotoWithLogo(url: string) {
    setSharing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const photo = new Image();
      photo.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        photo.onload = () => resolve();
        photo.onerror = () => reject(new Error('photo load failed'));
        photo.src = url;
      });

      canvas.width = photo.naturalWidth || 1200;
      canvas.height = photo.naturalHeight || 800;
      ctx.drawImage(photo, 0, 0);

      if (property.LogoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => { logo.onload = () => resolve(); logo.onerror = () => resolve(); logo.src = property.LogoUrl!; });
        const logoH = Math.round(canvas.height * 0.10);
        const logoW = Math.round((logo.naturalWidth / logo.naturalHeight) * logoH) || logoH;
        const pad = Math.round(canvas.width * 0.03);
        ctx.drawImage(logo, pad, canvas.height - logoH - pad, logoW, logoH);
      }

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      if (!blob) return;
      const file = new File([blob], 'experience.jpg', { type: 'image/jpeg' });

      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: property.PropertyName || 'My Stay', files: [file] });
      } else {
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl; a.download = 'experience.jpg'; a.click();
        URL.revokeObjectURL(objUrl);
      }
    } catch { /* cancelled or CORS — silently ignore */ }
    finally { setSharing(false); }
  }

  const bgKey = property.BackgroundKey ?? '';
  const isLightThemed = !dark && THEME_BG_KEYS.has(bgKey);
  const lightTheme: LightTheme = isLightThemed ? (LIGHT_THEMES[bgKey] ?? DEFAULT_LIGHT) : DEFAULT_LIGHT;
  const whiteOverlayOpacity = isLightThemed ? lightTheme.whiteOverlayOpacity : 1;

  const themeVars = {
    '--accent': SANDY,
    '--accent-10': `rgba(${SANDY_RGB},0.10)`,
    '--accent-18': `rgba(${SANDY_RGB},0.18)`,
    '--accent-22': `rgba(${SANDY_RGB},0.22)`,
    '--accent-25': `rgba(${SANDY_RGB},0.25)`,
    '--accent-40': `rgba(${SANDY_RGB},0.40)`,
    '--accent-45': `rgba(${SANDY_RGB},0.45)`,
    '--accent-50': `rgba(${SANDY_RGB},0.50)`,
    '--btn-bg-from': `rgba(${SANDY_RGB},0.22)`,
    '--btn-bg-to': `rgba(${SANDY_RGB},0.14)`,
    '--heading-color': property.HeadingColor || (dark ? 'rgba(255,255,255,0.9)' : lightTheme.headingColor),
    '--body-color': property.TextColor || (dark ? 'rgba(255,255,255,0.75)' : lightTheme.titleText),
    '--panel-deep': 'rgba(12,12,12,0.92)',
    '--panel-mid': 'rgba(18,18,18,0.55)',
    '--panel-card': 'rgba(18,18,18,0.88)',
    '--panel-input': 'rgba(14,14,14,0.72)',
    '--border-col': 'rgba(255,255,255,0.06)',
  } as React.CSSProperties;

  useEffect(() => {
    if (!expanded) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [expanded]);

  // Cycle through property photos in the amenities card
  useEffect(() => {
    if (photos.length <= 1 || fullView !== 'amenities') return;
    const id = setInterval(() => {
      setPhotoIdx((curr) => (curr + 1) % photos.length);
    }, 6000);
    return () => clearInterval(id);
  }, [photos.length, fullView]);

  useEffect(() => {
    if (fullView !== 'amenities') setPhotoIdx(0);
  }, [fullView]);

  useEffect(() => {
    document.body.style.overflow = expanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  const rootOverflow = 'overflow-hidden';
  const showExpandedContent = expanded && !isTransitioning && !isFullViewTransitioning && fullView === 'content';

  return (
    <div className={`min-h-screen font-sans ${rootOverflow}`} style={themeVars}>

      {/* ── Layer 1: hero image — visible on preview, fades away when expanded ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{ backgroundImage: `url(${backgroundUrl})`, opacity: expanded ? 0 : 1 }}
      />

      {/* ── Layer 2a: light expanded background ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          opacity: expanded && !isTransitioning && !dark ? 1 : 0,
          backgroundImage: `url(/images/${property.BackgroundKey && property.BackgroundKey !== 'background' ? property.BackgroundKey : 'mainbackground'}.png)`,
        }}
      />

      {/* ── Layer 2b: dark expanded background ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          opacity: expanded && !isTransitioning && dark ? 1 : 0,
          backgroundImage: 'url(/images/bg3.png)',
        }}
      />

      {/* ── Layer 3: white.png — all expanded light-mode views (opacity reduced for themes to let bg color show) ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: 'url(/images/white.png)',
          opacity: expanded && !isTransitioning && !dark ? whiteOverlayOpacity : 0,
        }}
      />

      {/* ── Logo — visible on content view only, not amenities list ── */}
      {(() => {
        const logoSrc = dark ? property.LogoUrl : (property.LogoUrlDark ?? null);
        if (!expanded || fullView === 'amenities' || !logoSrc) return null;
        return (
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-10 flex justify-center pt-6 transition-opacity duration-[220ms] ease-in-out"
            style={{ opacity: isTransitioning || isFullViewTransitioning ? 0 : 1 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Property logo"
              className="object-contain drop-shadow-lg"
              style={{ width: `${property.LogoSize ?? 100}px`, maxHeight: `${property.LogoSize ?? 100}px` }}
            />
          </div>
        );
      })()}

      {/* ── Dark mode toggle — top right, visible when expanded ── */}

      {/* ── Edit mode bar ── */}
      {editableCustomWindows ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-md px-6 pt-4">
          <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/55/80 px-4 py-2.5 text-white backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">{t('editMode')}</div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-white/40">{t('reorderHint')}</div>
              <button
                type="button"
                onClick={onAddWindow}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/70 transition-all duration-200 hover:bg-white/10"
              >
                <span className="text-base leading-none">+</span>
                {t('addWindow')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ════════════════════════════════════════════════════════
          PREVIEW (unexpanded) — full-screen editorial hero
          ════════════════════════════════════════════════════════ */}
      {!expanded ? (
        <button
          type="button"
          onClick={() => {
            setIsTransitioning(true);
            window.setTimeout(() => setExpanded(true), PREVIEW_FADE_MS);
            window.setTimeout(() => setIsTransitioning(false), PREVIEW_FADE_MS * 2);
          }}
          className={'fixed inset-0 w-full text-left transition-opacity ease-in-out ' + (isTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100')}
          style={{ transitionDuration: `${PREVIEW_FADE_MS}ms` }}
          aria-label={t('openFullDetails')}
        >
          {/* Soft gradient — transparent top, gentle dark fade at bottom */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 28%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.78) 100%)' }}
          />

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md px-7 pb-12">
            {property.PropertyAddress ? (
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.38em] text-white drop-shadow-sm">
                {property.PropertyAddress}
              </p>
            ) : null}
            <h1 className="mb-5 text-[2.6rem] font-light leading-none tracking-tight text-white drop-shadow-lg">
              {property.PropertyName}
            </h1>
            <div className="mb-4 h-px w-10 bg-white/22" />
            {property.DetailedHouseBio ? (
              <p className="text-[13px] leading-relaxed text-white/75 drop-shadow-sm">
                {property.DetailedHouseBio}
              </p>
            ) : null}
            <div className="mt-6 flex items-center justify-end gap-1.5 text-white/75">
              <span className="text-[10px] font-medium uppercase tracking-[0.3em]">{t('explore')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </button>
      ) : null}

      {/* ════════════════════════════════════════════════════════
          EXPANDED — content
          ════════════════════════════════════════════════════════ */}
      {expanded ? (
        <>
          {/* Dark mode toggle — fixed top-right */}
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="fixed top-5 right-5 z-20 transition-opacity duration-200 hover:opacity-70"
            style={{ color: dark ? 'rgba(255,255,255,0.45)' : lightTheme.toggleColor }}
            title={dark ? t('switchToLight') : t('switchToDark')}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {property.PropertyZipCode ? (
            <WeatherWidget
              zipCode={property.PropertyZipCode}
              dark={dark}
              lightTheme={lightTheme}
              isLightThemed={isLightThemed}
            />
          ) : null}

          <div className="relative">
            {/* Content view */}
            <div
              className={
                'relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden px-6 transition-opacity duration-450 ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'content'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
              style={{ transitionDuration: `${PREVIEW_FADE_MS}ms` }}
            >
              <div
                className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden"
                style={{
                  paddingTop: editableCustomWindows ? '110px' : 'clamp(165px, 42vh, 290px)',
                  paddingBottom: 'max(32px, calc(16px + env(safe-area-inset-bottom)))',
                }}
              >
                {/* Property name */}
                <div className="space-y-1 pb-1">
                  {property.PropertyAddress ? (
                    <p
                      className="text-[11px] font-medium uppercase tracking-[0.3em]"
                      style={{ color: dark ? 'rgba(245,237,213,0.55)' : lightTheme.addressText }}
                    >
                      {property.PropertyAddress}
                    </p>
                  ) : null}
                  <h1
                    className="lux-title text-[2.2rem] font-light leading-tight"
                    style={{ color: dark ? 'rgba(255,255,255,0.92)' : lightTheme.headingColor }}
                  >
                    {property.PropertyName}
                  </h1>
                  <div className="mt-2.5 h-px w-10" style={{ background: dark ? 'linear-gradient(to right, rgba(245,237,213,0.50), transparent)' : `linear-gradient(to right, ${lightTheme.dividerFrom}, transparent)` }} />
                </div>

                {/* Home Amenities button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFullViewTransitioning(true);
                    window.setTimeout(() => { setFullView('amenities'); }, FULL_VIEW_FADE_MS);
                    window.setTimeout(() => { setIsFullViewTransitioning(false); }, FULL_VIEW_FADE_MS * 2);
                    fetch('/api/guest/track-event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, event_type: 'amenity_view' }) }).catch(() => {});
                  }}
                  className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl px-6 py-5 text-left transition-all duration-300"
                  style={{
                    background: dark ? 'rgba(10,10,10,0.82)' : lightTheme.buttonBg,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${lightTheme.buttonBorder}`,
                    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : lightTheme.buttonShadow,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl" style={{
                      background: dark ? 'rgba(245,237,213,0.10)' : lightTheme.iconBg,
                      color: dark ? `rgba(${SANDY_RGB},0.85)` : lightTheme.iconColor,
                    }}>
                      <HomeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.90)' : lightTheme.titleText }}>{t('homeAmenities')}</div>
                      <div className="mt-0.5 text-xs" style={{ color: dark ? 'rgba(245,237,213,0.45)' : lightTheme.subtitleText }}>
                        {(() => {
                          const all = [t('wifi'), property.GarageCode ? t('garageCode') : null, ...(property.windows ?? []).map((w) => w.title)].filter(Boolean) as string[];
                          const preview = all.slice(0, 2);
                          return preview.join(', ') + (all.length > 2 ? t('andMore') : '');
                        })()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: dark ? `rgba(${SANDY_RGB},0.35)` : lightTheme.chevronColor }} />
                </button>

                {/* Pillar Concierge inline button */}
                <ChatConcierge
                  slug={slug}
                  placement="inline"
                  dark={dark}
                  inlineLightTheme={!dark ? {
                    accentRGB: lightTheme.accentRGB,
                    panelDeepBg: lightTheme.buttonBg.replace(',0.88)', ',0.96)'),
                    buttonBg: lightTheme.buttonBg,
                    buttonBorder: lightTheme.buttonBorder,
                    buttonShadow: lightTheme.buttonShadow,
                    iconBg: lightTheme.iconBg,
                    iconColor: lightTheme.iconColor,
                    titleText: lightTheme.titleText,
                    subtitleText: lightTheme.subtitleText,
                    chevronColor: lightTheme.chevronColor,
                  } : undefined}
                />

                {/* Manager layout windows */}
                {managerLayout.length ? (
                  <div className="w-full rounded-3xl p-5" style={{
                    background: dark ? 'rgba(10,10,10,0.82)' : lightTheme.buttonBg,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${lightTheme.buttonBorder}`,
                    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : lightTheme.buttonShadow,
                  }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="lux-title text-[1.1rem]" style={{ color: dark ? 'rgba(255,255,255,0.90)' : lightTheme.titleText }}>{t('amenities')}</p>
                        {editableCustomWindows ? (
                          <button
                            type="button"
                            onClick={onAddWindow}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-semibold transition-all duration-200"
                            style={{
                              border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.10)',
                              background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                              color: dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.50)',
                            }}
                            aria-label="Add window"
                          >
                            +
                          </button>
                        ) : null}
                      </div>

                      <div className="space-y-4">
                        {managerLayout.map((item, idx) => {
                          const key = (item.field || '').trim();
                          if (!key) return null;
                          const value = (rawFields as Record<string, unknown>)[key];

                          const renderValue = () => {
                            if (typeof value === 'string') {
                              return value.trim()
                                ? <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(30,41,59,0.75)' }}>{value}</p>
                                : <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>{t('empty')}</p>;
                            }
                            if (typeof value === 'number' || typeof value === 'boolean') {
                              return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(30,41,59,0.75)' }}>{String(value)}</p>;
                            }
                            if (isAttachmentArray(value)) {
                              const first = value[0] as { url?: unknown };
                              const url = typeof first?.url === 'string' ? first.url : '';
                              if (!url) return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>{t('noAttachment')}</p>;
                              const kind = guessAttachmentKind(url);
                              if (kind === 'video') {
                                const vmime = /\.webm(\?|$)/i.test(url) ? 'video/webm' : 'video/mp4';
                                return (
                                  <div className="rounded-xl" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
                                    <video controls playsInline className="w-full rounded-xl" preload="auto" style={{ display: 'block' }}><source src={url} type={vmime} />{t('browserNoVideo')}</video>
                                  </div>
                                );
                              }
                              if (kind === 'image') return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={key} className="w-full rounded-xl" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }} loading="lazy" />
                              );
                              return (
                                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 transition-all duration-200" style={{ color: dark ? SANDY : 'rgba(100,80,40,0.85)', textDecorationColor: dark ? `rgba(${SANDY_RGB},0.40)` : 'rgba(100,80,40,0.30)' }}>
                                  {t('openAttachment')}
                                </a>
                              );
                            }
                            return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>{t('noContent')}</p>;
                          };

                          return (
                            <div
                              key={`${key}-${idx}`}
                              className={editableCustomWindows ? 'rounded-xl p-3' : 'space-y-2'}
                              style={editableCustomWindows ? { border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' } : undefined}
                              draggable={editableCustomWindows}
                              onDragStart={(e) => { if (!editableCustomWindows) return; e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
                              onDragOver={(e) => { if (!editableCustomWindows) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                              onDrop={(e) => { if (!editableCustomWindows) return; e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isFinite(from) && onReorderWindows) onReorderWindows(from, idx); }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: dark ? 'rgba(245,237,213,0.42)' : lightTheme.subtitleText }}>{key}</div>
                                {editableCustomWindows ? (
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => onReorderWindows?.(idx, Math.max(0, idx - 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)', color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.40)' }} aria-label="Move up">↑</button>
                                    <button type="button" onClick={() => onReorderWindows?.(idx, Math.min(managerLayout.length - 1, idx + 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)', color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.40)' }} aria-label="Move down">↓</button>
                                    <button type="button" onClick={() => onRemoveWindow?.(idx)} className="text-xs font-semibold underline underline-offset-4 transition-all duration-200" style={{ color: 'rgba(239,68,68,0.55)', textDecorationColor: 'rgba(239,68,68,0.25)' }}>Remove</button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="mt-2">{renderValue()}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Need Help button */}
                <button
                  type="button"
                  onClick={() => setNeedHelpOpen(true)}
                  className="group flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left transition-all duration-300"
                  style={{
                    background: dark ? 'rgba(10,10,10,0.82)' : lightTheme.buttonBg,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${lightTheme.buttonBorder}`,
                    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : lightTheme.buttonShadow,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl" style={{
                      background: dark ? 'rgba(245,237,213,0.10)' : lightTheme.iconBg,
                      color: dark ? `rgba(${SANDY_RGB},0.85)` : lightTheme.iconColor,
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.1 10.81 19.79 19.79 0 01.07 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.90)' : lightTheme.titleText }}>{t('needHelp')}</div>
                      <div className="mt-0.5 text-xs" style={{ color: dark ? 'rgba(245,237,213,0.45)' : lightTheme.subtitleText }}>{t('contactManager')}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: dark ? `rgba(${SANDY_RGB},0.35)` : lightTheme.chevronColor }} />
                </button>

                {property.CheckoutInstructions ? (
                  <div className="flex justify-center pt-3 pb-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(true)}
                      className="text-[11px] uppercase tracking-[0.22em] transition-opacity duration-200 hover:opacity-80"
                      style={{ color: dark ? 'rgba(245,237,213,0.32)' : `rgba(${lightTheme.accentRGB},0.38)` }}
                    >
                      {t('checkoutInstructions')}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>


            {/* Amenities full view */}
            <div
              className={
                'absolute inset-0 transition-opacity duration-450 ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'amenities'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
            >
              <div className="relative mx-auto flex h-full max-w-md flex-col overflow-hidden">
                {/* Header */}
                <div className="shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAmenityId(null);
                      setIsFullViewTransitioning(true);
                      window.setTimeout(() => { setFullView('content'); }, FULL_VIEW_FADE_MS);
                      window.setTimeout(() => { setIsFullViewTransitioning(false); }, FULL_VIEW_FADE_MS * 2);
                      if (property.ReviewUrl) {
                        const key = `pillar_review_shown_${slug}`;
                        if (!sessionStorage.getItem(key)) {
                          window.setTimeout(() => setShowReviewBanner(true), FULL_VIEW_FADE_MS * 2 + 150);
                        }
                      }
                    }}
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl transition-all duration-200"
                    style={{
                      background: dark ? 'rgba(10,10,10,0.82)' : lightTheme.buttonBg,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${lightTheme.buttonBorder}`,
                      color: dark ? 'rgba(255,255,255,0.80)' : lightTheme.titleText,
                    }}
                    aria-label={t('back')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="lux-title flex-1 text-center text-3xl tracking-[0.04em]" style={{ color: dark ? '#ffffff' : lightTheme.headingColor }}>{t('homeAmenities')}</div>
                  <div className="h-9 w-9 flex-none" />
                </div>

                {/* Scrollable content — photo card + amenities card */}
                <div
                  className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 space-y-3"
                  style={{ scrollbarWidth: 'none', overscrollBehavior: 'contain' }}
                >
                  {/* Photo carousel card + share */}
                  {photos.length > 0 && (
                    <div className="shrink-0 space-y-2">
                      {/* Swipeable photo strip */}
                      <div
                        className="relative w-full overflow-hidden rounded-3xl"
                        style={{ height: 210, touchAction: 'pan-y', userSelect: 'none' }}
                        onTouchStart={(e) => { setCarouselDragStart(e.touches[0].clientX); setCarouselDragged(false); }}
                        onTouchMove={(e) => {
                          if (carouselDragStart === null) return;
                          const off = e.touches[0].clientX - carouselDragStart;
                          setCarouselDragOffset(off);
                          if (Math.abs(off) > 8) setCarouselDragged(true);
                        }}
                        onTouchEnd={() => {
                          if (Math.abs(carouselDragOffset) > 50) {
                            if (carouselDragOffset < 0) setPhotoIdx((i) => Math.min(i + 1, photos.length - 1));
                            else setPhotoIdx((i) => Math.max(i - 1, 0));
                          }
                          setCarouselDragStart(null); setCarouselDragOffset(0);
                        }}
                        onMouseDown={(e) => { setCarouselDragStart(e.clientX); setCarouselDragged(false); }}
                        onMouseMove={(e) => {
                          if (carouselDragStart === null) return;
                          const off = e.clientX - carouselDragStart;
                          setCarouselDragOffset(off);
                          if (Math.abs(off) > 8) setCarouselDragged(true);
                        }}
                        onMouseUp={() => {
                          if (Math.abs(carouselDragOffset) > 50) {
                            if (carouselDragOffset < 0) setPhotoIdx((i) => Math.min(i + 1, photos.length - 1));
                            else setPhotoIdx((i) => Math.max(i - 1, 0));
                          }
                          setCarouselDragStart(null); setCarouselDragOffset(0);
                        }}
                        onMouseLeave={() => { if (carouselDragStart !== null) { setCarouselDragStart(null); setCarouselDragOffset(0); } }}
                      >
                        <div
                          className="flex h-full"
                          style={{
                            width: `${photos.length * 100}%`,
                            transform: `translateX(calc(-${(photoIdx / photos.length) * 100}% + ${carouselDragOffset / photos.length}px))`,
                            transition: carouselDragStart !== null ? 'none' : 'transform 420ms cubic-bezier(0.22,1,0.36,1)',
                          }}
                        >
                          {photos.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="h-full flex-none bg-cover bg-center"
                              style={{ width: `${100 / photos.length}%`, backgroundImage: `url(${url})` }}
                              onClick={() => { if (!carouselDragged) { setLightboxIdx(idx); setLightboxOpen(true); } }}
                              aria-label={t('viewPhoto', { n: idx + 1 })}
                            />
                          ))}
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.42), transparent)' }} />
                        {photos.length > 1 && (
                          <div className="pointer-events-none absolute bottom-3 flex w-full items-center justify-center gap-1.5">
                            {photos.map((_, i) => (
                              <div
                                key={i}
                                className="rounded-full transition-all duration-500"
                                style={{ width: i === photoIdx ? '18px' : '5px', height: '5px', background: i === photoIdx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)' }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Amenities card */}
                  {(() => {
                    const rowStyle: React.CSSProperties = {
                      display: 'flex',
                      gap: 10,
                      overflowX: 'auto',
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'none',
                      paddingTop: 10, marginTop: -10,
                      paddingBottom: 16, marginBottom: -16,
                      paddingLeft: 4, marginLeft: -4,
                      paddingRight: 16,
                    };
                    const allWindows = property.windows ?? [];
                    const propertyRooms = property.rooms ?? [];
                    const sortedRooms = [...propertyRooms].sort((a, b) => roomSortOrder(a) - roomSortOrder(b));
                    const unassigned = allWindows.filter((w) => !w.room || !propertyRooms.includes(w.room));
                    const titleColor = dark ? `rgba(${SANDY_RGB},0.85)` : `rgba(${lightTheme.accentRGB},0.82)`;
                    const divColor = dark ? 'rgba(255,255,255,0.06)' : `rgba(${lightTheme.accentRGB},0.10)`;

                    return (
                      <div
                        className="w-full rounded-3xl"
                        style={{
                          background: dark ? 'rgba(10,10,10,0.82)' : lightTheme.buttonBg,
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: dark ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${lightTheme.buttonBorder}`,
                          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : lightTheme.buttonShadow,
                        }}
                      >
                        <div className="px-5 pt-6 pb-8 space-y-6">

                          {/* General — WiFi + Garage + unassigned windows */}
                          <div>
                            <p className="lux-title mb-4 text-2xl" style={{ color: titleColor }}>{t('general')}</p>
                            <div style={rowStyle}>
                              <AmenitySquare id="wifi" iconKey="wifi" title={t('wifi')} selected={openAmenityId === 'wifi'} onToggle={() => openAmenity('wifi')} dark={dark} themeAccentRGB={!dark ? lightTheme.accentRGB : undefined} />
                              {property.GarageCode ? (
                                <AmenitySquare id="garage" iconKey="key" title={t('garageCode')} selected={openAmenityId === 'garage'} onToggle={() => openAmenity('garage')} dark={dark} themeAccentRGB={!dark ? lightTheme.accentRGB : undefined} />
                              ) : null}
                              {unassigned.map((w) => (
                                <AmenitySquare key={w.id} id={w.id} iconKey={w.icon} title={w.title} selected={openAmenityId === w.id} onToggle={() => openAmenity(w.id)} dark={dark} themeAccentRGB={!dark ? lightTheme.accentRGB : undefined} />
                              ))}
                            </div>
                          </div>

                          {/* Room sections */}
                          {sortedRooms.map((room) => {
                            const roomWindows = allWindows.filter((w) => w.room === room);
                            if (!roomWindows.length) return null;
                            return (
                              <div key={room}>
                                <div className="h-px mb-6" style={{ background: divColor }} />
                                <p className="lux-title mb-4 text-2xl" style={{ color: titleColor }}>{room}</p>
                                <div style={rowStyle}>
                                  {roomWindows.map((w) => (
                                    <AmenitySquare key={w.id} id={w.id} iconKey={w.icon} title={w.title} selected={openAmenityId === w.id} onToggle={() => openAmenity(w.id)} dark={dark} themeAccentRGB={!dark ? lightTheme.accentRGB : undefined} />
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Amenity detail overlay */}
          {openAmenityId && (() => {
            const aw = openAmenityId !== 'wifi' && openAmenityId !== 'garage'
              ? (property.windows ?? []).find((x) => x.id === openAmenityId)
              : null;
            const overlayIconKey = openAmenityId === 'wifi' ? 'wifi' : openAmenityId === 'garage' ? 'key' : aw?.icon;
            const overlayTitle = openAmenityId === 'wifi' ? t('wifi') : openAmenityId === 'garage' ? t('garageCode') : (aw?.title ?? '');
            const overlayIconColor = dark ? 'rgba(255,255,255,0.75)' : 'rgba(30,41,59,0.65)';
            return (
              <div
                className="fixed inset-0 z-60 flex justify-center"
                style={{
                  alignItems: 'center',
                  padding: '0 16px',
                  pointerEvents: 'auto',
                }}
                onClick={closeAmenity}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(0,0,0,0.78)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    opacity: amenityAnimating ? 1 : 0,
                    transition: 'opacity 270ms ease',
                  }}
                />
                {/* Card */}
                <div
                  className="relative flex w-full max-w-md flex-col overflow-hidden"
                  style={{
                    background: dark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '24px',
                    boxShadow: dark ? '0 24px 80px rgba(0,0,0,0.90)' : '0 12px 48px rgba(0,0,0,0.14)',
                    maxHeight: '72vh',
                    opacity: amenityAnimating ? 1 : 0,
                    transform: amenityAnimating ? 'scale(1)' : 'scale(0.94)',
                    transition: 'opacity 270ms ease, transform 270ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.22), transparent)` }} />

                  {/* Header */}
                  <div className="flex flex-none items-center gap-3 px-5 py-4" style={{ borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex-none" style={{ color: overlayIconColor }}>
                      <AmenityIconSvg iconKey={overlayIconKey} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>{overlayTitle}</p>
                      {aw?.room && <p className="text-xs leading-snug" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.45)' }}>{aw.room}</p>}
                    </div>
                    <button type="button" onClick={closeAmenity}
                      className="flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200"
                      style={{ border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.40)' }}
                      aria-label="Close">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
                    {openAmenityId === 'wifi' ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>{t('network')}</p>
                          <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.WiFiName}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>{t('password')}</p>
                            <p className="font-mono text-sm" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.WiFiPassword}</p>
                          </div>
                          <CopyPasswordButton password={property.WiFiPassword} />
                        </div>
                      </div>
                    ) : openAmenityId === 'garage' ? (
                      property.GarageCode
                        ? <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>{t('code')}</p>
                            <p className="font-mono text-sm whitespace-pre-wrap" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.GarageCode}</p>
                          </div>
                        : <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,41,59,0.40)' }}>{t('garageCodeNotProvided')}</p>
                    ) : aw ? renderWindowContent(aw, t) : null}
                  </div>

                </div>
              </div>
            );
          })()}

          <NeedHelpModal
            open={needHelpOpen}
            onClose={() => setNeedHelpOpen(false)}
            phone={property.ManagerPhone ?? ''}
            dark={dark}
            slug={slug}
            lightTheme={isLightThemed ? lightTheme : undefined}
          />

          {property.CheckoutInstructions ? (
            <CheckoutModal
              open={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
              instructions={property.CheckoutInstructions}
              dark={dark}
              lightTheme={isLightThemed ? lightTheme : undefined}
            />
          ) : null}

          {showReviewBanner && property.ReviewUrl ? (
            <ReviewPromptBanner
              reviewUrl={property.ReviewUrl}
              onDismiss={() => {
                sessionStorage.setItem(`pillar_review_shown_${slug}`, '1');
                setShowReviewBanner(false);
              }}
            />
          ) : null}

          {/* Photo lightbox */}
          {lightboxOpen && photos.length > 0 && (
            <div
              className="fixed inset-0 z-70 flex flex-col items-center justify-center gap-4 px-4"
              onClick={() => setLightboxOpen(false)}
            >
              <div className="absolute inset-0 bg-black/92 backdrop-blur-lg" />
              <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.95)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[lightboxIdx]}
                  alt={`Photo ${lightboxIdx + 1}`}
                  className="w-full object-cover"
                  style={{ maxHeight: '72vh', objectFit: 'cover' }}
                  draggable={false}
                />

                {/* Logo watermark */}
                {property.LogoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.LogoUrl}
                    alt="Property logo"
                    className="pointer-events-none absolute bottom-4 left-4 object-contain drop-shadow-lg"
                    style={{ height: '36px', maxWidth: '90px' }}
                    draggable={false}
                  />
                )}

                {/* Top bar: counter + close */}
                <div
                  className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3 pb-8"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
                >
                  <span className="text-xs font-semibold text-white/55">{t('photoCounter', { current: lightboxIdx + 1, total: photos.length })}</span>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/45 text-white/85 backdrop-blur-sm transition hover:bg-black/65"
                    aria-label="Close"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Prev arrow */}
                {lightboxIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((i) => i - 1)}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label={t('previousPhoto')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {/* Next arrow */}
                {lightboxIdx < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((i) => i + 1)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label={t('nextPhoto')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}

              </div>

              {/* Share section — below the photo window */}
              <div
                className="relative z-10 flex w-full max-w-md items-center justify-between rounded-2xl px-5 py-3.5"
                onClick={(e) => e.stopPropagation()}
                style={{ background: 'rgba(20,20,20,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <p className="text-sm font-medium text-white/70">{t('shareExperience')}</p>
                <button
                  type="button"
                  onClick={() => void sharePhotoWithLogo(photos[lightboxIdx])}
                  disabled={sharing}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 transition-all duration-200 active:scale-90 disabled:opacity-40"
                  aria-label="Share photo"
                >
                  {sharing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
