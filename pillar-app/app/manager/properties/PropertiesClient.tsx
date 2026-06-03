'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import ManagerBottomNav from '@/app/manager/ManagerBottomNav';
import DuplicatePropertyModal from '@/app/manager/DuplicatePropertyModal';
import { PROPERTY_TEMPLATES } from '@/lib/propertyTemplates';

const SANDY_RGB = '245,237,213';

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function ToolsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      {/* Wrench: head upper-right, handle lower-left */}
      <path
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function DuplicateHousesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      {/* back house — offset upper-right */}
      <path d="M9 8.5L14.5 3.5L20 8.5V17H9V8.5Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" opacity="0.40" />
      {/* front house */}
      <path d="M4 12L9.5 6.5L15 12V20H4V12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 20V16.5H11.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PropertiesClient({
  properties,
  isSubscribed,
  propertySlots,
}: {
  properties: Property[];
  isSubscribed: boolean;
  propertySlots: number;
}) {
  const [dark, setDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createStep, setCreateStep] = useState<'name' | 'template'>('name');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [propertyName, setPropertyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<Property | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pillar-theme');
    if (stored) setDark(stored === 'dark');
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('pillar-theme', next ? 'dark' : 'light');
  }

  function openDeleteModal(p: Property) {
    setDeleteTarget(p);
    setDeleteConfirmName('');
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(deleteTarget.Slug || '')}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setDeleteError(data.error || 'Failed to delete. Please try again.');
      setIsDeleting(false);
      return;
    }
    window.location.reload();
  }

  async function handleCreate() {
    const name = propertyName.trim();
    if (!name) return;
    setIsCreating(true);
    setCreateError(null);
    const res = await fetch('/api/manager/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, templateId: selectedTemplate }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setCreateError(data.error || 'Failed to create property. Please try again.');
      setIsCreating(false);
      return;
    }
    const { slug } = (await res.json()) as { slug: string };
    window.location.href = `/manager/properties/${encodeURIComponent(slug)}/edit`;
  }

  async function handleAddSlot() {
    setSlotLoading(true);
    setSlotError(null);
    const res = await fetch('/api/manager/billing/add-property-slot', { method: 'POST' });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setSlotError(data.error || 'Failed to upgrade. Please try again or contact support.');
      setSlotLoading(false);
    }
  }

  /* â”€â”€ Theme helpers â”€â”€ */
  const card = dark
    ? { background: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(100,80,40,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(100,80,40,0.08)' };
  const cardHeader = dark
    ? { borderBottom: '1px solid rgba(255,255,255,0.07)' }
    : { borderBottom: '1px solid rgba(100,80,40,0.09)' };
  const labelColor = dark ? 'rgba(255,255,255,0.50)' : 'rgba(100,80,40,0.60)';
  const mutedColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(100,80,40,0.55)';
  const badgeBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(100,80,40,0.06)';
  const badgeBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(100,80,40,0.14)';
  const badgeText = dark ? 'rgba(255,255,255,0.60)' : 'rgba(100,80,40,0.60)';
  const propCardStyle = dark
    ? { background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }
    : { background: 'rgba(100,80,40,0.04)', border: '1px solid rgba(100,80,40,0.10)' };
  const propNameColor = dark ? 'rgba(255,255,255,0.90)' : '#1e293b';
  const addBtnStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', color: '#ffffff', boxShadow: '0 0 14px rgba(255,255,255,0.18)' }
    : { borderColor: 'rgba(0,0,0,0.16)', background: '#111111', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.14)' };
  const actionBoxStyle = dark
    ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }
    : { background: 'rgba(100,80,40,0.04)', border: '1px solid rgba(100,80,40,0.14)', color: 'rgba(100,80,40,0.60)' };
  const toggleStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.80)' }
    : { borderColor: 'rgba(100,80,40,0.18)', background: 'rgba(255,255,255,0.80)', color: 'rgba(100,80,40,0.70)', backdropFilter: 'blur(8px)' };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: dark ? 'rgba(255,255,255,0.60)' : 'rgba(100,80,40,0.55)' }}>Manager Portal</p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight" style={{ color: dark ? '#ffffff' : '#1e293b' }}>Properties</h1>
          </div>
          <button
            type="button"
            onClick={toggleMode}
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
            style={toggleStyle}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Properties card */}
        <div className="overflow-hidden rounded-2xl" style={card}>
          <div className="flex items-center justify-between px-6 py-4" style={cardHeader}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
              Your Properties
            </p>
            <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: badgeBg, borderColor: badgeBorder, color: badgeText }}>
              {properties.length} total
            </span>
          </div>
          <div className="p-6">

            {/* Add Property button */}
            <div className="mb-5">
              {!isSubscribed ? (
                <div title="Set up billing to add properties">
                  <button type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border px-4 text-sm font-semibold"
                    style={dark ? { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)' } : { borderColor: 'rgba(0,0,0,0.09)', background: 'rgba(0,0,0,0.03)', color: 'rgba(30,41,59,0.30)' }}>
                    <span className="text-base leading-none">+</span> Add Property
                  </button>
                  <p className="mt-1.5 text-[11px]" style={{ color: mutedColor }}>Active subscription required</p>
                </div>
              ) : properties.length >= propertySlots ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={slotLoading}
                    onClick={() => void handleAddSlot()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                    style={dark
                      ? { borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.60)' }
                      : { borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.04)', color: 'rgba(30,41,59,0.65)' }}
                  >
                    <span className="text-sm leading-none">+</span>
                    {slotLoading ? 'Upgrading…' : 'Add Property Slot — $9.99/mo'}
                  </button>
                  <p className="text-[11px]" style={{ color: mutedColor }}>
                    You&apos;ve used all {propertySlots} {propertySlots === 1 ? 'slot' : 'slots'}. Adding a slot charges $9.99/month prorated to your current billing cycle.
                  </p>
                  {slotError ? <p className="text-[11px] text-rose-400">{slotError}</p> : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { setShowModal(true); setPropertyName(''); setCreateError(null); }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-300"
                  style={addBtnStyle}
                >
                  <span className="text-base leading-none">+</span> Add Property
                </button>
              )}
            </div>

            {/* Property list */}
            {properties.length === 0 ? (
              <p className="text-sm" style={{ color: mutedColor }}>No properties yet. Add your first one above.</p>
            ) : (
              <div className="space-y-3">
                {properties.map((p) => {
                  const slug = (p.Slug || '').trim();
                  return (
                    <div key={`${p.PropertyName}-${p.PropertyAddress}`} className="rounded-xl p-4 transition-all duration-200" style={propCardStyle}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold" style={{ color: propNameColor }}>{p.PropertyName || '—'}</div>
                          {p.PropertyAddress ? (
                            <div className="mt-0.5 truncate text-xs" style={{ color: mutedColor }}>{p.PropertyAddress}</div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(p)}
                          className="flex-none rounded-lg border border-rose-500/20 bg-rose-500/[0.08] p-1.5 text-rose-400/50 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400/90"
                          title="Delete property"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                      {!slug ? (
                        <p className="mt-3 text-xs text-rose-400/55">Missing slug — contact support</p>
                      ) : (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {/* Live */}
                          <Link href={`/p/${encodeURIComponent(slug)}`} target="_blank" className="group flex flex-col items-center gap-1.5">
                            <div className="flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl transition-all duration-200 group-hover:opacity-75" style={actionBoxStyle}>
                              {p.HeroImage ? (
                                <img src={p.HeroImage} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                                  <path d="M3 12L12 4l9 8v8H3V12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M9 22v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Live</span>
                          </Link>
                          {/* Edit */}
                          <Link href={`/manager/properties/${encodeURIComponent(slug)}/edit`} className="group flex flex-col items-center gap-1.5">
                            <div className="flex h-[52px] w-full items-center justify-center rounded-xl transition-all duration-200 group-hover:opacity-75" style={actionBoxStyle}>
                              <ToolsIcon />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Edit</span>
                          </Link>
                          {/* Duplicate */}
                          <button type="button" onClick={() => setDuplicateTarget(p)} className="group flex w-full flex-col items-center gap-1.5">
                            <div className="flex h-[52px] w-full items-center justify-center rounded-xl transition-all duration-200 group-hover:opacity-75" style={actionBoxStyle}>
                              <DuplicateHousesIcon />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Duplicate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ManagerBottomNav />

      {/* Delete modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-5" style={{ background: 'rgba(5,10,16,0.88)' }} onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(248,113,113,0.3), transparent)' }} />
            <div className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-white">Delete Property</h2>
              <p className="mt-1 text-xs text-white/40">This cannot be undone. Type <span className="font-semibold text-white/70">{deleteTarget.PropertyName || deleteTarget.Slug}</span> to confirm.</p>
              <div className="mt-5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400/55">Property Name</p>
                <input autoFocus type="text" value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && deleteConfirmName === (deleteTarget.PropertyName || deleteTarget.Slug)) void handleDelete(); }} placeholder={deleteTarget.PropertyName || deleteTarget.Slug || ''} className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#1e1e1e]/80 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-rose-500/35 focus:ring-1 focus:ring-rose-500/[0.18]" />
              </div>
              {deleteError ? <p className="mt-3 text-xs text-rose-400/80">{deleteError}</p> : null}
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => void handleDelete()} disabled={deleteConfirmName !== (deleteTarget.PropertyName || deleteTarget.Slug) || isDeleting} className="h-10 flex-1 rounded-xl border border-rose-500/30 bg-rose-500/15 text-sm font-semibold text-rose-300 transition-all duration-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40">
                  {isDeleting ? 'Deleting…' : 'Delete Property'}
                </button>
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-sm font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Property modal — two-step */}
      {showModal ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-5" style={{ background: 'rgba(5,10,16,0.82)' }} onClick={(e) => { if (e.target === e.currentTarget && !isCreating) { setShowModal(false); setCreateStep('name'); setSelectedTemplate('blank'); } }}>
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            style={dark
              ? { background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }
              : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.09)' }}
          >
            <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.30), transparent)` }} />
            <div className="p-6">

              {createStep === 'name' ? (
                <>
                  <h2 className="text-base font-semibold tracking-tight" style={{ color: dark ? 'rgba(255,255,255,0.95)' : '#1e293b' }}>New Property</h2>
                  <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.55)' }}>Enter a name to get started. You can change everything after.</p>
                  <div className="mt-5 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: dark ? `rgba(${SANDY_RGB},0.65)` : '#64748b' }}>Property Name</p>
                    <input
                      autoFocus
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && propertyName.trim()) setCreateStep('template'); }}
                      placeholder="e.g. Oceanfront Villa"
                      className="h-11 w-full rounded-xl px-4 text-sm outline-none transition-all"
                      style={dark
                        ? { background: 'rgba(30,30,30,0.80)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }
                        : { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', color: '#1e293b' }}
                    />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => { if (propertyName.trim()) setCreateStep('template'); }} disabled={!propertyName.trim()} className="h-10 flex-1 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50" style={{ background: '#111111', boxShadow: '0 0 20px rgba(0,0,0,0.25)' }}>
                      Continue →
                    </button>
                    <button type="button" onClick={() => { setShowModal(false); setCreateStep('name'); setSelectedTemplate('blank'); }} className="h-10 rounded-xl border px-4 text-sm font-semibold transition-all duration-200" style={dark ? { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.50)' } : { borderColor: 'rgba(0,0,0,0.09)', background: 'rgba(0,0,0,0.03)', color: 'rgba(30,41,59,0.55)' }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-base font-semibold tracking-tight" style={{ color: dark ? 'rgba(255,255,255,0.95)' : '#1e293b' }}>Choose a Template</h2>
                  <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.55)' }}>Pick a starting point. You can add, edit, or remove anything after.</p>
                  <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                    {PROPERTY_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className="flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150"
                        style={selectedTemplate === tpl.id
                          ? { borderColor: `rgba(${SANDY_RGB},0.40)`, background: `rgba(${SANDY_RGB},0.09)` }
                          : dark
                            ? { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }
                            : { borderColor: 'rgba(0,0,0,0.07)', background: 'rgba(0,0,0,0.02)' }}
                      >
                        <span className="mt-0.5 text-xl leading-none">{tpl.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#1e293b' }}>{tpl.name}</p>
                          <p className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.55)' }}>{tpl.description}</p>
                          {tpl.preview.length > 0 && (
                            <p className="mt-0.5 text-[10px]" style={{ color: dark ? 'rgba(255,255,255,0.25)' : 'rgba(30,41,59,0.38)' }}>{tpl.preview.join(' Â· ')}</p>
                          )}
                        </div>
                        {selectedTemplate === tpl.id && (
                          <span className="ml-auto mt-0.5 flex-none text-xs" style={{ color: `rgba(${SANDY_RGB},0.7)` }}>âœ“</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {createError ? <p className="mt-3 text-xs text-rose-400/80">{createError}</p> : null}
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => void handleCreate()} disabled={isCreating} className="h-10 flex-1 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50" style={{ background: '#111111', boxShadow: '0 0 20px rgba(0,0,0,0.25)' }}>
                      {isCreating ? 'Creating…' : 'Create Property'}
                    </button>
                    <button type="button" onClick={() => setCreateStep('name')} disabled={isCreating} className="h-10 rounded-xl border px-4 text-sm font-semibold transition-all duration-200" style={dark ? { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.50)' } : { borderColor: 'rgba(0,0,0,0.09)', background: 'rgba(0,0,0,0.03)', color: 'rgba(30,41,59,0.55)' }}>
                      ← Back
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      ) : null}

      {duplicateTarget ? (
        <DuplicatePropertyModal
          dark={dark}
          sourceProperty={duplicateTarget}
          needsSlot={!isSubscribed || properties.length >= propertySlots}
          onAddSlot={isSubscribed ? () => void handleAddSlot() : undefined}
          onClose={() => setDuplicateTarget(null)}
        />
      ) : null}
    </div>
  );
}
