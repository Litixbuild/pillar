'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StayDamagePhoto } from '@/lib/stayDamageReports';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 8h2.2l1.1-2h9.4l1.1 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function DamageSection({
  slug,
  hasStay,
  photos,
}: {
  slug: string;
  hasStay: boolean;
  photos: StayDamagePhoto[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    if (caption.trim()) fd.append('caption', caption.trim());

    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/damage`, {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      setOpen(false);
      setFiles([]);
      setCaption('');
      router.refresh();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Upload failed. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
      <div className="flex items-center justify-between border-b border-[rgba(100,80,40,0.09)] px-6 py-4 dark:border-white/7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
          Reported Damage
        </p>
        {photos.length > 0 && (
          <span className="flex-none rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {photos.length}
          </span>
        )}
      </div>

      <div className="px-6 py-5">
        {!hasStay ? (
          <p className="text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
            Confirm a tenant stay above before documenting damage.
          </p>
        ) : (
          <>
            {photos.length === 0 ? (
              <p className="text-sm text-[#1e293b] dark:text-white/70">No damage reported for this stay.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div key={p.id} className="overflow-hidden rounded-xl border border-[rgba(100,80,40,0.10)] dark:border-white/8">
                    <img src={p.photo_url} alt={p.caption ?? 'Damage photo'} className="h-28 w-full object-cover" />
                    <div className="px-2.5 py-2">
                      {p.caption && (
                        <p className="line-clamp-2 text-[11px] text-[#1e293b] dark:text-white/70">{p.caption}</p>
                      )}
                      <p className="mt-0.5 text-[10px] text-[rgba(100,80,40,0.45)] dark:text-white/30">{formatDate(p.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] px-3 text-xs font-semibold text-[rgba(100,80,40,0.65)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] dark:border-white/8 dark:bg-white/3 dark:text-white/55"
              >
                <CameraIcon />
                Add Damage Photos
              </button>
            ) : (
              <div className="mt-4 space-y-2.5">
                <label className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[rgba(100,80,40,0.25)] bg-[rgba(100,80,40,0.04)] px-4 py-5 text-center dark:border-white/15 dark:bg-white/3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                  <span className="text-xs font-semibold text-[#7a5c08] dark:text-[#D4AF37]">
                    {files.length > 0 ? `${files.length} photo${files.length === 1 ? '' : 's'} selected` : 'Tap to choose photos'}
                  </span>
                </label>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe the damage (e.g. broken lamp in living room)…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.03)] px-3 py-2 text-sm text-[#1e293b] outline-none placeholder:text-[rgba(100,80,40,0.40)] dark:border-white/8 dark:bg-white/3 dark:text-white dark:placeholder:text-white/30"
                />

                {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={files.length === 0 || submitting}
                    className="h-9 flex-1 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #A87C0A 100%)' }}
                  >
                    {submitting ? 'Uploading…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setFiles([]); setCaption(''); setError(null); }}
                    disabled={submitting}
                    className="h-9 rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] px-3 text-xs font-semibold text-[rgba(100,80,40,0.60)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] disabled:opacity-50 dark:border-white/8 dark:bg-white/3 dark:text-white/45"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
