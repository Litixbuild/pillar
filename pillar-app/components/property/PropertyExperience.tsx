'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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

function NeedHelpModal({ open, onClose, phone, dark, slug }: { open: boolean; onClose: () => void; phone: string; dark: boolean; slug: string }) {
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [otherMessage, setOtherMessage] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lateCheckoutSent, setLateCheckoutSent] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

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

  const panelBg = dark ? 'rgba(10,10,10,0.97)' : 'rgba(255,255,255,0.97)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const dropdownBg = dark ? 'rgba(14,14,14,0.99)' : 'rgba(255,255,255,0.99)';
  const borderCol = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const labelCol = dark ? `rgba(${SANDY_RGB},0.55)` : 'rgba(100,80,40,0.60)';
  const textCol = dark ? 'rgba(255,255,255,0.90)' : '#1e293b';
  const mutedCol = dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,41,59,0.40)';
  const dividerCol = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const closeBtnBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const overlayBg = dark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.35)';
  const sandyLabel = labelCol;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center px-6 pb-6">
      <button type="button" onClick={onClose} className="absolute inset-0 backdrop-blur-sm" style={{ background: overlayBg }} aria-label="Close" />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        style={{ background: panelBg, border: `1px solid ${borderCol}` }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.25), transparent)` }} />

        <div className="max-h-[84vh] overflow-y-auto px-6 pb-7 pt-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="lux-title text-2xl" style={{ color: textCol }}>Need Help?</h2>
              <p className="mt-1 text-sm" style={{ color: mutedCol }}>Tell us what needs attention.</p>
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
              <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>Type</div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: category ? textCol : mutedCol }}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                >
                  <span>{category || 'Select…'}</span>
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
                          ? { backgroundColor: `rgba(${SANDY_RGB},0.12)`, color: textCol }
                          : { color: mutedCol }}
                      >
                        <span>{opt.name}</span>
                        {category === opt.name ? <span style={{ color: SANDY }}>✓</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {category === 'Other' ? (
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>Message</div>
                <input
                  value={otherMessage}
                  onChange={(e) => { setOtherMessage(e.target.value); setSent(false); setSubmitError(null); }}
                  placeholder="What is this about?"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: sandyLabel }}>Describe the problem</div>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setSent(false); }}
                placeholder="Add details (location, urgency, anything helpful)"
                className="min-h-25 w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
              />
            </div>

            {sent ? <div className="text-sm text-emerald-500">Sent. Thank you.</div> : null}
            {submitError ? <div className="text-sm text-red-400">{submitError}</div> : null}

            <button
              type="button"
              onClick={() => {
                if (!category) { setSubmitError('Please select a category.'); return; }
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
                      setSubmitError(d.error ?? 'Something went wrong. Please try again.');
                    }
                  })
                  .catch(() => setSubmitError('Network error. Please try again.'))
                  .finally(() => setSubmitting(false));
              }}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50"
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
                color: textCol,
              }}
            >
              <PaperPlaneIcon className="h-4 w-4" />
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>

          {/* Late Checkout */}
          <div className="mt-5">
            <div className="h-px" style={{ backgroundColor: dividerCol }} />
            <div className="mt-5">
              {lateCheckoutSent ? (
                <div className="rounded-2xl px-4 py-3.5 text-sm leading-relaxed" style={{ background: inputBg, border: `1px solid ${borderCol}`, color: mutedCol }}>
                  Your request has been submitted. We will contact you shortly with an update.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setLateCheckoutSent(true); }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200"
                  style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textCol }}
                >
                  Request Late Checkout
                </button>
              )}
            </div>
          </div>

          {/* Manager contact */}
          {phone ? (
            <>
              <div className="mt-5 h-px" style={{ backgroundColor: dividerCol }} />
              <div className="text-center">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: mutedCol }}>Property Manager</p>
                <a href={tel ? `tel:${tel}` : undefined} className="text-sm transition-colors duration-200" style={{ color: mutedCol }}>
                  {phone}
                </a>
              </div>
            </>
          ) : null}
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
}: {
  id: string;
  iconKey?: string;
  title: string;
  selected: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  void id;

  const bg = dark
    ? selected ? 'rgba(255,255,255,0.18)' : 'rgba(10,10,10,0.82)'
    : selected ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)';

  const border = dark
    ? `1px solid ${selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`
    : `1px solid ${selected ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.07)'}`;

  const shadow = dark
    ? selected ? '0 4px 24px rgba(0,0,0,0.50)' : '0 4px 16px rgba(0,0,0,0.40)'
    : selected ? '0 4px 20px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.07)';

  const iconColor = dark
    ? selected ? 'rgba(245,237,213,0.92)' : 'rgba(255,255,255,0.75)'
    : selected ? 'rgba(100,80,40,0.90)' : 'rgba(30,41,59,0.65)';

  const labelColor = dark
    ? selected ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.72)'
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

