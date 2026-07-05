import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { getPropertiesByManagerId } from '@/lib/properties';
import { createServiceClient } from '@/lib/supabase';
import PropertiesClient from './PropertiesClient';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || '';
  const session = token ? verifyManagerSession(token) : null;

  if (!session?.userId) redirect('/manager/login');

  const supabase = createServiceClient();
  const [properties, profileResult] = await Promise.all([
    getPropertiesByManagerId(session.userId),
    supabase
      .from('profiles')
      .select('is_subscribed, stripe_subscription_status, property_slots')
      .eq('id', session.userId)
      .single(),
  ]);

  const profile = profileResult.data;
  const isSubscribed = profile?.is_subscribed === true;
  const subscriptionStatus = (profile?.stripe_subscription_status as string | null) ?? null;
  const propertySlots = (profile?.property_slots as number) ?? 1;

  return (
    <PropertiesClient
      properties={properties}
      isSubscribed={isSubscribed}
      subscriptionStatus={subscriptionStatus}
      propertySlots={propertySlots}
    />
  );
}
