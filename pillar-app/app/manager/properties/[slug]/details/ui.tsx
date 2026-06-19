'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { Property, PropertyFields, ManagerLayoutItem, AmenityWindow } from '@/lib/types';
import { generateWindowId } from '@/lib/types';
import { AMENITY_ICONS_MAP, DEFAULT_ICON_KEY, searchIcons } from '@/lib/amenityIcons';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const DEFAULT_WINDOWS: AmenityWindow[] = [
  { id: 'default-wifi', title: 'WiFi', type: 'text', icon: 'wifi' },
  { id: 'default-television', title: 'Television', type: 'text', icon: 'tv' },
  { id: 'default-coffee', title: 'Coffee Machine', type: 'text', icon: 'coffee' },
  { id: 'default-thermostat', title: 'Thermostat', type: 'text', icon: 'thermometer' },
];

async function deleteWindowFromDb(slug: string, windowId: string) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: windowId }),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(data?.error ?? `Delete failed (HTTP ${res.status})`);
}

/* ── Design tokens ──────────────────────────────────────────────────── */
const card =
  'rounded-3xl border border-[#D4AF6A]/20 bg-white/85 p-6 shadow-[0_2px_20px_rgba(0,0,0,0.05)] backdrop-blur dark:border-[#D4AF6A]/10 dark:bg-[#141414]';

const inputBase =
  'w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#1a1a1a] outline-none placeholder:text-black/30 transition focus:border-[#D4AF6A]/50 focus:ring-2 focus:ring-[#D4AF6A]/15 disabled:opacity-50 dark:border-white/10 dark:bg-[#1E1E1E] dark:text-white dark:placeholder:text-white/25 dark:focus:border-[#D4AF6A]/35 dark:focus:ring-[#D4AF6A]/10';

/* ── Primitives ─────────────────────────────────────────────────────── */

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-block h-[18px] w-0.5 rounded-full bg-[#D4AF6A]/70 dark:bg-[#D4AF6A]/50" />
        <h2 className="lux-title text-[17px] text-[#4A3010] dark:text-[#E8D4A8]">{title}</h2>
      </div>
      {subtitle ? (
        <p className="mt-1 pl-3.5 text-xs leading-relaxed text-black/45 dark:text-white/45">{subtitle}</p>
      ) : null}
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#8B6A2E]/75 dark:text-[#C9A84C]/60">
      {children}
    </p>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-12 ${inputBase}`}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`py-3 ${inputBase}`}
    />
  );
}

function TypeSegmented({
  value,
  onChange,
  disabled,
}: {
  value: AmenityWindow['type'];
  onChange: (v: AmenityWindow['type']) => void;
  disabled?: boolean;
}) {
  const types: { value: AmenityWindow['type']; label: string }[] = [
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Image' },
    { value: 'text', label: 'Text' },
  ];

  return (
    <div className="flex gap-1 rounded-2xl border border-black/8 bg-black/[0.03] p-1 dark:border-white/10 dark:bg-white/5">
      {types.map((t) => (
        <button
          key={t.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(t.value)}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
            value === t.value
              ? 'bg-white text-[#4A3010] shadow-sm dark:bg-[#D4AF6A]/20 dark:text-[#E8D4A8]'
              : 'text-black/45 hover:text-black/70 dark:text-white/35 dark:hover:text-white/60'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function UploadedBadge() {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
      ✓ Uploaded
    </span>
  );
}

function UploadButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#2C2C2C] shadow-sm transition hover:bg-[#F5F3EE] disabled:opacity-50 dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
    >
      {label}
    </button>
  );
}

/* ── Hero Image Upload ──────────────────────────────────────────────── */

function HeroUpload({
  currentUrl,
  slug,
  disabled,
  onUploaded,
}: {
  currentUrl?: string;
  slug: string;
  disabled?: boolean;
  onUploaded: (url: string) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    setErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('field', 'hero');
      const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/upload`, {
        method: 'POST',
        body: form,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onUploaded(json.url!);
      setStatus('done');
    } catch (e) {
      setStatus('error');
      setErr(e instanceof Error ? e.message : 'Upload failed');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <FieldLabel>Hero image</FieldLabel>
      <div className="overflow-hidden rounded-2xl border border-black/8 dark:border-white/8">
        {currentUrl ? (
          <div className="relative">
            <img src={currentUrl} alt="Hero" className="h-36 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-3 right-3">
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
              <UploadButton
                label={status === 'uploading' ? 'Uploading…' : 'Replace'}
                disabled={disabled || status === 'uploading'}
                onClick={() => inputRef.current?.click()}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || status === 'uploading'}
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-full flex-col items-center justify-center gap-2 bg-[#FDFCFA] transition hover:bg-[#F5F3EE] disabled:opacity-50 dark:bg-[#1A1A1A] dark:hover:bg-[#222]"
          >
            <div className="text-2xl opacity-30">◻</div>
            <div className="text-xs font-semibold text-black/40 dark:text-white/40">
              {status === 'uploading' ? 'Uploading…' : 'Tap to upload hero image'}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
          </button>
        )}
      </div>
      {status === 'done' && !currentUrl ? (
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saved</p>
      ) : null}
      {status === 'error' ? (
        <div className="rounded-xl border border-red-500/15 bg-red-500/8 px-3 py-2 text-xs text-red-800 dark:text-red-300">
          {err}
        </div>
      ) : null}
    </div>
  );
}

