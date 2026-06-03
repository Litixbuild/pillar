'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Property } from '@/lib/types';
import type { DashboardStats } from '@/lib/propertyEvents';
import ManagerBottomNav from './ManagerBottomNav';
import DuplicatePropertyModal from './DuplicatePropertyModal';
import HomeStats from './HomeStats';
import { PROPERTY_TEMPLATES } from '@/lib/propertyTemplates';

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
  subscriptionStatus,
  hasStripeCustomer,
  managerName,
  referralCode,
  referralDiscountCents,
  activeReferralCount,
  propertySlots,
  dashboardStats,
}: {
  properties: Property[];
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  hasStripeCustomer: boolean;
  managerName: string;
  referralCode: string | null;
  referralDiscountCents: number;
  activeReferralCount: number;
  propertySlots: number;
  dashboardStats: DashboardStats;
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
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);

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

  async function handleStartCheckout() {
    setBillingLoading(true);
    setBillingError(null);
    const res = await fetch('/api/manager/billing/create-checkout', { method: 'POST' });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } else {
      setBillingError('Unable to start checkout. Please try again or contact support.');
      setBillingLoading(false);
    }
  }

  async function handleOpenPortal() {
    setBillingLoading(true);
    setBillingError(null);
    const res = await fetch('/api/manager/billing/portal', { method: 'POST' });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setBillingError(data.error || 'Unable to open billing portal. Please try again or contact support.');
      setBillingLoading(false);
    }
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

  function handleCopyReferral() {
    if (!referralCode) return;
    void navigator.clipboard.writeText(`https://pmpillar.com/ref/${referralCode}`).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    });
  }

  /* ── Theme helpers ── */

  const card = dark
    ? { background: 'rgba(8,8,8,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(0,0,0,0.40)' }
    : { background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(100,80,40,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 20px rgba(100,80,40,0.08)' };

  const cardHeader = dark
    ? { borderBottom: '1px solid rgba(255,255,255,0.07)' }
    : { borderBottom: '1px solid rgba(100,80,40,0.09)' };

  const labelColor = dark ? 'rgba(255,255,255,0.50)' : 'rgba(100,80,40,0.60)';
  const mutedColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(100,80,40,0.55)';
  const headingColor = dark ? '#ffffff' : '#1e293b';

  const badgeBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(100,80,40,0.06)';
  const badgeBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(100,80,40,0.14)';
  const badgeText = dark ? 'rgba(255,255,255,0.60)' : 'rgba(100,80,40,0.60)';

  const propCardStyle = dark
    ? { background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }
    : { background: 'rgba(100,80,40,0.04)', border: '1px solid rgba(100,80,40,0.10)' };

  const propNameColor = dark ? 'rgba(255,255,255,0.90)' : '#1e293b';

  const addBtnStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', color: '#ffffff', boxShadow: '0 0 14px rgba(255,255,255,0.18), 0 0 4px rgba(255,255,255,0.10)' }
    : { borderColor: 'rgba(0,0,0,0.16)', background: '#111111', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.14)' };

  const viewLinkStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)' }
    : { borderColor: 'rgba(100,80,40,0.20)', background: 'rgba(100,80,40,0.06)', color: 'rgba(61,42,10,0.85)' };

  const editLinkStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)' }
    : { borderColor: 'rgba(100,80,40,0.12)', background: 'rgba(100,80,40,0.03)', color: 'rgba(100,80,40,0.65)' };

  const signOutStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.80)' }
    : { borderColor: 'rgba(0,0,0,0.14)', background: '#111111', color: '#fff' };

  const toggleStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.80)' }
    : { borderColor: 'rgba(100,80,40,0.18)', background: 'rgba(255,255,255,0.80)', color: 'rgba(100,80,40,0.70)', backdropFilter: 'blur(8px)' };

  /* ── Modal theme helpers ── */
  const modalOverlayBg = dark ? 'rgba(5,10,16,0.88)' : 'rgba(0,0,0,0.40)';
  const modalCardStyle = dark
    ? { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }
    : { background: 'rgba(255,252,245,0.98)', border: '1px solid rgba(100,80,40,0.14)', boxShadow: '0 24px 80px rgba(100,80,40,0.14)' };
  const modalGradientLine = dark
    ? `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.25), transparent)`
    : `linear-gradient(to right, transparent, rgba(212,175,106,0.50), transparent)`;
  const modalHeadingCls = dark ? 'text-white' : 'text-[#1a1a1a]';
  const modalSubtextColor = dark ? 'rgba(255,255,255,0.40)' : 'rgba(100,80,40,0.55)';
  const modalLabelClr = dark ? `rgba(${SANDY_RGB},0.65)` : 'rgba(100,80,40,0.65)';
  const modalInputCls = dark
    ? 'h-11 w-full rounded-xl border border-white/8 bg-[#1e1e1e]/80 px-4 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-white/20 focus:ring-1 focus:ring-white/10'
    : 'h-11 w-full rounded-xl border border-[rgba(100,80,40,0.15)] bg-[rgba(100,80,40,0.04)] px-4 text-sm text-[#1a1a1a] outline-none transition-all placeholder:text-[rgba(100,80,40,0.30)] focus:border-[rgba(100,80,40,0.28)]';
  const modalPrimaryBtnStyle = dark
    ? { background: '#111111', boxShadow: '0 0 20px rgba(0,0,0,0.30)', color: '#fff' }
    : { background: '#111111', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', color: '#fff' };
  const modalSecondaryBtnCls = dark
    ? 'h-10 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 text-sm font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75'
    : 'h-10 rounded-xl border border-[rgba(100,80,40,0.14)] bg-[rgba(100,80,40,0.04)] px-4 text-sm font-semibold text-[rgba(100,80,40,0.60)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)]';
  const tplCardStyle = (selected: boolean) => selected
    ? (dark ? { borderColor: `rgba(${SANDY_RGB},0.35)`, background: `rgba(${SANDY_RGB},0.08)` } : { borderColor: 'rgba(100,80,40,0.35)', background: 'rgba(100,80,40,0.07)' })
    : (dark ? { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' } : { borderColor: 'rgba(100,80,40,0.10)', background: 'rgba(100,80,40,0.02)' });
  const tplNameColor = dark ? 'rgba(255,255,255,0.90)' : '#1e293b';
  const tplDescColor = dark ? 'rgba(255,255,255,0.40)' : 'rgba(100,80,40,0.55)';
  const tplPreviewColor = dark ? 'rgba(255,255,255,0.25)' : 'rgba(100,80,40,0.40)';
  const tplCheckColor = dark ? `rgba(${SANDY_RGB},0.7)` : '#7A5A1E';

  return (
    <div className="relative min-h-screen">
      {/* Fixed background layers */}
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8">

        {/* Header row — greeting left, controls right */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: dark ? 'rgba(255,255,255,0.50)' : 'rgba(100,80,40,0.55)' }}>
              Manager Portal
            </p>
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight" style={{ color: headingColor }}>
              Hey, {managerName.split(' ')[0] || managerName}
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

        <HomeStats stats={dashboardStats} managerName={managerName} />

        <div className="hidden">
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
                    const liveHref = slug ? `/p/${encodeURIComponent(slug)}` : null;
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
                            className="flex-none rounded-lg border border-rose-500/20 bg-rose-500/8 p-1.5 text-rose-400/50 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400/90"
                            title="Delete property"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {liveHref ? (
                            <Link href={liveHref} target="_blank" className="inline-flex h-8 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200" style={viewLinkStyle}>
                              View live
                            </Link>
                          ) : null}
                          {slug ? (
                            <Link href={`/manager/properties/${encodeURIComponent(slug)}/edit`} className="inline-flex h-8 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200" style={editLinkStyle}>
                              Edit property
                            </Link>
                          ) : null}
                          {slug ? (
                            <button
                              type="button"
                              onClick={() => setDuplicateTarget(p)}
                              className="inline-flex h-8 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-all duration-200"
                              style={editLinkStyle}
                            >
                              Duplicate
                            </button>
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
          <div className="overflow-hidden rounded-2xl" style={card}>
            <div className="flex items-center justify-between px-6 py-4" style={cardHeader}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
                Billing
              </p>
              {isSubscribed && (
                <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(34,197,94,0.10)', borderColor: 'rgba(34,197,94,0.25)', color: 'rgb(34,197,94)' }}>
                  Active
                </span>
              )}
              {subscriptionStatus === 'past_due' && (
                <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(251,146,60,0.12)', borderColor: 'rgba(251,146,60,0.30)', color: 'rgb(251,146,60)' }}>
                  Past due
                </span>
              )}
              {subscriptionStatus === 'canceled' && (
                <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(248,113,113,0.10)', borderColor: 'rgba(248,113,113,0.25)', color: 'rgb(248,113,113)' }}>
                  Canceled
                </span>
              )}
            </div>
            <div className="p-6">
              {isSubscribed ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>
                      Pillar Subscription
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: mutedColor }}>
                      {properties.length} of {propertySlots} {propertySlots === 1 ? 'property slot' : 'property slots'} used
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleOpenPortal()}
                    disabled={billingLoading}
                    className="inline-flex h-9 items-center rounded-xl border px-4 text-xs font-semibold transition-all duration-200 disabled:opacity-40"
                    style={dark
                      ? { borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }
                      : { borderColor: 'rgba(100,80,40,0.18)', background: 'rgba(100,80,40,0.05)', color: 'rgba(61,42,10,0.85)' }}
                  >
                    {billingLoading ? 'Opening…' : 'Manage billing →'}
                  </button>
                  {billingError ? <p className="text-xs text-rose-400">{billingError}</p> : null}
                </div>
              ) : subscriptionStatus === 'past_due' ? (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: mutedColor }}>
                    Your last payment failed. Update your payment method to restore access.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleOpenPortal()}
                    disabled={billingLoading}
                    className="inline-flex h-9 items-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 text-xs font-semibold text-orange-400 transition-all duration-200 hover:bg-orange-500/20 disabled:opacity-40"
                  >
                    {billingLoading ? 'Opening…' : 'Update payment method →'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>
                      Start your subscription
                    </p>
                    <p className="mt-1 text-xs" style={{ color: mutedColor }}>
                      Subscribe to unlock property management and all Pillar features.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleStartCheckout()}
                    disabled={billingLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-all duration-300 disabled:opacity-40"
                    style={addBtnStyle}
                  >
                    {billingLoading ? 'Loading…' : 'Subscribe now →'}
                  </button>
                  {billingError ? <p className="text-xs text-rose-400">{billingError}</p> : null}
                </div>
              )}
            </div>
          </div>
          {/* Referral card */}
          {referralCode ? (
            <div className="overflow-hidden rounded-2xl" style={card}>
              <div className="flex items-center justify-between px-6 py-4" style={cardHeader}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
                  Refer &amp; Save
                </p>
                {referralDiscountCents > 0 && (
                  <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(34,197,94,0.10)', borderColor: 'rgba(34,197,94,0.25)', color: 'rgb(34,197,94)' }}>
                    ${(referralDiscountCents / 100).toFixed(0)} off/mo
                  </span>
                )}
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>
                    Invite property managers, earn $1/month off
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: mutedColor }}>
                    For every manager you refer who subscribes, you get $1 off your monthly bill — forever, as long as they stay active.
                  </p>
                </div>

                {/* Referral link copy row */}
                <div className="flex items-center gap-2 overflow-hidden rounded-xl border px-3 py-2.5" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs" style={{ color: mutedColor }}>
                    pmpillar.com/ref/{referralCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="flex-none rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
                    style={dark
                      ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }
                      : { background: '#111111', color: '#fff' }}
                  >
                    {referralCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Active referral count */}
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <div className="text-2xl font-light" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#1e293b' }}>
                    {activeReferralCount}
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: dark ? 'rgba(255,255,255,0.70)' : '#1e293b' }}>
                      active {activeReferralCount === 1 ? 'referral' : 'referrals'}
                    </p>
                    <p className="text-[11px]" style={{ color: mutedColor }}>
                      ${activeReferralCount} off your next bill
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>{/* end hidden */}

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

      <ManagerBottomNav />

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

      {/* Add Property modal — two-step, light/dark aware */}
      {showModal ? (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-5" style={{ background: modalOverlayBg }} onClick={(e) => { if (e.target === e.currentTarget && !isCreating) { setShowModal(false); setCreateStep('name'); setSelectedTemplate('blank'); } }}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl" style={modalCardStyle}>
            <div className="h-px w-full" style={{ background: modalGradientLine }} />
            <div className="p-6">

              {createStep === 'name' ? (
                <>
                  <h2 className={`text-base font-semibold tracking-tight ${modalHeadingCls}`}>New Property</h2>
                  <p className="mt-1 text-xs" style={{ color: modalSubtextColor }}>Enter a name to get started. You can change everything after.</p>
                  <div className="mt-5 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: modalLabelClr }}>Property Name</p>
                    <input autoFocus type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && propertyName.trim()) setCreateStep('template'); }} placeholder="e.g. Oceanfront Villa" className={modalInputCls} />
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => { if (propertyName.trim()) setCreateStep('template'); }} disabled={!propertyName.trim()} className="h-10 flex-1 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50" style={modalPrimaryBtnStyle}>
                      Continue →
                    </button>
                    <button type="button" onClick={() => { setShowModal(false); setCreateStep('name'); setSelectedTemplate('blank'); }} className={modalSecondaryBtnCls}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className={`text-base font-semibold tracking-tight ${modalHeadingCls}`}>Choose a Template</h2>
                  <p className="mt-1 text-xs" style={{ color: modalSubtextColor }}>Pick a starting point. You can add, edit, or remove anything after.</p>
                  <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                    {PROPERTY_TEMPLATES.map((tpl) => (
                      <button key={tpl.id} type="button" onClick={() => setSelectedTemplate(tpl.id)} className="flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150" style={tplCardStyle(selectedTemplate === tpl.id)}>
                        <span className="mt-0.5 text-xl leading-none">{tpl.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: tplNameColor }}>{tpl.name}</p>
                          <p className="text-[11px]" style={{ color: tplDescColor }}>{tpl.description}</p>
                          {tpl.preview.length > 0 && <p className="mt-0.5 text-[10px]" style={{ color: tplPreviewColor }}>{tpl.preview.join(' Â· ')}</p>}
                        </div>
                        {selectedTemplate === tpl.id && <span className="ml-auto mt-0.5 flex-none text-xs" style={{ color: tplCheckColor }}>âœ“</span>}
                      </button>
                    ))}
                  </div>
                  {createError ? <p className="mt-3 text-xs text-rose-400/80">{createError}</p> : null}
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => void handleCreate()} disabled={isCreating} className="h-10 flex-1 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50" style={modalPrimaryBtnStyle}>
                      {isCreating ? 'Creating…' : 'Create Property'}
                    </button>
                    <button type="button" onClick={() => setCreateStep('name')} disabled={isCreating} className={modalSecondaryBtnCls}>
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
          onClose={() => setDuplicateTarget(null)}
        />
      ) : null}
    </div>
  );
}
