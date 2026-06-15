import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder, FAQSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Digital Guest Portal for Boutique Hotels & Short-Term Rentals | Pillar',
  description: 'Give hotel guests a premium digital experience from check-in to checkout. QR-accessible room guides, AI concierge, and maintenance requests — no app download required.',
};

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
        screenshotLabel="Hotel Dashboard — Room Type Editor" hideScreenshot
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
        screenshotLabel="Hotel Dashboard — Work Orders" hideScreenshot
        reverse={true}
      />

      <Divider />

      <FAQSection faqs={[
        { q: 'How does Pillar work for hotels with many room types?', a: 'You create room types in your dashboard — Standard, Deluxe, Suite, Penthouse — and assign rooms to each type. Each room type has its own amenity guides and content, while hotel-wide information like pool hours and spa access is shared across all guests.' },
        { q: 'Does each room need its own QR code?', a: 'No. A single hotel-wide QR code works for all guests. When they scan, they\'re prompted to enter their room number and the portal adapts to show content specific to their room type.' },
        { q: 'How are maintenance requests tied to specific rooms?', a: 'When a guest submits a work order, their room number is automatically attached to the request. Hotel staff can filter work orders by room, floor, or status from the manager dashboard.' },
        { q: 'Can different categories of work orders go to different hotel departments?', a: 'Yes. You configure routing per category — housekeeping requests go to housekeeping, engineering issues go to your maintenance team, and front desk matters route to front desk staff.' },
        { q: 'Is the AI concierge available for hotel guests?', a: 'Yes. Every hotel gets a full AI concierge that knows the local area and can plan full day itineraries, recommend restaurants, and answer property-specific questions for guests at any hour.' },
        { q: 'Is Pillar suitable for small boutique hotels?', a: 'Absolutely. Pillar scales from a single-room boutique property to a multi-floor hotel. The room type system is powerful when needed but you can start simple and expand as your operation grows.' },
      ]} />

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#F5EDD5', marginBottom: 20, textAlign: 'center' }}>Explore the Platform</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { href: '/platform/qr-portal', label: 'QR Guest Portal', desc: 'One QR code for the whole hotel.' },
            { href: '/platform/ai-concierge', label: 'AI Concierge', desc: 'Local recommendations and property Q&A.' },
            { href: '/platform/work-orders', label: 'Work Orders', desc: 'Room-level requests routed automatically.' },
            { href: '/platform/late-checkout', label: 'Late Checkout', desc: 'Guest requests managed from one view.' },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} style={{ padding: '18px', borderRadius: 12, border: '1px solid rgba(245,237,213,0.10)', background: 'rgba(245,237,213,0.03)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', margin: 0 }}>{label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', margin: 0 }}>{desc}</p>
            </a>
          ))}
        </div>
      </section>

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
