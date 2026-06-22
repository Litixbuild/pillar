import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder, FAQSection, ExploreLinksSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Tenant Communication Tools for Residential Property Managers | Pillar',
  description: 'Streamline tenant communication with digital property guides, maintenance request routing, and a structured checkout process — all managed from one clean dashboard.',
};

function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>; }
function FileTextIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
function WrenchIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function UsersIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function ResidentialPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Residential Property Managers"
        title="Modern Tools for"
        titleAccent="Modern Landlords."
        subtitle="Long-term tenants expect clarity and responsiveness. Pillar gives residential managers a professional system for onboarding tenants, handling maintenance, and reducing unnecessary contact."
        cta="Get Started Free"
        ctaHref="/manager/login"
      />


      <Divider />

      <FeatureGrid features={[
        { icon: <HomeIcon />, title: 'Digital Property Handbook', desc: 'WiFi, trash schedules, appliance guides, building rules — everything tenants need, always accessible.' },
        { icon: <WrenchIcon />, title: 'Structured Maintenance Requests', desc: 'Tenants submit categorised requests through the portal. The right contractor is notified automatically.' },
        { icon: <FileTextIcon />, title: 'House Rules On Record', desc: 'Clear, always-accessible house rules eliminate misunderstandings and protect you in disputes.' },
        { icon: <UsersIcon />, title: 'Multi-Unit Management', desc: 'Manage multiple units across multiple buildings from one dashboard. Add units at $9.99/month each.' },
        { icon: <BellIcon />, title: 'Instant Notifications', desc: 'Every maintenance request triggers an immediate alert — email or SMS — to the right contact.' },
        { icon: <ShieldIcon />, title: 'Professional First Impression', desc: 'A digital portal signals to tenants that you run a professional, organised operation from day one.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Tenant Onboarding"
        title="Start the Tenancy"
        titleAccent="on the Right Foot."
        body={[
          'Print a QR code and include it with move-in materials. Tenants scan to access everything.',
          'Property handbook, building access info, utility contacts, and house rules — all in one place.',
          'Update any information at any time. Tenants always see the current version.',
          'Sets a professional, organised tone that reduces disputes and improves the relationship.',
        ]}
        screenshotLabel="Tenant Portal — Move-In View" hideScreenshot
        reverse={false}
      />

      <SplitSection
        eyebrow="Maintenance"
        title="A Proper System"
        titleAccent="for Every Request."
        body={[
          'Tenants submit requests through the portal — categorised, described, timestamped.',
          'Each category routes to the right contractor or team. No more forwarding texts.',
          'Full history of every request per unit. Ideal for resolving disputes or tracking recurring issues.',
          'Resolve requests from the dashboard. Tenants can see status without calling.',
        ]}
        screenshotLabel="Dashboard — Maintenance Activity" hideScreenshot
        reverse={true}
      />

      <Divider />

      <FAQSection faqs={[
        { q: 'How is Pillar different from a typical property management tool?', a: 'Most property management software is built for the manager. Pillar is built around the tenant and guest experience — a QR-accessible portal they use throughout their tenancy to find information, submit maintenance requests, and communicate without unnecessary back-and-forth.' },
        { q: 'Can I use Pillar for long-term rental properties?', a: 'Yes. Pillar works well for long-term residential rentals. The guest portal becomes a permanent resource for tenants — house rules, appliance guides, utility contacts, and maintenance requests all in one place for the duration of the tenancy.' },
        { q: 'How do tenants submit maintenance requests?', a: 'Tenants access the portal via QR code, navigate to work orders, select the appropriate category, describe the issue, and submit. The right contact — your plumber, electrician, or property manager — is notified immediately by SMS and email.' },
        { q: 'Can I manage multiple residential units from one account?', a: 'Yes. Add each unit as its own property. Each gets a unique QR code and its own portal. Your dashboard shows all units and all pending maintenance requests in one view.' },
        { q: 'What if a tenant loses access to the QR code?', a: 'The portal URL can be accessed directly, and you can regenerate or share the QR code at any time from your dashboard. Most landlords include the QR code with the tenancy welcome pack and frame it somewhere visible in the unit.' },
        { q: 'How much does Pillar cost for residential properties?', a: 'Pillar starts at $14.99/month for your first unit with every feature included. Each additional unit is $9.99/month. There are no long-term contracts and you can cancel anytime.' },
      ]} />

      <Divider />

      <ExploreLinksSection
        links={[
          { href: '/platform/qr-portal', label: 'QR Guest Portal', desc: 'One QR code — all property info.' },
          { href: '/platform/property-guides', label: 'Property Guides', desc: 'Handbook, rules, and contacts.' },
          { href: '/platform/work-orders', label: 'Work Orders', desc: 'Maintenance routed to the right person.' },
          { href: '/platform/late-checkout', label: 'Late Checkout', desc: 'Structured requests, no awkward texts.' },
        ]}
      />

      <Divider />

      <CTASection
        title="Run Your Properties Like a Professional"
        subtitle="A system that impresses tenants and simplifies your day."
        buttonText="Start Free Today"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
