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
  HouseRules: string;
  WiFiName: string;
  WiFiPassword: string;
  GarageCode: string;
  ManagerPhone: string;
  LogoSize: number;
}

type View = 'grid' | 'property-info' | 'amenities' | 'qr' | 'settings';

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
  const clean = windows.map(({ id, title, type, icon, body, url }) => ({ id, title, type, icon, body, url }));
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
    body: JSON.stringify({ id: win.id, title: win.title, type: win.type, icon: win.icon, body: win.body, displayOrder }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Create window failed (HTTP ${res.status})`);
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
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: `rgba(${SANDY_RGB},0.70)` }}>
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
      className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
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
      className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
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
    borderStyle: { borderColor: 'rgba(147,197,253,0.50)', background: 'rgba(96,165,250,0.11)' },
    shadow: '0 0 0 1px rgba(96,165,250,0.20), 0 0 40px rgba(96,165,250,0.16), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(96,165,250,0.38), 0 0 65px rgba(96,165,250,0.28), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: '',
    iconBg: '',
    iconStyle: { background: 'rgba(96,165,250,0.14)', border: '1px solid rgba(147,197,253,0.32)', color: 'rgb(147,197,253)' },
    text: '',
    textStyle: { color: 'rgb(147,197,253)' },
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
    border: 'border-red-400/55',
    shadow: '0 0 0 1px rgba(248,113,113,0.20), 0 0 40px rgba(239,68,68,0.18), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(248,113,113,0.38), 0 0 65px rgba(239,68,68,0.30), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-red-500/6',
    iconBg: 'bg-red-500/14 border-red-400/35 text-red-300',
    text: 'text-red-200',
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
    label: 'Settings',
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
];

function GridView({ onNavigate, propertyName, dark }: { onNavigate: (v: View) => void; propertyName: string; dark: boolean }) {
  return (
    <div className="flex flex-col px-4 pb-4 pt-3" style={{ height: 'calc(100dvh - 64px)' }}>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {TILES.map((tile) => {
          const isPropertyInfo = tile.id === 'property-info';
          const lightBlueOverride = isPropertyInfo && !dark;

          const shadow = lightBlueOverride
            ? '0 0 0 1px rgba(96,165,250,0.38), 0 0 40px rgba(59,130,246,0.22), inset 0 1px 0 rgba(255,255,255,0.07)'
            : tile.shadow;
          const shadowHover = lightBlueOverride
            ? '0 0 0 1px rgba(96,165,250,0.55), 0 0 60px rgba(59,130,246,0.38), inset 0 1px 0 rgba(255,255,255,0.10)'
            : tile.shadowHover;
          const borderStyle = lightBlueOverride
            ? { borderColor: 'rgba(96,165,250,0.35)', background: 'rgba(59,130,246,0.04)' }
            : tile.borderStyle;
          const iconStyle = lightBlueOverride
            ? { background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)', color: 'rgb(59,130,246)' }
            : tile.iconStyle;
          const textStyle = lightBlueOverride
            ? { color: 'rgb(59,130,246)' }
            : tile.textStyle;

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onNavigate(tile.id)}
              className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border backdrop-blur-sm transition-all duration-300 active:scale-[0.97] ${tile.border} ${tile.bg}`}
              style={{ boxShadow: shadow, ...borderStyle }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = shadowHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = shadow; }}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${tile.iconBg}`}
                style={iconStyle}
              >
                {tile.icon}
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${tile.text}`} style={textStyle}>{tile.label}</p>
                <p className="mt-0.5 text-xs text-white/75">{tile.sub}</p>
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
  slug, core, setCore, logoUrl, setLogoUrl, saving, saved, onSave, saveError, dark,
}: {
  slug: string;
  core: CoreFields;
  setCore: React.Dispatch<React.SetStateAction<CoreFields>>;
  logoUrl: string | undefined;
  setLogoUrl: (url: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  saveError: string | null;
  dark: boolean;
}) {
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  const cardStyle: React.CSSProperties = dark
    ? { background: 'rgba(18,18,18,0.80)', border: `1px solid rgba(${SANDY_RGB},0.12)`, backdropFilter: 'blur(20px)' }
    : { background: 'rgba(255,255,255,0.14)', border: `1px solid rgba(${SANDY_RGB},0.20)`, backdropFilter: 'blur(16px)' };
  const headerBorder = { borderBottom: `1px solid rgba(${SANDY_RGB},0.10)` };
  const sectionLabel = { color: `rgba(${SANDY_RGB},0.70)` };

  function setField<K extends keyof CoreFields>(key: K, val: string) {
    setCore((prev) => ({ ...prev, [key]: val }));
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

  return (
    <div className="relative pb-32">
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
            <FieldGroup label="House Bio">
              <TextArea value={core.DetailedHouseBio} onChange={(v) => setField('DetailedHouseBio', v)} placeholder="Describe the property for guests…" rows={4} />
            </FieldGroup>
            <FieldGroup label="House Rules">
              <TextArea value={core.HouseRules} onChange={(v) => setField('HouseRules', v)} placeholder="No smoking, check out by 11am…" rows={3} />
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
            <FieldGroup label="Property Logo">
              <div className="space-y-3">
                {logoUrl ? (
                  <div className="flex items-center justify-center rounded-xl border border-white/8 bg-black/20 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo preview" className="object-contain" style={{ width: `${core.LogoSize}px`, maxHeight: '120px' }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/10 py-5 text-sm text-white/25">
                    No logo uploaded
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" ref={logoFileRef} accept="image/*" className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleLogoUpload(f); }}
                  />
                  <button type="button" disabled={logoUploading} onClick={() => logoFileRef.current?.click()}
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 text-xs font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/80 disabled:opacity-45"
                  >
                    <UploadIcon />
                    {logoUploading ? 'Uploading…' : logoUrl ? 'Replace logo' : 'Upload logo'}
                  </button>
                  {logoUploadError ? <span className="text-xs text-rose-400/75">{logoUploadError}</span> : null}
                </div>
              </div>
            </FieldGroup>
            <FieldGroup label={`Logo Size — ${core.LogoSize}px`}>
              <input type="range" min={40} max={200} step={4} value={core.LogoSize}
                onChange={(e) => setCore((prev) => ({ ...prev, LogoSize: Number(e.target.value) }))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10"
                style={{ accentColor: SANDY }}
              />
              <div className="flex justify-between text-[10px] text-white/22">
                <span>Small (40px)</span><span>Large (200px)</span>
              </div>
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6">
        <button type="button" disabled={saving} onClick={onSave}
          className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-[#3d2a0a] transition-all duration-300 disabled:opacity-50"
          style={{ background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, boxShadow: `0 0 20px rgba(${SANDY_RGB},0.22)` }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ─── Amenities view ──────────────────────────────────── */

function AmenitiesView({
  slug, windows, setWindows, saving, saved, onSave, saveError, dark,
}: {
  slug: string;
  windows: WindowDraft[];
  setWindows: React.Dispatch<React.SetStateAction<WindowDraft[]>>;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  saveError: string | null;
  dark: boolean;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AmenityWindow['type']>('text');
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON_KEY);
  const [newBody, setNewBody] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const windowCard: React.CSSProperties = dark
    ? { background: 'rgba(14,14,14,0.75)', border: `1px solid rgba(${SANDY_RGB},0.10)` }
    : { background: 'rgba(255,255,255,0.12)', border: `1px solid rgba(${SANDY_RGB},0.16)` };

  function setWindowBody(id: string, body: string) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, body } : w)));
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
    const win: WindowDraft = { id, title, type: newType, icon: newIcon || DEFAULT_ICON_KEY, body: newType === 'text' && newBody.trim() ? newBody.trim() : undefined };
    setAddSaving(true);
    try {
      await createWindowInDb(slug, win, windows.length);
      setWindows((prev) => [...prev, win]);
      setAddOpen(false);
      setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody('');
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
    <div className="relative pb-32">
      <div className="mx-auto max-w-2xl space-y-3 px-4 pt-4">

        {saveError ? (
          <div className="rounded-xl border border-rose-500/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300/80">
            {saveError}
          </div>
        ) : null}

        {windows.length === 0 ? (
          <p className="py-6 text-center text-sm text-white/30">
            No windows yet — add text, images, videos, or PDFs that guests see inside the amenities screen.
          </p>
        ) : (
          windows.map((w, idx) => (
            <div key={w.id} className="overflow-hidden rounded-xl" style={windowCard}>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button type="button" onClick={() => setIconPickerFor(w.id)} title="Change icon"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border transition-all"
                    style={{ borderColor: `rgba(${SANDY_RGB},0.22)`, background: `rgba(${SANDY_RGB},0.08)`, color: SANDY }}
                  >
                    <AmenityIconSvg iconKey={w.icon ?? DEFAULT_ICON_KEY} className="h-4 w-4" />
                  </button>
                  <TypeBadge type={w.type} />
                  <span className="truncate text-sm font-medium text-white/85">{w.title}</span>
                </div>
                <div className="flex flex-none items-center gap-1">
                  <button type="button" disabled={idx === 0} onClick={() => moveWindow(w.id, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/6 bg-white/3 text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
                  ><ChevronUpIcon /></button>
                  <button type="button" disabled={idx === windows.length - 1} onClick={() => moveWindow(w.id, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/6 bg-white/3 text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
                  ><ChevronDownIcon /></button>
                  <button type="button" disabled={deletingId === w.id} onClick={() => handleRemoveWindow(w.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/18 bg-rose-500/6 text-rose-400/55 transition-all hover:bg-rose-500/14 hover:text-rose-300/85 disabled:opacity-40"
                  >
                    {deletingId === w.id
                      ? <span className="h-3 w-3 animate-spin rounded-full border border-rose-400/40 border-t-rose-400" />
                      : <TrashIcon />}
                  </button>
                </div>
              </div>
              <div className="border-t border-white/5 px-4 py-3">
                {w.type === 'text' ? (
                  <TextArea value={w.body ?? ''} onChange={(v) => setWindowBody(w.id, v)} placeholder="Enter content for guests…" rows={3} />
                ) : (
                  <div className="space-y-2.5">
                    {w.url ? (
                      <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: `rgba(${SANDY_RGB},0.15)`, background: `rgba(${SANDY_RGB},0.06)` }}>
                        <span className="flex-none text-[10px] font-semibold uppercase tracking-wide" style={{ color: `rgba(${SANDY_RGB},0.65)` }}>Uploaded</span>
                        <span className="min-w-0 truncate text-xs text-white/40">{w.url}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-white/30">No file uploaded yet.</p>
                    )}
                    <div className="flex items-center gap-3">
                      <input type="file" ref={(el) => { fileRefs.current[w.id] = el; }}
                        accept={w.type === 'image' ? 'image/*' : w.type === 'video' ? 'video/*' : w.type === 'pdf' ? 'application/pdf' : undefined}
                        className="hidden"
                        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleUpload(w.id, f); }}
                      />
                      <button type="button" disabled={w._uploading} onClick={() => fileRefs.current[w.id]?.click()}
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 text-xs font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/80 disabled:opacity-45"
                      >
                        <UploadIcon />
                        {w._uploading ? 'Uploading…' : w.url ? 'Replace file' : 'Upload file'}
                      </button>
                      {w._uploadError ? <span className="text-xs text-rose-400/75">{w._uploadError}</span> : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <button type="button" onClick={() => setAddOpen(true)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3.5 text-sm font-semibold transition-all duration-200"
          style={{ borderColor: `rgba(${SANDY_RGB},0.22)`, background: `rgba(${SANDY_RGB},0.04)`, color: `rgba(${SANDY_RGB},0.60)` }}
        >
          <PlusIcon /> Add Window
        </button>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6">
        <button type="button" disabled={saving} onClick={onSave}
          className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-[#3d2a0a] transition-all duration-300 disabled:opacity-50"
          style={{ background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, boxShadow: `0 0 20px rgba(${SANDY_RGB},0.22)` }}
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

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
          <button type="button" onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-label="Close"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-[#141414] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.22), transparent)` }} />
            <h3 className="text-base font-semibold text-white">Add a Window</h3>
            <p className="mt-1 text-sm text-white/40">Creates a new amenity section guests can open.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <button type="button" onClick={() => setIconPickerFor('new')}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-left transition-all w-full"
                  style={undefined}
                >
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border transition-all"
                    style={{ borderColor: `rgba(${SANDY_RGB},0.25)`, background: `rgba(${SANDY_RGB},0.10)`, color: SANDY }}
                  >
                    <AmenityIconSvg iconKey={newIcon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white/75">{AMENITY_ICONS_MAP[newIcon]?.name ?? 'Home'}</p>
                    <p className="text-xs text-white/30">Tap to change icon</p>
                  </div>
                </button>
              </div>
              <FieldGroup label="Title">
                <TextInput value={newTitle} onChange={setNewTitle} placeholder="e.g. Pool Access, Parking, Check-out Info…" />
              </FieldGroup>
              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['text', 'image', 'video', 'pdf'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setNewType(t)}
                      className="rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200"
                      style={newType === t
                        ? { borderColor: `rgba(${SANDY_RGB},0.40)`, background: `rgba(${SANDY_RGB},0.12)`, color: SANDY }
                        : { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.40)' }
                      }
                    >{t}</button>
                  ))}
                </div>
              </div>
              {newType === 'text' ? (
                <FieldGroup label="Content (optional)">
                  <TextArea value={newBody} onChange={setNewBody} placeholder="Enter text content for guests…" rows={3} />
                </FieldGroup>
              ) : (
                <p className="text-xs text-white/30">You can upload the {newType} file after adding the window.</p>
              )}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button"
                onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/4 px-4 text-sm font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/75"
              >Cancel</button>
              <button type="button" disabled={!newTitle.trim() || addSaving} onClick={handleAddWindow}
                className="inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-[#3d2a0a] transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, boxShadow: `0 0 16px rgba(${SANDY_RGB},0.18)` }}
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
          <p className="mt-3 max-w-65 text-center text-sm leading-relaxed text-white/45">
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

const BG_KEYS = ['background', 'bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6'] as const;
type BgKey = typeof BG_KEYS[number];

const BG_PALETTES: Record<BgKey, { label: string; accent: string; heading: string; text: string }> = {
  background: { label: 'Classic Dark',   accent: '#2dd4bf', heading: '#f0fffe', text: '#6ba8a4' },
  bg1:        { label: 'Ember',          accent: '#fb923c', heading: '#fff8f2', text: '#ffd4b0' },
  bg2:        { label: 'Lavender Dream', accent: '#7c3aed', heading: '#f5f0ff', text: '#c4b5fd' },
  bg3:        { label: 'Midnight',       accent: '#60a5fa', heading: '#f8fafc', text: '#94a3b8' },
  bg4:        { label: 'Forest',         accent: '#4ade80', heading: '#f0fff4', text: '#6bbf8a' },
  bg5:        { label: 'Crimson',        accent: '#f87171', heading: '#fff1f2', text: '#c86060' },
  bg6:        { label: 'Sandstone',      accent: '#b8864e', heading: '#fffaf5', text: '#d4b896' },
};

function SubBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className="mb-6 flex items-center gap-1.5 self-start text-sm font-semibold text-white/45 transition hover:text-white/75"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

function SettingsView({ slug, initialBgKey, dark }: { slug: string; initialBgKey?: string; dark: boolean }) {
  const [sub, setSub] = useState<'grid' | 'backgrounds'>('grid');
  const [bgIndex, setBgIndex] = useState<number>(() => {
    const i = BG_KEYS.indexOf((initialBgKey ?? '') as BgKey);
    return i >= 0 ? i : 0;
  });
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const currentBg = BG_KEYS[bgIndex];
  const palette = BG_PALETTES[currentBg];

  async function handleApplyTheme() {
    setThemeSaving(true); setThemeSaved(false); setThemeError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fields: {
          BackgroundKey: currentBg === 'background' ? '' : currentBg,
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

  if (sub === 'backgrounds') {
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-32">
        <SubBackButton onClick={() => setSub('grid')} />
        <h2 className="mb-6 text-base font-semibold text-white/80">Choose a Theme</h2>

        <div className="flex w-full max-w-sm items-center gap-3">
          <button type="button" onClick={() => setBgIndex((i) => (i - 1 + BG_KEYS.length) % BG_KEYS.length)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/12 hover:text-white/90"
            aria-label="Previous theme"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <img key={currentBg} src={`/images/${currentBg}.png`} alt={palette.label} className="h-56 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 rounded-xl p-3" style={{ background: 'rgba(5,12,22,0.80)', backdropFilter: 'blur(12px)' }}>
              <p className="text-sm font-light leading-tight" style={{ color: palette.heading }}>Your Property</p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: palette.text }}>WiFi, house rules & amenities.</p>
              <div
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                style={{ borderColor: `${palette.accent}40`, color: palette.accent, background: `linear-gradient(135deg, ${palette.accent}4d, ${palette.accent}2e)` }}
              >
                Amenities
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => setBgIndex((i) => (i + 1) % BG_KEYS.length)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/12 hover:text-white/90"
            aria-label="Next theme"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex w-full max-w-sm flex-col items-center gap-4">
          <p className="text-sm font-semibold text-white/70">{palette.label}</p>
          <div className="flex items-center gap-8">
            {(['accent', 'heading', 'text'] as const).map((k, i) => (
              <div key={k} className="flex flex-col items-center gap-1.5">
                <div className="h-9 w-9 rounded-full border-2 border-white/20 shadow-lg" style={{ backgroundColor: palette[k] }} />
                <p className="text-[10px] text-white/40">{['Accent', 'Titles', 'Text'][i]}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {BG_KEYS.map((_, idx) => (
              <button key={idx} type="button" onClick={() => setBgIndex(idx)} aria-label={`Theme ${idx + 1}`}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{ width: idx === bgIndex ? '20px' : '6px', backgroundColor: idx === bgIndex ? palette.accent : 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
        </div>

        {themeError ? <p className="mt-3 text-xs text-red-400">{themeError}</p> : null}
        <button type="button" onClick={() => void handleApplyTheme()} disabled={themeSaving}
          className="mt-5 h-12 w-full max-w-sm rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={themeSaved
            ? { background: 'rgba(52,211,153,0.15)', color: 'rgb(52,211,153)' }
            : { borderColor: `rgba(${SANDY_RGB},0.30)`, border: `1px solid rgba(${SANDY_RGB},0.30)`, background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, boxShadow: `0 0 20px rgba(${SANDY_RGB},0.10)` }
          }
        >
          {themeSaving ? 'Applying…' : themeSaved ? 'Theme Applied ✓' : `Apply ${palette.label} Theme`}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-32">
      <button
        type="button" onClick={() => setSub('backgrounds')}
        className="flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200"
        style={{
          borderColor: `rgba(${SANDY_RGB},0.25)`,
          background: `rgba(${SANDY_RGB},0.06)`,
          boxShadow: `0 0 0 1px rgba(${SANDY_RGB},0.10), 0 0 28px rgba(${SANDY_RGB},0.06)`,
        }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
          style={{ borderColor: `rgba(${SANDY_RGB},0.28)`, background: `rgba(${SANDY_RGB},0.10)`, color: SANDY }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M2 8h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="8" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: SANDY }}>Themes & Colors</p>
          <p className="mt-0.5 text-xs text-white/35">Background + complementary palette</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {(['accent', 'heading', 'text'] as const).map((k) => (
            <div key={k} className="h-4 w-4 rounded-full border border-white/15" style={{ backgroundColor: BG_PALETTES[BG_KEYS[bgIndex]][k] }} />
          ))}
        </div>
      </button>

      <div className="mt-6">
        <div className="h-px bg-white/5" />
        <div className="mt-5">
          <p className="mb-2 text-xs text-white/28">Reset all visual customizations back to the original defaults.</p>
          <button type="button" onClick={() => void handleResetAll()} disabled={resetSaving}
            className={`h-10 w-full rounded-xl border text-sm font-semibold transition-all duration-200 ${
              resetDone
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-400'
                : 'border-white/8 bg-white/3 text-white/35 hover:border-white/15 hover:bg-white/6 hover:text-white/55'
            } disabled:opacity-40`}
          >
            {resetSaving ? 'Resetting…' : resetDone ? 'Reset ✓' : 'Reset to Defaults'}
          </button>
        </div>
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
  const [dark, setDark] = useState(true);

  const [core, setCore] = useState<CoreFields>({
    PropertyName: property.PropertyName ?? '',
    PropertyAddress: property.PropertyAddress === 'Not provided' ? '' : (property.PropertyAddress ?? ''),
    PropertyZipCode: property.PropertyZipCode === 'Not provided' ? '' : (property.PropertyZipCode ?? ''),
    DetailedHouseBio: property.DetailedHouseBio === 'Not provided' ? '' : (property.DetailedHouseBio ?? ''),
    HouseRules: property.HouseRules ?? '',
    WiFiName: property.WiFiName ?? '',
    WiFiPassword: property.WiFiPassword ?? '',
    GarageCode: property.GarageCode ?? '',
    ManagerPhone: property.ManagerPhone ?? '',
    LogoSize: property.LogoSize ?? 100,
  });

  const [logoUrl, setLogoUrl] = useState<string | undefined>(property.LogoUrl);
  const [windows, setWindows] = useState<WindowDraft[]>(property.windows ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pillar-dashboard-theme');
    if (stored) setDark(stored === 'dark');
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('pillar-dashboard-theme', next ? 'dark' : 'light');
  }

  function goTo(next: View) {
    setFading(true);
    setTimeout(() => { setView(next); setFading(false); }, 160);
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
    settings: 'Settings',
  };

  const glowGradient = dark ? (
    view === 'property-info' ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(96,165,250,0.50) 0%, transparent 65%),'
    : view === 'amenities'    ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(248,113,113,0.40) 0%, transparent 65%),'
    : view === 'settings'     ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(74,222,128,0.35) 0%, transparent 65%),'
    : view === 'qr'           ? 'radial-gradient(ellipse 90% 55% at 50% 20%, rgba(251,191,36,0.40) 0%, transparent 65%),'
    : ''
  ) : '';

  const bgStyle: React.CSSProperties = dark
    ? { backgroundImage: `${glowGradient}url(/images/bg3.png)`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }
    : { backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' };

  const toggleStyle: React.CSSProperties = {
    borderColor: `rgba(${SANDY_RGB},0.25)`,
    background: `rgba(${SANDY_RGB},0.08)`,
    color: SANDY,
  };

  return (
    <div className="min-h-screen text-white transition-all duration-500" style={bgStyle}>

      {/* Header */}
      <div className="relative z-10 flex h-16 items-center gap-3 border-b px-4" style={{ borderColor: `rgba(${SANDY_RGB},0.10)`, background: dark ? 'rgba(10,10,10,0.60)' : 'rgba(255,255,255,0.10)', backdropFilter: 'blur(16px)' }}>
        <button
          type="button" onClick={goBack}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/55 transition-all hover:bg-white/8 hover:text-white/80"
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
              style={{ borderColor: `rgba(${SANDY_RGB},0.30)`, background: `rgba(${SANDY_RGB},0.08)`, color: SANDY }}
            >
              View live ↗
            </a>
          ) : null}
        </div>
      </div>

      {/* Content with fade */}
      <div className="relative" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.16s ease' }}>
        {view === 'grid' && <GridView onNavigate={goTo} propertyName={core.PropertyName} dark={dark} />}
        {view === 'property-info' && (
          <PropertyInfoView
            slug={slug} core={core} setCore={setCore}
            logoUrl={logoUrl} setLogoUrl={setLogoUrl}
            saving={saving} saved={saved} onSave={handleSave} saveError={saveError}
            dark={dark}
          />
        )}
        {view === 'amenities' && (
          <AmenitiesView
            slug={slug} windows={windows} setWindows={setWindows}
            saving={saving} saved={saved} onSave={handleSave} saveError={saveError}
            dark={dark}
          />
        )}
        {view === 'qr' && <QRView slug={slug} dark={dark} />}
        {view === 'settings' && <SettingsView slug={slug} initialBgKey={property.BackgroundKey} dark={dark} />}
      </div>
    </div>
  );
}
