'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/lib/types';

const SANDY = '#F5EDD5';
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

export default function ManagerDashboardClient({
  properties,
  isSubscribed,
  managerName,
}: {
  properties: Property[];
  isSubscribed: boolean;
  managerName: string;
}) {
  const [dark, setDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      body: JSON.stringify({ name }),
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

  /* ── Theme helpers — both modes use sandy palette, different backgrounds ── */

  const card = dark
    ? { background: 'rgba(18,18,18,0.78)', border: `1px solid rgba(${SANDY_RGB},0.14)`, backdropFilter: 'blur(20px)' }
    : { background: 'rgba(255,255,255,0.14)', border: `1px solid rgba(${SANDY_RGB},0.2)`, backdropFilter: 'blur(16px)' };

  const cardHeader = { borderBottom: `1px solid rgba(${SANDY_RGB},0.14)` };

  const labelColor = `rgba(${SANDY_RGB},${dark ? '0.90' : '0.70'})`;
  const mutedColor = `rgba(255,255,255,${dark ? '0.72' : '0.65'})`;
  const badgeBg = `rgba(${SANDY_RGB},0.12)`;
  const badgeBorder = `rgba(${SANDY_RGB},${dark ? '0.30' : '0.3'})`;
  const badgeText = `rgba(${SANDY_RGB},0.90)`;

  const propCardStyle = dark
    ? { background: 'rgba(10,10,10,0.60)', border: `1px solid rgba(${SANDY_RGB},0.12)`, backdropFilter: 'blur(8px)' }
    : { background: 'rgba(255,255,255,0.10)', border: `1px solid rgba(${SANDY_RGB},0.18)`, backdropFilter: 'blur(8px)' };

  const addBtnStyle = {
    borderColor: `rgba(${SANDY_RGB},0.4)`,
    background: `rgba(${SANDY_RGB},0.12)`,
    color: SANDY,
    boxShadow: `0 0 20px rgba(${SANDY_RGB},0.12)`,
  };

  const viewLinkStyle = {
    borderColor: `rgba(${SANDY_RGB},0.3)`,
    background: `rgba(${SANDY_RGB},0.10)`,
    color: SANDY,
  };

  const editLinkStyle = {
    borderColor: `rgba(${SANDY_RGB},0.18)`,
    background: `rgba(${SANDY_RGB},0.06)`,
    color: 'rgba(255,255,255,0.75)',
  };

  const signOutStyle = {
    borderColor: `rgba(${SANDY_RGB},0.25)`,
    background: `rgba(${SANDY_RGB},0.07)`,
    color: SANDY,
  };

  const toggleStyle = {
    borderColor: `rgba(${SANDY_RGB},0.25)`,
    background: `rgba(${SANDY_RGB},0.08)`,
    color: SANDY,
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background layers — driven by CSS dark class to avoid flash */}
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: 'url(/images/mainbackground.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-8">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: labelColor }}>
              Manager Portal
            </p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-white">
              Hello, {managerName}
            </h1>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={toggleMode}
              className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
              style={toggleStyle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
              style={toggleStyle}
              title="Back to home"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="space-y-4">

          {/* Properties card */}
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.25)]" style={card}>
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
                {isSubscribed ? (
                  <button
                    type="button"
                    onClick={() => { setShowModal(true); setPropertyName(''); setCreateError(null); }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-300"
                    style={addBtnStyle}
                  >
                    <span className="text-base leading-none">+</span> Add Property
                  </button>
                ) : (
                  <div title="Set up billing to add properties">
                    <button type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.07] bg-white/3 px-4 text-sm font-semibold text-white/25">
                      <span className="text-base leading-none">+</span> Add Property
                    </button>
                    <p className="mt-1.5 text-[11px]" style={{ color: mutedColor }}>Active subscription required</p>
                  </div>
                )}
              </div>

              {/* Property list */}
              {properties.length === 0 ? (
                <p className="text-sm" style={{ color: mutedColor }}>No properties yet. Add your first one above.</p>
              ) : (
                <div className="space-y-3">
                  {properties.map((p) => {
                    const slug = (p.Slug || '').trim();
                    const liveHref = slug ? `/p/${encodeURIComponent(slug)}` : null;
                    return (
                      <div key={`${p.PropertyName}-${p.PropertyAddress}`} className="rounded-xl p-4 transition-all duration-200" style={propCardStyle}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white/90">{p.PropertyName || '—'}</div>
                            {p.PropertyAddress ? (
                              <div className="mt-0.5 truncate text-xs" style={{ color: mutedColor }}>{p.PropertyAddress}</div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(p)}
                            className="flex-none rounded-lg border border-rose-500/20 bg-rose-500/8 p-1.5 text-rose-400/50 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400/90"
                            title="Delete property"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {liveHref ? (
                            <Link href={liveHref} target="_blank" className="inline-flex h-8 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200" style={viewLinkStyle}>
                              View live ↗
                            </Link>
                          ) : null}
                          {slug ? (
                            <Link href={`/manager/properties/${encodeURIComponent(slug)}/edit`} className="inline-flex h-8 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200" style={editLinkStyle}>
                              Edit property
                            </Link>
                          ) : null}
                          {!slug ? <span className="text-xs text-rose-400/55">Missing slug — add one in Supabase</span> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Billing card */}
          <div className="overflow-hidden rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.25)]" style={card}>
            <div className="px-6 py-4" style={cardHeader}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
                Billing
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm" style={{ color: mutedColor }}>
                Stripe integration coming soon. Once connected, subscription checkout and invoices will appear here.
              </p>
              <p className="mt-2 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.45)' }}>
                No payments are being collected yet.
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <form action="/api/manager/logout" method="post" className="w-full max-w-xs">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-200"
              style={signOutStyle}
            >
              Sign out
            </button>
          </form>
          <Image src="/images/pillarlogowhite.png" alt="Pillar" width={48} height={32} className="mt-2 opacity-20" />
        </div>
      </div>

      {/* Delete modal — always dark */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-5" style={{ background: 'rgba(5,10,16,0.88)' }} onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/8 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(248,113,113,0.3), transparent)' }} />
            <div className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-white">Delete Property</h2>
              <p className="mt-1 text-xs text-white/40">This cannot be undone. Type <span className="font-semibold text-white/70">{deleteTarget.PropertyName || deleteTarget.Slug}</span> to confirm.</p>
              <div className="mt-5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400/55">Property Name</p>
                <input autoFocus type="text" value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && deleteConfirmName === (deleteTarget.PropertyName || deleteTarget.Slug)) void handleDelete(); }} placeholder={deleteTarget.PropertyName || deleteTarget.Slug || ''} className="h-11 w-full rounded-xl border border-white/8 bg-[#1e1e1e]/80 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-rose-500/35 focus:ring-1 focus:ring-rose-500/18" />
              </div>
              {deleteError ? <p className="mt-3 text-xs text-rose-400/80">{deleteError}</p> : null}
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => void handleDelete()} disabled={deleteConfirmName !== (deleteTarget.PropertyName || deleteTarget.Slug) || isDeleting} className="h-10 flex-1 rounded-xl border border-rose-500/30 bg-rose-500/15 text-sm font-semibold text-rose-300 transition-all duration-200 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed">
                  {isDeleting ? 'Deleting…' : 'Delete Property'}
                </button>
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="h-10 rounded-xl border border-white/[0.07] bg-white/3 px-4 text-sm font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Property modal — always dark */}
      {showModal ? (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-5" style={{ background: 'rgba(5,10,16,0.82)' }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/8 bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.25), transparent)` }} />
            <div className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-white">New Property</h2>
              <p className="mt-1 text-xs text-white/40">Enter a name to get started. You can change everything after.</p>
              <div className="mt-5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: `rgba(${SANDY_RGB},0.65)` }}>Property Name</p>
                <input autoFocus type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }} placeholder="e.g. Oceanfront Villa" className="h-11 w-full rounded-xl border border-white/8 bg-[#1e1e1e]/80 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-[#F5EDD5]/25 focus:ring-1 focus:ring-[#F5EDD5]/12" />
              </div>
              {createError ? <p className="mt-3 text-xs text-rose-400/80">{createError}</p> : null}
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => void handleCreate()} disabled={!propertyName.trim() || isCreating} className="h-10 flex-1 rounded-xl text-sm font-semibold text-[#3d2a0a] transition-all duration-300 disabled:opacity-50" style={{ background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, boxShadow: `0 0 20px rgba(${SANDY_RGB},0.22)` }}>
                  {isCreating ? 'Creating…' : 'Create Property'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="h-10 rounded-xl border border-white/[0.07] bg-white/3 px-4 text-sm font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75">
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