/* ── Amenity icon helpers ───────────────────────────────────────────── */

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
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close icon picker"
      />
      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ maxHeight: '80vh', backgroundColor: 'white', borderColor: 'rgba(212,175,106,0.25)' }}
      >
        {/* Dark mode override via Tailwind */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#141414]" style={{ maxHeight: '80vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-black/8 px-5 py-4 dark:border-white/8">
            <h3 className="text-sm font-semibold text-[#1a1a1a] dark:text-white">Pick an Icon</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-black/35 transition-colors hover:text-black/65 dark:text-white/35 dark:hover:text-white/65"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-black/5 px-5 py-3 dark:border-white/5">
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30 dark:text-white/30" aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icons… (pool, tv, coffee, gym…)"
                className="h-10 w-full rounded-xl border border-black/10 bg-black/3 pl-10 pr-4 text-sm text-[#1a1a1a] placeholder:text-black/30 outline-none transition-all focus:border-[#D4AF6A]/50 focus:ring-2 focus:ring-[#D4AF6A]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus:border-[#D4AF6A]/40"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-black/35 dark:text-white/35">
              {results.length} icon{results.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Grid */}
          <div className="overflow-y-auto p-4">
            {results.length === 0 ? (
              <p className="py-6 text-center text-sm text-black/35 dark:text-white/35">
                No icons match &ldquo;{query}&rdquo;
              </p>
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
                          ? 'border-[#D4AF6A]/50 bg-[#D4AF6A]/10 text-[#7A5A1E] dark:border-[#D4AF6A]/40 dark:bg-[#D4AF6A]/12 dark:text-[#E8D4A8]'
                          : 'border-black/8 bg-black/2 text-black/40 hover:border-[#D4AF6A]/35 hover:bg-[#D4AF6A]/6 hover:text-[#7A5A1E] dark:border-white/8 dark:bg-white/2 dark:text-white/40 dark:hover:border-[#D4AF6A]/30 dark:hover:text-[#E8D4A8]'
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
    </div>
  );
}

/* ── Window Card ────────────────────────────────────────────────────── */

const ACCEPT: Record<AmenityWindow['type'], string> = {
  video: 'video/*',
  pdf: 'application/pdf',
  image: 'image/*',
  text: '',
};

function WindowCard({
  w,
  slug,
  disabled,
  onUpdate,
  onDelete,
}: {
  w: AmenityWindow;
  slug: string;
  disabled?: boolean;
  onUpdate: (next: AmenityWindow) => void;
  onDelete: () => void;
}) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadErr, setUploadErr] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus('uploading');
    setUploadErr('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('field', `window/${w.id}`);
      const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/upload`, {
        method: 'POST',
        body: form,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      onUpdate({ ...w, url: json.url });
      setUploadStatus('done');
    } catch (e) {
      setUploadStatus('error');
      setUploadErr(e instanceof Error ? e.message : 'Upload failed');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#D4AF6A]/20 bg-[#FDFCFA] p-5 dark:border-[#D4AF6A]/10 dark:bg-[#1A1A1A]">

      {/* Icon picker */}
      {iconPickerOpen ? (
        <IconPickerModal
          current={w.icon ?? DEFAULT_ICON_KEY}
          onSelect={(key) => onUpdate({ ...w, icon: key })}
          onClose={() => setIconPickerOpen(false)}
        />
      ) : null}

      {/* Icon selector button */}
      <div className="space-y-2">
        <FieldLabel>Icon</FieldLabel>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIconPickerOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-left transition hover:bg-[#F5F3EE] disabled:opacity-50 dark:border-white/10 dark:bg-[#1E1E1E] dark:hover:bg-white/5"
        >
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-[#D4AF6A]/30 bg-[#D4AF6A]/8 text-[#7A5A1E] dark:border-[#D4AF6A]/20 dark:bg-[#D4AF6A]/10 dark:text-[#E8D4A8]">
            <AmenityIconSvg iconKey={w.icon ?? DEFAULT_ICON_KEY} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#1a1a1a] dark:text-white">
              {AMENITY_ICONS_MAP[w.icon ?? DEFAULT_ICON_KEY]?.name ?? 'Home'}
            </p>
            <p className="text-xs text-black/35 dark:text-white/35">Tap to change icon</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-none text-black/25 dark:text-white/25" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <FieldLabel>Window title</FieldLabel>
        <TextInput
          value={w.title}
          disabled={disabled}
          placeholder="e.g. Pool Heater, TV Guide, Parking Instructions…"
          onChange={(v) => onUpdate({ ...w, title: v })}
        />
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <FieldLabel>Content type</FieldLabel>
        <TypeSegmented
          value={w.type}
          disabled={disabled}
          onChange={(v) => onUpdate({ ...w, type: v, url: undefined, body: undefined })}
        />
      </div>

      {/* Content */}
      {w.type !== 'text' ? (
        <div className="space-y-2">
          <FieldLabel>{w.type === 'video' ? 'Video file' : w.type === 'pdf' ? 'PDF file' : 'Image file'}</FieldLabel>
          <div className="flex flex-wrap items-center gap-2.5">
            {w.url ? <UploadedBadge /> : null}
            <input ref={inputRef} type="file" accept={ACCEPT[w.type]} className="hidden" onChange={handleUpload} />
            <UploadButton
              label={uploadStatus === 'uploading' ? 'Uploading…' : w.url ? 'Replace' : 'Upload file'}
              disabled={disabled || uploadStatus === 'uploading'}
              onClick={() => inputRef.current?.click()}
            />
            {uploadStatus === 'done' ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saved</span>
            ) : null}
          </div>
          {uploadStatus === 'error' ? (
            <div className="rounded-xl border border-red-500/15 bg-red-500/8 px-3 py-2 text-xs text-red-800 dark:text-red-300">
              {uploadErr}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <FieldLabel>Body text</FieldLabel>
          <TextArea
            value={w.body ?? ''}
            disabled={disabled}
            rows={4}
            placeholder="Enter the text guests will see when they open this section…"
            onChange={(v) => onUpdate({ ...w, body: v })}
          />
        </div>
      )}

      {/* Delete */}
      <div className="border-t border-black/5 pt-3 dark:border-white/5">
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400/70 transition hover:text-red-500 disabled:opacity-40 dark:text-red-400/50 dark:hover:text-red-400"
        >
          Remove window
        </button>
      </div>
    </div>
  );
}

/* ── QR Code Section ────────────────────────────────────────────────── */

function QRSection({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);

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
    window.location.href = `/manager/properties/${encodeURIComponent(newSlug)}/details`;
  }

  return (
    <section className={card}>
      <SectionHeading
        title="QR Code"
        subtitle="Print and place at the property — tenants scan to access WiFi, house rules, and more."
      />
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-[#D4AF6A]/25 bg-white p-4 shadow-sm dark:bg-[#1A1A1A]">
          {mounted ? (
            <QRCodeSVG value={publicUrl} size={160} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
          ) : (
            <div className="h-40 w-40 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
          )}
        </div>

        <div className="flex w-full gap-2">
          {/* Regenerate — left */}
          <button
            type="button"
            onClick={() => { setShowModal(true); setConfirmText(''); setRegenError(null); }}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#D4AF6A]/30 bg-[#D4AF6A]/8 text-sm font-semibold text-[#7A5A1E] transition hover:bg-[#D4AF6A]/15 dark:border-[#D4AF6A]/20 dark:bg-[#D4AF6A]/10 dark:text-[#E8D4A8] dark:hover:bg-[#D4AF6A]/18"
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
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-black/10 bg-white text-sm font-semibold text-[#2C2C2C] shadow-sm transition hover:bg-[#F5F3EE] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M6 9V2h12v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print view
          </a>
        </div>
      </div>

      {/* Regenerate confirmation modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-[#141414]">
            <div className="h-1 w-full bg-amber-400" />
            <div className="p-6">
              <h2 className="text-base font-bold tracking-tight text-[#1a1a1a] dark:text-white">Regenerate QR Code?</h2>
              <p className="mt-2 text-sm leading-relaxed text-black/55 dark:text-white/55">
                This creates a new unique link for this property.{' '}
                <span className="font-semibold text-black/75 dark:text-white/75">Any previously printed QR codes will stop working</span>{' '}
                and will need to be reprinted.
              </p>
              <div className="mt-5 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
                  Type <span className="text-amber-600">Generate</span> to confirm
                </p>
                <input
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleRegenerate(); }}
                  placeholder="Generate"
                  className="h-11 w-full rounded-xl border border-black/12 bg-black/3 px-4 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-black/20 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/20"
                />
              </div>
              {regenError ? <p className="mt-3 text-xs text-red-500">{regenError}</p> : null}
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRegenerate()}
                  disabled={!confirmed || isGenerating}
                  className="h-10 flex-1 rounded-xl bg-amber-400 text-sm font-bold text-[#1a1a1a] shadow-sm transition hover:bg-amber-500 disabled:opacity-40"
                >
                  {isGenerating ? 'Generating…' : 'Generate New QR Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 rounded-xl border border-black/10 bg-black/4 px-4 text-sm font-semibold text-black/50 transition hover:bg-black/8 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

export default function ManagerPropertyDetailsClient({
  slug,
  property,
  rawFields,
  initialLayout,
}: {
  slug: string;
  property: Property;
  rawFields: PropertyFields;
  initialLayout: ManagerLayoutItem[];
}) {
  const customFieldKeys = initialLayout.map((x) => x.field);
  const initCustom: Record<string, string> = {};
  for (const key of customFieldKeys) {
    const v = rawFields[key];
    if (typeof v === 'string') initCustom[key] = v;
    else if (typeof v === 'number' || typeof v === 'boolean') initCustom[key] = String(v);
    else initCustom[key] = '';
  }

  const [draft, setDraft] = useState({
    name: property.PropertyName || '',
    address: property.PropertyAddress || '',
    zip: property.PropertyZipCode || '',
    bio: property.DetailedHouseBio || '',
    wifiName: property.WiFiName || '',
    wifiPassword: property.WiFiPassword || '',
    garageCode: (property.GarageCode || '').trim(),
    phone: property.ManagerPhone || '',
    custom: initCustom,
  });

  const [heroUrl, setHeroUrl] = useState<string | undefined>(property.HeroImage);
  const [windows, setWindows] = useState<AmenityWindow[]>(
    property.windows?.length ? property.windows : DEFAULT_WINDOWS
  );

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isSaving = saveState === 'saving';

  const save = async () => {
    setSaveState('saving');
    setErrorMsg('');
    try {
      const fieldsRes = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fields: {
            PropertyName: draft.name,
            PropertyAddress: draft.address,
            PropertyZipCode: draft.zip,
            DetailedHouseBio: draft.bio,
            WiFiName: draft.wifiName,
            WiFiPassword: draft.wifiPassword,
            GarageCode: draft.garageCode,
            ManagerPhone: draft.phone,
          },
          customFields: draft.custom,
        }),
      });
      const json = (await fieldsRes.json().catch(() => null)) as { error?: string } | null;
      if (!fieldsRes.ok) throw new Error(json?.error ?? `Save failed (HTTP ${fieldsRes.status})`);

      if (windows.length > 0) {
        const winRes = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/windows`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            windows: windows.map(({ id, title, type, icon, body, url, room }) => ({ id, title, type, icon, body, url, room })),
          }),
        });
        const wJson = (await winRes.json().catch(() => null)) as { error?: string } | null;
        if (!winRes.ok) throw new Error(wJson?.error ?? `Window save failed (HTTP ${winRes.status})`);
      }

      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch (e) {
      setSaveState('error');
      setErrorMsg(e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#1a1a1a] dark:bg-[#0D0D0D] dark:text-white">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#D4AF6A]/15 bg-[#F5F3EE]/95 px-4 py-3 backdrop-blur-xl dark:border-[#D4AF6A]/10 dark:bg-[#0D0D0D]/95">
        <Link
          href="/manager"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-base text-[#2C2C2C] shadow-sm transition hover:bg-[#EDE9E0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          aria-label="Back to dashboard"
        >
          ←
        </Link>

        <div className="min-w-0 flex-1">
          <div className="lux-title truncate text-sm leading-tight text-[#4A3010] dark:text-[#E8D4A8]">
            {draft.name || 'Property'}
          </div>
          <div className="truncate text-[11px] text-black/40 dark:text-white/40">{draft.address}</div>
        </div>

        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          className={`inline-flex h-9 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition disabled:opacity-60 ${
            saveState === 'saved'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-[#2C2C2C] text-white hover:bg-black dark:bg-[#D4AF6A]/20 dark:text-[#E8D4A8] dark:hover:bg-[#D4AF6A]/30'
          }`}
        >
          {isSaving ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto w-full max-w-xl space-y-4 px-4 pb-24 pt-5">

        {/* View live */}
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs text-black/35 dark:text-white/35">/p/{slug}</span>
          <Link
            href={`/p/${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7A5A1E] underline decoration-[#D4AF6A]/50 underline-offset-4 hover:decoration-[#D4AF6A] dark:text-[#E8D4A8]"
          >
            View live
          </Link>
        </div>

        {/* QR Code */}
        <QRSection slug={slug} />

        {saveState === 'error' ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            {errorMsg}
          </div>
        ) : null}

        {/* Basics */}
        <section className={card}>
          <SectionHeading title="Basics" />
          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel>Property name</FieldLabel>
              <TextInput value={draft.name} disabled={isSaving} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Address</FieldLabel>
              <TextInput value={draft.address} disabled={isSaving} onChange={(v) => setDraft((d) => ({ ...d, address: v }))} />
            </div>
            <div className="space-y-2">
              <FieldLabel>ZIP code</FieldLabel>
              <TextInput value={draft.zip} disabled={isSaving} onChange={(v) => setDraft((d) => ({ ...d, zip: v }))} />
            </div>
            <HeroUpload slug={slug} currentUrl={heroUrl} disabled={isSaving} onUploaded={setHeroUrl} />
          </div>
        </section>

        {/* Guest content */}
        <section className={card}>
          <SectionHeading title="Guest-facing content" />
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>House bio</FieldLabel>
              <TextArea
                value={draft.bio}
                disabled={isSaving}
                rows={7}
                placeholder="Short, elegant intro for guests"
                onChange={(v) => setDraft((d) => ({ ...d, bio: v }))}
              />
            </div>
          </div>
        </section>

        {/* WiFi & Access */}
        <section className={card}>
          <SectionHeading title="WiFi & Access" />
          <div className="grid gap-4">
            <div className="space-y-2">
              <FieldLabel>WiFi name</FieldLabel>
              <TextInput value={draft.wifiName} disabled={isSaving} onChange={(v) => setDraft((d) => ({ ...d, wifiName: v }))} />
            </div>
            <div className="space-y-2">
              <FieldLabel>WiFi password</FieldLabel>
              <TextInput value={draft.wifiPassword} disabled={isSaving} onChange={(v) => setDraft((d) => ({ ...d, wifiPassword: v }))} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Garage code</FieldLabel>
              <TextInput value={draft.garageCode} disabled={isSaving} placeholder="optional" onChange={(v) => setDraft((d) => ({ ...d, garageCode: v }))} />
            </div>
          </div>
        </section>

        {/* Manager contact */}
        <section className={card}>
          <SectionHeading title="Manager contact" />
          <div className="space-y-2">
            <FieldLabel>Phone</FieldLabel>
            <TextInput
              value={draft.phone}
              disabled={isSaving}
              placeholder="+1 (555) 555-5555"
              onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
            />
            <p className="text-[11px] leading-relaxed text-slate-400">
              By saving a phone number, you consent to receive recurring transactional SMS notifications
              from Pillar PM when tenants submit requests. Message frequency varies. Msg &amp; data rates
              may apply. Reply STOP to opt out or HELP for help.{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
              {' '}·{' '}
              <a href="/sms-policy" className="underline">SMS Policy</a>
            </p>
          </div>
        </section>

        {/* Amenity Windows */}
        <section className={card}>
          <SectionHeading
            title="Amenity Windows"
            subtitle="Each window is an expandable row on the guest's amenities screen. Set a title, pick the content type, then add your file or text."
          />

          <div className="space-y-3">
            {windows.map((w, idx) => (
              <WindowCard
                key={w.id}
                w={w}
                slug={slug}
                disabled={isSaving}
                onUpdate={(next) => setWindows((ws) => ws.map((x, i) => (i === idx ? next : x)))}
                onDelete={async () => {
                  try { await deleteWindowFromDb(slug, w.id); } catch { /* no-op if not yet in DB */ }
                  setWindows((ws) => ws.filter((_, i) => i !== idx));
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setWindows((ws) => [...ws, { id: generateWindowId(), title: '', type: 'video', icon: DEFAULT_ICON_KEY }])}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D4AF6A]/30 text-sm font-semibold text-[#7A5A1E]/60 transition hover:border-[#D4AF6A]/50 hover:bg-[#D4AF6A]/5 dark:border-[#D4AF6A]/20 dark:text-[#E8D4A8]/50 dark:hover:bg-[#D4AF6A]/8"
          >
            <span className="text-lg leading-none">+</span> Add window
          </button>
        </section>

        {/* Custom layout windows */}
        {customFieldKeys.length > 0 ? (
          <section className={card}>
            <SectionHeading title="Custom windows" subtitle="Values for windows added via the layout editor." />
            <div className="grid gap-4">
              {customFieldKeys.map((key) => (
                <div key={key} className="space-y-2">
                  <FieldLabel>{key}</FieldLabel>
                  <TextArea
                    value={draft.custom[key] ?? ''}
                    disabled={isSaving}
                    rows={4}
                    onChange={(v) => setDraft((d) => ({ ...d, custom: { ...d.custom, [key]: v } }))}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Bottom save */}
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#2C2C2C] text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-black disabled:opacity-60 dark:bg-[#D4AF6A]/20 dark:text-[#E8D4A8] dark:hover:bg-[#D4AF6A]/30"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
