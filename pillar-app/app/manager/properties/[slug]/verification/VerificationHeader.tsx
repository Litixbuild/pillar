import Link from 'next/link';

export default function VerificationHeader({
  backHref,
  backLabel,
  kicker,
}: {
  backHref: string;
  backLabel: string;
  kicker: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      <Link
        href={backHref}
        aria-label={`Back to ${backLabel}`}
        className="absolute left-0 flex h-6 w-6 items-center justify-center text-[rgba(100,80,40,0.55)] transition-colors hover:text-[rgba(100,80,40,0.80)] dark:text-white/40 dark:hover:text-white/65"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <p className="lux-title text-xl text-slate-900 dark:text-white">
        {kicker}
      </p>
    </div>
  );
}
