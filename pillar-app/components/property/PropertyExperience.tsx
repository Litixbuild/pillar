'use client';

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import ChatConcierge from '@/components/ChatConcierge';
import CopyPasswordButton from './CopyPasswordButton';
import type { AirtableFields, ManagerLayoutItem, Property } from '@/lib/airtable';

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

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base text-white">{children}</h2>;
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/12 p-6 shadow-xl backdrop-blur-sm">
      {children}
    </section>
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

function isAttachmentArray(v: unknown): v is Array<Record<string, unknown>> {
  return Array.isArray(v) && v.every((x) => x && typeof x === 'object');
}

function guessAttachmentKind(url: string): 'image' | 'video' | 'other' {
  const u = url.toLowerCase();
  if (/(\.mp4|\.mov|\.webm)(\?|$)/.test(u)) return 'video';
  if (/(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?|$)/.test(u)) return 'image';
  return 'other';
}

export default function PropertyExperience({
  slug,
  property,
  managerLayout,
  rawFields,
  editableCustomWindows = false,
  onAddWindow,
  onRemoveWindow,
  onReorderWindows,
}: {
  slug: string;
  property: Property;
  managerLayout: ManagerLayoutItem[];
  rawFields: AirtableFields;
  editableCustomWindows?: boolean;
  onAddWindow?: () => void;
  onRemoveWindow?: (index: number) => void;
  onReorderWindows?: (fromIndex: number, toIndex: number) => void;
}) {
  const PREVIEW_FADE_MS = 450;

  const [expanded, setExpanded] = useState(editableCustomWindows ? true : false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fullView, setFullView] = useState<'content' | 'amenities'>('content');
  const [isFullViewTransitioning, setIsFullViewTransitioning] = useState(false);

  const [previewSheetHeightPx, setPreviewSheetHeightPx] = useState<number | null>(null);

  const [openAmenity, setOpenAmenity] = useState<
    null | 'wifi' | 'garageCode' | 'poolHeater' | 'television' | 'coffeeMachine'
  >(null);

  const bio = property.DetailedHouseBio || '';
  const wordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;

  const previewLines = Math.max(3, Math.min(12, Math.ceil(wordCount / 18) || 3));
  const previewMinHeightRem = Math.max(10, Math.min(26, 7.5 + previewLines * 1.55));

  const previewSheetHeightFallbackPx = previewMinHeightRem * 16;
  const previewSheetOuterPaddingBottomPx = 24;
  const previewTitleGapPx = 36;
  const previewSheetBottomPx =
    (previewSheetHeightPx ?? previewSheetHeightFallbackPx) +
    previewSheetOuterPaddingBottomPx +
    previewTitleGapPx;

  const backgroundUrl = useMemo(
    () => property.HeroImage || '/images/heroimage.jpg',
    [property.HeroImage]
  );

  useEffect(() => {
    if (!expanded) return;
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
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/65" />

      {editableCustomWindows ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[30] mx-auto w-full max-w-md px-6 pt-4">
          <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">Edit mode</div>
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-semibold text-white/70">Reorder: drag or use ↑↓</div>
              <button
                type="button"
                onClick={onAddWindow}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15"
              >
                <span className="text-base leading-none">+</span>
                Add window
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!expanded ? (
        <>
          <div
            className="relative mx-auto flex min-h-screen max-w-md flex-col px-6"
            style={{ paddingBottom: `${previewSheetBottomPx}px` }}
          >
            <header className="h-[70vh] w-full" />
          </div>

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
              <h1 className="text-3xl text-white">{property.PropertyName}</h1>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-[20] mx-auto w-full max-w-md px-6 pb-6">
            <button
              data-preview-sheet="1"
              type="button"
              onClick={() => {
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
                <div
                  className="text-sm leading-relaxed text-white/85"
                  style={{ maxHeight: 'calc(70vh - 3rem)', overflow: 'auto' }}
                >
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
          <div className="relative">
            <div
              className={
                'relative mx-auto flex h-screen max-w-md flex-col overflow-hidden px-6 transition-opacity duration-[450ms] ease-in-out ' +
                (isTransitioning || isFullViewTransitioning || fullView !== 'content'
                  ? 'opacity-0 pointer-events-none'
                  : 'opacity-100')
              }
              style={{
                transitionDuration: `${PREVIEW_FADE_MS}ms`,
                paddingTop: editableCustomWindows ? '56px' : undefined,
              }}
            >
              <header className="h-[38vh] w-full flex-none" />

              <div className="-mt-16 flex min-h-0 flex-1 flex-col space-y-6 overflow-auto pb-10">
                <div className="space-y-2">
                  {property.PropertyAddress ? (
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
                      {property.PropertyAddress}
                    </p>
                  ) : null}
                  <h1 className="text-3xl text-white">{property.PropertyName}</h1>
                </div>

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
                    <div className="lux-title text-base text-white">Home Amenities</div>
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

                {managerLayout.length ? (
                  <GlassCard>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <SectionTitle>Amenities</SectionTitle>
                        {editableCustomWindows ? (
                          <button
                            type="button"
                            onClick={onAddWindow}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-semibold text-white hover:bg-white/15"
                            aria-label="Add window"
                            title="Add window"
                          >
                            +
                          </button>
                        ) : null}
                      </div>

                      <div className="space-y-4">
                        {managerLayout.map((item, idx) => {
                          const key = (item.field || '').trim();
                          if (!key) return null;
                          const value = (rawFields as Record<string, unknown>)[key];

                          const renderValue = () => {
                            if (typeof value === 'string') {
                              return value.trim() ? (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{value}</p>
                              ) : (
                                <p className="text-sm text-white/70">(empty)</p>
                              );
                            }

                            if (typeof value === 'number' || typeof value === 'boolean') {
                              return <p className="text-sm text-white/85">{String(value)}</p>;
                            }

                            if (isAttachmentArray(value)) {
                              const first = value[0] as { url?: unknown };
                              const url = typeof first?.url === 'string' ? first.url : '';
                              if (!url) return <p className="text-sm text-white/70">(no attachment)</p>;

                              const kind = guessAttachmentKind(url);
                              if (kind === 'video') {
                                return (
                                  <div className="overflow-hidden rounded-xl border border-white/15">
                                    <video controls className="w-full" preload="metadata">
                                      <source src={url} />
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                );
                              }
                              if (kind === 'image') {
                                // eslint-disable-next-line @next/next/no-img-element
                                return (
                                  <img
                                    src={url}
                                    alt={key}
                                    className="w-full rounded-xl border border-white/15"
                                    loading="lazy"
                                  />
                                );
                              }

                              return (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white/70"
                                >
                                  Open attachment
                                </a>
                              );
                            }

                            return <p className="text-sm text-white/70">(no content)</p>;
                          };

                          return (
                            <div
                              key={`${key}-${idx}`}
                              className={editableCustomWindows ? 'rounded-xl border border-white/10 p-3' : 'space-y-2'}
                              draggable={editableCustomWindows}
                              onDragStart={(e) => {
                                if (!editableCustomWindows) return;
                                e.dataTransfer.setData('text/plain', String(idx));
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                if (!editableCustomWindows) return;
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(e) => {
                                if (!editableCustomWindows) return;
                                e.preventDefault();
                                const from = Number(e.dataTransfer.getData('text/plain'));
                                const to = idx;
                                if (Number.isFinite(from) && onReorderWindows) {
                                  onReorderWindows(from, to);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">
                                  {key}
                                </div>
                                {editableCustomWindows ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onReorderWindows?.(idx, Math.max(0, idx - 1))}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                                      aria-label="Move up"
                                      title="Move up"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onReorderWindows?.(idx, Math.min(managerLayout.length - 1, idx + 1))}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                                      aria-label="Move down"
                                      title="Move down"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onRemoveWindow?.(idx)}
                                      className="text-xs font-semibold text-white/70 underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              <div className="mt-2">{renderValue()}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                ) : null}

                {property.ManagerPhone ? (
                  <GlassCard>
                    <div className="space-y-3">
                      <SectionTitle>Property Manager</SectionTitle>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">Contact</p>
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

                    <div className="h-10 w-10 flex-none" />
                  </div>

                  <div className="mt-5 space-y-4">
                    <AmenityRow
                      title="WiFi"
                      open={openAmenity === 'wifi'}
                      onToggle={() =>
                        setOpenAmenity((v: typeof openAmenity) => (v === 'wifi' ? null : 'wifi'))
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
                        <div className="text-sm text-white/75">Garage code not provided in Airtable.</div>
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
                        <div className="text-sm text-white/75">Pool heater video not provided in Airtable.</div>
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
                        <div className="text-sm text-white/75">Television video not provided in Airtable.</div>
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
