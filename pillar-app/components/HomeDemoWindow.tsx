'use client';

import { useEffect, useState } from 'react';

/* ── Icon paths copied 1:1 from lib/amenityIcons.ts so this preview matches the real guest portal exactly.
   Icons render in plain ink (not per-amenity brand colors) — that's how the real AmenitySquare does it. ── */
const ICON_PATHS: Record<string, string[]> = {
  wifi: [
    'M5 12.55a11 11 0 0 1 14.08 0',
    'M1.42 9a16 16 0 0 1 21.16 0',
    'M8.53 16.11a6 6 0 0 1 6.95 0',
    'M12 20h.01',
  ],
  pool: [
    'M2 12c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
    'M2 7c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
    'M2 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1',
  ],
  tv: [
    'M21 3H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z',
    'M8 21h8',
    'M12 17v4',
  ],
  key: [
    'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4',
  ],
  grill: [
    'M4 11h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z',
    'M12 13l-2 8M12 13l2 8',
    'M8 11c0-4 8-4 8 0',
    'M6 3c1 1.5 3 2 6 2s5-.5 6-2',
  ],
};

function MiniIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {ICON_PATHS[iconKey].map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* ── Same room-grouping convention as the real property page: a "General" row
   for WiFi/Garage, then one row per room ── */
const ROOMS: { name: string; items: { key: string; label: string }[] }[] = [
  { name: 'General', items: [
    { key: 'wifi', label: 'WiFi' },
    { key: 'key', label: 'Garage Code' },
  ] },
  { name: 'Living Room', items: [
    { key: 'tv', label: 'Television' },
  ] },
  { name: 'Backyard', items: [
    { key: 'pool', label: 'Pool Heater' },
    { key: 'grill', label: 'Grill' },
  ] },
];

const PHOTOS = [
  '/images/screenshots/hp1.jpg',
  '/images/screenshots/hp2.jpg',
  '/images/screenshots/hp3.jpg',
  '/images/screenshots/hp4.jpg',
  '/images/screenshots/hp5.jpg',
];

/* ── Amenities the demo cycles through, each opening its own instructional video ── */
const DEMO_ITEMS: { key: string; label: string; video: string }[] = [
  { key: 'tv', label: 'Television', video: '/images/screenshots/tvgirl.mp4' },
  { key: 'pool', label: 'Pool Heater', video: '/images/screenshots/poolguy.mp4' },
  { key: 'grill', label: 'Grill', video: '/images/screenshots/grill.mp4' },
];

const INK = 'rgba(30,41,59,0.65)';
const INK_SELECTED = 'rgba(100,80,40,0.90)';
const TITLE = '#1e293b';
const ACCENT = 'rgba(100,80,40,0.82)';
const DIVIDER = 'rgba(100,80,40,0.10)';

type Phase = 'idle' | 'selected' | 'open' | 'closing';
const SEQUENCE: { phase: Phase; duration: number }[] = [
  { phase: 'idle', duration: 3000 },
  { phase: 'selected', duration: 700 },
  { phase: 'open', duration: 6500 },
  { phase: 'closing', duration: 550 },
];

/* ── A self-contained, looping mockup of the real guest property-experience page,
   used on the marketing homepage in place of a static screenshot so it stays
   accurate forever and never needs to be re-captured. ── */
export default function HomeDemoWindow({ dark }: { dark: boolean }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeItem, setActiveItem] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    let itemIdx = 0;
    let timer: ReturnType<typeof setTimeout>;
    function run() {
      setPhase(SEQUENCE[i].phase);
      setActiveItem(itemIdx);
      timer = setTimeout(() => {
        i = (i + 1) % SEQUENCE.length;
        if (i === 0) itemIdx = (itemIdx + 1) % DEMO_ITEMS.length;
        run();
      }, SEQUENCE[i].duration);
    }
    run();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPhotoIdx((i) => (i + 1) % PHOTOS.length), 8800);
    return () => clearInterval(id);
  }, []);

  const itemSelected = phase === 'selected' || phase === 'open' || phase === 'closing';
  const modalMounted = phase === 'selected' || phase === 'open' || phase === 'closing';
  const modalVisible = phase === 'open';
  const current = DEMO_ITEMS[activeItem];

  const bezel = dark ? '#0b0b0b' : '#161616';

  return (
    <div
      className="relative w-full h-full"
      style={{
        borderRadius: 42,
        background: bezel,
        padding: 8,
      }}
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2" style={{ width: 64, height: 16, borderRadius: 999, background: bezel }} />

      {/* Screen */}
      <div
        className="relative w-full h-full overflow-hidden flex flex-col"
        style={{
          borderRadius: 34,
          backgroundImage: 'url(/images/White.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Page header — matches the real "Home Amenities" screen title */}
        <div className="shrink-0 px-6 pt-9 pb-3 text-center">
          <p className="font-serif text-lg tracking-[0.04em]" style={{ color: TITLE }}>Home Amenities</p>
        </div>

        {/* Photo carousel — same swipeable-strip pattern as the real property page */}
        <div className="relative mx-4 shrink-0 overflow-hidden rounded-3xl" style={{ height: 168 }}>
          <div
            className="flex h-full"
            style={{
              width: `${PHOTOS.length * 100}%`,
              transform: `translateX(-${(photoIdx / PHOTOS.length) * 100}%)`,
              transition: 'transform 900ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {PHOTOS.map((src, i) => (
              <div key={i} className="h-full flex-none bg-cover bg-center" style={{ width: `${100 / PHOTOS.length}%`, backgroundImage: `url(${src})` }} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.38), transparent)' }} />
          <div className="pointer-events-none absolute bottom-1.5 flex w-full items-center justify-center gap-1">
            {PHOTOS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{ width: i === photoIdx ? '11px' : '4px', height: '4px', background: i === photoIdx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)' }}
              />
            ))}
          </div>
        </div>

        {/* Spacer — nudges the amenities card toward the bottom without leaving an oversized gap */}
        <div style={{ flex: 1, maxHeight: 28, minHeight: 14 }} />

        {/* Amenities card — mirrors the real frosted card with General + per-room sections */}
        <div className="mx-4 mb-7 shrink-0 rounded-3xl" style={{
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div className="px-4 pt-4 pb-5 space-y-4">
            {ROOMS.map((room, i) => (
              <div key={room.name}>
                {i > 0 && <div className="h-px mb-4" style={{ background: DIVIDER }} />}
                <p className="font-serif text-xs mb-2.5" style={{ color: ACCENT }}>{room.name}</p>
                <div className="flex gap-2">
                  {room.items.map(({ key, label }) => {
                    const selected = key === current.key && itemSelected;
                    return (
                      <div
                        key={key}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-300"
                        style={{
                          width: 58,
                          height: 64,
                          flexShrink: 0,
                          background: selected ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)',
                          border: `1px solid ${selected ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.07)'}`,
                          boxShadow: selected ? '0 4px 16px rgba(0,0,0,0.10)' : '0 3px 10px rgba(0,0,0,0.06)',
                          transform: selected ? 'scale(0.96)' : 'scale(1)',
                        }}
                      >
                        <div style={{ color: selected ? INK_SELECTED : INK }}>
                          <MiniIcon iconKey={key} className="h-4.5 w-4.5" />
                        </div>
                        <span className="px-1 text-center text-[6.5px] font-medium leading-tight" style={{ color: selected ? TITLE : INK }}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenity detail overlay — cycles through Television / Pool Heater / Grill, each playing its own video — anchored toward the bottom of the screen */}
        {modalMounted && (
          <div
            className="absolute inset-x-5 flex flex-col overflow-hidden"
            style={{
              bottom: '14%',
              height: 190,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? 'scale(1)' : 'scale(0.94)',
              transition: 'opacity 420ms ease, transform 420ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ color: INK_SELECTED }}>
                <MiniIcon iconKey={current.key} className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-semibold" style={{ color: TITLE }}>{current.label}</span>
            </div>
            <div className="flex-1 px-2 pb-2">
              <video
                key={current.video}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                className="w-full h-full rounded-xl object-cover"
                style={{ display: 'block' }}
              >
                <source src={current.video} type="video/mp4" />
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
