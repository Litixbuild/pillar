import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertyAccessWithName } from '@/lib/properties';
import { getMostRecentStay } from '@/lib/stays';
import { getCleaningPhotosForStay } from '@/lib/stayCleaningPhotos';
import VerificationHeader from '../VerificationHeader';
import VerificationTitleBlock from '../VerificationTitleBlock';
import CleanerLinkSection from '../CleanerLinkSection';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default async function CleaningPage(
  props: { params: Promise<{ slug: string }> }
) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;
  if (!session?.userId) redirect('/manager/login');

  const { slug } = await props.params;
  const { allowed, propertyName } = await getPropertyAccessWithName(session.userId, slug);
  if (!allowed) notFound();

  const mostRecentStay = await getMostRecentStay(slug);
  const photos = mostRecentStay ? await getCleaningPhotosForStay(mostRecentStay.id) : [];

  return (
    <div className="page-fade-in flex flex-1 flex-col">
      <VerificationHeader
        backHref={`/manager/properties/${encodeURIComponent(slug)}/verification`}
        backLabel="Verification"
        kicker="Cleaning Photos & Link"
      />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <VerificationTitleBlock
            title={propertyName ?? decodeURIComponent(slug)}
            subtitle="Share the upload link with your cleaning crew so they can log photos before the next tenant arrives — no account needed."
          />

          <CleanerLinkSection slug={slug} />

          <div className="mb-4 overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.12)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(8,8,8,0.95)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]">
            <div className="border-b border-[rgba(100,80,40,0.09)] px-6 py-4 dark:border-white/7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/50">
                Pre-Arrival Photos
              </p>
            </div>
            <div className="px-6 py-5">
              {!mostRecentStay ? (
                <p className="text-sm text-[rgba(100,80,40,0.65)] dark:text-white/45">
                  Confirm a tenant stay before cleaning photos can be logged.
                </p>
              ) : photos.length === 0 ? (
                <p className="text-sm text-[#1e293b] dark:text-white/70">No cleaning photos submitted for this stay yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={p.id} className="overflow-hidden rounded-xl border border-[rgba(100,80,40,0.10)] dark:border-white/8">
                      <img src={p.photo_url} alt="Cleaning photo" className="h-28 w-full object-cover" />
                      <div className="px-2.5 py-2">
                        <p className="text-[10px] text-[rgba(100,80,40,0.55)] dark:text-white/40">
                          {formatDate(p.uploaded_at)}{p.uploader_label ? ` — ${p.uploader_label}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
