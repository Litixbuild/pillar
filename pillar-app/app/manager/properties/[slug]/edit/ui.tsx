'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { Property, AmenityWindow } from '@/lib/types';
import { generateWindowId } from '@/lib/types';
import { AMENITY_ICONS, AMENITY_ICONS_MAP, DEFAULT_ICON_KEY, searchIcons } from '@/lib/amenityIcons';

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

/* ─── API helpers ─────────────────────────────────────────────── */

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

async function createWindowInDb(slug: string, window: AmenityWindow, displayOrder: number) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: window.id, title: window.title, type: window.type, icon: window.icon, body: window.body, displayOrder }),
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

async function uploadWindowFile(slug: string, windowId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('field', `window/${windowId}`);
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/upload`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new Error(data?.error ?? 'Upload failed');
  return data.url;
}

async function uploadLogoFile(slug: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('field', 'logo');
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/upload`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new Error(data?.error ?? 'Upload failed');
  return data.url;
}

/* ─── Icons ───────────────────────────────────────────────────── */

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

/* ─── Icon rendering ──────────────────────────────────────────── */

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

function IconPickerModal({
  current,
  onSelect,
  onClose,
}: {
  current: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const results = searchIcons(query);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center px-4 pb-6 sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        aria-label="Close icon picker"
      />
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#080f18]/98 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl" style={{ maxHeight: '80vh' }}>
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/28 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Pick an Icon</h3>
          <button type="button" onClick={onClose} className="text-white/35 transition-colors hover:text-white/65">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/5">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons… (pool, tv, coffee, gym…)"
              className="h-10 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-white/25">{results.length} icon{results.length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/30">No icons match &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {results.map((icon) => {
                const isSelected = icon.key === current;
                return (
                  <button
                    key={icon.key}
                    type="button"
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

/* ─── Shared UI primitives ────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">{children}</p>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1e2d]/80 shadow-[0_4px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
      <div className="border-b border-white/[0.05] px-6 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-400/60">{title}</p>
      </div>
      <div className="p-6">{children}</div>
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

/* ─── Main component ──────────────────────────────────────────── */

export default function ManagerPropertyEditorClient({
  slug,
  property,
}: {
  slug: string;
  property: Property;
  rawFields?: Record<string, unknown>;
  initialLayout?: { field: string }[];
}) {
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
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  const [windows, setWindows] = useState<WindowDraft[]>(property.windows ?? []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AmenityWindow['type']>('text');
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON_KEY);
  const [newBody, setNewBody] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null); // window id, or 'new' for the add modal

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function setField<K extends keyof CoreFields>(key: K, val: string) {
    setCore((prev) => ({ ...prev, [key]: val }));
  }

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

  async function handleAddWindow() {
    const title = newTitle.trim();
    if (!title) return;

    const id = generateWindowId();
    const win: WindowDraft = {
      id,
      title,
      type: newType,
      icon: newIcon || DEFAULT_ICON_KEY,
      body: newType === 'text' && newBody.trim() ? newBody.trim() : undefined,
    };

    setAddSaving(true);
    setSaveError(null);
    try {
      await createWindowInDb(slug, win, windows.length);
      setWindows((prev) => [...prev, win]);
      setAddOpen(false);
      setNewTitle('');
      setNewType('text');
      setNewIcon(DEFAULT_ICON_KEY);
      setNewBody('');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create window');
    } finally {
      setAddSaving(false);
    }
  }

  async function handleRemoveWindow(id: string) {
    setDeletingId(id);
    setSaveError(null);
    try {
      await deleteWindowFromDb(slug, id);
      setWindows((prev) => prev.filter((w) => w.id !== id));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to delete window');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    setLogoUploadError(null);
    try {
      const url = await uploadLogoFile(slug, file);
      setLogoUrl(url);
    } catch (e) {
      setLogoUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleUpload(windowId: string, file: File) {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, _uploading: true, _uploadError: null } : w))
    );
    try {
      const url = await uploadWindowFile(slug, windowId, file);
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, url, _uploading: false } : w))
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, _uploading: false, _uploadError: msg } : w))
      );
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #070e17 0%, #0a1720 50%, #060d14 100%)' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse 90% 40% at 50% -5%, rgba(20,184,166,0.07) 0%, transparent 68%)' }}
      />

      <div className="relative mx-auto max-w-2xl px-5 pb-36 pt-8 sm:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-400/50">Property Editor</p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-white">
              {core.PropertyName || 'Untitled Property'}
            </h1>
          </div>
          <div className="flex flex-none items-center gap-2 pt-1">
            <Link
              href="/manager"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/8 bg-white/4 px-3 text-xs font-semibold text-white/55 transition-all duration-200 hover:bg-white/8 hover:text-white/80"
            >
              ← Dashboard
            </Link>
            <Link
              href={`/p/${encodeURIComponent(slug)}`}
              target="_blank"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-teal-500/22 bg-teal-500/8 px-3 text-xs font-semibold text-teal-300/75 transition-all duration-200 hover:bg-teal-500/14 hover:text-teal-300"
            >
              View live ↗
            </Link>
          </div>
        </div>

        <div className="space-y-4">

          {/* Property Info */}
          <Card title="Property Info">
            <div className="space-y-4">
              <FieldGroup label="Property Name">
                <TextInput value={core.PropertyName} onChange={(v) => setField('PropertyName', v)} placeholder="e.g. Oceanview Villa" />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Address">
                  <TextInput value={core.PropertyAddress} onChange={(v) => setField('PropertyAddress', v)} placeholder="123 Main St" />
                </FieldGroup>
                <FieldGroup label="ZIP Code">
                  <TextInput value={core.PropertyZipCode} onChange={(v) => setField('PropertyZipCode', v)} placeholder="90210" />
                </FieldGroup>
              </div>
              <FieldGroup label="House Bio">
                <TextArea value={core.DetailedHouseBio} onChange={(v) => setField('DetailedHouseBio', v)} placeholder="Describe the property for guests…" rows={4} />
              </FieldGroup>
              <FieldGroup label="House Rules">
                <TextArea value={core.HouseRules} onChange={(v) => setField('HouseRules', v)} placeholder="No smoking, check out by 11am…" rows={3} />
              </FieldGroup>
            </div>
          </Card>

          {/* WiFi & Access */}
          <Card title="WiFi & Access">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="WiFi Network">
                  <TextInput value={core.WiFiName} onChange={(v) => setField('WiFiName', v)} placeholder="Network name" />
                </FieldGroup>
                <FieldGroup label="WiFi Password">
                  <TextInput value={core.WiFiPassword} onChange={(v) => setField('WiFiPassword', v)} placeholder="Password" />
                </FieldGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Garage Code">
                  <TextInput value={core.GarageCode} onChange={(v) => setField('GarageCode', v)} placeholder="e.g. 1234#" />
                </FieldGroup>
                <FieldGroup label="Manager Phone">
                  <TextInput value={core.ManagerPhone} onChange={(v) => setField('ManagerPhone', v)} placeholder="+1 (555) 000-0000" type="tel" />
                </FieldGroup>
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card title="Branding">
            <div className="space-y-5">
              <FieldGroup label="Property Logo">
                <div className="space-y-3">
                  {logoUrl ? (
                    <div className="flex items-center justify-center rounded-xl border border-white/8 bg-[#0a1520]/60 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="object-contain"
                        style={{ width: `${core.LogoSize}px`, maxHeight: '160px' }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0a1520]/40 py-6 text-sm text-white/25">
                      No logo uploaded
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={logoFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleLogoUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={logoUploading}
                      onClick={() => logoFileRef.current?.click()}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 text-xs font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/80 disabled:opacity-45"
                    >
                      <UploadIcon />
                      {logoUploading ? 'Uploading…' : logoUrl ? 'Replace logo' : 'Upload logo'}
                    </button>
                    {logoUploadError ? (
                      <span className="text-xs text-rose-400/75">{logoUploadError}</span>
                    ) : null}
                  </div>
                </div>
              </FieldGroup>

              <FieldGroup label={`Logo Size — ${core.LogoSize}px`}>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={4}
                    value={core.LogoSize}
                    onChange={(e) => setCore((prev) => ({ ...prev, LogoSize: Number(e.target.value) }))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-white/22">
                    <span>Small (40px)</span>
                    <span>Large (200px)</span>
                  </div>
                </div>
              </FieldGroup>
            </div>
          </Card>

          {/* Amenity Windows */}
          <Card title="Amenity Windows">
            <div className="space-y-3">
              {windows.length === 0 ? (
                <p className="py-2 text-sm text-white/30">
                  No windows yet — add text, images, videos, or PDFs that guests see inside Home Amenities.
                </p>
              ) : (
                windows.map((w, idx) => (
                  <div
                    key={w.id}
                    className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#080f18]/70 transition-all duration-200"
                  >
                    {/* Window header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIconPickerFor(w.id)}
                          title="Change icon"
                          className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/8 text-teal-300/70 transition-all hover:border-teal-500/40 hover:bg-teal-500/14 hover:text-teal-300"
                        >
                          <AmenityIconSvg iconKey={w.icon ?? DEFAULT_ICON_KEY} className="h-4 w-4" />
                        </button>
                        <TypeBadge type={w.type} />
                        <span className="truncate text-sm font-medium text-white/85">{w.title}</span>
                      </div>
                      <div className="flex flex-none items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveWindow(w.id, -1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
                          aria-label="Move up"
                        >
                          <ChevronUpIcon />
                        </button>
                        <button
                          type="button"
                          disabled={idx === windows.length - 1}
                          onClick={() => moveWindow(w.id, 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/35 transition-all hover:bg-white/[0.07] hover:text-white/65 disabled:opacity-25"
                          aria-label="Move down"
                        >
                          <ChevronDownIcon />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === w.id}
                          onClick={() => handleRemoveWindow(w.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/18 bg-rose-500/6 text-rose-400/55 transition-all hover:bg-rose-500/14 hover:text-rose-300/85 disabled:opacity-40"
                          aria-label="Remove window"
                        >
                          {deletingId === w.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border border-rose-400/40 border-t-rose-400" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Window content editor */}
                    <div className="border-t border-white/[0.05] px-4 py-3">
                      {w.type === 'text' ? (
                        <TextArea
                          value={w.body ?? ''}
                          onChange={(v) => setWindowBody(w.id, v)}
                          placeholder="Enter content for guests…"
                          rows={3}
                        />
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
                            <input
                              type="file"
                              ref={(el) => { fileRefs.current[w.id] = el; }}
                              accept={
                                w.type === 'image' ? 'image/*' :
                                w.type === 'video' ? 'video/*' :
                                w.type === 'pdf' ? 'application/pdf' :
                                undefined
                              }
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await handleUpload(w.id, file);
                              }}
                            />
                            <button
                              type="button"
                              disabled={w._uploading}
                              onClick={() => fileRefs.current[w.id]?.click()}
                              className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 text-xs font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/80 disabled:opacity-45"
                            >
                              <UploadIcon />
                              {w._uploading ? 'Uploading…' : w.url ? 'Replace file' : 'Upload file'}
                            </button>
                            {w._uploadError ? (
                              <span className="text-xs text-rose-400/75">{w._uploadError}</span>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-teal-500/20 bg-teal-500/4 py-3.5 text-sm font-semibold text-teal-300/55 transition-all duration-200 hover:border-teal-400/35 hover:bg-teal-500/8 hover:text-teal-300/80"
              >
                <PlusIcon />
                Add Window
              </button>
            </div>
          </Card>

        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        {saveError ? (
          <div className="mx-auto mb-2 max-w-2xl px-5 sm:px-8">
            <div className="rounded-xl border border-rose-500/18 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300/80">
              {saveError}
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-2xl px-5 pb-6 sm:px-8">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#070e17]/95 px-5 py-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="text-xs font-medium">
              {saved
                ? <span className="text-teal-400/80">All changes saved ✓</span>
                : <span className="text-white/30">Unsaved changes</span>}
            </div>
            <button
              type="button"
              disabled={saving || addSaving}
              onClick={handleSave}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 px-6 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.4)] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Icon picker modal */}
      {iconPickerFor ? (
        <IconPickerModal
          current={iconPickerFor === 'new' ? newIcon : (windows.find((w) => w.id === iconPickerFor)?.icon ?? DEFAULT_ICON_KEY)}
          onSelect={(key) => {
            if (iconPickerFor === 'new') {
              setNewIcon(key);
            } else {
              setWindowIcon(iconPickerFor, key);
            }
          }}
          onClose={() => setIconPickerFor(null)}
        />
      ) : null}

      {/* Add window modal */}
      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-5 pb-8 sm:items-center">
          <button
            type="button"
            onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Close"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-[#080f18]/97 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/28 to-transparent" />

            <h3 className="text-base font-semibold text-white">Add a Window</h3>
            <p className="mt-1 text-sm text-white/40">Creates a new amenity section guests can open.</p>

            <div className="mt-5 space-y-4">
              {/* Icon picker row */}
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <button
                  type="button"
                  onClick={() => setIconPickerFor('new')}
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
                <TextInput
                  value={newTitle}
                  onChange={setNewTitle}
                  placeholder="e.g. Pool Access, Parking, Check-out Info…"
                />
              </FieldGroup>

              <div className="space-y-1.5">
                <Label>Content Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['text', 'image', 'video', 'pdf'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`rounded-xl border py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                        newType === t
                          ? 'border-teal-500/40 bg-teal-500/15 text-teal-300'
                          : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:bg-white/[0.07] hover:text-white/65'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {newType === 'text' ? (
                <FieldGroup label="Content (optional)">
                  <TextArea
                    value={newBody}
                    onChange={setNewBody}
                    placeholder="Enter text content for guests…"
                    rows={3}
                  />
                </FieldGroup>
              ) : (
                <p className="text-xs text-white/30">
                  You can upload the {newType} file after adding the window.
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setAddOpen(false); setNewTitle(''); setNewType('text'); setNewIcon(DEFAULT_ICON_KEY); setNewBody(''); }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/4 px-4 text-sm font-semibold text-white/55 transition-all hover:bg-white/8 hover:text-white/75"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newTitle.trim() || addSaving}
                onClick={handleAddWindow}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 px-5 text-sm font-semibold text-[#070e17] shadow-[0_0_16px_rgba(20,184,166,0.2)] transition-all hover:shadow-[0_0_28px_rgba(20,184,166,0.38)] disabled:opacity-50"
              >
                {addSaving ? 'Creating…' : 'Add Window'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
