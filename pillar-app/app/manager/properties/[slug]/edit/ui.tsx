'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropertyExperience from '@/components/property/PropertyExperience';
import type { AirtableFields, ManagerLayoutItem, Property } from '@/lib/airtable';

async function saveLayout(slug: string, layout: ManagerLayoutItem[]) {
  const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/layout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ layout }),
  });

  const rawText = await res.text();
  let parsed: unknown = null;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsed = null;
  }

  const data = (parsed && typeof parsed === 'object' ? parsed : null) as
    | { error?: unknown }
    | null;

  if (!res.ok) {
    const errFromJson =
      typeof data?.error === 'string' && data.error.trim() ? data.error.trim() : null;
    const errFromText = rawText && rawText.trim() ? rawText.trim().slice(0, 500) : null;
    throw new Error(errFromJson || errFromText || `Save failed (HTTP ${res.status})`);
  }
}

export default function ManagerPropertyEditorClient({
  slug,
  property,
  rawFields,
  initialLayout,
}: {
  slug: string;
  property: Property;
  rawFields: AirtableFields;
  initialLayout: ManagerLayoutItem[];
}) {
  const [layout, setLayout] = useState<ManagerLayoutItem[]>(initialLayout);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newField, setNewField] = useState('');

  const persist = async (next: ManagerLayoutItem[]) => {
    setIsSaving(true);
    setError(null);
    try {
      await saveLayout(slug, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      <PropertyExperience
        slug={slug}
        property={property}
        managerLayout={layout}
        rawFields={rawFields}
        editableCustomWindows
        onAddWindow={() => setIsAddOpen(true)}
        onRemoveWindow={async (index) => {
          const next = layout.filter((_, i) => i !== index);
          setLayout(next);
          try {
            await persist(next);
          } catch {
            setLayout(layout);
          }
        }}
        onReorderWindows={async (from, to) => {
          if (from === to) return;
          const next = layout.slice();
          const [moved] = next.splice(from, 1);
          if (!moved) return;
          next.splice(to, 0, moved);
          setLayout(next);
          try {
            await persist(next);
          } catch {
            setLayout(layout);
          }
        }}
      />

      {/* Bottom utility bar (manager only) */}
      <div className="fixed inset-x-0 bottom-4 z-[40] mx-auto w-full max-w-md px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.22em]">Manager editor</div>
          <div className="flex items-center gap-2">
            <Link
              href="/manager"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
            >
              Back
            </Link>
            <Link
              href={`/p/${encodeURIComponent(slug)}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
            >
              View live
            </Link>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => persist(layout)}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-3 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        {error ? (
          <div className="mt-2 rounded-2xl border border-red-500/20 bg-red-500/15 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </div>

      {/* Add window modal */}
      {isAddOpen ? (
        <div className="fixed inset-0 z-[50] flex items-end justify-center bg-black/60 p-6 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0E0E0E] p-5 text-white shadow-2xl">
            <div className="lux-title text-lg">Add a window</div>
            <div className="mt-2 text-sm text-white/70">
              Type the Airtable column name to pull content from (e.g. <span className="font-mono">MassageChair</span>).
            </div>

            <input
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              placeholder="Airtable column name"
              className="mt-4 h-11 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:ring-2 focus:ring-white/20"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setNewField('');
                }}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newField.trim() || isSaving}
                onClick={async () => {
                  const field = newField.trim();
                  const next = [...layout, { field }];
                  setLayout(next);
                  setIsAddOpen(false);
                  setNewField('');
                  try {
                    await persist(next);
                  } catch {
                    setLayout(layout);
                  }
                }}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
