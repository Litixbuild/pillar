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

export const PROPERTY_TEMPLATES: PropertyTemplate[] = [
  {
    id: 'beach_house',
    name: 'Beach House',
    emoji: '🏖️',
    description: 'Coastal rentals with outdoor amenities.',
    preview: ['Hot Tub', 'Outdoor Grill', 'Kayaks & Paddleboards', 'Fire Pit'],
    windows: [
      {
        title: 'Hot Tub & Jacuzzi',
        type: 'text',
        icon: '🛁',
        body: 'Add your hot tub instructions here — how to adjust the temperature and jets, maximum capacity, your rules (rinse off first, no glass, no children unsupervised), and how to re-cover when done.',
      },
      {
        title: 'BBQ & Outdoor Grill',
        type: 'text',
        icon: '🍖',
        body: 'Describe how to use the grill — propane tank location and how to turn it on, ignition steps, any burner quirks, and how to clean the grates after use. Let guests know where to find utensils.',
      },
      {
        title: 'Beach Chairs & Umbrellas',
        type: 'text',
        icon: '☂️',
        body: 'Let guests know how many chairs and umbrellas are available, where they\'re stored (garage, outdoor closet, deck, etc.), and how to set them up. Note if a beach cart is available to haul everything.',
      },
      {
        title: 'Outdoor Shower',
        type: 'text',
        icon: '🚿',
        body: 'Explain how to operate the outdoor shower — hot/cold valve location, water pressure notes, and any quirks. Remind guests to rinse off before entering the home and where to find towels.',
      },
      {
        title: 'Kayak & Paddleboard Equipment',
        type: 'text',
        icon: '🏄',
        body: 'List what equipment is available (kayaks, paddleboards, life vests, paddles), where it\'s stored, and tips for launching. Include any local rules about where to paddle and safety requirements.',
      },
      {
        title: 'Outdoor Fire Pit',
        type: 'text',
        icon: '🔥',
        body: 'Show guests how to use the fire pit safely — where wood is stored, how to light it, what not to burn, and how to fully extinguish before leaving. Include any HOA or local fire rules.',
      },
    ],
  },
  {
    id: 'mountain_cabin',
    name: 'Mountain Cabin',
    emoji: '🏔️',
    description: 'Cabins, ski lodges, and forest retreats.',
    preview: ['Fireplace', 'Hot Tub', 'Outdoor Grill', 'Game Room'],
    windows: [
      {
        title: 'Fireplace & Wood Stove',
        type: 'text',
        icon: '🔥',
        body: 'Provide step-by-step instructions for lighting and using the fireplace — damper position (open before lighting), where firewood is stored, what not to burn, and how to safely extinguish before going to bed.',
      },
      {
        title: 'Hot Tub',
        type: 'text',
        icon: '♨️',
        body: 'Describe how to use the hot tub — how to adjust temperature and jets, the cover removal and replacement process, your rules (max capacity, no glass, shower first), and how to report any issues.',
      },
      {
        title: 'BBQ & Outdoor Grill',
        type: 'text',
        icon: '🍖',
        body: 'Describe how to use the grill — propane or charcoal setup, ignition steps, any quirks, and how to clean the grates after use. Let guests know where utensils and lighter fluid are kept.',
      },
      {
        title: 'Outdoor Fire Pit',
        type: 'text',
        icon: '🪵',
        body: 'Show guests how to use the fire pit — where wood is stored, how to light and maintain a fire, what not to burn, and how to fully extinguish it. Include any local fire ban rules or restrictions.',
      },
      {
        title: 'Game Room',
        type: 'text',
        icon: '🎮',
        body: 'List what\'s available in the game room — pool table, ping pong, darts, board games, card games, video games, etc. Note where cues, paddles, and game pieces are stored.',
      },
      {
        title: 'Snowshoes & Winter Gear',
        type: 'text',
        icon: '🏔️',
        body: 'Let guests know what winter gear is available — snowshoes, sleds, ice skates — sizes available, and where everything is stored. Note if boots or any specific gear is not included.',
      },
    ],
  },
  {
    id: 'urban_apartment',
    name: 'Urban Apartment',
    emoji: '🏙️',
    description: 'City apartments, condos, and downtown units.',
    preview: ['Coffee Machine', 'Smart TV', 'Washer & Dryer', 'Building Gym'],
    windows: [
      {
        title: 'Coffee Machine',
        type: 'text',
        icon: '☕',
        body: 'Explain how to use the coffee machine — type (Nespresso, drip, espresso, etc.), where pods or coffee grounds are stored, how to descale or run a cleaning cycle if needed, and where cups and filters are.',
      },
      {
        title: 'Smart TV & Streaming',
        type: 'text',
        icon: '📺',
        body: 'Describe how to use the TV — how to switch inputs, which streaming services are logged in (Netflix, Hulu, Disney+, etc.), how to connect a personal device for casting, and any remote control tips.',
      },
      {
        title: 'Washer & Dryer',
        type: 'text',
        icon: '🫧',
        body: 'Show guests how to operate the washer and dryer — recommended settings, where detergent and dryer sheets are stored, cycle duration, and any known quirks (runs hot, dial is stiff, etc.).',
      },
      {
        title: 'Building Gym',
        type: 'text',
        icon: '🏋️',
        body: 'Describe how guests access the building gym — which key fob or access card to use, which floor, hours of operation, and what major equipment is available. Include any guest rules.',
      },
      {
        title: 'Rooftop & Common Areas',
        type: 'text',
        icon: '🌆',
        body: 'Let guests know how to access the rooftop or common areas — access code or key, hours, what\'s available (seating, grill, city views), and any building rules for guests.',
      },
      {
        title: 'Bike Storage',
        type: 'text',
        icon: '🚲',
        body: 'Let guests know where bicycles are stored, any lock codes, what sizes are available, and whether helmets are included. Add a note about your favorite routes nearby if you\'d like.',
      },
    ],
  },
  {
    id: 'golf_resort',
    name: 'Golf / Resort',
    emoji: '⛳',
    description: 'Resort properties, golf communities, and luxury retreats.',
    preview: ['Golf Cart', 'Pool & Hot Tub', 'Tennis Court', 'Fitness Center'],
    windows: [
      {
        title: 'Golf Cart',
        type: 'text',
        icon: '🏌️',
        body: 'Explain how to operate the golf cart — how to charge it, speed limits on the property or community roads, where to park when not in use, and any community rules (no driving after dark, stay on cart paths, etc.).',
      },
      {
        title: 'Pool & Hot Tub',
        type: 'text',
        icon: '🏊',
        body: 'Describe pool and hot tub access — location, hours, how to adjust the hot tub temperature, any rules (no diving, shower before entering, no outside guests), and how to report any issues.',
      },
      {
        title: 'Tennis & Pickleball Court',
        type: 'text',
        icon: '🎾',
        body: 'Let guests know how to access the courts — reservation system or walk-up, where rackets and balls are stored or available to borrow, court hours, and any etiquette rules.',
      },
      {
        title: 'Fitness Center',
        type: 'text',
        icon: '🏋️',
        body: 'Describe how guests access the fitness center — key or access card required, location within the resort, hours, and what major equipment is available. Include any guest rules or towel policy.',
      },
      {
        title: 'Outdoor Grill Area',
        type: 'text',
        icon: '🍖',
        body: 'Describe the shared grill area — how to reserve it if required, how to operate the grill, where supplies and utensils are, and what cleanup is expected after use.',
      },
      {
        title: 'Entertainment System',
        type: 'text',
        icon: '📺',
        body: 'Show guests how to use the entertainment system — how to turn on the TV and sound bar, which streaming services are available, how to use the surround sound, and where to find the remotes.',
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank',
    emoji: '📄',
    description: 'Start completely fresh. Build your guide from scratch.',
    preview: [],
    windows: [],
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