function renderWindowContent(w: AmenityWindow): ReactNode {
  if (w.type === 'text') {
    return w.body
      ? <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--body-color)' }}>{w.body}</p>
      : <p className="text-sm text-white/35">No content added yet.</p>;
  }
  if (w.type === 'pdf') {
    return w.url
      ? <a href={w.url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 transition-all duration-200" style={{ color: SANDY, textDecorationColor: `rgba(${SANDY_RGB},0.40)` }}>Open PDF</a>
      : <p className="text-sm text-white/35">No PDF uploaded yet.</p>;
  }
  if (w.type === 'image') {
    return w.url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={w.url} alt={w.title} className="w-full rounded-xl border border-white/[0.07]" loading="lazy" />
      : <p className="text-sm text-white/35">No image uploaded yet.</p>;
  }
  return w.url
    ? <div className="overflow-hidden rounded-xl border border-white/[0.07]"><video controls className="w-full" preload="metadata"><source src={w.url} />Your browser does not support the video tag.</video></div>
    : <p className="text-sm text-white/35">No video uploaded yet.</p>;
}

function guessAttachmentKind(url: string): 'image' | 'video' | 'other' {
  const u = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm)(\?|$)/.test(u)) return 'video';
  if (/(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?|$)/.test(u)) return 'image';
  return 'other';
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
  const PREVIEW_FADE_MS = 450;
  const FULL_VIEW_FADE_MS = 450;

  const [expanded, setExpanded] = useState(editableCustomWindows ? true : false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fullView, setFullView] = useState<'content' | 'amenities'>('content');
  const [isFullViewTransitioning, setIsFullViewTransitioning] = useState(false);
  const [openAmenityId, setOpenAmenityId] = useState<string | null>(null);
  const [amenityAnimating, setAmenityAnimating] = useState(false);
  const [needHelpOpen, setNeedHelpOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [carouselDragStart, setCarouselDragStart] = useState<number | null>(null);
  const [carouselDragOffset, setCarouselDragOffset] = useState(0);
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
    '--heading-color': property.HeadingColor || 'rgba(255,255,255,0.9)',
    '--body-color': property.TextColor || 'rgba(255,255,255,0.75)',
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

  const rootOverflow = expanded ? '' : 'overflow-hidden';
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

      {/* ── Layer 3: white.png — all expanded light-mode views ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: 'url(/images/white.png)',
          opacity: expanded && !isTransitioning && !dark ? 1 : 0,
        }}
      />

      {/* ── Logo — visible on content view only, not amenities list ── */}
      {expanded && fullView !== 'amenities' && property.LogoUrl ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-10 flex justify-center pt-6 transition-opacity duration-700 ease-in-out"
          style={{ opacity: isTransitioning || isFullViewTransitioning ? 0 : 1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dark ? property.LogoUrl : (property.LogoUrlDark ?? property.LogoUrl)}
            alt="Property logo"
            className="object-contain drop-shadow-lg"
            style={{ width: `${property.LogoSize ?? 100}px`, maxHeight: `${property.LogoSize ?? 100}px` }}
          />
        </div>
      ) : null}

      {/* ── Dark mode toggle — top right, visible when expanded ── */}

      {/* ── Edit mode bar ── */}
      {editableCustomWindows ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-md px-6 pt-4">
          <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/55/80 px-4 py-2.5 text-white backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Edit mode</div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-white/40">Reorder: drag or ↑↓</div>
              <button
                type="button"
                onClick={onAddWindow}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/70 transition-all duration-200 hover:bg-white/10"
              >
                <span className="text-base leading-none">+</span>
                Add window
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
          aria-label="Open full property details"
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
              <span className="text-[10px] font-medium uppercase tracking-[0.3em]">Explore</span>
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
          <div className="relative">
            {/* Content view */}
            <div
              className={
                'relative mx-auto flex h-screen max-w-md flex-col overflow-hidden px-6 transition-opacity duration-450 ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'content'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
              style={{ transitionDuration: `${PREVIEW_FADE_MS}ms` }}
            >
              <div
                className="flex min-h-0 flex-1 flex-col space-y-4 overflow-auto pb-10"
                style={{
                  paddingTop: editableCustomWindows ? '110px' : 'clamp(200px, 48vh, 320px)',
                }}
              >
                {/* Property name */}
                <div className="space-y-1 pb-1">
                  {property.PropertyAddress ? (
                    <p
                      className="text-[11px] font-medium uppercase tracking-[0.3em]"
                      style={{ color: dark ? 'rgba(245,237,213,0.55)' : 'rgba(100,80,40,0.70)' }}
                    >
                      {property.PropertyAddress}
                    </p>
                  ) : null}
                  <h1
                    className="lux-title text-[2.2rem] font-light leading-tight"
                    style={{ color: dark ? 'rgba(255,255,255,0.92)' : '#1e293b' }}
                  >
                    {property.PropertyName}
                  </h1>
                  <div className="mt-2.5 h-px w-10" style={{ background: dark ? 'linear-gradient(to right, rgba(245,237,213,0.50), transparent)' : 'linear-gradient(to right, rgba(100,80,40,0.35), transparent)' }} />
                </div>

                {/* Home Amenities button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFullViewTransitioning(true);
                    window.setTimeout(() => { setFullView('amenities'); }, FULL_VIEW_FADE_MS);
                    window.setTimeout(() => { setIsFullViewTransitioning(false); }, FULL_VIEW_FADE_MS * 2);
                  }}
                  className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl px-6 py-5 text-left transition-all duration-300"
                  style={{
                    background: dark ? 'rgba(10,10,10,0.82)' : 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl" style={{
                      background: dark ? 'rgba(245,237,213,0.10)' : 'rgba(100,80,40,0.08)',
                      color: dark ? `rgba(${SANDY_RGB},0.85)` : 'rgba(100,80,40,0.75)',
                    }}>
                      <HomeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>Home Amenities</div>
                      <div className="mt-0.5 text-xs" style={{ color: dark ? 'rgba(245,237,213,0.45)' : 'rgba(100,80,40,0.55)' }}>
                        {(() => {
                          const all = ['WiFi', property.GarageCode ? 'Garage Code' : null, ...(property.windows ?? []).map((w) => w.title)].filter(Boolean) as string[];
                          const preview = all.slice(0, 2);
                          return preview.join(', ') + (all.length > 2 ? ', and more!' : '');
                        })()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: dark ? `rgba(${SANDY_RGB},0.35)` : 'rgba(100,80,40,0.35)' }} />
                </button>

                {/* Pillar Concierge inline button */}
                <ChatConcierge slug={slug} placement="inline" dark={dark} />

                {/* Manager layout windows */}
                {managerLayout.length ? (
                  <div className="w-full rounded-3xl p-5" style={{
                    background: dark ? 'rgba(10,10,10,0.82)' : 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 20px rgba(0,0,0,0.08)',
                  }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="lux-title text-[1.1rem]" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>Amenities</p>
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
                                : <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>(empty)</p>;
                            }
                            if (typeof value === 'number' || typeof value === 'boolean') {
                              return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(30,41,59,0.75)' }}>{String(value)}</p>;
                            }
                            if (isAttachmentArray(value)) {
                              const first = value[0] as { url?: unknown };
                              const url = typeof first?.url === 'string' ? first.url : '';
                              if (!url) return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>(no attachment)</p>;
                              const kind = guessAttachmentKind(url);
                              if (kind === 'video') return (
                                <div className="overflow-hidden rounded-xl" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}>
                                  <video controls className="w-full" preload="metadata"><source src={url} />Your browser does not support the video tag.</video>
                                </div>
                              );
                              if (kind === 'image') return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={key} className="w-full rounded-xl" style={{ border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }} loading="lazy" />
                              );
                              return (
                                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 transition-all duration-200" style={{ color: dark ? SANDY : 'rgba(100,80,40,0.85)', textDecorationColor: dark ? `rgba(${SANDY_RGB},0.40)` : 'rgba(100,80,40,0.30)' }}>
                                  Open attachment
                                </a>
                              );
                            }
                            return <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.30)' }}>(no content)</p>;
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
                                <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: dark ? 'rgba(245,237,213,0.42)' : 'rgba(100,80,40,0.55)' }}>{key}</div>
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
                {property.ManagerPhone ? (
                  <button
                    type="button"
                    onClick={() => setNeedHelpOpen(true)}
                    className="group flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left transition-all duration-300"
                    style={{
                      background: dark ? 'rgba(10,10,10,0.82)' : 'rgba(255,255,255,0.82)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                      boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl" style={{
                        background: dark ? 'rgba(245,237,213,0.10)' : 'rgba(100,80,40,0.08)',
                        color: dark ? `rgba(${SANDY_RGB},0.85)` : 'rgba(100,80,40,0.75)',
                      }}>
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.1 10.81 19.79 19.79 0 01.07 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>Need Help?</div>
                        <div className="mt-0.5 text-xs" style={{ color: dark ? 'rgba(245,237,213,0.45)' : 'rgba(100,80,40,0.55)' }}>Contact your property manager</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: dark ? `rgba(${SANDY_RGB},0.35)` : 'rgba(100,80,40,0.35)' }} />
                  </button>
                ) : null}

                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => setDark((d) => !d)}
                    className="transition-opacity duration-200 hover:opacity-70"
                    style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.40)' }}
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? <SunIcon /> : <MoonIcon />}
                  </button>
                </div>
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
                    }}
                    className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl transition-all duration-200"
                    style={{
                      background: dark ? 'rgba(10,10,10,0.82)' : 'rgba(255,255,255,0.82)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
                      color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b',
                    }}
                    aria-label="Back"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="lux-title flex-1 text-center text-3xl tracking-[0.04em]" style={{ color: dark ? '#ffffff' : '#1e293b' }}>Home Amenities</div>
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
                              aria-label={`View photo ${idx + 1}`}
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
                    const titleColor = dark ? `rgba(${SANDY_RGB},0.85)` : 'rgba(100,80,40,0.80)';
                    const divColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

                    return (
                      <div
                        className="w-full rounded-3xl"
                        style={{
                          background: dark ? 'rgba(10,10,10,0.82)' : 'rgba(255,255,255,0.82)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                          boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : '0 4px 20px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div className="px-5 pt-6 pb-8 space-y-6">

                          {/* General — WiFi + Garage + unassigned windows */}
                          <div>
                            <p className="lux-title mb-4 text-2xl" style={{ color: titleColor }}>General</p>
                            <div style={rowStyle}>
                              <AmenitySquare id="wifi" iconKey="wifi" title="WiFi" selected={openAmenityId === 'wifi'} onToggle={() => openAmenity('wifi')} dark={dark} />
                              {property.GarageCode ? (
                                <AmenitySquare id="garage" iconKey="key" title="Garage Code" selected={openAmenityId === 'garage'} onToggle={() => openAmenity('garage')} dark={dark} />
                              ) : null}
                              {unassigned.map((w) => (
                                <AmenitySquare key={w.id} id={w.id} iconKey={w.icon} title={w.title} selected={openAmenityId === w.id} onToggle={() => openAmenity(w.id)} dark={dark} />
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
                                    <AmenitySquare key={w.id} id={w.id} iconKey={w.icon} title={w.title} selected={openAmenityId === w.id} onToggle={() => openAmenity(w.id)} dark={dark} />
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
            const overlayTitle = openAmenityId === 'wifi' ? 'WiFi' : openAmenityId === 'garage' ? 'Garage Code' : (aw?.title ?? '');
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
                          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>Network</p>
                          <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.WiFiName}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>Password</p>
                            <p className="font-mono text-sm" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.WiFiPassword}</p>
                          </div>
                          <CopyPasswordButton password={property.WiFiPassword} />
                        </div>
                      </div>
                    ) : openAmenityId === 'garage' ? (
                      property.GarageCode
                        ? <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.50)` : 'rgba(100,80,40,0.60)' }}>Code</p>
                            <p className="font-mono text-sm whitespace-pre-wrap" style={{ color: dark ? 'rgba(255,255,255,0.80)' : '#1e293b' }}>{property.GarageCode}</p>
                          </div>
                        : <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,41,59,0.40)' }}>Garage code not provided.</p>
                    ) : aw ? renderWindowContent(aw) : null}
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
          />

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
                  <span className="text-xs font-semibold text-white/55">{lightboxIdx + 1} / {photos.length}</span>
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
                    aria-label="Previous photo"
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
                    aria-label="Next photo"
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
                <p className="text-sm font-medium text-white/70">Share your Experience with Others!</p>
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
