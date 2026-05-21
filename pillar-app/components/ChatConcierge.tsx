'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

const SANDY = '#F5EDD5';
const SANDY_RGB = '245,237,213';

function makeChatVars(dark: boolean): React.CSSProperties {
  return {
    '--accent':      SANDY,
    '--accent-10':   `rgba(${SANDY_RGB},0.10)`,
    '--accent-18':   `rgba(${SANDY_RGB},0.18)`,
    '--accent-22':   `rgba(${SANDY_RGB},0.22)`,
    '--accent-28':   `rgba(${SANDY_RGB},0.28)`,
    '--accent-45':   `rgba(${SANDY_RGB},0.45)`,
    '--accent-50':   `rgba(${SANDY_RGB},0.50)`,
    '--btn-bg-from': `rgba(${SANDY_RGB},0.22)`,
    '--btn-bg-to':   `rgba(${SANDY_RGB},0.14)`,
    '--panel-deep':  dark ? 'rgba(12,12,12,0.97)'  : 'rgba(255,255,255,0.93)',
    '--panel-mid':   dark ? 'rgba(18,18,18,0.60)'  : 'rgba(0,0,0,0.04)',
    '--panel-card':  dark ? 'rgba(22,22,22,0.92)'  : 'rgba(0,0,0,0.04)',
    '--panel-input': dark ? 'rgba(14,14,14,0.80)'  : 'rgba(0,0,0,0.06)',
    '--text-primary':   dark ? 'rgba(255,255,255,0.90)' : 'rgba(61,42,10,0.90)',
    '--text-muted':     dark ? 'rgba(255,255,255,0.40)' : 'rgba(61,42,10,0.50)',
    '--border-col':     dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    '--star-col':       dark ? SANDY : '#B8820A',
    '--copy-col':       dark ? SANDY : 'rgba(61,42,10,0.78)',
    '--copy-border':    dark ? `rgba(${SANDY_RGB},0.22)` : 'rgba(61,42,10,0.22)',
    '--copy-bg':        dark ? `rgba(${SANDY_RGB},0.10)` : 'rgba(61,42,10,0.07)',
    '--phone-col':      dark ? SANDY : '#4A6FA5',
    '--header-sub':     dark ? `rgba(${SANDY_RGB},0.55)` : 'rgba(61,42,10,0.60)',
  } as React.CSSProperties;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ─── Icons ──────────────────────────────────────────────────── */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClocheIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4 14.5c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 16.5h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 5.2V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M9 18l-4 2V6l4-2 6 2 4-2v14l-4 2-6-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 4v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 6v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BikeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 17.5l4.4-8h3.2l2 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6 9.5H8.7L7.6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SlidingTriggerIcon() {
  return (
    <div className="relative h-6 w-6 overflow-hidden">
      <div className="flex h-6 w-24 animate-[conciergeIconSlide_4.2s_ease-in-out_infinite]">
        <ClocheIcon className="h-6 w-6" />
        <MapIcon className="h-6 w-6" />
        <BikeIcon className="h-6 w-6" />
        <ClocheIcon className="h-6 w-6" />
      </div>
      <style jsx>{`
        @keyframes conciergeIconSlide {
          0%, 22%  { transform: translateX(0px);   }
          33%, 55% { transform: translateX(-24px);  }
          66%, 88% { transform: translateX(-48px);  }
          100%     { transform: translateX(-72px);  }
        }
      `}</style>
    </div>
  );
}

function ButlerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4.5 18.5c1.3-2.9 4.1-4.8 7.5-4.8s6.2 1.9 7.5 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 10.2c0-2.3 1.8-4.2 4-4.2s4 1.9 4 4.2c0 2.3-1.8 4.1-4 4.1s-4-1.8-4-4.1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 6.4c.9-.7 1.9-1.1 3-1.1s2.1.4 3 1.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Typing indicator ───────────────────────────────────────── */

function TypingDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
      Thinking{'.'.repeat(dots)}
    </span>
  );
}

