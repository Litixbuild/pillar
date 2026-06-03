'use client';

import { useState } from 'react';
import type { Property } from '@/lib/types';

const SANDY_RGB = '245,237,213';

interface Props {
  dark: boolean;
  sourceProperty: Property;
  needsSlot?: boolean;
  onAddSlot?: () => void;
  onClose: () => void;
}

export default function DuplicatePropertyModal({ dark, sourceProperty, needsSlot, onAddSlot, onClose }: Props) {
  const [newName, setNewName] = useState(`Copy of ${sourceProperty.PropertyName || 'Property'}`);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    const name = newName.trim();
    if (!name || isDuplicating) return;
    setIsDuplicating(true);
    setError(null);

    const res = await fetch(
      `/api/manager/properties/${encodeURIComponent(sourceProperty.Slug || '')}/duplicate`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error === 'slot_limit_reached'
        ? "You've reached your property slot limit. Add a slot to continue."
        : (data.error || 'Failed to duplicate. Please try again.'));
      setIsDuplicating(false);
      return;
    }

    const { slug } = (await res.json()) as { slug: string };
    window.location.href = `/manager/properties/${encodeURIComponent(slug)}/edit`;
  }

  function handleAddSlot() {
    if (!onAddSlot || isAddingSlot) return;
    setIsAddingSlot(true);
    onAddSlot();
  }

  const cancelBtn = (
    <button
      type="button"
      onClick={onClose}
      disabled={isDuplicating || isAddingSlot}
      className="h-10 rounded-xl border px-4 text-sm font-semibold transition-all duration-200"
      style={dark
        ? { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.50)' }
        : { borderColor: 'rgba(0,0,0,0.09)', background: 'rgba(0,0,0,0.03)', color: 'rgba(30,41,59,0.55)' }}
    >
      Cancel
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-5"
      style={{ background: 'rgba(5,10,16,0.88)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isDuplicating && !isAddingSlot) onClose(); }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        style={dark
          ? { background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }
          : { background: '#ffffff', border: '1px solid rgba(0,0,0,0.09)' }}
      >
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, rgba(${SANDY_RGB},0.30), transparent)` }}
        />
        <div className="p-6">
          <h2 className="text-base font-semibold tracking-tight" style={{ color: dark ? 'rgba(255,255,255,0.95)' : '#1e293b' }}>
            Duplicate Property
          </h2>

          {needsSlot ? (
            <>
              <p className="mt-2 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(30,41,59,0.60)' }}>
                {onAddSlot
                  ? `You've used all your property slots. Add an additional slot for $9.99/mo to duplicate ${sourceProperty.PropertyName || 'this property'}.`
                  : 'An active subscription is required to duplicate properties. Set up billing in Account settings.'}
              </p>
              <div className="mt-5 flex gap-2">
                {onAddSlot ? (
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    disabled={isAddingSlot}
                    className="h-10 flex-1 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                    style={{ background: `rgba(${SANDY_RGB},0.15)`, border: `1px solid rgba(${SANDY_RGB},0.25)`, color: dark ? `rgba(${SANDY_RGB},0.9)` : 'rgba(120,90,40,0.90)' }}
                  >
                    {isAddingSlot ? 'Upgrading…' : 'Add Property Slot — $9.99/mo'}
                  </button>
                ) : null}
                {cancelBtn}
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.55)' }}>
                Creates a copy with all amenities, categories, and branding. Address, WiFi, and garage code are left blank.
              </p>

              <div className="mt-5 space-y-1.5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: dark ? `rgba(${SANDY_RGB},0.65)` : '#64748b' }}
                >
                  New Property Name
                </p>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleDuplicate(); }}
                  placeholder="e.g. Copy of Oceanfront Villa"
                  className="h-11 w-full rounded-xl px-4 text-sm outline-none transition-all"
                  style={dark
                    ? { background: 'rgba(30,30,30,0.80)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }
                    : { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.09)', color: '#1e293b' }}
                />
              </div>

              {error ? <p className="mt-3 text-xs text-rose-400/80">{error}</p> : null}

              {isDuplicating ? (
                <div className="mt-5">
                  <div className="mb-2 h-1 w-full overflow-hidden rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                    <div
                      className="h-full animate-pulse rounded-full"
                      style={{ background: `rgba(${SANDY_RGB},0.4)`, width: '60%' }}
                    />
                  </div>
                  <p className="text-center text-xs" style={{ color: dark ? 'rgba(255,255,255,0.40)' : 'rgba(30,41,59,0.45)' }}>Duplicating property and copying files…</p>
                </div>
              ) : (
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDuplicate()}
                    disabled={!newName.trim()}
                    className="h-10 flex-1 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                    style={{ background: `rgba(${SANDY_RGB},0.15)`, border: `1px solid rgba(${SANDY_RGB},0.25)`, color: dark ? `rgba(${SANDY_RGB},0.9)` : 'rgba(120,90,40,0.90)' }}
                  >
                    Duplicate Property
                  </button>
                  {cancelBtn}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
