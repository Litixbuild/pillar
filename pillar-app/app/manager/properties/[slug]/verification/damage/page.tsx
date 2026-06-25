import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertyAccessWithName } from '@/lib/properties';
import { getMostRecentStay } from '@/lib/stays';
import { getDamagePhotosForStay } from '@/lib/stayDamageReports';
import VerificationHeader from '../VerificationHeader';
import VerificationTitleBlock from '../VerificationTitleBlock';
import DamageSection from '../DamageSection';

export const dynamic = 'force-dynamic';

export default async function DamagePage(
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
  const photos = mostRecentStay ? await getDamagePhotosForStay(mostRecentStay.id) : [];

  return (
    <div className="page-fade-in flex flex-1 flex-col">
      <VerificationHeader
        backHref={`/manager/properties/${encodeURIComponent(slug)}/verification`}
        backLabel="Verification"
        kicker="Damage Documentation"
      />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <VerificationTitleBlock
            title={propertyName ?? decodeURIComponent(slug)}
            subtitle="Photos and notes for any damage found — feeds directly into the summary report."
          />

          <DamageSection slug={slug} hasStay={!!mostRecentStay} photos={photos} />
        </div>
      </div>
    </div>
  );
}
