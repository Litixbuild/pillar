'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { currentHourForZip } from '@/lib/zipTimezone';

const SANDY = '#F5EDD5';
const SANDY_RGB = '245,237,213';

function makeChatVars(dark: boolean, theme?: InlineLightTheme): React.CSSProperties {
  const isThemed = !dark && !!theme;
  const aRGB = isThemed ? theme!.accentRGB : SANDY_RGB;
  const aColor = isThemed ? theme!.iconColor : SANDY;

  return {
    '--accent':      aColor,
    '--accent-10':   `rgba(${aRGB},0.10)`,
    '--accent-18':   `rgba(${aRGB},0.18)`,
    '--accent-22':   `rgba(${aRGB},0.22)`,
    '--accent-28':   `rgba(${aRGB},0.28)`,
    '--accent-45':   `rgba(${aRGB},0.45)`,
    '--accent-50':   `rgba(${aRGB},0.50)`,
    '--btn-bg-from': `rgba(${aRGB},0.22)`,
    '--btn-bg-to':   `rgba(${aRGB},0.14)`,
    '--panel-deep':  dark ? 'rgba(12,12,12,0.97)' : (isThemed ? theme!.panelDeepBg : 'rgba(255,255,255,0.93)'),
    '--panel-mid':   dark ? 'rgba(18,18,18,0.60)' : (isThemed ? `rgba(${aRGB},0.03)` : 'rgba(0,0,0,0.04)'),
    '--panel-card':  dark ? 'rgba(22,22,22,0.92)' : (isThemed ? `rgba(${aRGB},0.04)` : 'rgba(0,0,0,0.04)'),
    '--panel-input': dark ? 'rgba(14,14,14,0.80)' : (isThemed ? `rgba(${aRGB},0.05)` : 'rgba(0,0,0,0.06)'),
    '--text-primary':   dark ? 'rgba(255,255,255,0.90)' : (isThemed ? theme!.titleText : 'rgba(61,42,10,0.90)'),
    '--text-muted':     dark ? 'rgba(255,255,255,0.40)' : (isThemed ? `rgba(${aRGB},0.55)` : 'rgba(61,42,10,0.50)'),
    '--border-col':     dark ? 'rgba(255,255,255,0.07)' : (isThemed ? `rgba(${aRGB},0.10)` : 'rgba(0,0,0,0.09)'),
    '--star-col':       dark ? SANDY : (isThemed ? aColor : '#B8820A'),
    '--copy-col':       dark ? SANDY : (isThemed ? `rgba(${aRGB},0.82)` : 'rgba(61,42,10,0.78)'),
    '--copy-border':    dark ? `rgba(${SANDY_RGB},0.22)` : (isThemed ? `rgba(${aRGB},0.22)` : 'rgba(61,42,10,0.22)'),
    '--copy-bg':        dark ? `rgba(${SANDY_RGB},0.10)` : (isThemed ? `rgba(${aRGB},0.08)` : 'rgba(61,42,10,0.07)'),
    '--phone-col':      dark ? SANDY : '#4A6FA5',
    '--header-sub':     dark ? `rgba(${SANDY_RGB},0.55)` : (isThemed ? `rgba(${aRGB},0.60)` : 'rgba(61,42,10,0.60)'),
  } as React.CSSProperties;
}

