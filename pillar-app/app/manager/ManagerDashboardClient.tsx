'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Property } from '@/lib/types';

export default function ManagerDashboardClient({
  properties,
  isSubscribed,
}: {
  properties: Property[];
  isSubscribed: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  return (
    <>
      {/* Add Property button */}
      <div className="mb-5">
        {isSubscribed ? (
          <button
            type="button"
            onClick={() => { setShowModal(true); setPropertyName(''); setCreateError(null); }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-teal-500/35 bg-teal-500/10 px-4 text-sm font-semibold text-teal-300/90 shadow-[0_0_20px_rgba(20,184,166,0.18)] transition-all duration-300 hover:border-teal-400/55 hover:bg-teal-500/18 hover:shadow-[0_0_32px_rgba(20,184,166,0.32)]"
          >
            <span className="text-base leading-none">+</span> Add Property
          </button>
        ) : (
          <div title="Set up billing to add properties">
            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.07] bg-white/3 px-4 text-sm font-semibold text-white/25"
            >
              <span className="text-base leading-none">+</span> Add Property
            </button>
            <p className="mt-1.5 text-[11px] text-white/30">Active subscription required</p>
          </div>
        )}
      </div>

      {/* Property list */}
      {properties.length === 0 ? (
        <p className="text-sm text-white/35">No properties yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => {
            const slug = (p.Slug || '').trim();
            const liveHref = slug ? `/p/${encodeURIComponent(slug)}` : null;

            return (
              <div
                key={`${p.PropertyName}-${p.PropertyAddress}`}
                className="rounded-xl border border-white/[0.07] bg-[#080f18]/60 p-4 transition-all duration-200 hover:border-white/11 hover:bg-[#080f18]/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white/90">{p.PropertyName || '—'}</div>
                    {p.PropertyAddress ? (
                      <div className="mt-0.5 truncate text-xs text-white/38">{p.PropertyAddress}</div>
                    ) : null}
                  </div>
                  {slug ? <div className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-teal-400/60" /> : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {liveHref ? (
                    <Link
                      href={liveHref}
                      target="_blank"
                      className="inline-flex h-8 items-center justify-center rounded-xl border border-teal-500/22 bg-teal-500/8 px-3 text-xs font-semibold text-teal-300/75 transition-all duration-200 hover:bg-teal-500/14 hover:text-teal-300"
                    >
                      View live ↗
                    </Link>
                  ) : null}

                  {slug ? (
                    <Link
                      href={`/manager/properties/${encodeURIComponent(slug)}/edit`}
                      className="inline-flex h-8 items-center justify-center rounded-xl border border-white/[0.07] bg-white/3 px-3 text-xs font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75"
                    >
                      Edit property
                    </Link>
                  ) : null}

                  {!slug ? (
                    <span className="text-xs text-rose-400/55">Missing slug — add one in Supabase</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Property modal */}
      {showModal ? (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center px-5"
          style={{ background: 'rgba(5,10,16,0.82)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/8 bg-[#0a1520] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            {/* Top glow */}
            <div className="h-px w-full bg-linear-to-r from-transparent via-teal-400/20 to-transparent" />

            <div className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-white">New Property</h2>
              <p className="mt-1 text-xs text-white/40">Enter a name to get started. You can change everything after.</p>

              <div className="mt-5 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
                  Property Name
                </p>
                <input
                  type="text"
                  autoFocus
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
                  placeholder="e.g. Oceanfront Villa"
                  className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
                />
              </div>

              {createError ? (
                <p className="mt-3 text-xs text-rose-400/80">{createError}</p>
              ) : null}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={!propertyName.trim() || isCreating}
                  className="h-10 flex-1 rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.42)] disabled:opacity-50"
                >
                  {isCreating ? 'Creating…' : 'Create Property'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-10 rounded-xl border border-white/[0.07] bg-white/3 px-4 text-sm font-semibold text-white/50 transition-all duration-200 hover:bg-white/[0.07] hover:text-white/75"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
