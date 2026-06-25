import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertyAccessWithName } from '@/lib/properties';
import { getActiveStay, getMostRecentStay, getStayHistory } from '@/lib/stays';
import { getConsentsForStay } from '@/lib/stayConsent';
import { getCleaningPhotosForStay } from '@/lib/stayCleaningPhotos';
import { getDamagePhotosForStay } from '@/lib/stayDamageReports';
import { getLatestReportForStay } from '@/lib/stayReports';
import VerificationHeader from './VerificationHeader';
import VerificationTitleBlock from './VerificationTitleBlock';
import CurrentStayCard from './CurrentStayCard';
import VerificationTiles from './VerificationTiles';
import type { StayHistoryEntry } from './StayHistorySection';

export const dynamic = 'force-dynamic';

export default async function PropertyVerificationPage(
  props: { params: Promise<{ slug: string }> }
) {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;
  if (!session?.userId) redirect('/manager/login');

  const { slug } = await props.params;
  const { allowed, propertyName } = await getPropertyAccessWithName(session.userId, slug);
  if (!allowed) notFound();

  const [activeStay, mostRecentStay] = await Promise.all([
    getActiveStay(slug),
    getMostRecentStay(slug),
  ]);

  const [cleaningPhotos, damagePhotos, report, closedStays] = await Promise.all([
    mostRecentStay ? getCleaningPhotosForStay(mostRecentStay.id) : Promise.resolve([]),
    mostRecentStay ? getDamagePhotosForStay(mostRecentStay.id) : Promise.resolve([]),
    mostRecentStay ? getLatestReportForStay(mostRecentStay.id) : Promise.resolve(null),
    getStayHistory(slug),
  ]);

  const historyEntries: StayHistoryEntry[] = await Promise.all(
    closedStays.map(async (stay) => {
      const [consents, stayCleaningPhotos, stayDamagePhotos, stayReport] = await Promise.all([
        getConsentsForStay(stay.id),
        getCleaningPhotosForStay(stay.id),
        getDamagePhotosForStay(stay.id),
        getLatestReportForStay(stay.id),
      ]);
      return {
        stay,
        consentCount: consents.length,
        cleaningPhotoCount: stayCleaningPhotos.length,
        damagePhotoCount: stayDamagePhotos.length,
        report: stayReport,
      };
    })
  );

  return (
    <div className="page-fade-in flex flex-1 flex-col">
      <VerificationHeader backHref="/manager/properties" backLabel="Properties" kicker="Verification" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <VerificationTitleBlock
            title={propertyName ?? decodeURIComponent(slug)}
            subtitle="Everything you need to support a damage claim with your booking platform."
          />

          {/* Current Stay — tenant tracking */}
          <CurrentStayCard slug={slug} activeStay={activeStay} />

          {/* Hub tiles to the focused sub-pages */}
          <VerificationTiles
            slug={slug}
            cleaningPhotoCount={cleaningPhotos.length}
            damagePhotoCount={damagePhotos.length}
            hasReport={!!report}
            historyEntries={historyEntries}
          />
        </div>
      </div>
    </div>
  );
}
