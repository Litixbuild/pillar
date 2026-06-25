'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function CleanerLinkSection({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`/api/manager/properties/${encodeURIComponent(slug)}/cleaner-link`)
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as { token?: string; error?: string };
        if (!r.ok || !d.token) { setLoadError(d.error ?? 'Failed to load link'); return; }
        setToken(d.token);
      })
      .catch(() => setLoadError('Failed to load link'));
  }, [slug]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (mounted ? window.location.origin : '');
  const cleanUrl = token ? `${appUrl}/clean/${token}` : '';

  async function handleCopy() {
    if (!cleanUrl) return;
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the link is still visible to copy manually
    }
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
      <div className="border-b border-[rgba(100,80,40,0.09)] px-6 py-4 dark:border-white/7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
          Upload Link
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-5">
        <div className="rounded-2xl border border-[rgba(100,80,40,0.14)] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]">
          {mounted && token ? (
            <QRCodeSVG value={cleanUrl} size={140} bgColor="#ffffff" fgColor="#1a1a1a" level="H" />
          ) : (
            <div className="h-35 w-35 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
          )}
        </div>

        {loadError ? (
          <p className="text-xs text-rose-500 dark:text-rose-400">{loadError}</p>
        ) : (
          <>
            <p className="w-full break-all rounded-xl bg-[rgba(100,80,40,0.04)] px-3 py-2 text-center font-mono text-xs text-[rgba(100,80,40,0.65)] dark:bg-white/5 dark:text-white/55">
              {cleanUrl || 'Loading…'}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!cleanUrl}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
