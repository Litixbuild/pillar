import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase';

export interface TemplateWindow {
  title: string;
  type: 'text' | 'video' | 'pdf' | 'image';
  body?: string;
  icon?: string;
}

export interface PropertyTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  preview: string[];
  windows: TemplateWindow[];
}

const STANDARD_WINDOWS: TemplateWindow[] = [
  {
    title: 'WiFi',
    type: 'text',
    icon: 'wifi',
    body: 'Add your Wi-Fi network name and password here so guests can connect easily.',
  },
  {
    title: 'Television',
    type: 'text',
    icon: 'tv',
    body: 'Describe how to use the TV — how to switch inputs, which streaming services are logged in, and any remote control tips.',
  },
  {
    title: 'Coffee Machine',
    type: 'text',
    icon: 'coffee',
    body: 'Explain how to use the coffee machine — type (Nespresso, drip, espresso, etc.), where pods or grounds are stored, and where cups are.',
  },
  {
    title: 'Thermostat',
    type: 'text',
    icon: 'thermometer',
    body: 'Describe how to adjust the thermostat — heating and cooling settings, your preferred temperature range, and any quirks.',
  },
];

export const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  {
    id: 'beach_house',
    name: 'Beach House',
    emoji: '🏖️',
    description: 'Coastal rentals with outdoor amenities.',
    preview: ['WiFi', 'Television', 'Coffee Machine', 'Thermostat'],
    windows: STANDARD_WINDOWS,
  },
  {
    id: 'mountain_cabin',
    name: 'Mountain Cabin',
    emoji: '🏔️',
    description: 'Cabins, ski lodges, and forest retreats.',
    preview: ['WiFi', 'Television', 'Coffee Machine', 'Thermostat'],
    windows: STANDARD_WINDOWS,
  },
  {
    id: 'urban_apartment',
    name: 'Urban Apartment',
    emoji: '🏙️',
    description: 'City apartments, condos, and downtown units.',
    preview: ['WiFi', 'Television', 'Coffee Machine', 'Thermostat'],
    windows: STANDARD_WINDOWS,
  },
  {
    id: 'golf_resort',
    name: 'Golf / Resort',
    emoji: '⛳',
    description: 'Resort properties, golf communities, and luxury retreats.',
    preview: ['WiFi', 'Television', 'Coffee Machine', 'Thermostat'],
    windows: STANDARD_WINDOWS,
  },
  {
    id: 'blank',
    name: 'Blank',
    emoji: '📄',
    description: 'Start completely fresh. Build your guide from scratch.',
    preview: ['WiFi', 'Television', 'Coffee Machine', 'Thermostat'],
    windows: STANDARD_WINDOWS,
  },
];

export function getTemplate(id: string): PropertyTemplate | undefined {
  return PROPERTY_TEMPLATES.find((t) => t.id === id);
}

export async function applyTemplateToProperty(slug: string, templateId: string): Promise<void> {
  const template = getTemplate(templateId);
  if (!template || template.windows.length === 0) return;

  const supabase = createServiceClient();
  const rows = template.windows.map((w, idx) => ({
    id: randomUUID(),
    property_slug: slug,
    title: w.title,
    type: w.type,
    body: w.body ?? null,
    icon: w.icon ?? null,
    url: null,
    room: null,
    display_order: idx,
  }));

  const { error } = await supabase.from('property_windows').insert(rows);
  if (error) throw new Error(`Failed to apply template: ${error.message}`);
}
