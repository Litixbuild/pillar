import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { requirePropertyAccess, getPropertyBySlug } from '@/lib/properties';
import type { Metadata } from 'next';
import QRPrintClient from './ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: `QR Code — ${slug}` };
}

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  return token ? verifyManagerSession(token) : null;
}

export default async function QRPrintPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  if (!session?.userId) redirect('/manager/login');

  const { slug } = await props.params;
  const ok = await requirePropertyAccess(session.userId, slug);
  if (!ok) redirect('/manager');

  const property = await getPropertyBySlug(slug);
  if (!property) redirect('/manager');

  let publicUrl: string;
  if (process.env.NEXT_PUBLIC_APP_URL) {
    publicUrl = `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/p/${encodeURIComponent(slug)}`;
  } else {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const xForwardedProto = headersList.get('x-forwarded-proto');
    const proto = xForwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    publicUrl = `${proto}://${host}/p/${encodeURIComponent(slug)}`;
  }

  return (
    <QRPrintClient
      propertyName={property.PropertyName}
      propertyAddress={property.PropertyAddress}
      publicUrl={publicUrl}
      slug={slug}
    />
  );
}
