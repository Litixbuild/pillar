import FeaturePageLayout, { PageHero, FeatureGrid, CTASection, Divider } from '@/components/FeaturePageLayout';

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

      {/* Pain points block */}
      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#F5EDD5', marginBottom: 20 }}>Sound Familiar?</p>
        <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, lineHeight: 1.2, color: '#fff', marginBottom: 36 }}>
          The same questions,<br />every single booking.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
          {[
            '"What\'s the WiFi password again?"',
            '"Where do I put the trash on checkout day?"',
            '"Can I check out a little later?"',
            '"What\'s good to eat near the place?"',
          ].map(q => (
            <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 14, color: 'rgba(245,237,213,0.45)', flexShrink: 0 }}>✕</span>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>{q}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <ZapIcon />, title: 'Instant Guest Access', desc: 'One QR code gives guests WiFi, codes, rules, and guides the moment they arrive. No messages needed.' },
        { icon: <MessageIcon />, title: 'AI Handles the Questions', desc: '24/7 concierge answers local recommendations, property questions, and itinerary requests automatically.' },
        { icon: <StarIcon />, title: 'Five-Star Reviews', desc: 'Guests who feel genuinely looked after leave reviews that future guests actually read before booking.' },
        { icon: <ClockIcon />, title: 'Late Checkout On Your Terms', desc: 'Guests request, you approve. Structured and professional — no awkward last-minute texts.' },
        { icon: <TrendingUpIcon />, title: 'Repeat Bookings', desc: 'Exceptional experiences create direct inquiries and repeat guests who book without searching Airbnb.' },
        { icon: <MapPinIcon />, title: 'Local Expertise, Built In', desc: 'The AI concierge knows your neighbourhood — restaurants, activities, and what\'s actually worth visiting.' },
      ]} />


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
