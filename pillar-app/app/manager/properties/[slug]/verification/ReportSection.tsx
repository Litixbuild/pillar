'use client';

import { useState } from 'react';
import type { StayReport } from '@/lib/stayReports';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReportSection({
  slug,
  hasStay,
  initialReport,
}: {
  slug: string;
  hasStay: boolean;
  initialReport: StayReport | null;
}) {
  const [report, setReport] = useState<StayReport | null>(initialReport);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const res = await fetch(`/api/manager/properties/${encodeURIComponent(slug)}/report`, { method: 'POST' });
    if (res.ok) {
      const d = (await res.json()) as { report: StayReport };
      setReport(d.report);
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Failed to generate report. Please try again.');
    }
    setGenerating(false);
  }

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
      <div className="border-b border-[rgba(100,80,40,0.09)] px-6 py-4 dark:border-white/7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
          Report
        </p>
      </div>

      <div className="px-6 py-5">
        {!hasStay ? (
          <p className="text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
            Confirm a tenant stay above before generating a report.
          </p>
        ) : (
          <>
            {report ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(100,80,40,0.10)] bg-[rgba(100,80,40,0.04)] px-4 py-3 dark:border-white/8 dark:bg-white/3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[rgba(100,80,40,0.08)] text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">
                  <DocumentIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1e293b] dark:text-white/80">Report ready</p>
                  <p className="mt-0.5 text-xs text-[rgba(100,80,40,0.55)] dark:text-white/40">
                    Generated {formatDate(report.generated_at)}
                  </p>
                </div>
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-none rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
                >
                  Download
                </a>
              </div>
            ) : null}

            {report && (
              <div className="mt-3 rounded-xl border border-[rgba(100,80,40,0.10)] bg-[rgba(100,80,40,0.03)] px-4 py-3 dark:border-white/8 dark:bg-white/3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(100,80,40,0.55)] dark:text-white/40">
                  What to do with this report
                </p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[rgba(100,80,40,0.70)] dark:text-white/45">
                  <li>• File your damage claim with your booking platform as soon as possible — most enforce a strict window after checkout (often around 14 days).</li>
                  <li>• Attach this PDF along with receipts and repair estimates. Most platforms require original, unaltered photos — only the written summary in this report is AI-assisted.</li>
                  <li>• If a retaliatory review shows up, this report&apos;s timeline can support a review-removal dispute. Reviews are only considered retaliatory if the guest broke a policy, was notified, and then reviewed out of spite.</li>
                </ul>
              </div>
            )}

            {!report && (
              <p className="text-sm text-[#1e293b] dark:text-white/70">No report generated yet for this stay.</p>
            )}

            {error && <p className="mt-3 text-xs text-rose-500 dark:text-rose-400">{error}</p>}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D9C4A0 0%, #A8895E 100%)' }}
            >
              {generating ? 'Generating…' : report ? 'Regenerate Report' : 'Generate Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