function getTimeGreeting(zip?: string) {
  const h = currentHourForZip(zip);
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

/* ─── Itinerary download ─────────────────────────────────────── */

type ItineraryData = { intro?: string; sections: Array<{ title: string; places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string; rating?: number }> }> };

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws (or measures, when draw=false) the itinerary as a styled one-pager and returns the total height used. */
function layoutItineraryCanvas(ctx: CanvasRenderingContext2D, data: ItineraryData, width: number, draw: boolean): number {
  const PAD = 56;
  const CONTENT_W = width - PAD * 2;
  const INK = '#2b2013';
  const MUTED = 'rgba(43,32,19,0.58)';
  const GOLD = '#A87C0A';
  const CARD_BORDER = 'rgba(100,80,40,0.14)';
  let y = 0;

  // Header band
  const headerH = 196;
  if (draw) {
    const grad = ctx.createLinearGradient(0, 0, width, headerH);
    grad.addColorStop(0, '#D4AF37');
    grad.addColorStop(1, '#A87C0A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, headerH);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '600 22px -apple-system, system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('PILLAR CONCIERGE', PAD, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 52px -apple-system, system-ui, sans-serif';
    ctx.fillText('Your Itinerary', PAD, 116);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '400 24px -apple-system, system-ui, sans-serif';
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    ctx.fillText(dateLabel, PAD, 158);
  }
  y += headerH;
  y += 40;

  if (data.intro) {
    ctx.font = '400 26px -apple-system, system-ui, sans-serif';
    const lines = wrapCanvasText(ctx, data.intro, CONTENT_W);
    if (draw) {
      ctx.fillStyle = MUTED;
      lines.forEach((line, i) => ctx.fillText(line, PAD, y + 30 + i * 34));
    }
    y += lines.length * 34 + 28;
  }

  for (const section of data.sections) {
    // Section title
    ctx.font = '700 28px -apple-system, system-ui, sans-serif';
    if (draw) {
      ctx.fillStyle = GOLD;
      ctx.fillText(section.title.toUpperCase(), PAD, y + 30);
      ctx.strokeStyle = 'rgba(168,124,10,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD, y + 44);
      ctx.lineTo(width - PAD, y + 44);
      ctx.stroke();
    }
    y += 64;

    for (const p of section.places || []) {
      const cardPad = 24;
      const nameFont = '700 28px -apple-system, system-ui, sans-serif';
      const blurbFont = '400 23px -apple-system, system-ui, sans-serif';
      ctx.font = nameFont;
      const nameLines = wrapCanvasText(ctx, p.name || '—', CONTENT_W - cardPad * 2);
      const hasRating = typeof p.rating === 'number';
      ctx.font = blurbFont;
      const blurbLines = p.blurb ? wrapCanvasText(ctx, p.blurb, CONTENT_W - cardPad * 2) : [];

      let cardY = cardPad; // top padding inside card
      cardY += nameLines.length * 34;
      if (hasRating) cardY += 34;
      if (blurbLines.length) cardY += blurbLines.length * 30 + 6;
      if (p.phone) cardY += 30;
      const cardH = cardY + cardPad;

      if (draw) {
        ctx.save();
        ctx.shadowColor = 'rgba(100,80,40,0.10)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#ffffff';
        roundRectPath(ctx, PAD, y, CONTENT_W, cardH, 16);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = CARD_BORDER;
        ctx.lineWidth = 1.5;
        roundRectPath(ctx, PAD, y, CONTENT_W, cardH, 16);
        ctx.stroke();

        let ty = y + cardPad + 24;
        ctx.fillStyle = INK;
        ctx.font = nameFont;
        nameLines.forEach((line) => { ctx.fillText(line, PAD + cardPad, ty); ty += 34; });

        if (hasRating) {
          const rating = p.rating!;
          const full = Math.round(rating);
          ctx.font = '24px sans-serif';
          let sx = PAD + cardPad;
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i < full ? '#D4AF37' : 'rgba(100,80,40,0.22)';
            ctx.fillText('★', sx, ty);
            sx += 28;
          }
          ctx.fillStyle = MUTED;
          ctx.font = '400 22px -apple-system, system-ui, sans-serif';
          ctx.fillText(rating.toFixed(1), sx + 4, ty);
          ty += 34;
        }

        if (blurbLines.length) {
          ctx.fillStyle = MUTED;
          ctx.font = blurbFont;
          blurbLines.forEach((line) => { ctx.fillText(line, PAD + cardPad, ty); ty += 30; });
          ty += 6;
        }

        if (p.phone) {
          ctx.fillStyle = 'rgba(74,111,165,0.92)';
          ctx.font = '600 22px -apple-system, system-ui, sans-serif';
          ctx.fillText(`☎ ${p.phone}`, PAD + cardPad, ty);
        }
      }

      y += cardH + 18;
    }
    y += 24;
  }

  // Footer
  y += 8;
  if (draw) {
    ctx.strokeStyle = 'rgba(100,80,40,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(width - PAD, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(43,32,19,0.40)';
    ctx.font = '400 20px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Crafted with Pillar', width / 2, y + 38);
    ctx.textAlign = 'left';
  }
  y += 64;

  return y;
}

