import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, CTASection, Divider, FAQSection, PainPointsSection, ExploreLinksSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Guest Experience Platform for Rental Hosts | Pillar',
  description: 'Turn one-time guests into five-star reviews. Pillar gives rental hosts a premium guest portal with AI concierge, property guides, and work orders — all from one QR scan.',
};

function StarIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>; }
function ZapIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MessageIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function TrendingUpIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MapPinIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.4" /><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" /></svg>; }

export default function AirbnbHostsPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Rental Hosts"
        title="Stand Out From"
        titleAccent="Every Other Listing."
        subtitle="When every property looks the same, the experience is what wins. Pillar gives rental hosts a premium guest portal that turns five-star stays into five-star reviews."
        cta="Start Free Today"
        ctaHref="/manager/login"
      />

      <Divider />

      <PainPointsSection
        eyebrow="Sound Familiar?"
        title={<>The same questions,<br />every single booking.</>}
        points={[
          '"What\'s the WiFi password again?"',
          '"Where do I put the trash on checkout day?"',
          '"Can I check out a little later?"',
          '"What\'s good to eat near the place?"',
        ]}
      />

      <Divider />

      <FeatureGrid features={[
        { icon: <ZapIcon />, title: 'Instant Guest Access', desc: 'One QR code gives guests WiFi, codes, rules, and guides the moment they arrive. No messages needed.' },
        { icon: <MessageIcon />, title: 'AI Handles the Questions', desc: '24/7 concierge answers local recommendations, property questions, and itinerary requests automatically.' },
        { icon: <StarIcon />, title: 'Five-Star Reviews', desc: 'Guests who feel genuinely looked after leave reviews that future guests actually read before booking.' },
        { icon: <ClockIcon />, title: 'Late Checkout On Your Terms', desc: 'Guests request, you approve. Structured and professional — no awkward last-minute texts.' },
        { icon: <TrendingUpIcon />, title: 'Repeat Bookings', desc: 'Exceptional experiences create direct inquiries and repeat guests who come back without searching listing platforms.' },
        { icon: <MapPinIcon />, title: 'Local Expertise, Built In', desc: 'The AI concierge knows your neighbourhood — restaurants, activities, and what\'s actually worth visiting.' },
      ]} />


      <Divider />

      <FAQSection faqs={[
        { q: 'How does Pillar help with guest reviews?', a: 'A better guest experience leads to better reviews. When guests have instant access to everything they need — WiFi, house rules, local spots, and a 24/7 AI concierge — they feel genuinely looked after. That translates directly into five-star feedback.' },
        { q: 'Do guests need to download an app?', a: 'No. Guests scan a QR code you place at your property and the guest portal opens instantly in their browser. No app, no account, no friction.' },
        { q: 'Will this work with major booking platforms and direct bookings?', a: 'Yes. Pillar is completely platform-independent. It works alongside any booking platform you use, as well as direct bookings. The QR portal is physical — it lives at your property, not inside any platform.' },
        { q: 'How does the AI concierge help rental hosts specifically?', a: 'The AI handles the questions every host gets — "What\'s the WiFi?", "Where should we eat?", "Can we check out late?" — automatically, around the clock. You get fewer messages and your guests get faster, better answers.' },
        { q: 'Can I customise the portal to match my property\'s brand?', a: 'Yes. You control the name, property details, photos, guides, and the content guests see. Every portal reflects your specific property and the experience you want to deliver.' },
        { q: 'How quickly can I get set up?', a: 'Most hosts set up their first property in under 10 minutes. Add your WiFi, door code, and house rules, download your QR code, and you\'re ready. You can build out the full guide over time.' },
      ]} />

      <Divider />

      <ExploreLinksSection
        eyebrow="What's Included"
        links={[
          { href: '/platform/qr-portal', label: 'QR Guest Portal', desc: 'One scan — everything they need.' },
          { href: '/platform/ai-concierge', label: 'AI Concierge', desc: '24/7 answers and local recommendations.' },
          { href: '/platform/property-guides', label: 'Property Guides', desc: 'WiFi, codes, and house rules.' },
          { href: '/platform/late-checkout', label: 'Late Checkout', desc: 'Requests handled without texts.' },
          { href: '/platform/work-orders', label: 'Work Orders', desc: 'Maintenance routed automatically.' },
        ]}
      />

      <Divider />

      <CTASection
        title="Turn Your Listing Into a Five-Star Experience"
        subtitle="Join rental hosts already delivering premium stays with Pillar."
        buttonText="Get Started Free"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
