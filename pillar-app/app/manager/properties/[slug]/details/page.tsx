import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import {
  getManagerLayoutBySlug,
  getPropertyBySlug,
  getPropertyFieldsBySlug,
  requirePropertyAccess,
} from '@/lib/properties';
import type { PropertyFields, ManagerLayoutItem, Property } from '@/lib/types';
import ManagerPropertyDetailsClient from './ui';

export const dynamic = 'force-dynamic';

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export default async function ManagerPropertyDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  if (!session?.userId) redirect('/manager/login');

  const { slug } = await props.params;
  const ok = await requirePropertyAccess(session.userId, slug);
  if (!ok) redirect('/manager');

  const [property, fields, layout] = await Promise.all([
    getPropertyBySlug(slug),
    getPropertyFieldsBySlug(slug),
    getManagerLayoutBySlug(slug),
  ]);

  if (!property || !fields) redirect('/manager');

  return (
    <ManagerPropertyDetailsClient
      slug={slug}
      property={property as Property}
      rawFields={fields as PropertyFields}
      initialLayout={(layout ?? []) as ManagerLayoutItem[]}
    />
  );
}
