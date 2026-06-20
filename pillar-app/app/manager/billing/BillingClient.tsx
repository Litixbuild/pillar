'use client';

import { useState, useEffect } from 'react';
import ManagerBottomNav from '@/app/manager/ManagerBottomNav';

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

export default function BillingClient({
  isSubscribed,
  subscriptionStatus,
  referralCode,
  referralDiscountCents,
  activeReferralCount,
  propertySlots,
  propertyCount,
}: {
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  referralCode: string | null;
  referralDiscountCents: number;
  activeReferralCount: number;
  propertySlots: number;
  propertyCount: number;
}) {
  const [dark, setDark] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
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
  const addBtnStyle = dark
    ? { borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', color: '#ffffff' }
    : { borderColor: 'rgba(0,0,0,0.16)', background: '#111111', color: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.14)' };
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
            <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight" style={{ color: dark ? '#ffffff' : '#1e293b' }}>Billing</h1>
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

        <div className="space-y-4">

          {/* Billing card */}
          <div className="overflow-hidden rounded-2xl" style={card}>
            <div className="flex items-center justify-between px-6 py-4" style={cardHeader}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: labelColor }}>
                Subscription
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
                      {propertyCount} of {propertySlots} {propertySlots === 1 ? 'property slot' : 'property slots'} used
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
                    data-tour="billing-subscribe"
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

        </div>
      </div>

      <ManagerBottomNav />
    </div>
  );
}
