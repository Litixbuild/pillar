'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Property, AmenityWindow } from '@/lib/types';
import { generateWindowId } from '@/lib/types';
import { AMENITY_ICONS_MAP, DEFAULT_ICON_KEY, searchIcons } from '@/lib/amenityIcons';

const SANDY = '#F5EDD5';
const SANDY_RGB = '245,237,213';

/* ─── Types ───────────────────────────────────────────── */

interface WindowDraft extends AmenityWindow {
  _uploading?: boolean;
  _uploadError?: string | null;
}

interface CoreFields {
  PropertyName: string;
  PropertyAddress: string;
  PropertyZipCode: string;
  DetailedHouseBio: string;
  CheckoutInstructions: string;
  WiFiName: string;
  WiFiPassword: string;
  GarageCode: string;
  ManagerPhone: string;
  LogoSize: number;
}

type View = 'grid' | 'property-info' | 'amenities' | 'qr' | 'settings' | 'work-orders' | 'help';

interface Tile {
  id: View;
  label: string;
  sub: string;
  border: string;
  borderStyle?: React.CSSProperties;
  shadow: string;
  shadowHover: string;
  bg: string;
  iconBg: string;
  iconStyle?: React.CSSProperties;
  text: string;
  textStyle?: React.CSSProperties;
  icon: React.ReactNode;
  wide?: boolean;
}

/* ─── API helpers ─────────────────────────────────────── */

async function saveCoreFields(slug: string, fields: Partial<CoreFields>) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Save failed (HTTP ${res.status})`);
}

async function saveWindowsToDb(slug: string, windows: AmenityWindow[]) {
  const clean = windows.map(({ id, title, type, icon, body, url, room }) => ({ id, title, type, icon, body, url, room }));
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ windows: clean }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Window save failed (HTTP ${res.status})`);
}

async function createWindowInDb(slug: string, win: AmenityWindow, displayOrder: number) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: win.id, title: win.title, type: win.type, icon: win.icon, body: win.body, room: win.room, displayOrder }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Create window failed (HTTP ${res.status})`);
}

async function saveRoomsToDb(slug: string, rooms: string[]) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/rooms`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ rooms }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Rooms save failed (HTTP ${res.status})`);
}

async function deleteWindowFromDb(slug: string, windowId: string) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: windowId }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Delete failed (HTTP ${res.status})`);
}

