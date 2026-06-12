import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder } from '@/components/FeaturePageLayout';

function GridIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>; }
function LayersIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><polyline points="2 17 12 22 22 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="2 12 12 17 22 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function SparkleIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>; }
function WrenchIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function QRIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" /><rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" /><rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" /><path d="M14 14h2v2h-2zM18 14h3M18 16v2h3M14 18v3h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function HotelsPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Hotels"
        title="Enterprise Hospitality,"
        titleAccent="At Every Level."
        subtitle="From boutique properties to multi-floor hotels, Pillar's commercial platform gives hotel operators room-level guest portals, work order routing, and amenity management at scale."
        cta="Talk to Sales"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
        <ScreenshotPlaceholder label="Hotel Dashboard — Commercial View" aspect="16/9" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <GridIcon />, title: 'Room-Level Portals', desc: 'Each guest accesses a portal specific to their room type — tailored amenities, guides, and info.' },
        { icon: <LayersIcon />, title: 'Room Type System', desc: 'Assign rooms to types (Standard, Deluxe, Suite) with type-specific amenity guides and content.' },
        { icon: <SparkleIcon />, title: 'AI Concierge per Hotel', desc: 'Every hotel gets a full AI concierge — local discovery, day planning, and property knowledge.' },
        { icon: <WrenchIcon />, title: 'Work Orders by Room', desc: 'Guests submit maintenance requests tied to their room number — routed to the right team instantly.' },
        { icon: <ClockIcon />, title: 'Late Checkout at Scale', desc: 'Guests request late checkout from their room portal. Hotel staff review and respond centrally.' },
        { icon: <QRIcon />, title: 'One QR Per Hotel', desc: 'A single hotel-wide QR code. Guests are prompted to enter their room number for personalised access.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Room Type Management"
        title="Tailored Content for"
        titleAccent="Every Room Category."
        body={[
          'Create room types — Standard, Deluxe, Suite, Penthouse — each with their own amenity guides.',
          'Assign individual rooms or ranges (e.g. floors 3–8 = Deluxe) to a room type in seconds.',
          'Suite guests see the hot tub guide. Standard guests see the gym access info. Relevant, not overwhelming.',
          'Hotel-wide amenities (pool, spa, restaurant hours) surface for every guest regardless of room type.',
        ]}
        screenshotLabel="Hotel Dashboard — Room Type Editor"
        reverse={false}
      />

      <SplitSection
        eyebrow="Operations"
        title="Work Orders That"
        titleAccent="Go to the Right Team."
        body={[
          'Guests submit maintenance requests through their room portal — with their room number attached automatically.',
          'Categories route to specific contacts: housekeeping, engineering, front desk, or management.',
          'Hotel managers see all open requests across all rooms in a single dashboard view.',
          'Full activity log per hotel — filterable by room, status, and date.',
        ]}
        screenshotLabel="Hotel Dashboard — Work Orders"
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Ready to Upgrade Your Hotel's Guest Experience?"
        subtitle="Set up your hotel in minutes. Room types and all."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