/* ─── Star rating ────────────────────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="text-xs">
      <span style={{ color: 'var(--star-col)' }}>{'★'.repeat(n)}</span>
      <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>{'★'.repeat(5 - n)}</span>
      <span className="ml-1 font-medium" style={{ color: 'var(--text-muted)' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

/* ─── Copy button ────────────────────────────────────────────── */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }
        catch { /* ignore */ }
      }}
      className="whitespace-nowrap shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all duration-200"
      style={{ borderColor: 'var(--copy-border)', backgroundColor: 'var(--copy-bg)', color: 'var(--copy-col)' }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Phone mini button ──────────────────────────────────────── */

function PhoneButton({ phone }: { phone: string }) {
  const tel = phone.replace(/[^\d+]/g, '');
  return (
    <a
      href={tel ? `tel:${tel}` : undefined}
      className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border shadow-sm transition-all duration-200"
      style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)', color: 'var(--phone-col)' }}
      aria-label={`Call ${phone}`}
      title={phone}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.6 21 3 13.4 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.46.57 3.58.11.35.03.74-.23 1.01L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/* ─── Google Maps mini button ────────────────────────────────── */

function MapsButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border shadow-sm transition-all duration-200"
      style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}
      aria-label="Open in Google Maps"
      title="Open in Google Maps"
    >
      <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 3.2l6-6C34.4 2.6 29.6.5 24 .5 14.7.5 6.7 5.8 2.9 13.5l7 5.4C11.7 13.2 17.4 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.5c-.3 2-1.7 5-4.9 7.1l7.6 5.9c4.5-4.2 7-10.3 7-17.7z" />
        <path fill="#FBBC05" d="M9.9 28.9c-.5-1.4-.8-2.8-.8-4.4s.3-3 .8-4.4l-7-5.4C1.3 17.8.5 21 .5 24.5s.8 6.7 2.4 9.8l7-5.4z" />
        <path fill="#34A853" d="M24 47.5c5.6 0 10.4-1.8 13.9-5l-7.6-5.9c-2 1.4-4.7 2.4-6.3 2.4-6.6 0-12.3-3.7-14.1-9.4l-7 5.4c3.8 7.7 11.8 12.5 21.1 12.5z" />
      </svg>
    </a>
  );
}

/* ─── Link helpers ───────────────────────────────────────────── */

function prettyUrlLabel(raw: string) {
  try {
    const u = new URL(raw);
    const path = u.pathname && u.pathname !== '/' ? u.pathname : '';
    const label = `${u.hostname}${path}`;
    if (label.length <= 44) return label;
    return `${label.slice(0, 41)}…`;
  } catch {
    if (raw.length <= 44) return raw;
    return `${raw.slice(0, 41)}…`;
  }
}

