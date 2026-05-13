'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Property, AmenityWindow } from '@/lib/types';
import { generateWindowId } from '@/lib/types';
import { AMENITY_ICONS_MAP, DEFAULT_ICON_KEY, searchIcons } from '@/lib/amenityIcons';

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
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#080f18]/98 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl" style={{ maxHeight: '80vh' }}>
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/28 to-transparent" />
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
              className="h-10 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
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
                    className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all duration-150 ${
                      isSelected
                        ? 'border-teal-500/50 bg-teal-500/15 text-teal-300'
                        : 'border-white/6 bg-white/2 text-white/45 hover:border-teal-500/25 hover:bg-teal-500/8 hover:text-teal-300/80'
                    }`}
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
  return <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white placeholder:text-white/22 outline-none transition-all duration-200 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
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
      className="w-full resize-y rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 py-3 text-sm text-white placeholder:text-white/22 outline-none transition-all duration-200 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
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
  text: 'border-teal-500/20 bg-teal-500/10 text-teal-300/80',
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

const TILES = [
  {
    id: 'qr' as View,
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
    id: 'property-info' as View,
    label: 'Property Info',
    sub: 'Name, rules & bio',
    border: 'border-teal-400/55',
    shadow: '0 0 0 1px rgba(45,212,191,0.18), 0 0 40px rgba(20,184,166,0.20), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(45,212,191,0.35), 0 0 60px rgba(20,184,166,0.36), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-teal-500/6',
    iconBg: 'bg-teal-500/15 border-teal-400/35 text-teal-300',
    text: 'text-teal-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'amenities' as View,
    label: 'Amenities',
    sub: 'Windows & content',
    border: 'border-purple-400/55',
    shadow: '0 0 0 1px rgba(192,132,252,0.18), 0 0 40px rgba(168,85,247,0.20), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(192,132,252,0.35), 0 0 60px rgba(168,85,247,0.36), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-purple-500/6',
    iconBg: 'bg-purple-500/15 border-purple-400/35 text-purple-300',
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
    id: 'settings' as View,
    label: 'Settings',
    sub: 'Coming soon',
    border: 'border-blue-400/55',
    shadow: '0 0 0 1px rgba(96,165,250,0.18), 0 0 40px rgba(59,130,246,0.20), inset 0 1px 0 rgba(255,255,255,0.07)',
    shadowHover: '0 0 0 1px rgba(96,165,250,0.35), 0 0 60px rgba(59,130,246,0.36), inset 0 1px 0 rgba(255,255,255,0.10)',
    bg: 'bg-blue-500/6',
    iconBg: 'bg-blue-500/15 border-blue-400/35 text-blue-300',
    text: 'text-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

function GridView({ onNavigate, propertyName }: { onNavigate: (v: View) => void; propertyName: string }) {
  return (
    <div className="flex flex-col px-4 pb-4 pt-3" style={{ height: 'calc(100dvh - 64px)' }}>
      <p className="mb-3 truncate text-center text-xs font-semibold uppercase tracking-[0.24em] text-white/30">
        {propertyName || 'Property'}
      </p>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {TILES.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => onNavigate(tile.id)}
            className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border ${tile.border} ${tile.bg} backdrop-blur-sm transition-all duration-300 active:scale-[0.97]`}
            style={{ boxShadow: `${tile.shadow}` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = tile.shadowHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = tile.shadow; }}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${tile.iconBg} transition-transform duration-300 group-hover:scale-105`}>
              {tile.icon}
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${tile.text}`}>{tile.label}</p>
              <p className="mt-0.5 text-xs text-white/28">{tile.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Property Info view ──────────────────────────────── */

function PropertyInfoView({
  slug, core, setCore, logoUrl, setLogoUrl, saving, saved, onSave, saveError,
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
}) {
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

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
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="border-b border-white/[0.05] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">Identity</p>
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
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="border-b border-white/[0.05] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">Guest Content</p>
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
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="border-b border-white/[0.05] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">WiFi & Access</p>
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
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="border-b border-white/[0.05] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">Branding</p>
          </div>
          <div className="space-y-5 p-5">
            <FieldGroup label="Property Logo">
              <div className="space-y-3">
                {logoUrl ? (
                  <div className="flex items-center justify-center rounded-xl border border-white/8 bg-[#0a1520]/60 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo preview" className="object-contain" style={{ width: `${core.LogoSize}px`, maxHeight: '120px' }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0a1520]/40 py-5 text-sm text-white/25">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-teal-400"
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
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-linear-to-r from-teal-500 to-cyan-400 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.4)] disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ─── Amenities view ──────────────────────────────────── */

function AmenitiesView({
  slug, windows, setWindows, saving, saved, onSave, saveError,
}: {
  slug: string;
  windows: WindowDraft[];
  setWindows: React.Dispatch<React.SetStateAction<WindowDraft[]>>;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  saveError: string | null;
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
            <div key={w.id} className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#080f18]/70">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button type="button" onClick={() => setIconPickerFor(w.id)} title="Change icon"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/8 text-teal-300/70 transition-all hover:border-teal-500/40 hover:bg-teal-500/14"
                  >
                    <AmenityIconSvg iconKey={w.icon ?? DEFAULT_ICON_KEY} className="h-4 w-4" />
                  </button>
                  <TypeBadge type={w.type} />
                  <span className="truncate text-sm font-medium text-white/85">{w.title}</span>
                </div>
                <div className="flex flex-none items-center gap-1">
                  <button type="button" disabled={idx === 0} onClick={() => moveWindow(w.id, -1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
                  ><ChevronUpIcon /></button>
                  <button type="button" disabled={idx === windows.length - 1} onClick={() => moveWindow(w.id, 1)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
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
              <div className="border-t border-white/[0.05] px-4 py-3">
                {w.type === 'text' ? (
                  <TextArea value={w.body ?? ''} onChange={(v) => setWindowBody(w.id, v)} placeholder="Enter content for guests…" rows={3} />
                ) : (
                  <div className="space-y-2.5">
                    {w.url ? (
                      <div className="flex items-center gap-2 rounded-lg border border-teal-500/15 bg-teal-500/6 px-3 py-2">
                        <span className="flex-none text-[10px] font-semibold uppercase tracking-wide text-teal-400/65">Uploaded</span>
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
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal-500/20 bg-teal-500/4 py-3.5 text-sm font-semibold text-teal-300/55 transition-all duration-200 hover:border-teal-400/35 hover:bg-teal-500/8 hover:text-teal-300/80"
        >
          <PlusIcon /> Add Window
        </button>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6">
        <button type="button" disabled={saving} onClick={onSave}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-linear-to-r from-teal-500 to-cyan-400 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.4)] disabled:opacity-50"
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
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-[#080f18]/97 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/28 to-transparent" />
            <h3 className="text-base font-semibold text-white">Add a Window</h3>
            <p className="mt-1 text-sm text-white/40">Creates a new amenity section guests can open.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <button type="button" onClick={() => setIconPickerFor('new')}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-3 py-2.5 text-left transition-all hover:border-teal-500/30 hover:bg-[#0f1e2d]"
                >
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-teal-500/25 bg-teal-500/10 text-teal-300/80">
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
                      className={`rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                        newType === t
                          ? 'border-teal-500/40 bg-teal-500/15 text-teal-300'
                          : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:bg-white/[0.07] hover:text-white/65'
                      }`}
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
                className="inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 px-5 text-sm font-semibold text-[#070e17] shadow-[0_0_16px_rgba(20,184,166,0.2)] transition-all hover:shadow-[0_0_28px_rgba(20,184,166,0.38)] disabled:opacity-50"
              >{addSaving ? 'Creating…' : 'Add Window'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── QR view ─────────────────────────────────────────── */

function QRView({ slug: initialSlug }: { slug: string }) {
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
          <div className="h-[220px] w-[220px] animate-pulse rounded-xl bg-black/5" />
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
        {/* Regenerate — left */}
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

        {/* Print view — right */}
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

      {/* Regenerate confirmation modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0f1a24] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
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
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleRegenerate(); }}
                  placeholder="Generate"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/25"
                />
              </div>
              {regenError ? <p className="mt-3 text-xs text-red-400">{regenError}</p> : null}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRegenerate()}
                  disabled={!confirmed || isGenerating}
                  className="h-10 flex-1 rounded-xl bg-amber-400 text-sm font-bold text-[#0a1015] transition hover:bg-amber-500 disabled:opacity-40"
                >
                  {isGenerating ? 'Generating…' : 'Generate New QR Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

function SettingsView() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/8 text-blue-400/60">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="mt-5 text-base font-semibold text-white/70">Settings</h2>
      <p className="mt-2 text-sm text-white/35">More options coming soon.</p>
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
    setSaving(true);
    setSaveError(null);
    setSaved(false);
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

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #070e17 0%, #0a1720 50%, #060d14 100%)' }}
    >
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(ellipse 90% 40% at 50% -5%, rgba(20,184,166,0.06) 0%, transparent 68%)' }} />

      {/* Header */}
      <div className="relative z-10 flex h-16 items-center gap-3 border-b border-white/[0.05] px-4">
        <button
          type="button"
          onClick={goBack}
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
            <span className="truncate text-xs text-white/30 font-mono">/p/{slug}</span>
          )}
        </div>

        {view === 'grid' ? (
          <a
            href={`/p/${encodeURIComponent(slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-teal-500/22 bg-teal-500/8 px-3 text-xs font-semibold text-teal-300/75 transition-all hover:bg-teal-500/14 hover:text-teal-300"
          >
            View live ↗
          </a>
        ) : null}
      </div>

      {/* Content with fade */}
      <div
        className="relative"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.16s ease' }}
      >
        {view === 'grid' && (
          <GridView onNavigate={goTo} propertyName={core.PropertyName} />
        )}
        {view === 'property-info' && (
          <PropertyInfoView
            slug={slug}
            core={core}
            setCore={setCore}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            saving={saving}
            saved={saved}
            onSave={handleSave}
            saveError={saveError}
          />
        )}
        {view === 'amenities' && (
          <AmenitiesView
            slug={slug}
            windows={windows}
            setWindows={setWindows}
            saving={saving}
            saved={saved}
            onSave={handleSave}
            saveError={saveError}
          />
        )}
        {view === 'qr' && <QRView slug={slug} />}
        {view === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}
