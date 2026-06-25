import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertyAccessWithName } from '@/lib/properties';
import { getMostRecentStay } from '@/lib/stays';
import { getLatestReportForStay } from '@/lib/stayReports';
import VerificationHeader from '../VerificationHeader';
import VerificationTitleBlock from '../VerificationTitleBlock';
import ReportSection from '../ReportSection';

export const dynamic = 'force-dynamic';

export default async function ReportsPage(
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
  const latestReport = mostRecentStay ? await getLatestReportForStay(mostRecentStay.id) : null;

  return (
    <div className="page-fade-in flex flex-1 flex-col">
      <VerificationHeader
        backHref={`/manager/properties/${encodeURIComponent(slug)}/verification`}
        backLabel="Verification"
        kicker="Summary Report"
      />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <VerificationTitleBlock
            title={propertyName ?? decodeURIComponent(slug)}
            subtitle="A professional PDF combining the cleanliness confirmation, cleaning photos, damage documentation, and an AI-drafted narrative — ready to send to your booking platform."
          />

          <ReportSection
            key={mostRecentStay?.id ?? 'none'}
            slug={slug}
            hasStay={!!mostRecentStay}
            initialReport={latestReport}
          />
        </div>
      </div>
    </div>
  );
}
