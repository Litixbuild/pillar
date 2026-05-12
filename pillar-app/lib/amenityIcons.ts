export interface AmenityIconDef {
  key: string;
  name: string;
  tags: string[];
  // SVG path 'd' attribute strings — rendered in a 24×24 stroke viewBox
  paths: string[];
}

export const AMENITY_ICONS: AmenityIconDef[] = [
  // ── Connectivity ────────────────────────────────────────────────
  {
    key: 'wifi',
    name: 'WiFi',
    tags: ['wifi', 'internet', 'network', 'wireless', 'router', 'connectivity', 'online'],
    paths: [
      'M5 12.55a11 11 0 0 1 14.08 0',
      'M1.42 9a16 16 0 0 1 21.16 0',
      'M8.53 16.11a6 6 0 0 1 6.95 0',
      'M12 20h.01',
    ],
  },
  {
    key: 'ethernet',
    name: 'Ethernet / High-Speed Internet',
    tags: ['ethernet', 'internet', 'lan', 'wired', 'network', 'connectivity', 'cable'],
    paths: [
      'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v4M9 7H3m6 0h12M3 7v10a2 2 0 0 0 2 2h4m-6-0v-4m0 4h6M21 7v10a2 2 0 0 1-2 2h-4m6-12v4m0 8h-6',
    ],
  },
  {
    key: 'phone',
    name: 'Phone / Landline',
    tags: ['phone', 'landline', 'telephone', 'call', 'contact'],
    paths: [
      'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    ],
  },
  {
    key: 'globe',
    name: 'Satellite / International TV',
    tags: ['satellite', 'cable', 'international', 'globe', 'tv', 'channels'],
    paths: [
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      'M2 12h20',
      'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    ],
  },

  // ── Entertainment ───────────────────────────────────────────────
  {
    key: 'tv',
    name: 'Television',
    tags: ['tv', 'television', 'screen', 'cable', 'streaming', 'netflix', 'entertainment', 'smart tv'],
    paths: [
      'M21 3H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
      'M8 21h8',
      'M12 17v4',
    ],
  },
  {
    key: 'monitor',
    name: 'Computer / Workstation',
    tags: ['computer', 'monitor', 'workstation', 'laptop', 'desktop', 'work', 'office', 'screen'],
    paths: [
      'M2 3h20a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
      'M8 21h8',
      'M12 18v3',
    ],
  },
  {
    key: 'gamepad',
    name: 'Game Console',
    tags: ['gaming', 'games', 'console', 'playstation', 'xbox', 'video games', 'controller'],
    paths: [
      'M6 12h4m-2-2v4',
      'M15 13h.01M17 11h.01',
      'M2 6h20l-1.5 9a2 2 0 0 1-2 1.73H5.5a2 2 0 0 1-2-1.73z',
    ],
  },
  {
    key: 'headphones',
    name: 'Headphones / Audio',
    tags: ['headphones', 'audio', 'music', 'sound', 'speaker', 'stereo'],
    paths: [
      'M3 18v-6a9 9 0 0 1 18 0v6',
      'M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z',
    ],
  },
  {
    key: 'speaker',
    name: 'Sound System',
    tags: ['speaker', 'sound', 'music', 'audio', 'bluetooth', 'stereo', 'surround'],
    paths: [
      'M11 5L6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
    ],
  },
  {
    key: 'projector',
    name: 'Projector / Home Theater',
    tags: ['projector', 'movie', 'cinema', 'screen', 'home theater', 'film'],
    paths: [
      'M2 7h20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z',
      'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
      'M19 10h.01M5 12h.01',
    ],
  },
  {
    key: 'book',
    name: 'Books / Library',
    tags: ['books', 'library', 'reading', 'novels', 'shelf', 'literature'],
    paths: [
      'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
      'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    ],
  },

  // ── Kitchen ─────────────────────────────────────────────────────
  {
    key: 'coffee',
    name: 'Coffee Maker',
    tags: ['coffee', 'espresso', 'caffeine', 'beverage', 'kitchen', 'morning', 'cappuccino', 'maker'],
    paths: [
      'M18 8h1a4 4 0 0 1 0 8h-1',
      'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z',
      'M6 1v3M10 1v3M14 1v3',
    ],
  },
  {
    key: 'cup',
    name: 'Tea / Kettle',
    tags: ['tea', 'kettle', 'hot water', 'beverage', 'cup', 'mug', 'herbal'],
    paths: [
      'M17 8h1a4 4 0 0 1 0 8h-1',
      'M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z',
    ],
  },
  {
    key: 'refrigerator',
    name: 'Refrigerator',
    tags: ['fridge', 'refrigerator', 'kitchen', 'food', 'cold', 'groceries'],
    paths: [
      'M5 2h14a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      'M5 10h14',
      'M10 6v2M10 15v2',
    ],
  },
  {
    key: 'microwave',
    name: 'Microwave',
    tags: ['microwave', 'oven', 'kitchen', 'cooking', 'heat', 'appliance'],
    paths: [
      'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      'M7 8v8',
      'M10 8h8v8h-8z',
    ],
  },
  {
    key: 'utensils',
    name: 'Full Kitchen',
    tags: ['kitchen', 'utensils', 'cooking', 'fork', 'knife', 'stove', 'oven', 'pots', 'pans', 'cookware'],
    paths: [
      'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
      'M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
    ],
  },
  {
    key: 'wine',
    name: 'Wine / Bar',
    tags: ['wine', 'bar', 'drinks', 'alcohol', 'beverage', 'cocktail', 'bottle', 'glass'],
    paths: [
      'M8 22h8',
      'M7 10h10',
      'M12 15v7',
      'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H7c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z',
    ],
  },
  {
    key: 'toaster',
    name: 'Toaster',
    tags: ['toaster', 'bread', 'breakfast', 'kitchen', 'appliance', 'toast'],
    paths: [
      'M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z',
      'M8 8V5M12 8V5M16 8V5',
      'M7 18v2M17 18v2',
    ],
  },
  {
    key: 'dishwasher',
    name: 'Dishwasher',
    tags: ['dishwasher', 'dishes', 'kitchen', 'cleaning', 'appliance'],
    paths: [
      'M4 2h16a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      'M4 10h16',
      'M9 6h.01M12 6h.01M15 6h.01',
      'M12 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    ],
  },

  // ── Water & Pool ─────────────────────────────────────────────────
  {
    key: 'pool',
    name: 'Swimming Pool',
    tags: ['pool', 'swimming', 'water', 'outdoor', 'summer', 'swim', 'lap pool'],
    paths: [
      'M2 12c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
      'M2 7c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
      'M2 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
    ],
  },
  {
    key: 'hot-tub',
    name: 'Hot Tub / Jacuzzi',
    tags: ['hot tub', 'jacuzzi', 'spa', 'whirlpool', 'bubble', 'jets', 'outdoor'],
    paths: [
      'M3 12h18',
      'M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9',
      'M7 6c.5 1 1.5 1.5 2.5 1.5S11 7 12 6s2 1.5 3.5 1.5',
      'M7 3c0 1 1 2 2 2M12 2v2M17 3c0 1-1 2-2 2',
    ],
  },
  {
    key: 'droplet',
    name: 'Water Feature',
    tags: ['water', 'fountain', 'pond', 'droplet', 'feature', 'outdoor'],
    paths: [
      'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    ],
  },
  {
    key: 'shower',
    name: 'Shower',
    tags: ['shower', 'bathroom', 'rain shower', 'steam', 'spa shower'],
    paths: [
      'M4 4h1v2H4zM4 10h1v2H4zM4 16h1v2H4zM9 4h1v2H9zM9 10h1v2H9zM9 16h1v2H9zM14 4h1v2h-1zM14 10h1v2h-1zM14 16h1v2h-1zM19 4h1v2h-1zM19 10h1v2h-1zM19 16h1v2h-1z',
    ],
  },
  {
    key: 'bathtub',
    name: 'Bathtub / Soaking Tub',
    tags: ['bathtub', 'bath', 'soaking', 'tub', 'bathroom', 'soak'],
    paths: [
      'M2 12h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z',
      'M5 12V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1',
      'M4 18v2M20 18v2',
    ],
  },

  // ── Climate & Comfort ────────────────────────────────────────────
  {
    key: 'thermometer',
    name: 'Thermostat / Heat',
    tags: ['thermostat', 'heat', 'temperature', 'hvac', 'warm', 'climate control'],
    paths: [
      'M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z',
    ],
  },
  {
    key: 'snowflake',
    name: 'Air Conditioning',
    tags: ['ac', 'air conditioning', 'cooling', 'cold', 'hvac', 'climate', 'cool'],
    paths: [
      'M12 2v20M2 12h20',
      'M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07',
      'M12 6L9 3M12 6l3-3M12 18l-3 3M12 18l3 3M6 12l-3-3M6 12l-3 3M18 12l3-3M18 12l3 3',
    ],
  },
  {
    key: 'flame',
    name: 'Fireplace',
    tags: ['fireplace', 'fire', 'hearth', 'chimney', 'warmth', 'wood burning', 'gas fireplace'],
    paths: [
      'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    ],
  },
  {
    key: 'wind',
    name: 'Ceiling Fan',
    tags: ['fan', 'ceiling fan', 'air', 'cooling', 'breeze', 'ventilation'],
    paths: [
      'M9.59 4.59A2 2 0 1 1 11 8H2M10.59 15.41A2 2 0 1 0 12 19H2M15.73 8.27A2 2 0 1 1 19.73 12H2',
    ],
  },

  // ── Bedroom & Bathroom ───────────────────────────────────────────
  {
    key: 'bed',
    name: 'Bedroom',
    tags: ['bed', 'bedroom', 'sleep', 'mattress', 'pillow', 'rest', 'king', 'queen'],
    paths: [
      'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8',
      'M2 20h20',
      'M2 10V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4',
      'M7 14h2v2H7zM15 14h2v2h-2z',
    ],
  },
  {
    key: 'sofa',
    name: 'Living Room / Sofa',
    tags: ['sofa', 'couch', 'living room', 'lounge', 'seating', 'relax'],
    paths: [
      'M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3',
      'M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3H2v-3z',
      'M4 14v3M20 14v3M4 17h16',
    ],
  },

  // ── Laundry ─────────────────────────────────────────────────────
  {
    key: 'washer',
    name: 'Washer / Laundry',
    tags: ['washer', 'laundry', 'washing machine', 'clothes', 'clean'],
    paths: [
      'M4 2h16a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      'M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 0 0-10 0',
      'M7 6h.01M11 6h.01',
    ],
  },
  {
    key: 'dryer',
    name: 'Dryer',
    tags: ['dryer', 'laundry', 'clothes dryer', 'dry'],
    paths: [
      'M4 2h16a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      'M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 0 0-10 0',
      'M16 6h.01M12 6h.01',
    ],
  },
  {
    key: 'iron',
    name: 'Iron / Ironing Board',
    tags: ['iron', 'ironing', 'laundry', 'clothes', 'press', 'wrinkles'],
    paths: [
      'M3 20h18',
      'M5 20V10h14a6 6 0 0 1-6 6H5z',
      'M12 10V5a3 3 0 0 1 3-3h2',
    ],
  },

  // ── Outdoor & Nature ─────────────────────────────────────────────
  {
    key: 'sun',
    name: 'Patio / Deck',
    tags: ['patio', 'deck', 'outdoor', 'terrace', 'sun', 'balcony', 'sundeck'],
    paths: [
      'M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0',
      'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
    ],
  },
  {
    key: 'umbrella',
    name: 'Patio Umbrella',
    tags: ['umbrella', 'patio', 'outdoor', 'shade', 'garden', 'parasol'],
    paths: [
      'M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7',
    ],
  },
  {
    key: 'grill',
    name: 'BBQ / Grill',
    tags: ['bbq', 'grill', 'barbecue', 'outdoor cooking', 'charcoal', 'propane', 'cookout'],
    paths: [
      'M4 11h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z',
      'M12 13l-2 8M12 13l2 8',
      'M8 11c0-4 8-4 8 0',
      'M6 3c1 1.5 3 2 6 2s5-.5 6-2',
    ],
  },
  {
    key: 'tree',
    name: 'Garden / Yard',
    tags: ['garden', 'yard', 'outdoor', 'plants', 'nature', 'landscaping', 'green'],
    paths: [
      'M11 20a7 7 0 0 1-7-7 7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7z',
      'M11 20v4',
      'M8 22h6',
      'M16 7.5A5 5 0 0 0 7 10',
    ],
  },
  {
    key: 'waves',
    name: 'Beach / Lake Access',
    tags: ['beach', 'ocean', 'waves', 'water', 'lake', 'waterfront', 'sea'],
    paths: [
      'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
      'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
    ],
  },
  {
    key: 'mountain',
    name: 'Mountain / Scenic View',
    tags: ['mountain', 'view', 'scenic', 'hiking', 'nature', 'landscape', 'trail'],
    paths: [
      'M8 3l4 8 5-5 5 15H2L8 3z',
    ],
  },
  {
    key: 'anchor',
    name: 'Boat / Dock Access',
    tags: ['boat', 'dock', 'marina', 'lake', 'kayak', 'anchor', 'nautical', 'water'],
    paths: [
      'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
      'M12 8v13',
      'M5 12H2a10 10 0 0 0 20 0h-3',
    ],
  },

  // ── Fitness & Wellness ───────────────────────────────────────────
  {
    key: 'dumbbell',
    name: 'Gym / Fitness',
    tags: ['gym', 'fitness', 'workout', 'exercise', 'weights', 'dumbbell', 'training'],
    paths: [
      'M6 4v16M18 4v16M2 8h4M18 8h4M2 16h4M18 16h4M6 8h12M6 16h12',
    ],
  },
  {
    key: 'yoga',
    name: 'Yoga / Wellness',
    tags: ['yoga', 'wellness', 'meditation', 'fitness', 'pilates', 'zen', 'mat'],
    paths: [
      'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
      'M6 8l6 2 6-2',
      'M12 10v4',
      'M7 18c.5-1 2-2 5-2s4.5 1 5 2',
      'M8 14l-2 4M16 14l2 4',
    ],
  },
  {
    key: 'bike',
    name: 'Bicycle',
    tags: ['bike', 'bicycle', 'cycling', 'outdoor', 'trail', 'exercise'],
    paths: [
      'M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'M19 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'M5 14h4l3-7h3.5l2 5H19',
      'M9 14l2-4',
    ],
  },
  {
    key: 'tennis',
    name: 'Tennis Court',
    tags: ['tennis', 'sport', 'court', 'outdoor', 'racket', 'ball'],
    paths: [
      'M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 0 0-20 0',
      'M4.93 4.93c4.2 3.15 4.2 10.99 0 14.14',
      'M19.07 4.93c-4.2 3.15-4.2 10.99 0 14.14',
    ],
  },
  {
    key: 'golf',
    name: 'Golf / Putting Green',
    tags: ['golf', 'sport', 'putting', 'green', 'course', 'outdoor'],
    paths: [
      'M12 18v4',
      'M8 22h8',
      'M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z',
      'M12 6V2M15 3l-3 3-3-3',
    ],
  },
  {
    key: 'sauna',
    name: 'Sauna / Steam Room',
    tags: ['sauna', 'steam', 'relaxation', 'spa', 'health', 'heat'],
    paths: [
      'M4 18v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1',
      'M3 18h18',
      'M8 7c0-1.5 1.5-3 4-3s4 1.5 4 3',
      'M10 4c.5-1 1.5-1.5 2-1.5',
      'M14 4c-.5-1-1.5-1.5-2-1.5',
    ],
  },

  // ── Transport & Parking ──────────────────────────────────────────
  {
    key: 'car',
    name: 'Parking / Garage',
    tags: ['parking', 'garage', 'car', 'vehicle', 'driveway', 'lot'],
    paths: [
      'M5 17H3a2 2 0 0 1-2-2V9l3-6h14l3 6v6a2 2 0 0 1-2 2h-2M5 17v3M19 17v3M5 13h14',
      'M7 9h3M14 9h3',
    ],
  },
  {
    key: 'ev-plug',
    name: 'EV Charging Station',
    tags: ['ev', 'electric vehicle', 'charging', 'charger', 'tesla', 'plug'],
    paths: [
      'M5 22V12L12 2l7 10v10',
      'M9 22v-4h6v4',
      'M12 14v2',
      'M10 14h4',
    ],
  },
  {
    key: 'scooter',
    name: 'Scooter / Moped',
    tags: ['scooter', 'moped', 'electric scooter', 'transport', 'rental'],
    paths: [
      'M6 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M4 15h-2V9h12v6',
      'M14 15h-4',
      'M14 9l4-4h3v4l1 2h-4',
    ],
  },

  // ── Security & Safety ────────────────────────────────────────────
  {
    key: 'key',
    name: 'Key / Entry',
    tags: ['key', 'access', 'entry', 'door', 'lock', 'unlock', 'check-in', 'self check-in'],
    paths: [
      'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
    ],
  },
  {
    key: 'lock',
    name: 'Smart Lock',
    tags: ['lock', 'security', 'smart lock', 'keypad', 'door', 'code', 'keyless'],
    paths: [
      'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z',
      'M7 11V7a5 5 0 0 1 10 0v4',
      'M12 16v2',
    ],
  },
  {
    key: 'camera',
    name: 'Security Camera',
    tags: ['camera', 'security', 'cctv', 'surveillance', 'safety', 'monitoring'],
    paths: [
      'M23 7l-7 5 7 5V7z',
      'M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
    ],
  },
  {
    key: 'shield',
    name: 'Alarm System',
    tags: ['alarm', 'security', 'system', 'safety', 'shield', 'protection'],
    paths: [
      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    ],
  },
  {
    key: 'first-aid',
    name: 'First Aid Kit',
    tags: ['first aid', 'medical', 'health', 'emergency', 'kit', 'safety', 'medicine'],
    paths: [
      'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
      'M12 8v8M8 12h8',
    ],
  },
  {
    key: 'smoke-detector',
    name: 'Smoke Detector',
    tags: ['smoke detector', 'carbon monoxide', 'safety', 'fire', 'alarm'],
    paths: [
      'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 0 0-18 0',
      'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
      'M12 7v1M12 16v1M7 12h1M16 12h1',
    ],
  },

  // ── Accessibility ─────────────────────────────────────────────────
  {
    key: 'wheelchair',
    name: 'Wheelchair Accessible',
    tags: ['accessible', 'wheelchair', 'disability', 'ada', 'handicap'],
    paths: [
      'M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'M9 9l1 9h4M14 9l-2 4H9',
      'M10 18a6 6 0 1 0 4.5-5.8',
    ],
  },
  {
    key: 'elevator',
    name: 'Elevator',
    tags: ['elevator', 'lift', 'accessible', 'floor', 'building'],
    paths: [
      'M5 2h14a2 2 0 0 1 2 2v18H3V4a2 2 0 0 1 2-2z',
      'M9 10l3-3 3 3',
      'M9 14l3 3 3-3',
    ],
  },

  // ── Utilities ─────────────────────────────────────────────────────
  {
    key: 'zap',
    name: 'Generator / Backup Power',
    tags: ['generator', 'power', 'electricity', 'backup power', 'zap', 'surge'],
    paths: [
      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    ],
  },
  {
    key: 'package',
    name: 'Storage / Luggage',
    tags: ['storage', 'closet', 'luggage', 'space', 'bags', 'locker'],
    paths: [
      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      'M3.27 6.96L12 12.01l8.73-5.05',
      'M12 22.08V12',
    ],
  },
  {
    key: 'trash',
    name: 'Trash / Recycling',
    tags: ['trash', 'recycling', 'garbage', 'waste', 'bins', 'disposal'],
    paths: [
      'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
      'M10 11v6M14 11v6',
    ],
  },
  {
    key: 'printer',
    name: 'Printer',
    tags: ['printer', 'office', 'work', 'print', 'documents', 'business'],
    paths: [
      'M6 9V2h12v7',
      'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2',
      'M6 14h12v8H6z',
    ],
  },
  {
    key: 'map',
    name: 'Local Area / Neighborhood',
    tags: ['map', 'location', 'nearby', 'neighborhood', 'area', 'directions', 'local'],
    paths: [
      'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z',
      'M8 2v16M16 6v16',
    ],
  },
  {
    key: 'home',
    name: 'Home',
    tags: ['home', 'house', 'property', 'building', 'residence'],
    paths: [
      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'M9 22V12h6v10',
    ],
  },

  // ── Family & Pets ─────────────────────────────────────────────────
  {
    key: 'baby',
    name: 'Baby / Family Friendly',
    tags: ['baby', 'crib', 'highchair', 'family', 'children', 'kids', 'infant'],
    paths: [
      'M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
      'M5 20a7 7 0 0 1 14 0',
      'M9 14v2M15 14v2',
    ],
  },
  {
    key: 'pet',
    name: 'Pet Friendly',
    tags: ['pets', 'dogs', 'cats', 'animals', 'pet friendly', 'dog', 'cat'],
    paths: [
      'M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5',
      'M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14',
      'M11.5 17H8',
    ],
  },

  // ── Workspace ────────────────────────────────────────────────────
  {
    key: 'briefcase',
    name: 'Dedicated Workspace',
    tags: ['workspace', 'desk', 'office', 'work', 'remote work', 'business', 'briefcase'],
    paths: [
      'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z',
      'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
      'M2 13h20',
    ],
  },
];

export const AMENITY_ICONS_MAP: Record<string, AmenityIconDef> = Object.fromEntries(
  AMENITY_ICONS.map((icon) => [icon.key, icon])
);

export const DEFAULT_ICON_KEY = 'home';

export function searchIcons(query: string): AmenityIconDef[] {
  const q = query.toLowerCase().trim();
  if (!q) return AMENITY_ICONS;
  return AMENITY_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(q) ||
      icon.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
