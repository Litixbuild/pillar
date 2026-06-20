import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase';
import { encryptField } from '@/lib/fieldEncryption';
import { createPropertyWindow } from '@/lib/properties';
import { ensureBuiltinCategories, submitWorkOrder } from '@/lib/workOrders';
import { createLateCheckoutRequest } from '@/lib/lateCheckouts';
import type { AmenityWindow } from '@/lib/types';

export const DEMO_PROPERTY_NAME = '123 Demo Lane (Tutorial Example)';

export async function getDemoPropertySlug(managerId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('properties')
    .select('slug')
    .eq('manager_id', managerId)
    .eq('is_demo', true)
    .maybeSingle();
  return typeof data?.slug === 'string' ? data.slug : null;
}

/** Idempotent — returns the existing demo property's slug if the tour was already started. */
export async function seedDemoProperty(managerId: string): Promise<string> {
  const existing = await getDemoPropertySlug(managerId);
  if (existing) return existing;

  const supabase = createServiceClient();
  const slug = `demo-${randomUUID()}`;

  const { error } = await supabase.from('properties').insert({
    slug,
    name: DEMO_PROPERTY_NAME,
    manager_id: managerId,
    is_demo: true,
    address: '123 Demo Lane, Austin, TX',
    property_zip_code: '78701',
    description:
      'A cozy 2-bedroom downtown retreat — minutes from the river walk, perfect for a relaxing getaway.',
    wifi_name: 'PillarDemo-5G',
    wifi_password: encryptField('welcome2pillar'),
    garage_code: encryptField('4521'),
    manager_phone: encryptField('+15125550199'),
    checkout_instructions:
      'Please start the dishwasher, lock the front door, and leave keys on the kitchen counter. Checkout is at 11:00 AM.',
    background_key: 'bg5',
    rooms: ['Kitchen', 'Living Room', 'Bedroom'],
  });
  if (error) throw new Error(`Failed to seed demo property: ${error.message}`);

  const windows: Array<Omit<AmenityWindow, 'id'>> = [
    {
      title: 'WiFi Tip',
      type: 'text',
      icon: 'wifi',
      body: 'Connect to PillarDemo-5G — the password is just below. Speeds are great for streaming.',
      room: 'Living Room',
    },
    {
      title: 'Coffee Machine',
      type: 'text',
      icon: 'coffee',
      body: 'Nespresso machine on the counter. Pods are in the drawer to the left of the sink.',
      room: 'Kitchen',
    },
    {
      title: 'Thermostat',
      type: 'text',
      icon: 'thermometer',
      body: 'Set to 72°F by default. The dial is on the hallway wall outside the bedroom.',
      room: 'Bedroom',
    },
  ];
  for (let i = 0; i < windows.length; i++) {
    await createPropertyWindow(slug, { id: randomUUID(), ...windows[i] }, i);
  }

  await ensureBuiltinCategories(slug);
  await submitWorkOrder(slug, 'Plumbing', 'Kitchen sink is dripping under the cabinet.', null);
  await createLateCheckoutRequest(slug);

  return slug;
}

/** Deletes the demo property and every row tied to it. Safe to call even if none exists. */
export async function cleanupDemoProperty(managerId: string): Promise<void> {
  const slug = await getDemoPropertySlug(managerId);
  if (!slug) return;

  const supabase = createServiceClient();
  await Promise.allSettled([
    supabase.from('property_windows').delete().eq('property_slug', slug),
    supabase.from('property_photos').delete().eq('property_slug', slug),
    supabase.from('work_order_categories').delete().eq('property_slug', slug),
    supabase.from('work_orders').delete().eq('property_slug', slug),
    supabase.from('late_checkout_requests').delete().eq('property_slug', slug),
    supabase.from('property_events').delete().eq('property_slug', slug),
  ]);

  await supabase.from('properties').delete().eq('slug', slug).eq('manager_id', managerId);
}
