import Link from 'next/link';
import StayHistorySection, { type StayHistoryEntry } from './StayHistorySection';

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-none text-[rgba(100,80,40,0.35)] dark:text-white/25" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M4 8h2.2l1.1-2h9.4l1.1 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.3 3.6 2.7 17a1.8 1.8 0 0 0 1.55 2.7h15.5A1.8 1.8 0 0 0 21.3 17L13.7 3.6a1.8 1.8 0 0 0-3.1 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function TileRow({
  href,
  icon,
  label,
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-[rgba(100,80,40,0.07)] px-5 py-3 transition-colors last:border-b-0 hover:bg-[rgba(100,80,40,0.025)] dark:border-white/5 dark:hover:bg-white/2"
    >
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[rgba(100,80,40,0.08)] text-[rgba(100,80,40,0.65)] dark:bg-white/8 dark:text-white/55">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1e293b] dark:text-white/80">{label}</p>
        <p className="mt-0.5 text-[11px] text-[rgba(100,80,40,0.55)] dark:text-white/40">{meta}</p>
      </div>
      <ChevronRightIcon />
    </Link>
  );
}

export default function VerificationTiles({
  slug,
  cleaningPhotoCount,
  damagePhotoCount,
  hasReport,
  historyEntries,
}: {
  slug: string;
  cleaningPhotoCount: number;
  damagePhotoCount: number;
  hasReport: boolean;
  historyEntries: StayHistoryEntry[];
}) {
  const base = `/manager/properties/${encodeURIComponent(slug)}/verification`;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
      <TileRow
        href={`${base}/cleaning`}
        icon={<CameraIcon />}
        label="Cleaning Photos & Link"
        meta={cleaningPhotoCount > 0 ? `${cleaningPhotoCount} photo${cleaningPhotoCount === 1 ? '' : 's'} on file` : 'Share the crew upload link'}
      />
      <TileRow
        href={`${base}/damage`}
        icon={<AlertIcon />}
        label="Damage Documentation"
        meta={damagePhotoCount > 0 ? `${damagePhotoCount} photo${damagePhotoCount === 1 ? '' : 's'} reported` : 'No damage reported'}
      />
      <TileRow
        href={`${base}/reports`}
        icon={<DocumentIcon />}
        label="Summary Report"
        meta={hasReport ? 'Report ready to download' : 'No report generated yet'}
      />
      <StayHistorySection entries={historyEntries} />
    </div>
  );
}
