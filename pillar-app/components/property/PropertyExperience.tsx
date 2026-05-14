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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
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
}: {
  children: ReactNode;
  variant?: 'primary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
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
      className={base + 'active:scale-[0.98] ' + (className ?? '')}
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

function NeedHelpModal({ open, onClose, phone, dark }: { open: boolean; onClose: () => void; phone: string; dark: boolean }) {
  const [category, setCategory] = useState<'Air Conditioning' | 'Electric' | 'Plumbing' | 'Other' | ''>('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [otherMessage, setOtherMessage] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [lateCheckoutSent, setLateCheckoutSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  const tel = phone.replace(/[^\d+]/g, '');
  const categoryOptions = ['Air Conditioning', 'Electric', 'Plumbing', 'Other'] as const;

  const panelBg = dark ? 'rgba(12,12,12,0.97)' : 'rgba(255,255,255,0.92)';
  const inputBg = dark ? 'rgba(14,14,14,0.80)' : 'rgba(0,0,0,0.06)';
  const dropdownBg = dark ? 'rgba(10,10,10,0.98)' : 'rgba(255,255,255,0.98)';
  const borderCol = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const labelCol = dark ? `rgba(${SANDY_RGB},0.55)` : `rgba(${SANDY_RGB[0]},100,30,0.70)`;
  const textCol = dark ? 'rgba(255,255,255,0.90)' : 'rgba(20,15,5,0.90)';
  const mutedCol = dark ? 'rgba(255,255,255,0.35)' : 'rgba(20,15,5,0.40)';
  const dividerCol = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const closeBtnBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const overlayBg = dark ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0.45)';
  const sandyLabel = `rgba(${SANDY_RGB},0.55)`;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center px-6 pb-6">
      <button type="button" onClick={onClose} className="absolute inset-0 backdrop-blur-sm" style={{ background: overlayBg }} aria-label="Close" />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        style={{ background: panelBg, border: `1px solid ${borderCol}` }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.30), transparent)` }} />

        <div className="max-h-[84vh] overflow-y-auto px-6 pb-7 pt-6">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-light" style={{ color: textCol }}>Need Help?</h2>
              <p className="mt-1 text-sm" style={{ color: mutedCol }}>Tell us what needs attention.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl transition-all duration-200"
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
                        key={opt}
                        type="button"
                        onClick={() => { setCategory(opt); setSent(false); setCategoryOpen(false); if (opt !== 'Other') setOtherMessage(''); }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors duration-150"
                        style={category === opt
                          ? { backgroundColor: `rgba(${SANDY_RGB},0.12)`, color: textCol }
                          : { color: mutedCol }}
                      >
                        <span>{opt}</span>
                        {category === opt ? <span style={{ color: SANDY }}>✓</span> : null}
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
                  onChange={(e) => { setOtherMessage(e.target.value); setSent(false); }}
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

            <GradientButton
              type="button"
              onClick={() => {
                setSent(true);
                console.log('[work-order]', { category, otherMessage, description });
                window.setTimeout(() => { setCategory(''); setOtherMessage(''); setDescription(''); setSent(false); onClose(); }, 850);
              }}
            >
              <PaperPlaneIcon className="h-4 w-4" />
              Send
            </GradientButton>
          </div>

          {/* Late Checkout */}
          <div className="mt-5">
            <div className="h-px" style={{ backgroundColor: dividerCol }} />
            <div className="mt-5">
              {lateCheckoutSent ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3.5 text-sm leading-relaxed text-amber-600">
                  Your request has been submitted! We will contact you shortly with an update.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setLateCheckoutSent(true); }}
                  className="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 py-3.5 text-sm font-semibold tracking-wide text-amber-500 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/16"
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
}: {
  id: string;
  iconKey?: string;
  title: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-200"
      style={selected
        ? { borderColor: 'var(--accent-40)', boxShadow: '0 0 20px var(--accent-10)', background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))' }
        : { borderColor: 'var(--accent-18)', background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))' }}
    >
      <div
        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl ring-1 transition-colors duration-200"
        style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent-18)' }}
      >
        <AmenityIconSvg iconKey={iconKey} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-white transition-colors duration-200">
          {title}
        </p>
      </div>
    </button>
  );
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
  const [needHelpOpen, setNeedHelpOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const backgroundUrl = useMemo(
    () => property.HeroImage || '/images/heroimage.jpg',
    [property.HeroImage]
  );

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

  const rootOverflow = expanded ? '' : 'overflow-hidden';
  const showExpandedContent = expanded && !isTransitioning && !isFullViewTransitioning && fullView === 'content';

  return (
    <div className={`min-h-screen font-sans ${rootOverflow}`} style={themeVars}>

      {/* ── Layer 1: hero image — visible on preview, fades away when expanded ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{ backgroundImage: `url(${backgroundUrl})`, opacity: expanded ? 0 : 1 }}
      />

      {/* ── Layer 2: expanded background — bright blue by default, dark on toggle ── */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center transition-opacity duration-450 ease-in-out"
        style={{
          opacity: expanded && !isTransitioning ? 1 : 0,
          backgroundImage: dark
            ? 'url(/images/bg3.png)'
            : `url(/images/${property.BackgroundKey && property.BackgroundKey !== 'background' ? property.BackgroundKey : 'mainbackground'}.png)`,
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
            src={property.LogoUrl}
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
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.38em] text-white/52 drop-shadow-sm">
                {property.PropertyAddress}
              </p>
            ) : null}
            <h1 className="mb-5 text-[2.6rem] font-light leading-none tracking-tight text-white drop-shadow-lg">
              {property.PropertyName}
            </h1>
            <div className="mb-4 h-px w-10 bg-white/22" />
            {property.DetailedHouseBio ? (
              <p className="text-[13px] leading-relaxed text-white/55 drop-shadow-sm">
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
                      style={{ color: 'var(--accent)' }}
                    >
                      {property.PropertyAddress}
                    </p>
                  ) : null}
                  <h1
                    className="text-[2.05rem] font-light leading-tight tracking-[-0.01em]"
                    style={{ color: 'var(--heading-color)' }}
                  >
                    {property.PropertyName}
                  </h1>
                  <div className="mt-2.5 h-px w-10" style={{ backgroundImage: 'linear-gradient(to right, var(--accent-50), transparent)' }} />
                </div>

                {/* Home Amenities button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFullViewTransitioning(true);
                    window.setTimeout(() => { setFullView('amenities'); }, FULL_VIEW_FADE_MS);
                    window.setTimeout(() => { setIsFullViewTransitioning(false); }, FULL_VIEW_FADE_MS * 2);
                  }}
                  className="group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border px-6 py-5 text-left transition-all duration-300"
                  style={{
                    borderColor: 'var(--accent-18)',
                    background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--accent-22), transparent)' }} />
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl ring-1" style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)', ringColor: 'var(--accent-18)' }}>
                      <HomeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide text-white">Home Amenities</div>
                      <div className="mt-0.5 text-xs" style={{ color: 'var(--accent-50)' }}>
                        {(() => {
                          const all = ['WiFi', property.GarageCode ? 'Garage Code' : null, ...(property.windows ?? []).map((w) => w.title)].filter(Boolean) as string[];
                          const preview = all.slice(0, 2);
                          return preview.join(', ') + (all.length > 2 ? ', and more!' : '');
                        })()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: `rgba(${SANDY_RGB},0.45)` }} />
                </button>

                {/* Pillar Concierge inline button */}
                <ChatConcierge slug={slug} placement="inline" dark={dark} />

                {/* Manager layout windows */}
                {managerLayout.length ? (
                  <GlassCard>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <SectionTitle>Amenities</SectionTitle>
                        {editableCustomWindows ? (
                          <button
                            type="button"
                            onClick={onAddWindow}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-lg font-semibold text-white/70 transition-all duration-200 hover:bg-white/10"
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
                                ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">{value}</p>
                                : <p className="text-sm text-white/35">(empty)</p>;
                            }
                            if (typeof value === 'number' || typeof value === 'boolean') {
                              return <p className="text-sm text-white/75">{String(value)}</p>;
                            }
                            if (isAttachmentArray(value)) {
                              const first = value[0] as { url?: unknown };
                              const url = typeof first?.url === 'string' ? first.url : '';
                              if (!url) return <p className="text-sm text-white/35">(no attachment)</p>;
                              const kind = guessAttachmentKind(url);
                              if (kind === 'video') return (
                                <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                                  <video controls className="w-full" preload="metadata"><source src={url} />Your browser does not support the video tag.</video>
                                </div>
                              );
                              if (kind === 'image') return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt={key} className="w-full rounded-xl border border-white/[0.07]" loading="lazy" />
                              );
                              return (
                                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 transition-all duration-200" style={{ color: SANDY, textDecorationColor: `rgba(${SANDY_RGB},0.40)` }}>
                                  Open attachment
                                </a>
                              );
                            }
                            return <p className="text-sm text-white/35">(no content)</p>;
                          };

                          return (
                            <div
                              key={`${key}-${idx}`}
                              className={editableCustomWindows ? 'rounded-xl border border-white/6 p-3' : 'space-y-2'}
                              draggable={editableCustomWindows}
                              onDragStart={(e) => { if (!editableCustomWindows) return; e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move'; }}
                              onDragOver={(e) => { if (!editableCustomWindows) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                              onDrop={(e) => { if (!editableCustomWindows) return; e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isFinite(from) && onReorderWindows) onReorderWindows(from, idx); }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: 'var(--accent-45)' }}>{key}</div>
                                {editableCustomWindows ? (
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => onReorderWindows?.(idx, Math.max(0, idx - 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-black/55/50 text-white/55 transition-colors duration-200 hover:bg-black/55" aria-label="Move up">↑</button>
                                    <button type="button" onClick={() => onReorderWindows?.(idx, Math.min(managerLayout.length - 1, idx + 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-black/55/50 text-white/55 transition-colors duration-200 hover:bg-black/55" aria-label="Move down">↓</button>
                                    <button type="button" onClick={() => onRemoveWindow?.(idx)} className="text-xs font-semibold text-rose-300/50 underline decoration-rose-300/20 underline-offset-4 transition-all duration-200 hover:text-rose-300/75 hover:decoration-rose-300/45">Remove</button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="mt-2">{renderValue()}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                ) : null}

                {/* Need Help button */}
                {property.ManagerPhone ? (
                  <button
                    type="button"
                    onClick={() => setNeedHelpOpen(true)}
                    className="w-full rounded-2xl border py-3.5 text-sm font-semibold tracking-widest transition-all duration-300"
                    style={{
                      background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`,
                      color: '#3d2a0a',
                      boxShadow: `0 0 20px rgba(${SANDY_RGB},0.25)`,
                    }}
                  >
                    Need Help?
                  </button>
                ) : null}

                {/* Dark / light mode toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setDark((d) => !d)}
                    className="transition-opacity duration-200 hover:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? <SunIcon /> : <MoonIcon />}
                  </button>
                </div>

                <div className="h-6" />
              </div>
            </div>

            {/* House Rules — fixed footer */}
            {property.HouseRules && showExpandedContent ? (
              <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-6 pb-5 pt-8"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
              >
                <div className="text-center">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/28">House Rules</p>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-white/42">
                    {property.HouseRules}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Amenities full view */}
            <div
              className={
                'absolute inset-0 transition-opacity duration-450 ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'amenities'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
            >
              <div className="relative mx-auto flex h-screen max-w-md flex-col px-6">
                <div className="flex min-h-0 flex-1 flex-col overflow-auto pb-12 pt-12">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAmenityId(null);
                        setIsFullViewTransitioning(true);
                        window.setTimeout(() => { setFullView('content'); }, FULL_VIEW_FADE_MS);
                        window.setTimeout(() => { setIsFullViewTransitioning(false); }, FULL_VIEW_FADE_MS * 2);
                      }}
                      className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border transition-all duration-200"
                      style={{ borderColor: 'var(--accent-18)', background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))', color: 'var(--accent)' }}
                      aria-label="Back"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="lux-title flex-1 text-center text-xl whitespace-nowrap" style={{ color: 'var(--heading-color)' }}>Home Amenities</div>
                    <div className="h-10 w-10 flex-none" />
                  </div>

                  {/* Amenity grid */}
                  <div className="mt-5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* WiFi tile */}
                      <AmenityTile
                        id="wifi"
                        iconKey="wifi"
                        title="WiFi"
                        selected={openAmenityId === 'wifi'}
                        onToggle={() => setOpenAmenityId((v) => (v === 'wifi' ? null : 'wifi'))}
                      />

                      {/* Garage tile */}
                      <AmenityTile
                        id="garage"
                        iconKey="key"
                        title="Garage Code"
                        selected={openAmenityId === 'garage'}
                        onToggle={() => setOpenAmenityId((v) => (v === 'garage' ? null : 'garage'))}
                      />

                      {/* Custom window tiles */}
                      {(property.windows ?? []).map((w) => (
                        <AmenityTile
                          key={w.id}
                          id={w.id}
                          iconKey={w.icon}
                          title={w.title}
                          selected={openAmenityId === w.id}
                          onToggle={() => setOpenAmenityId((v) => (v === w.id ? null : w.id))}
                        />
                      ))}
                    </div>

                    {/* Detail panel — appears below the grid when a tile is selected */}
                    {openAmenityId ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border backdrop-blur-sm" style={{ borderColor: 'var(--accent-22)', background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))' }}>
                        <div className="border-b px-5 py-3.5" style={{ borderColor: 'var(--accent-18)' }}>
                          {openAmenityId === 'wifi' ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)' }}>
                                <AmenityIconSvg iconKey="wifi" className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-semibold text-white/90" style={{ color: 'var(--heading-color)' }}>WiFi</p>
                            </div>
                          ) : openAmenityId === 'garage' ? (
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)' }}>
                                <AmenityIconSvg iconKey="key" className="h-4 w-4" />
                              </div>
                              <p className="text-sm font-semibold text-white/90" style={{ color: 'var(--heading-color)' }}>Garage Code</p>
                            </div>
                          ) : (
                            (() => {
                              const w = (property.windows ?? []).find((x) => x.id === openAmenityId);
                              return w ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)' }}>
                                    <AmenityIconSvg iconKey={w.icon} className="h-4 w-4" />
                                  </div>
                                  <p className="text-sm font-semibold text-white/90" style={{ color: 'var(--heading-color)' }}>{w.title}</p>
                                </div>
                              ) : null;
                            })()
                          )}
                        </div>
                        <div className="px-5 py-4">
                          {openAmenityId === 'wifi' ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent-45)' }}>Network</p>
                                <p className="text-sm text-white/85" style={{ color: 'var(--body-color)' }}>{property.WiFiName}</p>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent-45)' }}>Password</p>
                                  <p className="font-mono text-sm text-white/85" style={{ color: 'var(--body-color)' }}>{property.WiFiPassword}</p>
                                </div>
                                <CopyPasswordButton password={property.WiFiPassword} />
                              </div>
                            </div>
                          ) : openAmenityId === 'garage' ? (
                            property.GarageCode
                              ? <div className="space-y-1"><p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'var(--accent-45)' }}>Code</p><p className="font-mono text-sm text-white/85 whitespace-pre-wrap" style={{ color: 'var(--body-color)' }}>{property.GarageCode}</p></div>
                              : <div className="text-sm text-white/45">Garage code not provided.</div>
                          ) : (
                            (() => {
                              const w = (property.windows ?? []).find((x) => x.id === openAmenityId);
                              return w ? renderWindowContent(w) : null;
                            })()
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NeedHelpModal
            open={needHelpOpen}
            onClose={() => setNeedHelpOpen(false)}
            phone={property.ManagerPhone ?? ''}
            dark={dark}
          />
        </>
      ) : null}
    </div>
  );
}