function linkifyLine(line: string) {
  const urlRe = /(https?:\/\/[^\s]+)/g;
  return line.split(urlRe).map((part, idx) =>
    urlRe.test(part) ? (
      <a key={idx} href={part} target="_blank" rel="noreferrer" className="max-w-full wrap-anywhere underline underline-offset-2 transition-all duration-200" style={{ color: SANDY, textDecorationColor: `rgba(${SANDY_RGB},0.40)` }}>
        {prettyUrlLabel(part)}
      </a>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

/* ─── Message text renderer ──────────────────────────────────── */

function MessageText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  return (
    <div className="space-y-1 whitespace-pre-wrap wrap-anywhere">
      {lines.map((line, i) => {
        const placeLine = line.match(/^\s*(\d+)\)\s+(.+)$/);
        if (placeLine) {
          const chunks = placeLine[2].split(' | ').map((x) => x.trim());
          const title = chunks[0] || '—';
          const details = chunks.slice(1);
          const website = details.find((d) => d.toLowerCase().startsWith('website:'));
          const maps = details.find((d) => d.toLowerCase().startsWith('maps:'));
          const websiteHref = (website || '').split(/\s+/).slice(1).join(' ').trim();
          const mapsHref = (maps || '').split(/\s+/).slice(1).join(' ').trim();
          const href = websiteHref || mapsHref;
          const titleNode = href
            ? <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">{title}</a>
            : title;
          const cleanedDetails = details.filter((d) => {
            const low = d.toLowerCase();
            if (href && (low.startsWith('website:') || low.startsWith('maps:'))) return false;
            if (low.startsWith('address:')) return false;
            return true;
          });
          return (
            <div key={i} className="rounded-xl border p-3 shadow-sm" style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{titleNode}</div>
                {mapsHref ? <MapsButton href={mapsHref} /> : null}
              </div>
              {cleanedDetails.length ? (
                <div className="mt-1 space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {cleanedDetails.map((d, di) => <div key={di}>{linkifyLine(d)}</div>)}
                </div>
              ) : null}
            </div>
          );
        }

        const phoneMatch = line.match(/\bPhone:\s*([^|]+)(\||$)/i);
        if (phoneMatch) {
          const raw = phoneMatch[1].trim();
          const tel = raw.replace(/[^\d+]/g, '');
          const before = line.slice(0, phoneMatch.index || 0) + 'Phone: ';
          const after = line.slice((phoneMatch.index || 0) + phoneMatch[0].length - (phoneMatch[2] ? 1 : 0));
          return (
            <div key={i}>
              {linkifyLine(before)}
              <a href={tel ? `tel:${tel}` : undefined} className="underline underline-offset-2">{raw}</a>
              {after ? linkifyLine(after) : null}
            </div>
          );
        }
        return <div key={i}>{linkifyLine(line)}</div>;
      })}
    </div>
  );
}

/* ─── Butler card ────────────────────────────────────────────── */

function ButlerCard({ data, onRetry }: { data: ButlerCardData; onRetry?: () => void }) {
  if (data.kind === 'text') return <MessageText text={data.text} />;

  if (data.kind === 'error') {
    return (
      <div className="space-y-3">
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{data.message}</div>
        {data.canRetry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-semibold tracking-wide transition-all duration-200"
            style={{ borderColor: 'var(--accent-22)', background: 'var(--accent-10)', color: 'var(--accent)' }}
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (data.kind === 'wifi') {
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>WiFi</div>
        {data.wifiName.trim() ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Network:</span> {data.wifiName}</div>
            <CopyButton value={data.wifiName} />
          </div>
        ) : null}
        {data.wifiPassword.trim() ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Password:</span> {data.wifiPassword}</div>
            <CopyButton value={data.wifiPassword} />
          </div>
        ) : (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No WiFi password on file.</div>
        )}
      </div>
    );
  }

  if (data.kind === 'phone') {
    const tel = data.phoneNumber.replace(/[^\d+]/g, '');
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>Manager Contact</div>
        <div className="flex items-center justify-between gap-2">
          <a href={tel ? `tel:${tel}` : undefined} className="text-xs underline underline-offset-2" style={{ color: 'var(--text-muted)' }}>
            {data.phoneNumber || '—'}
          </a>
          <CopyButton value={data.phoneNumber || ''} />
        </div>
      </div>
    );
  }

  if (data.kind === 'weather') {
    const chips = (data.summary || '').split('·').map(p => p.trim()).filter(Boolean);
    return (
      <div className="space-y-2.5">
        <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>Current Weather</div>
        {chips.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{ background: 'var(--accent-10)', color: 'var(--text-primary)', border: '1px solid var(--accent-18)' }}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.summary || '—'}</div>
        )}
      </div>
    );
  }

  if (data.kind === 'property') {
    return (
      <div className="space-y-2">
        <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>Property</div>
        {data.address ? <div className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Address:</span> {data.address}</div> : null}
        {data.zip ? <div className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>ZIP:</span> {data.zip}</div> : null}
        {data.managerPhone ? (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Manager Phone:</span> {data.managerPhone}</div>
            <CopyButton value={data.managerPhone} />
          </div>
        ) : null}
        {data.houseRules ? <div className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>House Rules:</span> {data.houseRules}</div> : null}
      </div>
    );
  }

  if (data.kind === 'places') {
    if (!data.places.length) return <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No results found nearby.</div>;
    return (
      <div className="space-y-2.5">
        {data.intro ? (
          <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{data.intro}</div>
        ) : null}
        <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>{data.label || 'Nearby options'}</div>
        <div className="space-y-2">
          {data.places.map((p, idx) => (
            <div key={idx} className="rounded-xl border p-3 shadow-sm" style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="lux-title text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {(() => {
                      const href = p.websiteUri || p.googleMapsUri;
                      return href
                        ? <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">{p.name}</a>
                        : p.name;
                    })()}
                  </div>
                  {(p.cuisine || typeof p.rating === 'number') ? (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {p.cuisine ? <span>{p.cuisine}</span> : null}
                      {typeof p.rating === 'number' ? (
                        <span className="flex items-center gap-0.5">
                          {p.cuisine ? <span style={{ opacity: 0.35 }}>·</span> : null}
                          <span style={{ color: 'var(--star-col)' }}>{'★'.repeat(Math.min(5, Math.round(p.rating)))}</span>
                          <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - Math.min(5, Math.round(p.rating)))}</span>
                          <span className="ml-0.5">{p.rating.toFixed(1)}</span>
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {p.blurb ? (
                    <div className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.blurb}</div>
                  ) : null}
                </div>
                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  {p.googleMapsUri ? <MapsButton href={p.googleMapsUri} /> : null}
                  {p.phone ? <PhoneButton phone={p.phone} /> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === 'itinerary') {
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return (
      <div className="space-y-3">
        {sections.map((s, si) => (
          <div key={si} className="space-y-2">
            <div className="lux-title text-sm" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
            <div className="space-y-2">
              {(s.places || []).map((p, pi) => (
                <div key={pi} className="rounded-xl border p-3 shadow-sm" style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="lux-title text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {p.googleMapsUri
                          ? <a href={p.googleMapsUri} target="_blank" rel="noreferrer" className="underline underline-offset-2">{p.name || '—'}</a>
                          : (p.name || '—')}
                      </div>
                      {typeof p.rating === 'number' ? (
                        <div className="mt-0.5 flex items-center gap-0.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--star-col)' }}>{'★'.repeat(Math.min(5, Math.round(p.rating)))}</span>
                          <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - Math.min(5, Math.round(p.rating)))}</span>
                          <span className="ml-0.5">{p.rating.toFixed(1)}</span>
                        </div>
                      ) : null}
                      {p.blurb ? <div className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.blurb}</div> : null}
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      {p.googleMapsUri ? <MapsButton href={p.googleMapsUri} /> : null}
                      {p.phone ? <PhoneButton phone={p.phone} /> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <MessageText text="—" />;
}

/* ─── Types ──────────────────────────────────────────────────── */

type ChatRole = 'user' | 'butler';

type ButlerCardData =
  | { kind: 'text'; text: string; model?: string }
  | { kind: 'error'; message: string; canRetry: boolean; model?: string }
  | { kind: 'wifi'; wifiName: string; wifiPassword: string; model?: string }
  | { kind: 'phone'; phoneNumber: string; model?: string }
  | { kind: 'property'; address: string; zip: string; houseRules: string; managerPhone: string; wifiName: string; model?: string }
  | { kind: 'itinerary'; intro?: string; sections: Array<{ title: string; places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string; rating?: number }> }>; model?: string }
  | { kind: 'places'; label?: string; intro?: string; places: Array<{ name: string; cuisine?: string; blurb?: string; formattedAddress?: string; phone?: string; websiteUri?: string; googleMapsUri?: string; rating?: number }>; model?: string }
  | { kind: 'weather'; summary: string; model?: string };

type ChatMessage = { id: string; role: ChatRole; text: string; data?: ButlerCardData };

type Props = { slug: string; placement?: 'floating' | 'inline'; triggerClassName?: string; dark?: boolean };

type OverloadedErrorPayload = { code: 'OVERLOADED'; message: string; retryAfterMs: number };

type ChatOkResponse =
  | { kind: 'text'; response: string; model: string }
  | { kind: 'wifi'; wifiName: string; wifiPassword: string; model: string }
  | { kind: 'phone'; phoneNumber: string; model: string }
  | { kind: 'property'; address: string; zip: string; houseRules: string; managerPhone: string; wifiName: string; model: string }
  | { kind: 'itinerary'; intro: string; sections: Array<{ title: string; places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string }> }>; model: string }
  | { kind: 'places'; label?: string; intro?: string; places: Array<{ name: string; cuisine?: string; blurb?: string; formattedAddress?: string; phone?: string; websiteUri?: string; googleMapsUri?: string; rating?: number }>; model: string }
  | { kind: 'weather'; summary: string; model: string };

const SUGGESTED = ["What's the WiFi?", 'Local dinner spots', 'Plan my day', 'Check-out instructions'] as const;

/* ─── Main export ────────────────────────────────────────────── */

export default function ChatConcierge({ slug, placement = 'floating', triggerClassName, dark = true }: Props) {
  const chatVars = useMemo(() => makeChatVars(dark), [dark]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: '0', role: 'butler', text: `${getTimeGreeting()}. I'm Pillar — your private estate concierge. How may I assist?` },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const requestNonceRef = useRef(0);
  const lastUserMessageRef = useRef<string>('');
  const consecutiveFailureCountRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  void ButlerCard;

  const canSend = useMemo(() => input.trim().length > 0 && !isTyping, [input, isTyping]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, isTyping]);

  function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

  function isOverloadedResponse(data: unknown): data is OverloadedErrorPayload {
    if (!data || typeof data !== 'object') return false;
    const v = data as Partial<OverloadedErrorPayload>;
    return v.code === 'OVERLOADED' && typeof v.message === 'string' && typeof v.retryAfterMs === 'number';
  }

  function isChatOkResponse(data: unknown): data is ChatOkResponse {
    if (!data || typeof data !== 'object') return false;
    const v = data as Partial<ChatOkResponse>;
    return typeof v.kind === 'string' && typeof (v as { model?: unknown }).model === 'string';
  }

  async function countdown(ms: number, label: string) {
    let remaining = ms;
    while (remaining > 0) {
      setStatusText(`${label} (retrying in ${Math.max(1, Math.ceil(remaining / 1000))}s)`);
      const step = Math.min(1000, remaining);
      await sleep(step);
      remaining -= step;
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    lastUserMessageRef.current = trimmed;
    setMessages((prev) => [...prev, { id: String(prev.length), role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    setStatusText(null);
    requestNonceRef.current += 1;
    const variant = requestNonceRef.current;

    try {
      const maxAttempts = 3;
      let lastErr: unknown = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Build conversation history (all prior messages, excluding the initial greeting).
        // For structured card responses, summarize what was actually shown so the AI
        // can reason about it (e.g. see it showed outdoor activities and pivot when asked).
        const summarizeCard = (data: ButlerCardData): string => {
          if (data.kind === 'text') return data.text;
          if (data.kind === 'itinerary') {
            const sectionLines = data.sections.map(s => `${s.title}: ${s.places.map(p => p.name).filter(Boolean).join(', ')}`).join('; ');
            return `[Showed a full-day itinerary. Sections — ${sectionLines}]`;
          }
          if (data.kind === 'places') {
            const names = data.places.map(p => p.name).filter(Boolean);
            return `[Showed place recommendations (${data.label || 'nearby'}): ${names.join(', ')}]`;
          }
          if (data.kind === 'weather') return `[Showed current weather: ${data.summary}]`;
          if (data.kind === 'wifi') return `[Showed WiFi credentials]`;
          if (data.kind === 'phone') return `[Showed manager phone number]`;
          if (data.kind === 'property') return `[Showed property info including address and house rules]`;
          return `[Showed ${data.kind} information]`;
        };
        const conversationHistory = messages
          .filter(m => m.id !== '0')
          .map(m => ({
            role: m.role === 'user' ? 'user' as const : 'model' as const,
            text: m.data ? summarizeCard(m.data) : m.text,
          }));
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, message: trimmed, variant, history: conversationHistory }) });
        const data = (await res.json()) as { response?: string; error?: string } | OverloadedErrorPayload | ChatOkResponse;

        if (res.ok) {
          consecutiveFailureCountRef.current = 0;
          setStatusText(null);
          if (isChatOkResponse(data)) {
            const card: ButlerCardData =
              data.kind === 'text' ? { kind: 'text', text: data.response || '—', model: data.model }
              : data.kind === 'wifi' ? { kind: 'wifi', wifiName: data.wifiName || '', wifiPassword: data.wifiPassword || '', model: data.model }
              : data.kind === 'phone' ? { kind: 'phone', phoneNumber: data.phoneNumber || '', model: data.model }
              : data.kind === 'itinerary' ? { kind: 'itinerary', intro: typeof (data as { intro?: unknown }).intro === 'string' ? (data as { intro: string }).intro : undefined, sections: Array.isArray(data.sections) ? data.sections : [], model: data.model }
              : data.kind === 'weather' ? { kind: 'weather', summary: data.summary || '—', model: data.model }
              : data.kind === 'property' ? { kind: 'property', address: data.address || '', zip: data.zip || '', houseRules: data.houseRules || '', managerPhone: data.managerPhone || '', wifiName: data.wifiName || '', model: data.model }
              : { kind: 'places', label: (data as { label?: string }).label, intro: (data as { intro?: string }).intro, places: Array.isArray(data.places) ? data.places : [], model: data.model };

            setMessages((prev) => [...prev, { id: String(prev.length), role: 'butler', text: card.kind === 'text' ? (card.text || '').trim() || '—' : '—', data: card }]);
            return;
          }
          setMessages((prev) => [...prev, { id: String(prev.length), role: 'butler', text: (('response' in data ? data.response : '') || '').trim() || '—' }]);
          return;
        }

        if (isOverloadedResponse(data) && attempt < maxAttempts) { await countdown(Math.max(500, data.retryAfterMs), data.message); continue; }
        lastErr = new Error('error' in data && typeof data.error === 'string' ? data.error : 'Chat request failed');
        break;
      }
      throw lastErr || new Error('Chat request failed');
    } catch {
      consecutiveFailureCountRef.current += 1;
      const canRetry = consecutiveFailureCountRef.current < 2;
      const msg = "We're experiencing a brief interruption. Please try again in a moment.";
      setMessages((prev) => [...prev, { id: String(prev.length), role: 'butler', text: msg, data: { kind: 'error', message: msg, canRetry } }]);
    } finally {
      setStatusText(null);
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* ── Trigger ── */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            placement === 'floating'
              ? 'fixed bottom-5 right-5 z-9999 inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 focus:outline-none'
              : 'group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border px-6 py-5 text-left transition-all duration-300 focus:outline-none ' + (triggerClassName ?? '')
          }
          aria-label="Open concierge"
          style={{
            borderColor: 'var(--accent-18)',
            background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))',
          }}
        >
          {placement === 'floating' ? (
            <SlidingTriggerIcon />
          ) : (
            <>
              {/* Shine line */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--accent-22), transparent)' }}
              />
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)', boxShadow: `0 0 0 1.5px rgba(${SANDY_RGB},0.85), 0 0 8px rgba(${SANDY_RGB},0.18)` }}
                >
                  <SlidingTriggerIcon />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide text-white">Pillar Concierge</div>
                  <div className="mt-0.5 text-xs" style={{ color: 'var(--accent-50)' }}>
                    Ask about the home or local area
                  </div>
                </div>
              </div>
              <span style={{ color: `rgba(${SANDY_RGB},0.45)` }}>
                <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </>
          )}
        </button>
      ) : null}

      {/* ── Panel ── */}
      <div
        className={
          'fixed inset-x-0 bottom-0 z-9998 mx-auto w-full max-w-md px-4 pb-4 transition duration-300 ' +
          (open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0')
        }
      >
        <div className="overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-[background-color,border-color] duration-500 ease-in-out" style={{ ...chatVars, background: 'var(--panel-deep)', border: `1px solid var(--border-col)` }}>
          {/* Top glow line */}
          <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--accent-22), transparent)' }} />

          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4 transition-[background-color,border-color] duration-500 ease-in-out" style={{ background: 'var(--panel-mid)', borderColor: 'var(--border-col)' }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl ring-1"
                style={{ backgroundColor: 'var(--accent-10)', color: 'var(--copy-col)', boxShadow: '0 0 0 1px var(--accent-18)' }}
              >
                <ButlerIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>Pillar Concierge</p>
                {statusText ? <p className="mt-0.5 text-xs" style={{ color: 'var(--header-sub)' }}>{statusText}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
              style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)', color: 'var(--text-muted)' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={listRef} className="max-h-[55vh] space-y-3 overflow-auto px-5 pb-4 pt-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className="max-w-[85%] wrap-anywhere rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border"
                  style={m.role === 'user' ? {
                    borderColor: 'var(--accent-28)',
                    background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))',
                    color: 'var(--text-primary)',
                  } : {
                    borderColor: 'var(--border-col)',
                    background: 'var(--panel-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.role === 'butler'
                    ? (m.data ? <ButlerCard data={m.data} onRetry={() => send(lastUserMessageRef.current)} /> : <MessageText text={m.text} />)
                    : m.text}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border px-4 py-3 shadow-sm" style={{ background: 'var(--panel-card)', borderColor: 'var(--border-col)' }}>
                  <TypingDots />
                </div>
              </div>
            ) : null}
          </div>

          {/* Suggested pills */}
          <div className="flex gap-2 overflow-x-auto px-5 pb-3">
            {SUGGESTED.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                disabled={isTyping}
                className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 disabled:opacity-45"
                style={dark
                  ? { borderColor: 'var(--accent-28)', backgroundColor: 'var(--accent-22)', color: 'var(--accent)' }
                  : { borderColor: 'rgba(30,41,59,0.22)', backgroundColor: 'rgba(30,41,59,0.05)', color: 'rgba(30,41,59,0.80)' }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            className="flex items-center gap-2 border-t px-4 py-3 transition-[background-color,border-color] duration-500 ease-in-out"
            style={{ background: 'var(--panel-mid)', borderColor: 'var(--border-col)' }}
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the home or the local area…"
              className={`h-11 flex-1 rounded-2xl border px-4 text-sm shadow-inner outline-none transition-[background-color,border-color,color] duration-500 ease-in-out ${dark ? 'placeholder:text-white/22' : 'placeholder:text-black/25'}`}
              style={{ background: 'var(--panel-input)', borderColor: 'var(--border-col)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold tracking-wide transition-all duration-300 active:scale-[0.97] disabled:opacity-40"
              style={{
                background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`,
                color: '#3d2a0a',
                boxShadow: `0 0 20px rgba(${SANDY_RGB},0.25)`,
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

