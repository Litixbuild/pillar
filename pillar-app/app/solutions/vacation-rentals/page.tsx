import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder, FAQSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Property Management Platform for Vacation Rental Managers | Pillar',
  description: 'Manage your entire vacation rental portfolio from one dashboard. QR guest portals, AI concierge, work orders, and late checkout — starting at $14.99/month.',
};

function LayersIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><polyline points="2 17 12 22 22 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="2 12 12 17 22 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function RefreshIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CopyIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ZapIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function WrenchIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BarChartIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="2" y="14" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="8" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="16" y="3" width="4" height="19" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>; }

export default function VacationRentalsPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Vacation Rental Managers"
        title="Scale Your Portfolio,"
        titleAccent="Not Your Workload."
        subtitle="Managing multiple vacation rentals shouldn't mean managing multiple headaches. Pillar gives you one platform to deliver a consistent, premium experience across every property."
        cta="Get Started Free"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
        <ScreenshotPlaceholder label="Manager Dashboard — Multi-Property View" aspect="16/9" src="/images/screenshots/vacation-rentals-hero.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <LayersIcon />, title: 'Multi-Property Dashboard', desc: 'All your properties, all your work orders, all your late checkout requests — one unified view.' },
        { icon: <CopyIcon />, title: 'Duplicate Properties', desc: 'Clone a property\'s setup to a new one in seconds. Guides, categories, and settings carry over.' },
        { icon: <ZapIcon />, title: 'One QR Per Property', desc: 'Each property gets its own branded QR portal. Set up once, works indefinitely.' },
        { icon: <WrenchIcon />, title: 'Centralised Work Orders', desc: 'See every open maintenance request across all properties. Route each one to the right contact.' },
        { icon: <RefreshIcon />, title: 'Instant Updates', desc: 'Changed the WiFi? Updated checkout instructions? Changes reflect across every scan immediately.' },
        { icon: <BarChartIcon />, title: 'Scale at $9.99/Property', desc: 'Add properties at just $9.99/month each. The more you grow, the more you save per property.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Portfolio Management"
        title="Every Property."
        titleAccent="One Platform."
        body={[
          'Your manager dashboard shows every property, every open work order, and every pending checkout request at a glance.',
          'Drill into any property to see its full activity history — work orders, late checkouts, guest events.',
          'Duplicate a fully configured property to bootstrap new listings instantly.',
          'Consistent guest experience across your entire portfolio — brand equity that compounds.',
        ]}
        screenshotLabel="Dashboard — Portfolio Overview" screenshotSrc="/images/screenshots/vacation-rentals-portfolio.png"
        reverse={false}
      />

      <SplitSection
        eyebrow="Pricing That Scales"
        title="Grow Without"
        titleAccent="Breaking the Budget."
        body={[
          'Start at $14.99/month for your first property — the full platform, every feature.',
          'Each additional property is just $9.99/month. No tiers, no feature gates.',
          'A 5-property portfolio costs $54.95/month — less than one saved maintenance call.',
          'Add and remove properties anytime. Only pay for what you have active.',
        ]}
        screenshotLabel="Dashboard — Billing & Properties" screenshotSrc="/images/screenshots/vacation-rentals-billing.png"
        reverse={true}
      />

      <Divider />

      <FAQSection faqs={[
        { q: 'Can I manage multiple vacation rental properties with one account?', a: 'Yes. One Pillar account supports unlimited properties. Your dashboard shows every property, every work order, and every pending guest request in a single unified view.' },
        { q: 'How much does it cost to add more properties?', a: 'Your first property is $14.99/month with every feature included. Each additional property is $9.99/month — no feature gates, no tiers. A 5-property portfolio costs $54.95/month total.' },
        { q: 'Can I copy my setup from one property to another?', a: 'Yes. Pillar lets you duplicate an existing property — guides, categories, routing settings, and house rules all carry over. It takes seconds to bootstrap a new listing.' },
        { q: 'Does each property have its own QR code?', a: 'Yes. Each property gets a unique permanent QR code so guests always access the correct portal for the property they\'re staying at. QR codes never change, so you print them once.' },
        { q: 'Can my properties have different work order contacts?', a: 'Yes. Each property has its own routing configuration. A property in one city can route plumbing issues to a local plumber while a property in another city routes to a completely different contact.' },
        { q: 'Is there a limit on how many properties I can manage?', a: 'No. There is no cap on the number of properties you can add to your account. Each additional property is $9.99/month.' },
      ]} />

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: '#F5EDD5', marginBottom: 20, textAlign: 'center' }}>Explore the Platform</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { href: '/platform/qr-portal', label: 'QR Guest Portal', desc: 'One QR code per property, permanent.' },
            { href: '/platform/ai-concierge', label: 'AI Concierge', desc: 'Local recommendations, 24/7.' },
            { href: '/platform/property-guides', label: 'Property Guides', desc: 'WiFi, codes, guides — always current.' },
            { href: '/platform/work-orders', label: 'Work Orders', desc: 'Smart routing to the right contact.' },
            { href: '/platform/late-checkout', label: 'Late Checkout', desc: 'Approve or deny with one tap.' },
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
        title="Your Portfolio Deserves a Proper System"
        subtitle="Start with one property. Add more whenever you're ready."
        buttonText="Start Managing Smarter"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
