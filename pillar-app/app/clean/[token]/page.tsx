'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { compressImageFiles } from '@/lib/clientImageCompress';

export const dynamic = 'force-dynamic';

interface LinkInfo {
  propertyName: string;
  hasActiveStay: boolean;
}

function GateBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-10 opacity-0 transition-opacity duration-700 dark:opacity-100" style={{ backgroundImage: 'url(/images/bg3.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div className="fixed inset-0 -z-10 opacity-100 transition-opacity duration-700 dark:opacity-0" style={{ backgroundImage: 'url(/images/White.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
    </>
  );
}

function CameraIcon({ className = 'h-7 w-7 text-[#7a5c08] dark:text-[#D4AF37]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 8h2.2l1.1-2h9.4l1.1 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-emerald-500" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <GateBackground />
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
        <div className="flex flex-col items-center px-7 py-8 text-center">{children}</div>
      </div>
    </div>
  );
}

export default function CleanerUploadPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch(`/api/clean/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as LinkInfo & { error?: string };
        if (!r.ok) {
          setLoadError(d.error ?? 'This link is invalid.');
          return;
        }
        setInfo(d);
      })
      .catch(() => setLoadError('Could not load this link. Check your connection and try again.'));
  }, [token]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [files]);

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);

    const compressed = await compressImageFiles(files);
    const fd = new FormData();
    compressed.forEach((f) => fd.append('files', f));
    if (name.trim()) fd.append('name', name.trim());

    try {
      const res = await fetch(`/api/clean/${encodeURIComponent(token)}`, { method: 'POST', body: fd });
      if (res.ok) {
        setDone(true);
      } else {
        const text = await res.text();
        let message = `Upload failed (HTTP ${res.status}). Please try again.`;
        try {
          const d = JSON.parse(text) as { error?: string };
          if (d.error) message = d.error;
        } catch {
          console.error('[cleaner upload] non-JSON error response:', text.slice(0, 300));
        }
        setError(message);
      }
    } catch (e) {
      console.error('[cleaner upload] network error:', e);
      setError('Could not reach the server. Check your connection and try again.');
    }
    setSubmitting(false);
  }

  if (loadError) {
    return (
      <Card>
        <p className="text-sm text-[#1e293b] dark:text-white/80">{loadError}</p>
      </Card>
    );
  }

  if (!info) {
    return <Card><div /></Card>;
  }

  if (!info.hasActiveStay) {
    return (
      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">
          {info.propertyName}
        </p>
        <h1 className="mt-2 text-lg font-light leading-snug text-slate-900 dark:text-white">
          No active stay right now
        </h1>
        <p className="mt-2 text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
          Ask the property manager to confirm the new tenant in their dashboard before uploading cleaning photos.
        </p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <span
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(16,185,129,0.12)' }}
        >
          <CheckIcon />
        </span>
        <h1 className="text-lg font-light text-slate-900 dark:text-white">Thanks — logged</h1>
        <p className="mt-2 text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
          Your photos were saved to {info.propertyName}&apos;s current stay record.
        </p>
        <button
          type="button"
          onClick={() => { setDone(false); setFiles([]); }}
          className="mt-6 h-11 w-full rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.04)] text-sm font-semibold text-[rgba(100,80,40,0.65)] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] dark:border-white/8 dark:bg-white/3 dark:text-white/55"
        >
          Upload more photos
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <span
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(168,126,10,0.10) 100%)' }}
      >
        <CameraIcon />
      </span>

      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">
        Cleaning Crew Upload
      </p>
      <h1 className="mt-1 text-xl font-light leading-tight tracking-tight text-slate-900 dark:text-white">
        {info.propertyName}
      </h1>
      <p className="mt-2 text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
        {files.length === 0
          ? 'Photos are ready to be taken. Tap below to use your camera — this keeps timestamps accurate.'
          : 'Take another photo (e.g. of another room), or submit when you’re done.'}
      </p>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      {previewUrls.length > 0 && (
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-[rgba(100,80,40,0.12)] dark:border-white/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(100,80,40,0.25)] bg-[rgba(100,80,40,0.04)] text-sm font-semibold text-[#7a5c08] transition-all duration-200 hover:bg-[rgba(100,80,40,0.08)] dark:border-white/15 dark:bg-white/3 dark:text-[#D4AF37]"
      >
        <CameraIcon className="h-5 w-5" />
        {files.length === 0 ? 'Use Camera' : 'Take Another Photo'}
      </button>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="mt-3 h-11 w-full rounded-xl border border-[rgba(100,80,40,0.12)] bg-[rgba(100,80,40,0.03)] px-4 text-sm text-[#1e293b] outline-none placeholder:text-[rgba(100,80,40,0.40)] dark:border-white/8 dark:bg-white/3 dark:text-white dark:placeholder:text-white/30"
      />

      {error && <p className="mt-3 text-xs text-rose-500 dark:text-rose-400">{error}</p>}

      {files.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-3 h-12 w-full rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #A87C0A 100%)' }}
        >
          {submitting ? 'Uploading…' : `Submit ${files.length} Photo${files.length === 1 ? '' : 's'}`}
        </button>
      )}
    </Card>
  );
}