async function renderItineraryImage(data: ItineraryData): Promise<Blob> {
  const WIDTH = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const totalHeight = layoutItineraryCanvas(ctx, data, WIDTH, false);
  canvas.width = WIDTH;
  canvas.height = totalHeight;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalHeight);
  bgGrad.addColorStop(0, '#FBF6E9');
  bgGrad.addColorStop(1, '#F3E9CC');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, totalHeight);

  layoutItineraryCanvas(ctx, data, WIDTH, true);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to render image'))), 'image/png');
  });
}

async function saveItineraryImage(data: ItineraryData) {
  const blob = await renderItineraryImage(data);
  const filename = `Itinerary ${new Date().toISOString().slice(0, 10)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  if (typeof navigator.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Your Itinerary' });
      return;
    } catch {
      // User cancelled the share sheet, or it failed — fall back to a plain download below.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadButton({ data }: { data: ItineraryData }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await saveItineraryImage(data); } catch { /* canvas/share failure — silently ignore */ }
        setBusy(false);
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold tracking-wide transition-all duration-200 disabled:opacity-50"
      style={{ borderColor: 'var(--accent-22)', background: 'var(--accent-10)', color: 'var(--accent)' }}
    >
      <DownloadIcon className="h-3.5 w-3.5" />
      {busy ? 'Preparing…' : 'Save to Photos'}
    </button>
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
      <a key={idx} href={part} target="_blank" rel="noreferrer" className="max-w-full wrap-anywhere underline underline-offset-2 transition-all duration-200" style={{ color: 'var(--copy-col)', textDecorationColor: 'var(--copy-border)' }}>
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
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {p.cuisine ? <span className="whitespace-nowrap">{p.cuisine}</span> : null}
                      {typeof p.rating === 'number' ? (
                        <span className="flex items-center gap-0.5 whitespace-nowrap">
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
                        <div className="mt-0.5 flex items-center gap-0.5 whitespace-nowrap text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
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

  if (data.kind === 'itineraryDownload') {
    return (
      <div className="space-y-3">
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Would you like to download this itinerary to your phone?</div>
        <DownloadButton data={data.itinerary} />
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
  | { kind: 'itineraryDownload'; itinerary: ItineraryData }
  | { kind: 'places'; label?: string; intro?: string; places: Array<{ name: string; cuisine?: string; blurb?: string; formattedAddress?: string; phone?: string; websiteUri?: string; googleMapsUri?: string; rating?: number }>; model?: string }
  | { kind: 'weather'; summary: string; model?: string };

type ChatMessage = { id: string; role: ChatRole; text: string; data?: ButlerCardData };

type InlineLightTheme = {
  accentRGB: string;
  panelDeepBg: string;
  buttonBg: string;
  buttonBorder: string;
  buttonShadow: string;
  iconBg: string;
  iconColor: string;
  titleText: string;
  subtitleText: string;
  chevronColor: string;
};

type Props = { slug: string; placement?: 'floating' | 'inline'; triggerClassName?: string; dark?: boolean; inlineLightTheme?: InlineLightTheme; zip?: string };

type OverloadedErrorPayload = { code: 'OVERLOADED'; message: string; retryAfterMs: number };

type ChatOkResponse =
  | { kind: 'text'; response: string; model: string }
  | { kind: 'wifi'; wifiName: string; wifiPassword: string; model: string }
  | { kind: 'phone'; phoneNumber: string; model: string }
  | { kind: 'property'; address: string; zip: string; houseRules: string; managerPhone: string; wifiName: string; model: string }
  | { kind: 'itinerary'; intro: string; sections: Array<{ title: string; places: Array<{ name: string; blurb?: string; phone?: string; googleMapsUri?: string }> }>; model: string }
  | { kind: 'places'; label?: string; intro?: string; places: Array<{ name: string; cuisine?: string; blurb?: string; formattedAddress?: string; phone?: string; websiteUri?: string; googleMapsUri?: string; rating?: number }>; model: string }
  | { kind: 'weather'; summary: string; model: string };

const SUGGESTED = ['Plan my day', 'Local restaurants', 'Bicycle rentals', 'Grocery stores', 'Coffee shops', 'Pharmacy', 'Kid-friendly activities'] as const;

/* ─── Main export ────────────────────────────────────────────── */

export default function ChatConcierge({ slug, placement = 'floating', triggerClassName, dark = true, inlineLightTheme, zip }: Props) {
  const chatVars = useMemo(() => makeChatVars(dark, inlineLightTheme), [dark, inlineLightTheme]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: '0', role: 'butler', text: `${getTimeGreeting(zip)}! Need local recommendations, or have a question about the home? I'm here to help.` },
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

            setMessages((prev) => {
              const next = [...prev, { id: String(prev.length), role: 'butler' as const, text: card.kind === 'text' ? (card.text || '').trim() || '—' : '—', data: card }];
              if (card.kind === 'itinerary') {
                next.push({
                  id: String(next.length),
                  role: 'butler',
                  text: 'Would you like to download this itinerary to your phone?',
                  data: { kind: 'itineraryDownload', itinerary: { intro: card.intro, sections: card.sections } },
                });
              }
              return next;
            });
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
              : 'group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-3xl px-6 py-5 text-left transition-all duration-300 focus:outline-none ' + (triggerClassName ?? '')
          }
          aria-label="Open concierge"
          style={placement === 'floating' ? {
            borderColor: 'var(--accent-18)',
            background: 'linear-gradient(135deg, var(--btn-bg-from), var(--btn-bg-to))',
          } : {
            background: dark ? 'rgba(10,10,10,0.82)' : (inlineLightTheme?.buttonBg ?? 'rgba(255,255,255,0.82)'),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: dark ? '1px solid rgba(255,255,255,0.07)' : (inlineLightTheme ? `1px solid ${inlineLightTheme.buttonBorder}` : '1px solid rgba(0,0,0,0.07)'),
            boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.40)' : (inlineLightTheme?.buttonShadow ?? '0 4px 20px rgba(0,0,0,0.08)'),
          }}
        >
          {placement === 'floating' ? (
            <SlidingTriggerIcon />
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl"
                  style={{
                    background: dark ? 'rgba(245,237,213,0.10)' : (inlineLightTheme?.iconBg ?? 'rgba(100,80,40,0.08)'),
                    color: dark ? `rgba(${SANDY_RGB},0.85)` : (inlineLightTheme?.iconColor ?? 'rgba(100,80,40,0.75)'),
                  }}
                >
                  <SlidingTriggerIcon />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.90)' : (inlineLightTheme?.titleText ?? '#1e293b') }}>Explore the Area</div>
                  <div className="mt-0.5 text-xs" style={{ color: dark ? 'rgba(245,237,213,0.45)' : (inlineLightTheme?.subtitleText ?? 'rgba(100,80,40,0.55)') }}>
                    Local tips, recommendations &amp; home help
                  </div>
                </div>
              </div>
              <span style={{ color: dark ? `rgba(${SANDY_RGB},0.35)` : (inlineLightTheme?.chevronColor ?? 'rgba(100,80,40,0.35)') }}>
                <ChevronRight className="h-5 w-5 flex-none transition-transform duration-300 group-hover:translate-x-0.5" />
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
                <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>Explore the Area</p>
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
                style={dark || inlineLightTheme
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
              placeholder="Ask about local recommendations…"
              className={`h-11 flex-1 rounded-2xl border px-4 text-sm shadow-inner outline-none transition-[background-color,border-color,color] duration-500 ease-in-out ${dark ? 'placeholder:text-white/22' : 'placeholder:text-black/25'}`}
              style={{ background: 'var(--panel-input)', borderColor: 'var(--border-col)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold tracking-wide transition-all duration-300 active:scale-[0.97] disabled:opacity-40"
              style={!dark && inlineLightTheme ? {
                background: inlineLightTheme.iconColor,
                color: '#ffffff',
                boxShadow: `0 0 20px rgba(${inlineLightTheme.accentRGB},0.22)`,
              } : {
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

