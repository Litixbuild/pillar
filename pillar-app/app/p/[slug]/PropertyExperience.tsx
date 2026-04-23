'use client';

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AmenityRow({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/12 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="text-sm font-semibold tracking-wide text-white">{title}</div>
        <div className="text-white/85">
          <ChevronRight className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {open ? <div className="border-t border-white/15 px-5 py-4">{children}</div> : null}
    </div>
  );
}
import ChatConcierge from '@/components/ChatConcierge';
import CopyPasswordButton from './CopyPasswordButton';
import type { Property } from '@/lib/airtable';


function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base text-white">
      {children}
    </h2>
  );
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/12 p-6 shadow-xl backdrop-blur-sm">
      {children}
    </section>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PropertyExperience({
  slug,
  property,
}: {
  slug: string;
  property: Property;
}) {
  const PREVIEW_FADE_MS = 450;

  const [expanded, setExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fullView, setFullView] = useState<'content' | 'amenities'>('content');
  const [isFullViewTransitioning, setIsFullViewTransitioning] = useState(false);

  const [previewSheetHeightPx, setPreviewSheetHeightPx] = useState<number | null>(null);

  const [openAmenity, setOpenAmenity] = useState<
    null | 'wifi' | 'garageCode' | 'poolHeater' | 'television' | 'coffeeMachine'
  >(null);

  const bio = property.DetailedHouseBio || '';
  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;

  // Continuous sizing based on Airtable word count.
  // Roughly: ~18 words/line at this font size; clamp to keep it sane.
  const previewLines = Math.max(3, Math.min(12, Math.ceil(wordCount / 18) || 3));
  const previewMinHeightRem = Math.max(10, Math.min(26, 7.5 + previewLines * 1.55));

  // Keep title block above the actual rendered sheet (bio length varies per property).
  // Use word-count based estimate as a fallback until we can measure.
  const previewSheetHeightFallbackPx = previewMinHeightRem * 16;
  const previewSheetOuterPaddingBottomPx = 24; // matches the pb-6 on the fixed preview container
  const previewTitleGapPx = 36;
  const previewSheetBottomPx =
    (previewSheetHeightPx ?? previewSheetHeightFallbackPx) +
    previewSheetOuterPaddingBottomPx +
    previewTitleGapPx;
  // No truncation: always show the full bio. (We may cap max-height + scroll for extremely long bios.)

  const backgroundUrl = useMemo(
    () => property.HeroImage || '/images/heroimage.jpg',
    [property.HeroImage]
  );

  useEffect(() => {
    if (!expanded) return;
    // Ensure the "new page" feels like a fresh view (no leftover scroll position).
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [expanded]);

  useLayoutEffect(() => {
    if (expanded) return;
    const el = document.querySelector<HTMLButtonElement>('[data-preview-sheet="1"]');
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) setPreviewSheetHeightPx(rect.height);
    };

    update();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, property.DetailedHouseBio]);

  const rootOverflow = expanded ? '' : 'overflow-hidden';
  const previewOpacityClass = isTransitioning ? 'opacity-0' : 'opacity-100';

  return (
    <div className={`min-h-screen bg-[#F9F7F2] font-sans ${rootOverflow}`}>
      {/* Full-screen hero background */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      {/* Subtle gradient for legibility */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/65" />

      {/* Temporary Property Manager logo (preview screen only) */}
      {!expanded ? (
        <div
          className={
            'pointer-events-none fixed inset-x-0 top-10 z-[22] mx-auto flex w-full max-w-md justify-center px-6 transition-opacity duration-[450ms] ease-in-out ' +
            previewOpacityClass
          }
          style={{ transitionDuration: `${PREVIEW_FADE_MS}ms` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pillarlogowhite.png"
            alt="Property Manager"
            className="h-60 w-auto opacity-95 drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:h-72"
          />
        </div>
      ) : null}

      {!expanded ? (
        <>
          {/* Background-only top so the house reads visually */}
          <div
            className="relative mx-auto flex min-h-screen max-w-md flex-col px-6"
            style={{ paddingBottom: `${previewSheetBottomPx}px` }}
          >
            <header className="h-[70vh] w-full" />
          </div>

          {/* Always-visible title block (stays above the sheet) */}
          <div
            className={
              'fixed inset-x-0 z-[21] mx-auto w-full max-w-md px-6 transition-[bottom,opacity] duration-300 ease-out ' +
              previewOpacityClass
            }
            style={{ bottom: `${previewSheetBottomPx}px` }}
          >
            <div className="space-y-2">
              {property.PropertyAddress ? (
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
                  {property.PropertyAddress}
                </p>
              ) : null}
              <h1 className="text-3xl text-white">
                {property.PropertyName}
              </h1>
            </div>
          </div>

          {/* Bottom frosted preview */}
          <div className="fixed inset-x-0 bottom-0 z-[20] mx-auto w-full max-w-md px-6 pb-6">
            <button
              data-preview-sheet="1"
              type="button"
              onClick={() => {
                // Cross-fade: fade OUT the preview screen, then mount the full view and fade it IN.
                setIsTransitioning(true);
                window.setTimeout(() => setExpanded(true), PREVIEW_FADE_MS);
                window.setTimeout(() => setIsTransitioning(false), PREVIEW_FADE_MS * 2);
              }}
              className={
                'group flex w-full items-start justify-between gap-4 rounded-2xl border border-white/20 bg-white/12 px-6 py-5 text-left shadow-xl backdrop-blur-sm transition-opacity duration-[450ms] ease-in-out ' +
                (isTransitioning ? 'opacity-0' : 'opacity-100 hover:bg-white/14')
              }
              style={{ maxHeight: '70vh', transitionDuration: `${PREVIEW_FADE_MS}ms` }}
              aria-label="Open full property details"
            >
              <div className="min-w-0">
                <div className="text-sm leading-relaxed text-white/85" style={{ maxHeight: 'calc(70vh - 3rem)', overflow: 'auto' }}>
                  {property.DetailedHouseBio || 'Welcome. Tap to view house details.'}
                </div>
              </div>
              <div className="flex flex-none items-center justify-center self-center text-white/85">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </div>
        </>
      ) : null}

      {expanded ? (
        <>
          {/* Foreground content */}
          <div className="relative">
            {/* CONTENT screen */}
            <div
              className={
                'relative mx-auto flex h-screen max-w-md flex-col overflow-hidden px-6 transition-opacity duration-[450ms] ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'content'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
              style={{ transitionDuration: `${PREVIEW_FADE_MS}ms` }}
            >
              {/* Hero spacer (lets background read like a hero) */}
              <header className="h-[38vh] w-full flex-none" />

              {/* Floating panel */}
              <div className="-mt-16 flex min-h-0 flex-1 flex-col space-y-6 overflow-auto pb-10">
                <div className="space-y-2">
                  {property.PropertyAddress ? (
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
                      {property.PropertyAddress}
                    </p>
                  ) : null}
                  <h1 className="text-3xl text-white">
                    {property.PropertyName}
                  </h1>
                </div>

                {/* Home Amenities */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFullViewTransitioning(true);
                    window.setTimeout(() => {
                      setFullView('amenities');
                      setIsFullViewTransitioning(false);
                    }, 420);
                  }}
                  className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/12 px-6 py-5 text-left shadow-xl backdrop-blur-sm transition hover:bg-white/14"
                >
                  <div>
                    <div className="lux-title text-base text-white">
                      Home Amenities
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      WiFi, Garage Code, Pool Heater, Television, Coffee Machine
                    </div>
                  </div>
                  <div className="flex flex-none items-center justify-center self-center text-white/85">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </button>

                {property.HouseRules ? (
                  <GlassCard>
                    <div className="space-y-3">
                      <SectionTitle>House Rules</SectionTitle>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                        {property.HouseRules}
                      </p>
                    </div>
                  </GlassCard>
                ) : null}

                {property.ManagerPhone ? (
                  <GlassCard>
                    <div className="space-y-3">
                      <SectionTitle>Property Manager</SectionTitle>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                          Contact
                        </p>
                        <a
                          href={`tel:${property.ManagerPhone}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white/70"
                        >
                          {property.ManagerPhone}
                        </a>
                      </div>
                    </div>
                  </GlassCard>
                ) : null}

                <div className="h-6" />
              </div>
            </div>

            {/* AMENITIES screen */}
            <div
              className={
                'absolute inset-0 transition-opacity duration-[900ms] ease-in-out ' +
                (fullView === 'amenities' && !isTransitioning
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none')
              }
            >
              <div className="relative mx-auto flex h-screen max-w-md flex-col px-6">
                <header className="h-[28vh] w-full flex-none" />

                <div className="-mt-10 flex min-h-0 flex-1 flex-col overflow-auto pb-12">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenAmenity(null);
                        setIsFullViewTransitioning(true);
                        window.setTimeout(() => {
                          setFullView('content');
                          setIsFullViewTransitioning(false);
                        }, 420);
                      }}
                      className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm hover:bg-white/12"
                      aria-label="Back"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="lux-title flex-1 text-center text-xl text-white whitespace-nowrap">
                      Home Amenities
                    </div>

                    {/* spacer to keep title centered (matches back button width) */}
                    <div className="h-10 w-10 flex-none" />
                  </div>

                  <div className="mt-5 space-y-4">
                    <AmenityRow
                      title="WiFi"
                      open={openAmenity === 'wifi'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) =>
                          v === 'wifi' ? null : 'wifi'
                        )
                      }
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/65">Network</p>
                          <p className="text-sm text-white/90">{property.WiFiName}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/65">Password</p>
                            <p className="font-mono text-sm text-white/90">{property.WiFiPassword}</p>
                          </div>
                          <CopyPasswordButton password={property.WiFiPassword} />
                        </div>
                      </div>
                    </AmenityRow>

                    <AmenityRow
                      title="Garage Code"
                      open={openAmenity === 'garageCode'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) =>
                          v === 'garageCode' ? null : 'garageCode'
                        )
                      }
                    >
                      {property.GarageCode ? (
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/65">Code</p>
                          <p className="font-mono text-sm text-white/90 whitespace-pre-wrap">{property.GarageCode}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-white/75">
                          Garage code not provided in Airtable.
                        </div>
                      )}
                    </AmenityRow>

                    <AmenityRow
                      title="Pool Heater"
                      open={openAmenity === 'poolHeater'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) =>
                          v === 'poolHeater' ? null : 'poolHeater'
                        )
                      }
                    >
                      {property.PoolHeater ? (
                        <div className="overflow-hidden rounded-xl border border-white/15">
                          <video controls className="w-full" preload="metadata">
                            <source src={property.PoolHeater} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="text-sm text-white/75">
                          Pool heater video not provided in Airtable.
                        </div>
                      )}
                    </AmenityRow>

                    <AmenityRow
                      title="Television"
                      open={openAmenity === 'television'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) =>
                          v === 'television' ? null : 'television'
                        )
                      }
                    >
                      {property.Television ? (
                        <div className="overflow-hidden rounded-xl border border-white/15">
                          <video controls className="w-full" preload="metadata">
                            <source src={property.Television} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="text-sm text-white/75">
                          Television video not provided in Airtable.
                        </div>
                      )}
                    </AmenityRow>

                    <AmenityRow
                      title="Coffee Machine"
                      open={openAmenity === 'coffeeMachine'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) =>
                          v === 'coffeeMachine' ? null : 'coffeeMachine'
                        )
                      }
                    >
                      {property.CoffeeMachine ? (
                        <div className="overflow-hidden rounded-xl border border-white/15 bg-black/10">
                          {/\.mp4($|\?)/i.test(property.CoffeeMachine) ? (
                            <video controls className="w-full" preload="metadata">
                              <source src={property.CoffeeMachine} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={property.CoffeeMachine}
                              alt="Coffee machine"
                              className="w-full"
                              loading="lazy"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-white/75">
                          Coffee machine attachment not provided in Airtable.
                        </div>
                      )}
                    </AmenityRow>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Concierge (full view only) */}
          {!isTransitioning ? (
            <div className="transition-opacity duration-[900ms] ease-in-out">
              <ChatConcierge slug={slug} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