async function uploadFile(slug: string, field: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('field', field);
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/upload`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new Error(data?.error ?? 'Upload failed');
  return data.url;
}

/* ─── SVG icon primitives ─────────────────────────────── */

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

/* ─── Amenity icon rendering ──────────────────────────── */

function AmenityIconSvg({ iconKey, className }: { iconKey: string; className?: string }) {
  const def = AMENITY_ICONS_MAP[iconKey];
  if (!def) return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {def.paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ─── Icon picker modal ───────────────────────────────── */

function IconPickerModal({ current, onSelect, onClose }: {
  current: string; onSelect: (key: string) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const results = searchIcons(query);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-6 sm:items-center">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-sm" aria-label="Close icon picker" />
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.9)]" style={{ maxHeight: '80vh' }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.22), transparent)` }} />
        <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Pick an Icon</h3>
          <button type="button" onClick={onClose} className="text-white/35 transition-colors hover:text-white/65">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="border-b border-white/5 px-5 py-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              autoFocus type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="h-10 w-full rounded-xl border border-white/8 bg-[#1e1e1e]/80 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-[#F5EDD5]/25 focus:ring-1 focus:ring-[#F5EDD5]/12"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-white/25">{results.length} icon{results.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/30">No icons match &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {results.map((icon) => {
                const isSelected = icon.key === current;
                return (
                  <button
                    key={icon.key} type="button"
                    onClick={() => { onSelect(icon.key); onClose(); }}
                    title={icon.name}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-150"
                    style={isSelected
                      ? { borderColor: `rgba(${SANDY_RGB},0.45)`, background: `rgba(${SANDY_RGB},0.12)`, color: SANDY }
                      : { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.45)' }
                    }
                  >
                    <AmenityIconSvg iconKey={icon.key} className="h-5 w-5 flex-none" />
                    <span className="w-full truncate text-center text-[9px] font-medium leading-tight opacity-70 group-hover:opacity-90">
                      {icon.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared primitives ───────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-[rgba(245,237,213,0.70)]">
      {children}
    </p>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-all duration-200 focus:border-slate-400 dark:focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-slate-100 dark:focus:ring-[#F5EDD5]/15"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-all duration-200 focus:border-slate-400 dark:focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-slate-100 dark:focus:ring-[#F5EDD5]/15"
    />
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const TYPE_STYLES: Record<AmenityWindow['type'], string> = {
  text: 'border-[#F5EDD5]/20 bg-[#F5EDD5]/10 text-[#F5EDD5]/80',
  image: 'border-sky-500/20 bg-sky-500/10 text-sky-300/80',
  video: 'border-purple-500/20 bg-purple-500/10 text-purple-300/80',
  pdf: 'border-amber-500/20 bg-amber-500/10 text-amber-300/80',
};

function TypeBadge({ type }: { type: AmenityWindow['type'] }) {
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[9px] font-bold uppercase tracking-[0.16em] ${TYPE_STYLES[type]}`}>
      {type}
    </span>
  );
}

/* ─── Grid view ───────────────────────────────────────── */

const TILES: Tile[] = [
  {
    id: 'qr',
    label: 'QR Code',
    sub: 'Print & share',
    border: 'border-amber-400/55',
    shadow: '0 0 0 1px rgba(251,191,36,0.18), 0 0 40px rgba(245,158,11,0.22), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(251,191,36,0.35), 0 0 60px rgba(245,158,11,0.38), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-amber-500/6',
    iconBg: 'bg-amber-500/15 border-amber-400/35 text-amber-300',
    text: 'text-amber-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3zM18 18v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'property-info',
    label: 'Property Info',
    sub: 'Name, rules & bio',
    border: '',
    borderStyle: { borderColor: 'rgba(254,215,170,0.45)', background: 'rgba(251,146,60,0.08)' },
    shadow: '0 0 0 1px rgba(251,146,60,0.20), 0 0 40px rgba(251,146,60,0.16), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(251,146,60,0.38), 0 0 65px rgba(251,146,60,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: '',
    iconBg: '',
    iconStyle: { background: 'rgba(251,146,60,0.14)', border: '1px solid rgba(254,215,170,0.30)', color: 'rgb(253,186,116)' },
    text: '',
    textStyle: { color: 'rgb(254,215,170)' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'amenities',
    label: 'Amenities',
    sub: 'Windows & content',
    border: 'border-purple-400/55',
    shadow: '0 0 0 1px rgba(192,132,252,0.20), 0 0 40px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(192,132,252,0.38), 0 0 65px rgba(168,85,247,0.30), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-purple-500/6',
    iconBg: 'bg-purple-500/14 border-purple-400/35 text-purple-300',
    text: 'text-purple-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Design',
    sub: 'Backgrounds & more',
    border: 'border-green-400/50',
    shadow: '0 0 0 1px rgba(74,222,128,0.20), 0 0 40px rgba(74,222,128,0.16), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(74,222,128,0.38), 0 0 65px rgba(74,222,128,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-green-500/5',
    iconBg: 'bg-green-500/14 border-green-400/35 text-green-300',
    text: 'text-green-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'work-orders',
    label: 'Work Orders',
    sub: 'Routing & categories',
    border: 'border-white/35',
    shadow: '0 0 0 1px rgba(255,255,255,0.22), 0 0 40px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)',
    shadowHover: '0 0 0 1px rgba(255,255,255,0.45), 0 0 65px rgba(255,255,255,0.32), inset 0 1px 0 rgba(255,255,255,0.16)',
    bg: 'bg-white/6',
    iconBg: 'bg-white/12 border-white/30 text-white/90',
    text: 'text-white/85',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help',
    sub: 'Support & guides',
    border: 'border-red-400/55',
    shadow: '0 0 0 1px rgba(248,113,113,0.20), 0 0 40px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(248,113,113,0.38), 0 0 65px rgba(239,68,68,0.30), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-red-500/6',
    iconBg: 'bg-red-500/14 border-red-400/35 text-red-300',
    text: 'text-red-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function calcCompletion(core: CoreFields, windows: WindowDraft[], woCats: WOCategory[] | undefined): number {
  const fields = [
    core.PropertyName, core.PropertyAddress, core.DetailedHouseBio,
    core.WiFiName, core.WiFiPassword, core.GarageCode, core.ManagerPhone,
  ];
  const propPct = (fields.filter((f) => f.trim()).length / fields.length) * 100;
  const amenPct = windows.length === 0 ? 0 : Math.min(100, (windows.length / 3) * 100);
  const cats = woCats ?? [];
  const woWithContact = cats.filter((c) => c.phone || c.email).length;
  const woPct = cats.length === 0 ? 0 : Math.min(100, (woWithContact / cats.length) * 100);
  return Math.round(propPct * 0.4 + amenPct * 0.3 + woPct * 0.3);
}

function getMissingItems(core: CoreFields, windows: WindowDraft[], woCats: WOCategory[] | undefined): string[] {
  const missing: string[] = [];
  if (!core.PropertyName.trim()) missing.push('Property name');
  if (!core.PropertyAddress.trim()) missing.push('Property address');
  if (!core.DetailedHouseBio.trim()) missing.push('Property description');
  if (!core.WiFiName.trim()) missing.push('Wi-Fi name');
  if (!core.WiFiPassword.trim()) missing.push('Wi-Fi password');
  if (!core.ManagerPhone.trim()) missing.push('Manager phone number');
  if (windows.length === 0) missing.push('Add at least one amenity');
  else if (windows.length < 3) missing.push(`Add ${3 - windows.length} more ${windows.length === 2 ? 'amenity' : 'amenities'}`);
  const cats = woCats ?? [];
  const missingContacts = cats.filter((c) => !c.phone && !c.email).length;
  if (missingContacts > 0) missing.push(`Add contact info to ${missingContacts} work order ${missingContacts === 1 ? 'category' : 'categories'}`);
  return missing;
}

function ProgressBanner({ pct, dark, missing }: { pct: number; dark: boolean; missing: string[] }) {
  const [open, setOpen] = useState(false);
  // Interpolate hue 0 (red) → 130 (green) based on completion
  const hue = Math.round(pct * 1.3);
  const hueStart = Math.max(0, hue - 18);
  const fillGradient = `linear-gradient(90deg, hsl(${hueStart},82%,50%), hsl(${hue},76%,58%))`;
  const glowColor = `hsl(${hue},70%,55%)`;
  const pctColor = pct >= 100 ? 'hsl(130,60%,42%)' : (dark ? '#ffffff' : '#1e293b');
  const labelColor = dark ? 'rgba(255,255,255,0.50)' : 'rgba(30,41,59,0.50)';
  const legendColor = dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.45)';
  const toggleColor = dark ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.45)';
  const missingColor = dark ? 'rgba(255,255,255,0.70)' : 'rgba(30,41,59,0.65)';

  return (
    <div
      className="rounded-2xl px-5 pt-4 mb-3 shrink-0 overflow-hidden"
      style={{
        background: dark ? 'rgba(8,8,8,0.95)' : 'rgba(255,255,255,0.92)',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.30)' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>
            Profile Complete
          </p>
          <p className="text-3xl font-bold tabular-nums mt-0.5" style={{ color: pctColor }}>
            {pct}<span className="text-base font-semibold opacity-55">%</span>
          </p>
        </div>
        <div className="flex gap-3 pb-0.5">
          {([
            { label: 'Info', color: '#F97316' },
            { label: 'Amenities', color: '#3B82F6' },
            { label: 'Orders', color: '#10B981' },
          ] as const).map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: legendColor }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: fillGradient, boxShadow: `0 0 12px ${glowColor}44` }}
        />
      </div>

      {/* Dropdown toggle — only shown when there are missing items */}
      {missing.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-center gap-1 pt-2.5 pb-2 transition-opacity duration-200 hover:opacity-80 active:opacity-60"
          style={{ color: toggleColor }}
          aria-expanded={open}
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
            {open ? 'Hide' : `${missing.length} item${missing.length > 1 ? 's' : ''} remaining`}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className="transition-transform duration-300 ease-out"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Expandable missing items list */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? `${missing.length * 32 + 16}px` : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-3 space-y-1.5">
          {missing.map((item) => (
            <div key={item} className="flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'hsl(0,72%,64%)' }} />
              <span className="text-[11px]" style={{ color: missingColor }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom padding when no toggle shown */}
      {missing.length === 0 && <div className="pb-4" />}
    </div>
  );
}

type GridTileId = 'property-info' | 'amenities' | 'work-orders' | 'help';

interface GridTileDef {
  id: GridTileId;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

interface TileColorMode {
  bg: string;
  border: string;
  backdropFilter?: string;
  label: string;
  sub: string;
  shadow: string;
  shadowHover: string;
}

/* All four tiles share a neutral slate base — vibrant color lives only in the icons. */
const SLATE_LIGHT: TileColorMode = {
  bg: 'rgba(255,255,255,0.92)',
  border: 'transparent',
  backdropFilter: 'blur(20px)',
  label: '#1e293b',
  sub: 'rgba(30,41,59,0.52)',
  shadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
  shadowHover: '0 4px 20px rgba(0,0,0,0.13), 0 2px 6px rgba(0,0,0,0.06)',
};
const SLATE_DARK: TileColorMode = {
  bg: 'rgba(8,8,8,0.95)',
  border: 'transparent',
  backdropFilter: 'blur(20px)',
  label: '#ffffff',
  sub: 'rgba(255,255,255,0.52)',
  shadow: '0 4px 24px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.05)',
  shadowHover: '0 8px 32px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.10)',
};
const TILE_COLORS: Record<GridTileId, { light: TileColorMode; dark: TileColorMode }> = {
  'property-info': { light: SLATE_LIGHT, dark: SLATE_DARK },
  amenities:       { light: SLATE_LIGHT, dark: SLATE_DARK },
  'work-orders':   { light: SLATE_LIGHT, dark: SLATE_DARK },
  help:            { light: SLATE_LIGHT, dark: SLATE_DARK },
};

/* Per-tile gradient stops — used for both the icon SVGs and the gradient borders. */
const TILE_GRADIENTS: Record<GridTileId, [string, string]> = {
  'property-info': ['#F97316', '#FBBF24'],
  amenities:       ['#3B82F6', '#06B6D4'],
  'work-orders':   ['#10B981', '#84CC16'],
  help:            ['#EF4444', '#FB923C'],
};

const GRID_TILES: GridTileDef[] = [
  {
    id: 'property-info',
    label: 'Property Info',
    sub: 'Name, rules & bio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="grad-pi" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="url(#grad-pi)" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="url(#grad-pi)" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'amenities',
    label: 'Amenities',
    sub: 'Windows & content',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="grad-am" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="url(#grad-am)" strokeWidth="1.8" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="url(#grad-am)" strokeWidth="1.8" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="url(#grad-am)" strokeWidth="1.8" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="url(#grad-am)" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'work-orders',
    label: 'Work Orders',
    sub: 'Routing & categories',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="grad-wo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#84CC16" />
          </linearGradient>
        </defs>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="url(#grad-wo)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'help',
    label: 'Help',
    sub: 'Guides & support',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="grad-hl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="url(#grad-hl)" strokeWidth="1.8" />
        <path d="M9.5 9.5a2.5 2.5 0 014.5 1.5c0 2-2.5 2.2-2.5 3.8" stroke="url(#grad-hl)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="17.5" x2="12" y2="17.5" stroke="url(#grad-hl)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

function GridView({ onNavigate, completion, dark, missing }: { onNavigate: (v: View) => void; completion: number; dark: boolean; missing: string[] }) {
  return (
    <div className="flex flex-col px-4 pb-4 pt-3" style={{ height: 'calc(100dvh - 64px - 80px)' }}>
      <ProgressBanner pct={completion} dark={dark} missing={missing} />
      <div className="grid flex-1 grid-cols-2 gap-3" style={{ gridTemplateRows: '1fr 1fr' }}>
        {GRID_TILES.map((tile) => {
          const m = TILE_COLORS[tile.id][dark ? 'dark' : 'light'];
          const [gFrom, gTo] = TILE_GRADIENTS[tile.id];
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onNavigate(tile.id)}
              className="group w-full h-full transition-all duration-300 active:scale-[0.96] flex flex-col items-center justify-center gap-4 rounded-2xl"
              style={dark ? {
                backgroundImage: `linear-gradient(rgba(8,8,8,0.95), rgba(8,8,8,0.95)), linear-gradient(135deg, ${gFrom}, ${gTo})`,
                backgroundOrigin: 'padding-box, border-box',
                backgroundClip: 'padding-box, border-box',
                WebkitBackgroundClip: 'padding-box, border-box',
                border: '1.5px solid transparent',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: m.shadow,
              } as React.CSSProperties : {
                background: m.bg,
                border: '1px solid rgba(0,0,0,0.07)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: m.shadow,
              } as React.CSSProperties}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = m.shadowHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = m.shadow; }}
            >
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                {tile.icon}
              </div>
              <div className="text-center px-2">
                <p className="text-sm font-bold tracking-wide" style={{ color: m.label }}>{tile.label}</p>
                <p className="mt-0.5 text-xs" style={{ color: m.sub }}>{tile.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Property Info view ──────────────────────────────── */

function PropertyInfoView({
  slug, core, setCore, heroUrl, setHeroUrl, logoUrl, setLogoUrl, logoUrlDark, setLogoUrlDark, saving, saved, onSave, saveError, dark,
}: {
  slug: string;
  core: CoreFields;
  setCore: React.Dispatch<React.SetStateAction<CoreFields>>;
  heroUrl: string | undefined;
  setHeroUrl: (url: string) => void;
  logoUrl: string | undefined;
  setLogoUrl: (url: string) => void;
  logoUrlDark: string | undefined;
  setLogoUrlDark: (url: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  saveError: string | null;
  dark: boolean;
}) {
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const [logoDarkUploading, setLogoDarkUploading] = useState(false);
  const [logoDarkUploadError, setLogoDarkUploadError] = useState<string | null>(null);
  const logoDarkFileRef = useRef<HTMLInputElement | null>(null);

  const cardStyle: React.CSSProperties = dark
    ? { background: 'rgba(8,8,8,0.95)', border: `1px solid rgba(${SANDY_RGB},0.10)`, backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
  const headerBorder = { borderBottom: dark ? `1px solid rgba(${SANDY_RGB},0.08)` : '1px solid rgba(0,0,0,0.06)' };
  const sectionLabel = { color: dark ? `rgba(${SANDY_RGB},0.70)` : 'rgba(51,65,85,0.65)' };

  function setField<K extends keyof CoreFields>(key: K, val: string) {
    setCore((prev) => ({ ...prev, [key]: val }));
  }

  async function handleHeroUpload(file: File) {
    setHeroUploading(true);
    setHeroUploadError(null);
    try {
      const url = await uploadFile(slug, 'hero', file);
      setHeroUrl(url);
    } catch (e) {
      setHeroUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    setLogoUploadError(null);
    try {
      const url = await uploadFile(slug, 'logo', file);
      setLogoUrl(url);
    } catch (e) {
      setLogoUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleLogoDarkUpload(file: File) {
    setLogoDarkUploading(true);
    setLogoDarkUploadError(null);
    try {
      const url = await uploadFile(slug, 'logo_dark', file);
      setLogoUrlDark(url);
    } catch (e) {
      setLogoDarkUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoDarkUploading(false);
    }
  }

  return (
    <div className="relative pb-48">
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">

        {saveError ? (
          <div className="rounded-xl border border-rose-500/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300/80">
            {saveError}
          </div>
        ) : null}

        {/* Identity */}
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Identity</p>
          </div>
          <div className="space-y-4 p-5">
            <FieldGroup label="Property Name">
              <TextInput value={core.PropertyName} onChange={(v) => setField('PropertyName', v)} placeholder="e.g. Oceanview Villa" />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Address">
                <TextInput value={core.PropertyAddress} onChange={(v) => setField('PropertyAddress', v)} placeholder="123 Main St" />
              </FieldGroup>
              <FieldGroup label="ZIP Code">
                <TextInput value={core.PropertyZipCode} onChange={(v) => setField('PropertyZipCode', v)} placeholder="90210" />
              </FieldGroup>
            </div>
          </div>
        </div>

        {/* Guest content */}
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Guest Content</p>
          </div>
          <div className="space-y-4 p-5">
            {/* Cover Photo */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(51,65,85,0.50)' }}>Cover Photo</p>
              <p className="mb-3 text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.38)' : 'rgba(51,65,85,0.50)' }}>The background image guests see on the welcome screen when they scan the QR code.</p>
              <div
                className="relative mb-2 flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl"
                style={{
                  background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  backgroundImage: heroUrl ? `url(${heroUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!heroUrl && (
                  <span className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)' }}>No cover photo</span>
                )}
              </div>
              <input
                type="file"
                ref={heroFileRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) await handleHeroUpload(f);
                }}
              />
              <button
                type="button"
                disabled={heroUploading}
                onClick={() => heroFileRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                style={{
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
                  color: dark ? 'rgba(255,255,255,0.60)' : 'rgba(30,41,59,0.65)',
                }}
              >
                <UploadIcon />
                {heroUploading ? 'Uploading…' : heroUrl ? 'Replace Photo' : 'Upload Photo'}
              </button>
              {heroUploadError ? <p className="mt-1 rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">{heroUploadError}</p> : null}
            </div>

            <FieldGroup label="House Bio">
              <TextArea value={core.DetailedHouseBio} onChange={(v) => setField('DetailedHouseBio', v)} placeholder="Describe the property for guests…" rows={4} />
            </FieldGroup>
            <FieldGroup label="Checkout Instructions">
              <TextArea value={core.CheckoutInstructions} onChange={(v) => setField('CheckoutInstructions', v)} placeholder="e.g. Check out by 11am, leave keys on the counter, take out rubbish…" rows={5} />
            </FieldGroup>
          </div>
        </div>

        {/* WiFi & Access */}
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>WiFi & Access</p>
          </div>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="WiFi Network">
                <TextInput value={core.WiFiName} onChange={(v) => setField('WiFiName', v)} placeholder="Network name" />
              </FieldGroup>
              <FieldGroup label="WiFi Password">
                <TextInput value={core.WiFiPassword} onChange={(v) => setField('WiFiPassword', v)} placeholder="Password" />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Garage Code">
                <TextInput value={core.GarageCode} onChange={(v) => setField('GarageCode', v)} placeholder="e.g. 1234#" />
              </FieldGroup>
              <FieldGroup label="Manager Phone">
                <TextInput value={core.ManagerPhone} onChange={(v) => setField('ManagerPhone', v)} placeholder="+1 (555) 000-0000" type="tel" />
              </FieldGroup>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.3)]" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Branding</p>
          </div>
          <div className="space-y-5 p-5">
            {/* Logo uploads — dark mode + light mode side by side */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(51,65,85,0.50)' }}>Logo</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Dark Mode logo */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(51,65,85,0.55)' }}>Dark Mode</p>
                  <div
                    className="flex min-h-[100px] items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundColor: '#0a0a0a',
                      backgroundImage: 'linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(135deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(135deg,transparent 75%,#1a1a1a 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0,5px 0,5px -5px,0 5px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Dark mode logo" className="object-contain p-3" style={{ maxWidth: '100%', maxHeight: '80px' }} />
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>No logo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoFileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (f) await handleLogoUpload(f);
                    }}
                  />
                  <button
                    type="button"
                    disabled={logoUploading}
                    onClick={() => logoFileRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
                      color: dark ? 'rgba(255,255,255,0.60)' : 'rgba(30,41,59,0.65)',
                    }}
                  >
                    <UploadIcon />
                    {logoUploading ? 'Uploading…' : logoUrl ? 'Replace' : 'Upload'}
                  </button>
                  {logoUploadError ? <p className="mt-1 rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">{logoUploadError}</p> : null}
                </div>

                {/* Light Mode logo */}
                <div className="space-y-2">
                  <p className="text-[11px] font-medium" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(51,65,85,0.55)' }}>Light Mode</p>
                  <div
                    className="flex min-h-[100px] items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundColor: '#ffffff',
                      backgroundImage: 'linear-gradient(45deg,#e8e8e8 25%,transparent 25%),linear-gradient(135deg,#e8e8e8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e8e8 75%),linear-gradient(135deg,transparent 75%,#e8e8e8 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0,5px 0,5px -5px,0 5px',
                      border: '1px solid rgba(0,0,0,0.10)',
                    }}
                  >
                    {logoUrlDark ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrlDark} alt="Light mode logo" className="object-contain p-3" style={{ maxWidth: '100%', maxHeight: '80px' }} />
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(0,0,0,0.22)' }}>No logo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoDarkFileRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (f) await handleLogoDarkUpload(f);
                    }}
                  />
                  <button
                    type="button"
                    disabled={logoDarkUploading}
                    onClick={() => logoDarkFileRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
                      color: dark ? 'rgba(255,255,255,0.60)' : 'rgba(30,41,59,0.65)',
                    }}
                  >
                    <UploadIcon />
                    {logoDarkUploading ? 'Uploading…' : logoUrlDark ? 'Replace' : 'Upload'}
                  </button>
                  {logoDarkUploadError ? <p className="mt-1 rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">{logoDarkUploadError}</p> : null}
                </div>
              </div>
            </div>
            <FieldGroup label={`Logo Size — ${core.LogoSize}px`}>
              <input type="range" min={40} max={200} step={4} value={core.LogoSize}
                onChange={(e) => setCore((prev) => ({ ...prev, LogoSize: Number(e.target.value) }))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-white/10"
                style={{ accentColor: dark ? SANDY : '#3b82f6' }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-white/22">
                <span>Small (40px)</span><span>Large (200px)</span>
              </div>
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 z-40 px-4 pb-2" style={{ bottom: '104px' }}>
        <button type="button" disabled={saving} onClick={onSave}
          className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
          style={dark
            ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
            : { background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.14)' }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ─── Amenities view ──────────────────────────────────── */

const ROOM_SUGGESTIONS = [
  'Entrance', 'Foyer', 'Kitchen', 'Dining Room', 'Living Room',
  'Family Room', 'Den', 'Office', 'Study',
  'Master Bedroom', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3',
  'Bathroom', 'Master Bathroom', 'Half Bath', 'Laundry Room',
  'Basement', 'Garage', 'Patio', 'Deck', 'Backyard',
];

function AmenitiesView({
  slug, windows, setWindows, saving, saved, onSave, saveError, dark, initialRooms,
}: {
  slug: string;
  windows: WindowDraft[];
  setWindows: React.Dispatch<React.SetStateAction<WindowDraft[]>>;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  saveError: string | null;
  dark: boolean;
  initialRooms: string[];
}) {
  const [rooms, setRooms] = useState<string[]>(initialRooms);
  const [roomInput, setRoomInput] = useState('');
  const [roomsSaving, setRoomsSaving] = useState(false);

  async function persistRooms(next: string[]) {
    setRoomsSaving(true);
    try { await saveRoomsToDb(slug, next); } catch { /* ignore */ }
    finally { setRoomsSaving(false); }
  }
  function addRoom(name: string) {
    const t = name.trim();
    if (!t || rooms.includes(t)) return;
    const next = [...rooms, t];
    setRooms(next);
    void persistRooms(next);
  }
  function removeRoom(name: string) {
    const next = rooms.filter((r) => r !== name);
    setRooms(next);
    void persistRooms(next);
  }

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AmenityWindow['type']>('text');
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON_KEY);
  const [newBody, setNewBody] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [previewWindow, setPreviewWindow] = useState<WindowDraft | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const windowCard: React.CSSProperties = dark
    ? { background: 'rgba(8,8,8,0.95)', border: `1px solid rgba(${SANDY_RGB},0.10)`, backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
  const modalCardStyle: React.CSSProperties = dark
    ? { background: 'rgba(12,12,12,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.85)' }
    : { background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' };
  const modalHeading = dark ? 'text-white' : 'text-[#2C2C2C]';
  const modalSub = dark ? 'text-white/40' : 'text-[#2C2C2C]/55';
  const modalInputCls = dark
    ? 'border-white/10 bg-black/20 text-white placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-[#F5EDD5]/15'
    : `border-[#F5EDD5]/35 bg-white/65 text-[#2C2C2C] placeholder:text-[#2C2C2C]/35 focus:border-[#F5EDD5]/60 focus:ring-[#F5EDD5]/20`;
  const modalIconRow = dark ? 'border-white/8 bg-black/20' : `bg-white/55`;
  const modalIconName = dark ? 'text-white/75' : 'text-[#2C2C2C]/80';
  const modalIconSub = dark ? 'text-white/30' : 'text-[#2C2C2C]/45';
  const modalTypeUnsel: React.CSSProperties = dark
    ? { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.40)' }
    : { borderColor: 'rgba(44,44,44,0.18)', background: 'rgba(44,44,44,0.05)', color: 'rgba(44,44,44,0.60)' };
  const modalTypeSel: React.CSSProperties = dark
    ? { borderColor: `rgba(${SANDY_RGB},0.45)`, background: `rgba(${SANDY_RGB},0.14)`, color: SANDY }
    : { borderColor: 'rgba(44,44,44,0.35)', background: 'rgba(44,44,44,0.10)', color: '#2C2C2C' };
  const modalIconColor = dark ? SANDY : '#5C4020';
  const modalHint = dark ? 'text-white/30' : 'text-[#2C2C2C]/45';
  const modalCancelCls = dark
    ? 'border-white/[0.07] bg-white/4 text-white/55 hover:bg-white/8 hover:text-white/75'
    : 'border-black/10 bg-black/5 text-[#2C2C2C]/65 hover:bg-black/8 hover:text-[#2C2C2C]/85';

  function setWindowBody(id: string, body: string) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, body } : w)));
  }

  function setWindowRoom(id: string, room: string) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, room } : w)));
  }

  function setWindowIcon(id: string, icon: string) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, icon } : w)));
  }

  function moveWindow(id: string, dir: -1 | 1) {
    setWindows((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap]!, next[idx]!];
      return next;
    });
  }

  async function handleAddWindow() {
    const title = newTitle.trim();
    if (!title) return;
    const id = generateWindowId();
    const win: WindowDraft = { id, title, type: newType, icon: newIcon || DEFAULT_ICON_KEY, body: newType === 'text' && newBody.trim() ? newBody.trim() : undefined, room: newRoom.trim() || undefined };
    setAddSaving(true);
    try {
      await createWindowInDb(slug, win, windows.length);
      setWindows((prev) => [...prev, win]);
      setAddOpen(false);
      setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); setNewRoom('');
    } catch (e) {
      // error surfaced via saveError in parent
    } finally {
      setAddSaving(false);
    }
  }

  async function handleRemoveWindow(id: string) {
    setDeletingId(id);
    try {
      await deleteWindowFromDb(slug, id);
      setWindows((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpload(windowId: string, file: File) {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, _uploading: true, _uploadError: null } : w)));
    try {
      const url = await uploadFile(slug, `window/${windowId}`, file);
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, url, _uploading: false } : w)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, _uploading: false, _uploadError: msg } : w)));
    }
  }

  return (
    <div className="relative pb-48">
      <div className="mx-auto max-w-2xl space-y-3 px-4 pt-4">

        {saveError ? (
          <div className="rounded-xl border border-rose-500/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300/80">
            {saveError}
          </div>
        ) : null}

        {/* Rooms panel */}
        <div className="overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)]" style={windowCard}>
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: dark ? `rgba(${SANDY_RGB},0.08)` : 'rgba(0,0,0,0.06)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>Property Rooms</p>
              <p className="text-xs mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,41,59,0.50)' }}>
                Define rooms so guests see amenities organized by room.
              </p>
            </div>
            {roomsSaving && <span className="text-xs" style={{ color: dark ? `rgba(${SANDY_RGB},0.55)` : 'rgba(30,41,59,0.40)' }}>Saving…</span>}
          </div>
          <div className="px-4 py-3 space-y-3">
            {rooms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rooms.map((r) => (
                  <span key={r} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={dark
                      ? { background: `rgba(${SANDY_RGB},0.10)`, color: `rgba(${SANDY_RGB},0.80)`, border: `1px solid rgba(${SANDY_RGB},0.18)` }
                      : { background: 'rgba(0,0,0,0.06)', color: '#1e293b', border: '1px solid rgba(0,0,0,0.10)' }}>
                    {r}
                    <button type="button" onClick={() => removeRoom(r)}
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100"
                      aria-label={`Remove ${r}`}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={roomInput} onChange={(e) => setRoomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRoom(roomInput); setRoomInput(''); } }}
                placeholder="e.g. Master Bedroom, Patio…"
                className={`flex-1 h-9 rounded-xl border px-3 text-xs outline-none transition-all focus:ring-1 ${modalInputCls}`}
              />
              <button type="button" disabled={!roomInput.trim() || rooms.includes(roomInput.trim())} onClick={() => { addRoom(roomInput); setRoomInput(''); }}
                className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold transition-all disabled:opacity-40"
                style={dark ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` } : { background: 'rgba(15,23,42,0.88)', color: '#fff' }}>
                Add
              </button>
            </div>
            {ROOM_SUGGESTIONS.filter((s) => !rooms.includes(s)).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.40)' }}>Quick add</p>
                <div className="flex flex-wrap gap-1.5">
                  {ROOM_SUGGESTIONS.filter((s) => !rooms.includes(s)).slice(0, 10).map((s) => (
                    <button key={s} type="button" onClick={() => addRoom(s)}
                      className="rounded-full px-2.5 py-0.5 text-xs transition-all hover:opacity-80"
                      style={dark
                        ? { background: `rgba(${SANDY_RGB},0.05)`, color: `rgba(${SANDY_RGB},0.55)`, border: `1px solid rgba(${SANDY_RGB},0.12)` }
                        : { background: 'rgba(0,0,0,0.04)', color: 'rgba(30,41,59,0.60)', border: '1px solid rgba(0,0,0,0.08)' }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {windows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-white/30">
            No windows yet — add text, images, videos, or PDFs that guests see inside the amenities screen.
          </p>
        ) : (
          windows.map((w, idx) => {
            const isExpanded = expandedId === w.id;
            return (
              <div key={w.id} className="overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)]" style={windowCard}>
                {/* Always-rendered hidden file input */}
                {w.type !== 'text' && (
                  <input type="file" ref={(el) => { fileRefs.current[w.id] = el; }}
                    accept={w.type === 'image' ? 'image/*' : w.type === 'video' ? 'video/*' : w.type === 'pdf' ? 'application/pdf' : undefined}
                    className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleUpload(w.id, f); }}
                  />
                )}

                {/* Title row: icon + name + type badge */}
                <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
                  <button type="button" onClick={() => setIconPickerFor(w.id)} title="Change icon"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border transition-all"
                    style={dark
                      ? { borderColor: `rgba(${SANDY_RGB},0.22)`, background: `rgba(${SANDY_RGB},0.08)`, color: SANDY }
                      : { borderColor: 'rgba(0,0,0,0.12)', background: 'rgba(0,0,0,0.06)', color: '#475569' }}
                  >
                    <AmenityIconSvg iconKey={w.icon ?? DEFAULT_ICON_KEY} className="h-4 w-4" />
                  </button>
                  <div className="flex flex-1 min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white/90 leading-snug">{w.title}</span>
                    {w.room && <span className="text-xs text-slate-400 dark:text-white/35 leading-snug">{w.room}</span>}
                  </div>
                  <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-white/30 border border-slate-200 dark:border-white/8">{w.type}</span>
                </div>

                {/* Room selector */}
                {rooms.length > 0 && (
                  <div className="flex items-center gap-2 px-4 pb-2">
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.15em]" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.40)' }}>Room</span>
                    <select value={w.room ?? ''} onChange={(e) => setWindowRoom(w.id, e.target.value)}
                      className={`flex-1 h-7 appearance-none rounded-lg border px-2 text-xs outline-none transition-all ${dark
                        ? 'border-white/10 bg-black/25 text-white/70'
                        : 'border-black/[0.10] bg-white/80 text-slate-600'}`}>
                      <option value="">— Unassigned —</option>
                      {rooms.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center gap-1.5 px-4 pb-3 border-t border-slate-100 dark:border-white/5 pt-2.5">
                  {w.type !== 'text' && (
                    <button type="button" disabled={w._uploading} onClick={() => fileRefs.current[w.id]?.click()}
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/6 px-2.5 text-xs font-semibold text-slate-600 dark:text-white/55 transition-all hover:bg-slate-100 dark:hover:bg-white/12 disabled:opacity-40"
                    >
                      <UploadIcon />
                      {w._uploading ? 'Uploading…' : w.url ? 'Replace file' : 'Upload file'}
                    </button>
                  )}
                  {w.type === 'text' && (
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : w.id)}
                      className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/6 px-2.5 text-xs font-semibold text-slate-600 dark:text-white/55 transition-all hover:bg-slate-100 dark:hover:bg-white/12"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {isExpanded ? 'Hide content' : 'Edit content'}
                    </button>
                  )}
                  <div className="flex-1" />
                  <button type="button" disabled={idx === 0} onClick={() => moveWindow(w.id, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 transition-all hover:bg-slate-100 dark:hover:bg-white/8 disabled:opacity-25"
                  ><ChevronUpIcon /></button>
                  <button type="button" disabled={idx === windows.length - 1} onClick={() => moveWindow(w.id, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 transition-all hover:bg-slate-100 dark:hover:bg-white/8 disabled:opacity-25"
                  ><ChevronDownIcon /></button>
                  {deleteConfirmId === w.id ? (
                    <>
                      <span className="text-xs text-slate-500 dark:text-white/50">Delete?</span>
                      <button type="button" onClick={() => { setDeleteConfirmId(null); handleRemoveWindow(w.id); }}
                        className="inline-flex h-7 items-center rounded-lg border border-rose-500/35 bg-rose-500/15 px-2.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/25"
                      >Yes</button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)}
                        className="inline-flex h-7 items-center rounded-lg border border-slate-200 dark:border-white/10 px-2.5 text-xs font-semibold text-slate-500 dark:text-white/45 transition-all hover:bg-slate-100 dark:hover:bg-white/8"
                      >No</button>
                    </>
                  ) : (
                    <button type="button" disabled={deletingId === w.id} onClick={() => setDeleteConfirmId(w.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-400/20 text-rose-400/50 transition-all hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40"
                    >
                      {deletingId === w.id
                        ? <span className="h-3 w-3 animate-spin rounded-full border border-rose-400/40 border-t-rose-400" />
                        : <TrashIcon />}
                    </button>
                  )}
                </div>

                {/* Expandable text content */}
                {isExpanded && w.type === 'text' && (
                  <div className="border-t border-slate-100 dark:border-white/5 px-4 pb-4 pt-3">
                    <TextArea value={w.body ?? ''} onChange={(v) => setWindowBody(w.id, v)} placeholder="Enter content for guests…" rows={3} />
                  </div>
                )}

                {/* File preview (non-text, when a file exists) */}
                {w.type !== 'text' && w.url && (
                  <div className="border-t border-slate-100 dark:border-white/5 px-4 pb-4 pt-3">
                    <button type="button" onClick={() => setPreviewWindow(w)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98] ${TYPE_STYLES[w.type]}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {w.type === 'image' ? 'Image' : w.type === 'video' ? 'Video' : 'PDF'} attached — tap to preview
                    </button>
                    {w._uploadError && <p className="mt-1.5 text-xs text-rose-400/75 text-center">{w._uploadError}</p>}
                  </div>
                )}
                {w.type !== 'text' && !w.url && w._uploadError && (
                  <div className="border-t border-slate-100 dark:border-white/5 px-4 pb-3 pt-2">
                    <p className="text-xs text-rose-400/75">{w._uploadError}</p>
                  </div>
                )}

              </div>
            );
          })
        )}

        <button type="button" onClick={() => setAddOpen(true)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
          style={dark
            ? { borderColor: `rgba(${SANDY_RGB},0.20)`, background: `rgba(${SANDY_RGB},0.07)`, color: `rgba(${SANDY_RGB},0.75)` }
            : { borderColor: 'rgba(0,0,0,0.12)', background: '#ffffff', color: '#1e293b', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <PlusIcon /> Add Window
        </button>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 z-40 px-4 pb-2" style={{ bottom: '104px' }}>
        <button type="button" disabled={saving} onClick={onSave}
          className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
          style={dark
            ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
            : { background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.14)' }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      {/* Attachment preview modal */}
      {previewWindow?.url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPreviewWindow(null)}>
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.22), transparent)` }} />{/* modal top accent — always dark context */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
              <span className="text-sm font-medium text-white/80">{previewWindow.title}</span>
              <button
                type="button"
                onClick={() => setPreviewWindow(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white/80"
                aria-label="Close preview"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {previewWindow.type === 'image' && (
                <img src={previewWindow.url} alt={previewWindow.title} className="w-full rounded-lg object-contain max-h-[60vh]" />
              )}
              {previewWindow.type === 'video' && (
                <video controls src={previewWindow.url} className="w-full rounded-lg max-h-[60vh]">
                  Your browser does not support the video tag.
                </video>
              )}
              {previewWindow.type === 'pdf' && (
                <iframe src={previewWindow.url} title={previewWindow.title} className="w-full rounded-lg" style={{ height: '60vh', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Icon picker */}
      {iconPickerFor ? (
        <IconPickerModal
          current={iconPickerFor === 'new' ? newIcon : (windows.find((w) => w.id === iconPickerFor)?.icon ?? DEFAULT_ICON_KEY)}
          onSelect={(key) => { if (iconPickerFor === 'new') setNewIcon(key); else setWindowIcon(iconPickerFor, key); }}
          onClose={() => setIconPickerFor(null)}
        />
      ) : null}

      {/* Add window modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-5 pb-8 sm:items-center">
          <button type="button" onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); setNewRoom(''); }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Close"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl p-6" style={modalCardStyle}>
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: dark ? `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.30), transparent)` : 'linear-gradient(to right, transparent, rgba(0,0,0,0.10), transparent)' }} />
            <h3 className={`text-base font-semibold ${modalHeading}`}>Add a Window</h3>
            <p className={`mt-1 text-sm ${modalSub}`}>Creates a new amenity section guests can open.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <button type="button" onClick={() => setIconPickerFor('new')}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${modalIconRow}`}
                  style={{ borderColor: dark ? `rgba(${SANDY_RGB},0.22)` : 'rgba(0,0,0,0.12)' }}
                >
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border transition-all"
                    style={{ borderColor: dark ? `rgba(${SANDY_RGB},0.25)` : 'rgba(0,0,0,0.12)', background: dark ? `rgba(${SANDY_RGB},0.10)` : 'rgba(0,0,0,0.05)', color: modalIconColor }}
                  >
                    <AmenityIconSvg iconKey={newIcon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm ${modalIconName}`}>{AMENITY_ICONS_MAP[newIcon]?.name ?? 'Home'}</p>
                    <p className={`text-xs ${modalIconSub}`}>Tap to change icon</p>
                  </div>
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <input
                  type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pool Access, Parking, Check-out Info…"
                  className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all duration-200 focus:ring-1 ${modalInputCls}`}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['text', 'image', 'video', 'pdf'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setNewType(t)}
                      className="rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200"
                      style={newType === t ? modalTypeSel : modalTypeUnsel}
                    >{t}</button>
                  ))}
                </div>
              </div>
              {newType === 'text' ? (
                <div className="space-y-1.5">
                  <Label>Content (optional)</Label>
                  <textarea
                    value={newBody} rows={3} onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Enter text content for guests…"
                    className={`w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-1 ${modalInputCls}`}
                  />
                </div>
              ) : (
                <p className={`text-xs ${modalHint}`}>You can upload the {newType} file after adding the window.</p>
              )}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button"
                onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); setNewRoom(''); }}
                className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all ${modalCancelCls}`}
              >Cancel</button>
              <button type="button" disabled={!newTitle.trim() || addSaving} onClick={handleAddWindow}
                className="inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all disabled:opacity-50"
                style={dark
                  ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                  : { background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 0 12px rgba(0,0,0,0.14)' }}
              >{addSaving ? 'Creating…' : 'Add Window'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── QR view ─────────────────────────────────────────── */

function QRView({ slug: initialSlug, dark }: { slug: string; dark: boolean }) {
  const [slug, setSlug] = useState(initialSlug);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [regenSuccess, setRegenSuccess] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (mounted ? window.location.origin : '');
  const publicUrl = `${appUrl}/p/${slug}`;
  const confirmed = confirmText === 'Generate';

  async function handleRegenerate() {
    if (!confirmed || isGenerating) return;
    setIsGenerating(true);
    setRegenError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/regenerate`, { method: 'POST' });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setRegenError(data.error || 'Failed to regenerate. Please try again.');
      setIsGenerating(false);
      return;
    }
    const { slug: newSlug } = (await res.json()) as { slug: string };
    setSlug(newSlug);
    window.history.replaceState(null, '', `/manager/properties/${encodeURIComponent(newSlug)}/edit`);
    setShowModal(false);
    setIsGenerating(false);
    setRegenSuccess(true);
  }

  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-32">
      <div className="rounded-2xl border border-amber-500/30 bg-white p-5 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
          {mounted ? (
            <QRCodeSVG value={publicUrl} size={220} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
          ) : (
            <div className="h-55 w-55 animate-pulse rounded-xl bg-black/5" />
          )}
        </div>
        {regenSuccess ? (
          <p className="mt-3 text-center text-sm font-semibold text-amber-400">New QR code generated ✓</p>
        ) : (
          <p className="mt-3 max-w-65 text-center text-sm leading-relaxed text-white/85">
            Place this QR code at the property — tenants scan to access WiFi, house rules, and more.
          </p>
        )}

        <div className="mt-8 flex w-full max-w-xs gap-2">
          <button
            type="button"
            onClick={() => { setShowModal(true); setConfirmText(''); setRegenError(null); }}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/8 text-sm font-semibold text-amber-300/85 transition-all duration-200 hover:bg-amber-500/14 hover:text-amber-300"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Regenerate
          </button>

          <a
            href={`/manager/properties/${encodeURIComponent(slug)}/qr`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white/85"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print view
          </a>
        </div>

        {showModal ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ background: 'rgba(0,0,0,0.72)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
              <div className="h-1 w-full bg-amber-400" />
              <div className="p-6">
                <h2 className="text-base font-bold tracking-tight text-white">Regenerate QR Code?</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  This creates a new unique link for this property.{' '}
                  <span className="font-semibold text-white/75">Any previously printed QR codes will stop working</span>{' '}
                  and will need to be reprinted.
                </p>
                <div className="mt-5 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    Type <span className="text-amber-400">Generate</span> to confirm
                  </p>
                  <input
                    type="text" autoFocus value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleRegenerate(); }}
                    placeholder="Generate"
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#1e1e1e]/80 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/25"
                  />
                </div>
                {regenError ? <p className="mt-3 text-xs text-red-400">{regenError}</p> : null}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button" onClick={() => void handleRegenerate()}
                    disabled={!confirmed || isGenerating}
                    className="h-10 flex-1 rounded-xl bg-amber-400 text-sm font-bold text-[#0a1015] transition hover:bg-amber-500 disabled:opacity-40"
                  >
                    {isGenerating ? 'Generating…' : 'Generate New QR Code'}
                  </button>
                  <button
                    type="button" onClick={() => setShowModal(false)}
                    className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/50 transition hover:bg-white/10 hover:text-white/75"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}

/* ─── Settings view ───────────────────────────────────── */

const BG_KEYS = ['bg1', 'bg2', 'bg4', 'bg5', 'bg6'] as const;
type BgKey = typeof BG_KEYS[number];

const BG_PALETTES: Record<BgKey, { label: string; accent: string; heading: string; text: string }> = {
  bg1: { label: 'Azure',     accent: '#144c8c', heading: '#0f2d5c', text: 'rgba(20,70,140,0.62)' },
  bg2: { label: 'Sage',      accent: '#1e5a37', heading: '#0f2e1c', text: 'rgba(30,90,55,0.62)'  },
  bg4: { label: 'Ember',     accent: '#964110', heading: '#3d1a05', text: 'rgba(150,65,10,0.62)' },
  bg5: { label: 'Blush',     accent: '#9b2855', heading: '#3d0d24', text: 'rgba(155,40,85,0.62)' },
  bg6: { label: 'Sandstone', accent: '#6e4b1e', heading: '#2d1a08', text: 'rgba(110,75,30,0.65)' },
};

function SubBackButton({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      type="button" onClick={onClick}
      className="mb-6 flex items-center gap-1.5 self-start text-sm font-semibold transition"
      style={{ color: dark === false ? 'rgba(30,41,59,0.50)' : 'rgba(255,255,255,0.45)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

interface PhotoItem { id: string; url: string }

function SettingsView({ slug, initialBgKey, dark }: { slug: string; initialBgKey?: string; dark: boolean }) {
  const [sub, setSub] = useState<'grid' | 'backgrounds' | 'photos'>('grid');
  const [subFading, setSubFading] = useState(false);

  function goToSub(next: 'grid' | 'backgrounds' | 'photos') {
    setSubFading(true);
    setTimeout(() => setSub(next), 200);
    setTimeout(() => setSubFading(false), 220);
  }
  const [bgIndex, setBgIndex] = useState<number>(() => {
    const i = BG_KEYS.indexOf((initialBgKey ?? '') as BgKey);
    return i >= 0 ? i : 0;
  });
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoFileRef = useRef<HTMLInputElement>(null);

  // Touch swipe state for photo carousel
  const [swipeDragStart, setSwipeDragStart] = useState<number | null>(null);
  const [swipeDragOffset, setSwipeDragOffset] = useState(0);

  async function loadPhotos() {
    setPhotosLoading(true);
    try {
      const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/photos`);
      const data = (await res.json().catch(() => null)) as { photos?: PhotoItem[] } | null;
      if (res.ok && data?.photos) {
        setPhotos(data.photos);
        setPhotoIdx(0);
      }
    } catch { /* ignore */ }
    finally { setPhotosLoading(false); setPhotosLoaded(true); }
  }

  useEffect(() => {
    if (sub === 'photos' && !photosLoaded) void loadPhotos();
  }, [sub]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    e.target.value = '';
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/photos`, {
          method: 'POST',
          body: form,
        });
        const data = (await res.json().catch(() => null)) as { photo?: PhotoItem; error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? 'Upload failed');
        if (data?.photo) {
          setPhotos((prev) => {
            const next = [...prev, data.photo!];
            setPhotoIdx(next.length - 1);
            return next;
          });
        }
      }
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handlePhotoDelete(id: string) {
    setDeletingPhotoId(id);
    try {
      const res = await fetch(
        `/api/manager/properties/${encodeURIComponent(slug)}/photos/${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setPhotos((prev) => {
          const next = prev.filter((p) => p.id !== id);
          setPhotoIdx((i) => Math.min(i, Math.max(0, next.length - 1)));
          return next;
        });
      }
    } catch { /* ignore */ }
    finally { setDeletingPhotoId(null); }
  }

  function swipeNext() { setPhotoIdx((i) => Math.min(i + 1, photos.length - 1)); }
  function swipePrev() { setPhotoIdx((i) => Math.max(i - 1, 0)); }

  const currentBg = BG_KEYS[bgIndex];
  const palette = BG_PALETTES[currentBg];

  async function handleApplyTheme() {
    setThemeSaving(true); setThemeSaved(false); setThemeError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fields: {
          BackgroundKey: currentBg,
          AccentColor: palette.accent,
          HeadingColor: palette.heading,
          TextColor: palette.text,
        },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setThemeError(data.error || 'Save failed.');
    } else {
      setThemeSaved(true);
      setTimeout(() => setThemeSaved(false), 2500);
    }
    setThemeSaving(false);
  }

  async function handleResetAll() {
    setResetSaving(true); setResetDone(false);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fields: { BackgroundKey: '', AccentColor: '', HeadingColor: '', TextColor: '' } }),
    });
    if (res.ok) { setBgIndex(0); setResetDone(true); setTimeout(() => setResetDone(false), 2500); }
    setResetSaving(false);
  }

  if (sub === 'photos') {
    const current = photos[photoIdx];
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-32" style={{ opacity: subFading ? 0 : 1, transform: subFading ? 'translateY(10px)' : 'translateY(0)', transition: 'opacity 0.22s ease-out, transform 0.22s ease-out' }}>
        <h2 className="lux-title mb-6 w-full text-3xl font-light tracking-wide" style={{ color: '#ffffff' }}>
          Property Photos
        </h2>

        {photosLoading ? (
          <div className="flex items-center justify-center pt-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex w-full flex-col items-center gap-4 pt-6">
            <div
              className="flex h-48 w-full items-center justify-center rounded-2xl border-2 border-dashed"
              style={{ borderColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)' }}
            >
              <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,41,59,0.40)' }}>
                No photos yet
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* Carousel */}
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ height: 280, touchAction: 'pan-y' }}
              onTouchStart={(e) => setSwipeDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => {
                if (swipeDragStart === null) return;
                setSwipeDragOffset(e.touches[0].clientX - swipeDragStart);
              }}
              onTouchEnd={() => {
                if (Math.abs(swipeDragOffset) > 48) {
                  if (swipeDragOffset < 0) swipeNext(); else swipePrev();
                }
                setSwipeDragStart(null);
                setSwipeDragOffset(0);
              }}
            >
              {/* Photo strip */}
              <div
                className="flex h-full"
                style={{
                  width: `${photos.length * 100}%`,
                  transform: `translateX(calc(-${(photoIdx / photos.length) * 100}% + ${swipeDragOffset / photos.length}px))`,
                  transition: swipeDragStart !== null ? 'none' : 'transform 350ms cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="h-full bg-cover bg-center"
                    style={{ width: `${100 / photos.length}%`, backgroundImage: `url(${p.url})` }}
                  />
                ))}
              </div>

              {/* Prev / Next arrows */}
              {photoIdx > 0 && (
                <button
                  type="button"
                  onClick={swipePrev}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border transition"
                  style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}
                  aria-label="Previous photo"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}
              {photoIdx < photos.length - 1 && (
                <button
                  type="button"
                  onClick={swipeNext}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border transition"
                  style={{ background: 'rgba(0,0,0,0.55)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)' }}
                  aria-label="Next photo"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              )}

              {/* Counter badge */}
              <div
                className="absolute bottom-3 right-3 rounded-lg px-2 py-0.5 text-xs font-semibold text-white"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                {photoIdx + 1} / {photos.length}
              </div>
            </div>

            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoIdx(idx)}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: idx === photoIdx ? '20px' : '6px',
                      backgroundColor: idx === photoIdx
                        ? SANDY
                        : (dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)'),
                    }}
                    aria-label={`Photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Delete current photo */}
            {current && (
              <button
                type="button"
                onClick={() => void handlePhotoDelete(current.id)}
                disabled={deletingPhotoId === current.id}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
                style={{ borderColor: 'rgba(239,68,68,0.28)', background: 'rgba(239,68,68,0.07)', color: dark ? '#f87171' : '#dc2626' }}
              >
                {deletingPhotoId === current.id ? 'Deleting…' : 'Delete This Photo'}
              </button>
            )}
          </div>
        )}

        {photoError && <p className="mt-3 text-xs text-red-400">{photoError}</p>}

        {/* Upload */}
        <input
          ref={photoFileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handlePhotoUpload(e)}
        />
        <button
          type="button"
          onClick={() => photoFileRef.current?.click()}
          disabled={uploadingPhoto}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={dark
            ? { borderColor: `rgba(${SANDY_RGB},0.30)`, border: `1px solid rgba(${SANDY_RGB},0.30)`, background: `rgba(${SANDY_RGB},0.10)`, color: SANDY }
            : { border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(15,23,42,0.88)', color: '#fff' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {uploadingPhoto ? 'Uploading…' : 'Upload Photos'}
        </button>
      </div>
    );
  }

  if (sub === 'backgrounds') {
    const whiteAlpha = currentBg === 'bg4' ? 0.60 : 0.55;
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-32" style={{ opacity: subFading ? 0 : 1, transform: subFading ? 'translateY(10px)' : 'translateY(0)', transition: 'opacity 0.22s ease-out, transform 0.22s ease-out' }}>
        <h2 className="lux-title mb-5 w-full text-3xl font-light tracking-wide" style={{ color: '#ffffff' }}>
          Choose a Theme
        </h2>

        {/* Full-width preview card */}
        <div
          className="relative w-full overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.30)]"
          style={{ border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}
        >
          {/* Background image */}
          <img
            key={currentBg}
            src={`/images/${currentBg}.png`}
            alt={palette.label}
            className="h-[340px] w-full object-cover"
          />

          {/* White overlay — mirrors the white.png layer in the tenant view */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `rgba(255,255,255,${whiteAlpha})` }}
          />

          {/* Prev arrow */}
          <button
            type="button"
            onClick={() => setBgIndex((i) => (i - 1 + BG_KEYS.length) % BG_KEYS.length)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(0,0,0,0.32)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff', backdropFilter: 'blur(8px)' }}
            aria-label="Previous theme"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            type="button"
            onClick={() => setBgIndex((i) => (i + 1) % BG_KEYS.length)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(0,0,0,0.32)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff', backdropFilter: 'blur(8px)' }}
            aria-label="Next theme"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Tenant UI mock overlay */}
          <div className="absolute inset-x-5 bottom-5 space-y-2.5">
            {/* Property heading */}
            <div className="pb-0.5">
              <p
                className="mb-0.5 text-[9px] font-medium uppercase tracking-[0.32em]"
                style={{ color: palette.text }}
              >
                123 Ocean Drive
              </p>
              <p className="text-xl font-light leading-tight" style={{ color: palette.heading }}>
                The Grand Estate
              </p>
              <div className="mt-1.5 h-px w-6" style={{ background: `${palette.accent}55` }} />
            </div>

            {/* Home Amenities button */}
            <div
              className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${palette.accent}22`,
                boxShadow: `0 2px 12px rgba(0,0,0,0.07)`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-xl"
                  style={{ background: `${palette.accent}14`, color: palette.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold leading-none" style={{ color: palette.heading }}>
                    Home Amenities
                  </p>
                  <p className="mt-0.5 text-[9px] leading-none" style={{ color: palette.text }}>
                    WiFi, garage &amp; more
                  </p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 flex-none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Need Help button */}
            <div
              className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${palette.accent}22`,
                boxShadow: `0 2px 12px rgba(0,0,0,0.07)`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-xl"
                  style={{ background: `${palette.accent}14`, color: palette.accent }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.1 10.81 19.79 19.79 0 01.07 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[11px] font-semibold" style={{ color: palette.heading }}>
                  Need Help?
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 flex-none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Label + dot indicators */}
        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.70)' : '#1e293b' }}>
            {palette.label}
          </p>
          <div className="flex items-center gap-1.5">
            {BG_KEYS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBgIndex(idx)}
                aria-label={`Theme ${idx + 1}`}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: idx === bgIndex ? '20px' : '6px',
                  backgroundColor: idx === bgIndex ? palette.accent : (dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)'),
                }}
              />
            ))}
          </div>
        </div>

        {themeError ? <p className="mt-3 text-xs text-red-400">{themeError}</p> : null}
        <button
          type="button"
          onClick={() => void handleApplyTheme()}
          disabled={themeSaving}
          className="mt-4 h-12 w-full rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={themeSaved
            ? { background: 'rgba(52,211,153,0.15)', color: 'rgb(52,211,153)' }
            : dark
              ? { borderColor: `rgba(${SANDY_RGB},0.30)`, border: `1px solid rgba(${SANDY_RGB},0.30)`, background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, boxShadow: `0 0 20px rgba(${SANDY_RGB},0.10)` }
              : { border: '1px solid rgba(0,0,0,0.12)', background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 0 12px rgba(0,0,0,0.10)' }
          }
        >
          {themeSaving ? 'Applying…' : themeSaved ? 'Theme Applied ✓' : `Apply ${palette.label} Theme`}
        </button>

        <button
          type="button"
          onClick={() => void handleResetAll()}
          disabled={resetSaving}
          className="mt-2.5 h-10 w-full rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-40"
          style={resetDone
            ? { background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.25)', color: 'rgb(52,211,153)' }
            : { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.38)', color: 'rgba(255,255,255,0.85)' }
          }
        >
          {resetSaving ? 'Resetting…' : resetDone ? 'Reset to Default ✓' : 'Reset to Default'}
        </button>
      </div>
    );
  }

  const settingCard: React.CSSProperties = dark
    ? { background: 'rgba(8,8,8,0.95)', border: `1px solid rgba(${SANDY_RGB},0.10)`, backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
  const settingIconStyle: React.CSSProperties = dark
    ? { borderColor: 'rgba(255,255,255,0.20)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.80)' }
    : { borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.05)', color: '#475569' };
  const settingTitle = dark ? '#ffffff' : '#1e293b';
  const settingSub = dark ? 'rgba(255,255,255,0.65)' : 'rgba(30,41,59,0.50)';
  const dividerColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
  const resetDesc = 'rgba(255,255,255,0.55)';
  const swatchBorder = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

  return (
    <div className="px-4 pt-6 pb-32 space-y-3" style={{ opacity: subFading ? 0 : 1, transform: subFading ? 'translateY(10px)' : 'translateY(0)', transition: 'opacity 0.22s ease-out, transform 0.22s ease-out' }}>
      <button
        type="button" onClick={() => goToSub('photos')}
        className="flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200"
        style={settingCard}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border" style={settingIconStyle}>
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: settingTitle }}>Property Photos</p>
          <p className="mt-0.5 text-xs" style={{ color: settingSub }}>
            {photosLoaded && photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} · visible to guests` : 'Upload photos for guests to browse'}
          </p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" style={{ color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(30,41,59,0.30)' }}>
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button" onClick={() => goToSub('backgrounds')}
        className="flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200"
        style={settingCard}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border" style={settingIconStyle}>
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M2 8h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: settingTitle }}>Themes & Colors</p>
          <p className="mt-0.5 text-xs" style={{ color: settingSub }}>Background + complementary palette</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {(['accent', 'heading', 'text'] as const).map((k) => (
            <div key={k} className="h-4 w-4 rounded-full border" style={{ backgroundColor: BG_PALETTES[BG_KEYS[bgIndex]][k], borderColor: swatchBorder }} />
          ))}
        </div>
      </button>

      <div className="mt-6">
        <div className="h-px" style={{ background: dividerColor }} />
        <div className="mt-5">
          <p className="mb-2 text-xs" style={{ color: resetDesc }}>Reset all visual customizations back to the original defaults.</p>
          <button type="button" onClick={() => void handleResetAll()} disabled={resetSaving}
            className={`h-10 w-full rounded-xl border text-sm font-semibold transition-all duration-200 disabled:opacity-40 ${resetDone ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-400' : ''}`}
            style={!resetDone ? (dark
              ? { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)' }
              : { borderColor: 'rgba(255,255,255,0.30)', background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)' }
            ) : undefined}
          >
            {resetSaving ? 'Resetting…' : resetDone ? 'Reset ✓' : 'Reset to Defaults'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Work Orders view ───────────────────────────────── */

interface WOCategory {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_builtin: boolean;
}

function WorkOrdersView({ slug, dark, initialCategories, onCategoriesChange }: { slug: string; dark: boolean; initialCategories?: WOCategory[]; onCategoriesChange?: (cats: WOCategory[]) => void }) {
  const [categories, setCategories] = useState<WOCategory[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(!initialCategories);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = dark
    ? { background: 'rgba(8,8,8,0.95)', border: `1px solid rgba(${SANDY_RGB},0.10)`, backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  function updateCategories(next: WOCategory[] | ((prev: WOCategory[]) => WOCategory[])) {
    setCategories((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      onCategoriesChange?.(resolved);
      return resolved;
    });
  }

  async function load() {
    setLoading(true); setLoadError(null);
    try {
      const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/work-order-categories`);
      const data = (await res.json().catch(() => null)) as { categories?: WOCategory[]; error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? `Load failed (${res.status})`);
      updateCategories(data?.categories ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (!initialCategories) void load(); }, [slug]);

  function startEdit(cat: WOCategory) {
    setEditingId(cat.id);
    setEditPhone(cat.phone ?? '');
    setEditEmail(cat.email ?? '');
    setSavedId(null);
  }

  function cancelEdit() { setEditingId(null); }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/manager/properties/${encodeURIComponent(slug)}/work-order-categories/${encodeURIComponent(id)}`,
        { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: editPhone, email: editEmail }) }
      );
      if (!res.ok) {
        const d = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(d?.error ?? 'Save failed');
      }
      updateCategories((prev) => prev.map((c) => c.id === id ? { ...c, phone: editPhone || null, email: editEmail || null } : c));
      setEditingId(null);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    const res = await fetch(
      `/api/manager/properties/${encodeURIComponent(slug)}/work-order-categories/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    if (res.ok) updateCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAdd() {
    if (!addName.trim()) { setAddError('Category name is required'); return; }
    setAdding(true); setAddError(null);
    try {
      const res = await fetch(
        `/api/manager/properties/${encodeURIComponent(slug)}/work-order-categories`,
        { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: addName, phone: addPhone, email: addEmail }) }
      );
      const data = (await res.json().catch(() => null)) as { category?: WOCategory; error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? 'Create failed');
      if (data?.category) updateCategories((prev) => [...prev, data.category!]);
      setAddName(''); setAddPhone(''); setAddEmail('');
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-32 space-y-4">
      {loadError ? (
        <p className="text-sm text-red-400">{loadError}</p>
      ) : null}

      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
        Assign a phone or email to each work order type so tenant requests are routed to the right contact. Tenants only see the category name — your contact info stays private.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          const wasSaved = savedId === cat.id;
          return (
            <div key={cat.id} className="rounded-2xl p-4 space-y-3" style={cardStyle}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white/85 truncate">{cat.name}</span>
                  {cat.is_builtin ? (
                    <span className="shrink-0 inline-flex h-4 items-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/6 px-1.5 text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30">
                      built-in
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {wasSaved ? <span className="text-xs text-emerald-400">Saved ✓</span> : null}
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit(cat.id)}
                        disabled={saving}
                        className="h-7 rounded-lg px-3 text-xs font-semibold transition-all disabled:opacity-50"
                        style={dark
                          ? { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff' }
                          : { background: 'rgba(15,23,42,0.88)', border: '1px solid transparent', color: '#fff' }}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEdit} className="h-7 rounded-lg px-2 text-xs transition"
                        style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.45)' }}>
                        Cancel
                      </button>
                    </>
                  ) : confirmDeleteId === cat.id ? null : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="h-7 rounded-lg px-3 text-xs font-medium transition border"
                        style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(30,41,59,0.55)', borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)', color: dark ? 'rgba(255,255,255,0.30)' : 'rgba(30,41,59,0.35)' }}
                        aria-label="Delete category"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Phone">
                    <TextInput value={editPhone} onChange={setEditPhone} placeholder="+1 (555) 000-0000" type="tel" />
                  </FieldGroup>
                  <FieldGroup label="Email">
                    <TextInput value={editEmail} onChange={setEditEmail} placeholder="repairs@co.com" type="email" />
                  </FieldGroup>
                </div>
              ) : confirmDeleteId === cat.id ? (
                <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}>
                  <span className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.70)' : 'rgba(30,41,59,0.80)' }}>
                    Are you sure you want to delete{' '}
                    <strong style={{ color: dark ? '#ffffff' : '#1e293b' }}>{cat.name}</strong>?
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-7 rounded-lg px-3 text-xs font-medium transition"
                      style={dark
                        ? { color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.12)' }
                        : { color: 'rgba(30,41,59,0.60)', border: '1px solid rgba(0,0,0,0.14)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => { void deleteCategory(cat.id); setConfirmDeleteId(null); }}
                      className="h-7 rounded-lg px-3 text-xs font-semibold transition"
                      style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: dark ? '#f87171' : '#dc2626' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.50)' }}>
                  {cat.phone
                    ? <span>📞 {cat.phone}</span>
                    : <span className="italic" style={{ color: dark ? 'rgba(255,255,255,0.20)' : 'rgba(30,41,59,0.28)' }}>No phone</span>}
                  {cat.email
                    ? <span>✉ {cat.email}</span>
                    : <span className="italic" style={{ color: dark ? 'rgba(255,255,255,0.20)' : 'rgba(30,41,59,0.28)' }}>No email</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add custom category */}
      <div className="rounded-2xl p-4 space-y-3" style={{ ...cardStyle, border: dark ? `1px dashed rgba(${SANDY_RGB},0.18)` : '1px dashed rgba(0,0,0,0.12)' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-[rgba(245,237,213,0.55)]">
          Add Custom Category
        </p>
        <FieldGroup label="Category Name">
          <TextInput value={addName} onChange={(v) => { setAddName(v); setAddError(null); }} placeholder="e.g. Pest Control" />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Phone">
            <TextInput value={addPhone} onChange={setAddPhone} placeholder="+1 (555) 000-0000" type="tel" />
          </FieldGroup>
          <FieldGroup label="Email">
            <TextInput value={addEmail} onChange={setAddEmail} placeholder="repairs@co.com" type="email" />
          </FieldGroup>
        </div>
        {addError ? <p className="text-xs text-red-400">{addError}</p> : null}
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={adding}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={dark
            ? { borderColor: `rgba(${SANDY_RGB},0.25)`, background: `rgba(${SANDY_RGB},0.07)`, color: SANDY }
            : { borderColor: 'rgba(0,0,0,0.14)', background: 'rgba(0,0,0,0.04)', color: 'rgba(30,41,59,0.65)' }}
        >
          <PlusIcon />
          {adding ? 'Adding…' : 'Add Category'}
        </button>
      </div>
    </div>
  );
}

/* ─── Help view ──────────────────────────────────────── */

type HelpTab = 'howto' | 'faq' | 'contact';

function HelpStep({ n, title, desc, dark }: { n: number; title: string; desc: string; dark: boolean }) {
  return (
    <div className="flex items-start gap-3 pt-3">
      <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
        style={{
          background: dark ? 'rgba(245,237,213,0.12)' : 'rgba(44,44,44,0.10)',
          color: dark ? 'rgba(245,237,213,0.70)' : 'rgba(44,44,44,0.60)',
        }}>
        {n}
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.88)' : 'rgba(30,20,10,0.90)' }}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(30,20,10,0.55)' }}>{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a, dark }: { q: string; a: string; dark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t" style={{ borderColor: dark ? 'rgba(245,237,213,0.08)' : 'rgba(44,44,44,0.10)' }}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-3 py-3 text-left">
        <span className="text-sm font-medium leading-snug" style={{ color: dark ? 'rgba(255,255,255,0.82)' : 'rgba(30,20,10,0.85)' }}>{q}</span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 mt-0.5 transition-transform duration-200"
          style={{ color: dark ? 'rgba(245,237,213,0.40)' : 'rgba(44,44,44,0.38)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p className="text-xs leading-relaxed pb-3" style={{ color: dark ? 'rgba(255,255,255,0.52)' : 'rgba(30,20,10,0.58)' }}>{a}</p>
      )}
    </div>
  );
}

/* per-section card colors for the How-To list — all cards now use the shared clean style */
const HOWTO_CARD_LIGHT = {
  lBg: 'rgba(255,255,255,0.92)', lBorder: 'rgba(0,0,0,0.07)',
  lTitle: '#1e293b', lSub: 'rgba(30,41,59,0.55)',
  lDivider: 'rgba(0,0,0,0.06)', lBadgeBg: 'rgba(0,0,0,0.06)',
};
const HOWTO_CARD_DARK = {
  dBg: 'rgba(8,8,8,0.95)', dBorder: 'rgba(255,255,255,0.08)',
  dTitle: 'rgba(255,255,255,0.88)', dSub: 'rgba(255,255,255,0.50)',
  dDivider: 'rgba(255,255,255,0.08)', dBadgeBg: 'rgba(255,255,255,0.08)',
};
const HOWTO_COLORS: Record<string, typeof HOWTO_CARD_LIGHT & typeof HOWTO_CARD_DARK> = {
  qr:              { ...HOWTO_CARD_LIGHT, ...HOWTO_CARD_DARK },
  'property-info': { ...HOWTO_CARD_LIGHT, ...HOWTO_CARD_DARK },
  amenities:       { ...HOWTO_CARD_LIGHT, ...HOWTO_CARD_DARK },
  settings:        { ...HOWTO_CARD_LIGHT, ...HOWTO_CARD_DARK },
  'work-orders':   { ...HOWTO_CARD_LIGHT, ...HOWTO_CARD_DARK },
};

/* gradient-matched icon container styles per tile */
const HOWTO_ICON_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  'property-info': { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.32)',  color: '#F97316' },
  amenities:       { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.32)',  color: '#3B82F6' },
  'work-orders':   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.32)',  color: '#10B981' },
  settings:        { bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.32)',  color: '#4ADE80' },
  qr:              { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.32)',  color: '#FBBF24' },
};

const HOWTO_STEPS: Record<string, { title: string; desc: string }[]> = {
  'property-info': [
    { title: 'Open Property Info', desc: 'Tap the orange Property Info tile on your dashboard to enter the editor.' },
    { title: 'Fill in the basics', desc: 'Enter your property name and address. These appear in your guest guide header.' },
    { title: 'Write your welcome message', desc: 'Add a House Bio — a warm introduction guests see when they first open the guide.' },
    { title: 'Add Wi-Fi & access codes', desc: 'Enter your Wi-Fi name, password, and any garage or door codes so guests can find them instantly.' },
    { title: 'Save your changes', desc: 'Tap Save at the bottom of the form. Changes go live immediately in the guest guide.' },
  ],
  amenities: [
    { title: 'Open Amenities', desc: 'Tap the purple Amenities tile to manage your content windows.' },
    { title: 'Add a window', desc: 'Tap Add Window, give it a title, choose a type (Image, Video, PDF, or Text), and attach your file or paste your text.' },
    { title: 'Reorder windows', desc: 'Use the up and down arrows on the bottom-right of each card to change display order.' },
    { title: 'Preview attachments', desc: "Tap the attachment tag (e.g. 'Image — tap to preview') to open a full preview of the file." },
    { title: 'Replace a file', desc: 'Open a window card and tap Replace File to upload a new version without changing the title.' },
    { title: 'Delete a window', desc: 'Tap the trash icon on the top-right of a card. Confirm deletion with Yes when prompted.' },
  ],
  qr: [
    { title: 'Open QR Code', desc: 'Tap the yellow QR Code tile on your dashboard.' },
    { title: 'Download the QR code', desc: "Tap Download to save a high-resolution PNG of your property's unique QR code." },
    { title: 'Print and display', desc: 'Print the code and place it in a visible spot — near the entrance or on the fridge works well.' },
    { title: 'Test it', desc: 'Scan the code with your phone camera to confirm it opens your guest guide correctly.' },
  ],
  settings: [
    { title: 'Open Design', desc: 'Tap the green Design tile to customise how your guest guide looks.' },
    { title: 'Choose a background', desc: 'Browse the available background images and tap one to apply it.' },
    { title: 'Upload your logo', desc: 'Add a property or brand logo that appears at the top of your guest guide.' },
    { title: 'Adjust logo size', desc: 'Use the size slider to scale the logo to your preference.' },
    { title: 'Save', desc: 'Tap Save to publish your design changes instantly.' },
  ],
  'work-orders': [
    { title: 'Open Work Orders', desc: 'Tap the Work Orders tile on your dashboard.' },
    { title: 'Review open requests', desc: 'All maintenance and guest requests appear here sorted by date. Tap any card to see full details.' },
    { title: 'Update status', desc: 'Mark requests as In Progress or Resolved to keep your records clean.' },
    { title: 'Add categories', desc: 'Create custom maintenance categories so guests can route requests to the right place.' },
    { title: 'Contact tenant', desc: 'Tap the phone or email icon on a request card to reach the guest directly.' },
  ],
};

function HelpView({ dark, slug, propertyName }: { dark: boolean; slug: string; propertyName: string }) {
  const SANDY = '#F5EDD5';
  const [tab, setTab] = useState<HelpTab>('howto');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  /* Shared card style for FAQ / Contact — warm cream in light, dark glass in dark */
  const cardStyle: React.CSSProperties = dark
    ? { background: 'rgba(8,8,8,0.95)', border: `1px solid rgba(${SANDY_RGB},0.10)`, backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

  /* Label color always readable in both modes */
  const labelColor = dark ? 'rgba(245,237,213,0.50)' : 'rgba(44,44,44,0.50)';

  const inputBase = 'h-10 w-full rounded-xl border px-3 text-sm outline-none transition-all focus:ring-1';
  const inputStyle: React.CSSProperties = dark
    ? { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(0,0,0,0.22)', color: '#fff' }
    : { borderColor: 'rgba(44,44,44,0.20)', background: 'rgba(44,44,44,0.06)', color: '#2C2C2C' };

  const tabs: { id: HelpTab; label: string }[] = [
    { id: 'howto', label: 'How To' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  async function handleContactSubmit() {
    if (!topic || !description.trim()) return;
    setContactStatus('sending');
    setContactError('');
    try {
      const res = await fetch('/api/manager/contact-support', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, propertyName, topic, description }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Send failed');
      setContactStatus('sent');
      setTopic('');
      setDescription('');
    } catch (e) {
      setContactError(e instanceof Error ? e.message : 'Something went wrong.');
      setContactStatus('error');
    }
  }

  const guideTiles = TILES.filter(t => t.id !== 'help');

  return (
    <div className="px-4 pb-8 pt-4 space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl p-1" style={dark
        ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
        : { background: 'rgba(44,44,44,0.08)', border: '1px solid rgba(44,44,44,0.12)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200"
            style={tab === t.id
              ? dark
                ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: '#3d2a0a', boxShadow: '0 0 14px rgba(245,237,213,0.18)' }
                : { background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.14)' }
              : { color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(44,44,44,0.50)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HOW TO — colored list accordion ── */}
      {tab === 'howto' && (
        <div className="space-y-3">
          {guideTiles.map((tile) => {
            const c = HOWTO_COLORS[tile.id];
            const isOpen = selectedSection === tile.id;
            const steps = HOWTO_STEPS[tile.id] ?? [];
            const bg = dark ? c.dBg : c.lBg;
            const border = dark ? c.dBorder : c.lBorder;
            const titleColor = dark ? c.dTitle : c.lTitle;
            const subColor = dark ? c.dSub : c.lSub;
            const divider = dark ? c.dDivider : c.lDivider;
            const badgeBg = dark ? c.dBadgeBg : c.lBadgeBg;

            const ic = HOWTO_ICON_COLORS[tile.id] ?? { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.12)', color: '#999' };
            const iconStyle: React.CSSProperties = { background: ic.bg, border: `1px solid ${ic.border}`, color: ic.color };

            return (
              <div
                key={tile.id}
                className="rounded-2xl overflow-hidden backdrop-blur-sm"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSection(isOpen ? null : tile.id)}
                  className="w-full px-4 pt-4 pb-3.5 text-left transition-opacity active:opacity-75"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-xl border h-10 w-10 mt-0.5 ${tile.iconBg}`}
                      style={iconStyle}
                    >
                      {tile.icon}
                    </div>
                    {/* Title row + subtitle row */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[15px] font-bold leading-tight" style={{ color: titleColor }}>{tile.label}</p>
                        <span
                          className="shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: badgeBg, color: titleColor }}
                        >
                          {steps.length} Steps
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs" style={{ color: subColor }}>{tile.sub}</p>
                        <svg
                          viewBox="0 0 24 24" fill="none"
                          className="h-4 w-4 shrink-0 ml-2 transition-transform duration-200"
                          style={{ color: subColor, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 border-t" style={{ borderColor: divider }}>
                    {steps.map((step, i) => (
                      <HelpStep key={i} n={i + 1} title={step.title} desc={step.desc} dark={dark} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── FAQ ── */}
      {tab === 'faq' && (
        <div className="space-y-3">
          <div className="rounded-2xl px-5 py-4" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-1" style={{ color: labelColor }}>For Managers</p>
            <FaqItem dark={dark} q="How do guests access the guide?" a="Guests scan the QR code you display at the property. It opens directly in their mobile browser — no app download needed." />
            <FaqItem dark={dark} q="Can I have multiple properties?" a="Yes. Each property gets its own guide, QR code, and dashboard. Use the property selector to switch between them." />
            <FaqItem dark={dark} q="Do changes go live immediately?" a="Yes. Any edit you save is reflected in the guest guide in real time, including property info, amenities, and design." />
            <FaqItem dark={dark} q="What file types can I upload for amenities?" a="You can upload images (JPG, PNG, WebP), videos (MP4, MOV), and PDF documents. Maximum file size is 50 MB." />
            <FaqItem dark={dark} q="Can I customise the look for each property?" a="Yes. The Design section lets you set a unique background image and logo per property." />
            <FaqItem dark={dark} q="How do I add a new property?" a="Go back to the main manager dashboard and use the Add Property option. You'll be guided through the setup." />
            <FaqItem dark={dark} q="What happens if a guest submits a work order?" a="The request appears in your Work Orders section with the guest's contact info and a description of the issue." />
            <FaqItem dark={dark} q="Can I change my login email or password?" a="Yes. Go to your account settings, or use the Forgot Password flow on the login page to reset your password." />
            <FaqItem dark={dark} q="Is the guest guide mobile-optimised?" a="Yes. The guide is built for mobile browsers and looks great on all screen sizes without any extra setup." />
            <FaqItem dark={dark} q="How do I delete a property?" a="Contact support@pmpillar.com with your property ID and we'll process the deletion securely." />
          </div>

          <div className="rounded-2xl px-5 py-4" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-1" style={{ color: labelColor }}>For Tenants &amp; Guests</p>
            <FaqItem dark={dark} q="How do I access the property guide?" a="Scan the QR code displayed at the property with your phone camera. It will open the guide automatically in your browser." />
            <FaqItem dark={dark} q="Where do I find the Wi-Fi password?" a="Open the guide and look in the Property Info or Amenities section — your host has added it there for you." />
            <FaqItem dark={dark} q="How do I report a maintenance issue?" a="Find the Work Orders or Maintenance section in the guide and tap Submit Request. Describe the issue and your contact info." />
            <FaqItem dark={dark} q="Do I need to download an app?" a="No. The guide opens directly in your phone's web browser when you scan the QR code." />
            <FaqItem dark={dark} q="The QR code isn't working — what do I do?" a="Make sure your camera app is pointing at the full QR code in good lighting. If it still doesn't work, ask your host for the direct link." />
            <FaqItem dark={dark} q="Can I access the guide again after check-out?" a="The link stays active as long as your host keeps the property listed. Bookmark the page during your stay for easy access." />
            <FaqItem dark={dark} q="Who do I contact for urgent issues?" a="Your host's phone number is listed in the Property Info section of the guide. For emergencies always call 911." />
            <FaqItem dark={dark} q="The guide isn't loading — what should I try?" a="Try refreshing the page, switching between Wi-Fi and mobile data, or clearing your browser cache. If the issue persists, contact your host." />
          </div>
        </div>
      )}

      {/* ── CONTACT ── */}
      {tab === 'contact' && (
        <div className="space-y-3">
          <div className="rounded-2xl px-5 py-4 space-y-1" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Property ID</p>
            <p className="text-sm font-mono font-medium" style={{ color: dark ? SANDY : '#2C2C2C' }}>{slug}</p>
          </div>

          {contactStatus === 'sent' ? (
            <div className="rounded-2xl px-5 py-8 flex flex-col items-center gap-3 text-center" style={cardStyle}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.30)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" style={{ color: 'rgb(134,239,172)' }}>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.88)' : 'rgba(44,44,44,0.88)' }}>Message Sent</p>
              <p className="text-xs leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(44,44,44,0.55)' }}>
                Your message has been sent to our support team. We&apos;ll get back to you at the email on your account.
              </p>
              <button
                type="button"
                onClick={() => setContactStatus('idle')}
                className="mt-1 text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
                style={{ color: labelColor }}
              >
                Send Another
              </button>
            </div>
          ) : (
            <div className="rounded-2xl px-5 py-5 space-y-4" style={cardStyle}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Contact Support</p>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.20em]" style={{ color: labelColor }}>Topic</p>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                  disabled={contactStatus === 'sending'}
                >
                  <option value="">Select a topic…</option>
                  <option value="Account & Billing">Account &amp; Billing</option>
                  <option value="Property Info">Property Info</option>
                  <option value="Amenities">Amenities</option>
                  <option value="QR Code">QR Code</option>
                  <option value="Design">Design</option>
                  <option value="Work Orders">Work Orders</option>
                  <option value="Guest Guide">Guest Guide</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.20em]" style={{ color: labelColor }}>Description</p>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe your issue or question…"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-1 resize-none"
                  style={{ ...inputStyle, height: 'auto' }}
                  disabled={contactStatus === 'sending'}
                />
              </div>

              {contactStatus === 'error' && (
                <p className="text-xs text-rose-400/90">{contactError}</p>
              )}

              <button
                type="button"
                onClick={handleContactSubmit}
                disabled={contactStatus === 'sending' || !topic || !description.trim()}
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                style={dark
                  ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: '#3d2a0a', boxShadow: '0 0 20px rgba(245,237,213,0.22)' }
                  : { background: 'rgba(15,23,42,0.88)', color: '#fff', boxShadow: '0 0 16px rgba(0,0,0,0.14)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {contactStatus === 'sending' ? 'Sending…' : 'Send to Support'}
              </button>

              <p className="text-center text-[10px]" style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(44,44,44,0.40)' }}>
                Sends directly to our team — no mail app needed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Bottom bar ──────────────────────────────────────── */

function BottomBar({ view, onNavigate, dark }: { view: View; onNavigate: (v: View) => void; dark: boolean }) {
  const iconInactive: React.CSSProperties = {
    color: dark ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.40)',
  };

  return (
    <div className="fixed left-1/2 bottom-5 z-30 -translate-x-1/2">
      <div
        className="flex items-center rounded-2xl px-5 py-1.5"
        style={{
          background: dark ? 'rgba(18,18,18,0.96)' : 'rgba(255,255,255,0.96)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10)',
          gap: '8px',
        }}
      >
        {/* QR Code */}
        <button
          type="button"
          onClick={() => onNavigate('qr')}
          className="flex h-9 w-12 items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
          style={view === 'qr'
            ? { background: 'rgba(251,191,36,0.14)', color: '#FBBF24' }
            : iconInactive}
          aria-label="QR Code"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3zM18 18v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-6 w-px mx-0.5 shrink-0" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

        {/* Home */}
        <button
          type="button"
          onClick={() => onNavigate('grid')}
          className="flex h-9 w-14 items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
          style={view === 'grid'
            ? { background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)', color: dark ? '#ffffff' : '#1e293b' }
            : { ...iconInactive, color: dark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.52)' }}
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-6 w-px mx-0.5 shrink-0" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

        {/* Design / Settings */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="flex h-9 w-12 items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
          style={view === 'settings'
            ? { background: 'rgba(74,222,128,0.14)', color: 'rgb(22,163,74)' }
            : iconInactive}
          aria-label="Design settings"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────── */

export default function ManagerPropertyEditorClient({
  slug,
  property,
}: {
  slug: string;
  property: Property;
  rawFields?: Record<string, unknown>;
  initialLayout?: { field: string }[];
}) {
  const [view, setView] = useState<View>('grid');
  const [fading, setFading] = useState(false);
  const [dark, setDark] = useState(false);

  const [core, setCore] = useState<CoreFields>({
    PropertyName: property.PropertyName ?? '',
    PropertyAddress: property.PropertyAddress === 'Not provided' ? '' : (property.PropertyAddress ?? ''),
    PropertyZipCode: property.PropertyZipCode === 'Not provided' ? '' : (property.PropertyZipCode ?? ''),
    DetailedHouseBio: property.DetailedHouseBio === 'Not provided' ? '' : (property.DetailedHouseBio ?? ''),
    CheckoutInstructions: property.CheckoutInstructions ?? '',
    WiFiName: property.WiFiName ?? '',
    WiFiPassword: property.WiFiPassword ?? '',
    GarageCode: property.GarageCode ?? '',
    ManagerPhone: property.ManagerPhone ?? '',
    LogoSize: property.LogoSize ?? 100,
  });

  const [heroUrl, setHeroUrl] = useState<string | undefined>(property.HeroImage);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(property.LogoUrl);
  const [logoUrlDark, setLogoUrlDark] = useState<string | undefined>(property.LogoUrlDark);
  const [windows, setWindows] = useState<WindowDraft[]>(property.windows ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [prefetchedWOCategories, setPrefetchedWOCategories] = useState<WOCategory[] | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem('pillar-theme');
    if (stored) setDark(stored === 'dark');
  }, []);

  useEffect(() => {
    fetch(`/api/manager/properties/${encodeURIComponent(slug)}/work-order-categories`)
      .then((r) => r.json())
      .then((d: { categories?: WOCategory[] }) => { if (d.categories) setPrefetchedWOCategories(d.categories); })
      .catch(() => { /* silently ignore — WorkOrdersView will retry on open */ });
  }, [slug]);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('pillar-theme', next ? 'dark' : 'light');
  }

  function goTo(next: View) {
    setFading(true);
    setTimeout(() => setView(next), 200);
    setTimeout(() => setFading(false), 220);
  }

  function goBack() {
    if (view === 'grid') {
      window.location.href = '/manager';
    } else {
      goTo('grid');
    }
  }

  async function handleSave() {
    setSaving(true); setSaveError(null); setSaved(false);
    try {
      await saveCoreFields(slug, core);
      await saveWindowsToDb(slug, windows);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const VIEW_TITLES: Partial<Record<View, string>> = {
    'property-info': 'Property Info',
    amenities: 'Amenities',
    qr: 'QR Code',
    settings: 'Design',
    'work-orders': 'Work Orders',
    help: 'Help',
  };

  const glowGradient = dark ? (
    view === 'property-info' ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(251,146,60,0.50) 0%, transparent 65%),'
    : view === 'amenities'    ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(59,130,246,0.45) 0%, transparent 65%),'
    : view === 'settings'     ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(74,222,128,0.35) 0%, transparent 65%),'
    : view === 'qr'           ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(251,191,36,0.40) 0%, transparent 65%),'
    : view === 'work-orders'  ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(16,185,129,0.45) 0%, transparent 65%),'
    : view === 'help'         ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(248,113,113,0.40) 0%, transparent 65%),'
    : ''
  ) : '';

  const toggleStyle: React.CSSProperties = {
    borderColor: 'rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.10)',
    color: 'rgba(255,255,255,0.85)',
  };

  const completion = calcCompletion(core, windows, prefetchedWOCategories);
  const missingItems = getMissingItems(core, windows, prefetchedWOCategories);

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background layers — driven by CSS dark class to avoid flash */}
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      {/* View-specific glow overlay — React-state driven (subtle, no flash concern) */}
      {dark && glowGradient && (
        <div className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-500" style={{ backgroundImage: glowGradient.replace(/,$/, ''), backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      )}

      {/* Header */}
      <div className="relative z-10 flex h-16 items-center gap-3 border-b px-4" style={{ borderColor: 'rgba(255,255,255,0.12)', background: dark ? 'rgba(10,10,10,0.60)' : 'rgba(255,255,255,0.10)', backdropFilter: 'blur(16px)' }}>
        <button
          type="button" onClick={goBack}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-white/20 bg-white/12 text-white/75 transition-all hover:bg-white/20 hover:text-white"
          aria-label={view === 'grid' ? 'Back to dashboard' : 'Back to menu'}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          {view !== 'grid' ? (
            <h1 className="truncate text-sm font-semibold text-white/80">{VIEW_TITLES[view]}</h1>
          ) : (
            <h1 className="truncate text-sm font-semibold text-white/80">{core.PropertyName || 'Property'}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button" onClick={toggleMode}
            className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
            style={toggleStyle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {view === 'grid' ? (
            <a
              href={`/p/${encodeURIComponent(slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.90)' }}
            >
              View live
            </a>
          ) : null}
        </div>
      </div>

      {/* Content with fade */}
      <div className="relative" style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateY(12px) scale(0.99)' : 'translateY(0) scale(1)', transition: 'opacity 0.24s ease-out, transform 0.24s ease-out' }}>
        {view === 'grid' && <GridView onNavigate={goTo} completion={completion} dark={dark} missing={missingItems} />}
        {view === 'property-info' && (
          <PropertyInfoView
            slug={slug} core={core} setCore={setCore}
            heroUrl={heroUrl} setHeroUrl={setHeroUrl}
            logoUrl={logoUrl} setLogoUrl={setLogoUrl}
            logoUrlDark={logoUrlDark} setLogoUrlDark={setLogoUrlDark}
            saving={saving} saved={saved} onSave={handleSave} saveError={saveError}
            dark={dark}
          />
        )}
        {view === 'amenities' && (
          <AmenitiesView
            slug={slug} windows={windows} setWindows={setWindows}
            saving={saving} saved={saved} onSave={handleSave} saveError={saveError}
            dark={dark} initialRooms={property.rooms ?? []}
          />
        )}
        {view === 'qr' && <QRView slug={slug} dark={dark} />}
        {view === 'settings' && <SettingsView slug={slug} initialBgKey={property.BackgroundKey} dark={dark} />}
        {view === 'work-orders' && <WorkOrdersView slug={slug} dark={dark} initialCategories={prefetchedWOCategories} onCategoriesChange={setPrefetchedWOCategories} />}
        {view === 'help' && <HelpView dark={dark} slug={slug} propertyName={core.PropertyName} />}
      </div>

      {/* Bottom navigation bar */}
      <BottomBar view={view} onNavigate={goTo} dark={dark} />
    </div>
  );
}
