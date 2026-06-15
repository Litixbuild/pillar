import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, PhoneHero, FAQSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Late Checkout Management for Rental Hosts | Pillar',
  description: 'Let guests request a late checkout directly from their portal. Approve or deny with one tap from your dashboard. No awkward texts, no missed messages — just a clean process.',
};

function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CheckSquareIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><polyline points="9 11 12 14 22 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function XCircleIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
function SmileIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function LateCheckoutPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Late Checkout"
        title="Flexible Departures,"
        titleAccent="Zero Friction."
        subtitle="Guests request a late checkout directly from their portal. You approve or deny from your dashboard. No awkward texts, no miscommunication, no surprises at the door."
        cta="Try It Free"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
        <PhoneHero left="/images/screenshots/late-checkout-hero.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <ClockIcon />, title: 'Simple Guest Request', desc: 'Guests tap one button in the portal to request a later checkout. No messages to you needed.' },
        { icon: <CheckSquareIcon />, title: 'One-Tap Approve or Deny', desc: 'Review all pending requests in the dashboard and respond with a single click.' },
        { icon: <BellIcon />, title: 'Instant Guest Notification', desc: 'Guests receive immediate confirmation — approved or denied — right in their portal.' },
        { icon: <XCircleIcon />, title: 'Auto-Expiry', desc: 'Requests that aren\'t actioned automatically expire after 8 hours. No lingering open requests.' },
        { icon: <SmileIcon />, title: 'Better Guest Experience', desc: 'Flexibility on checkout is one of the most appreciated touches — and now it costs you nothing.' },
        { icon: <ShieldIcon />, title: 'Full History', desc: 'Every request logged by property. Approved, denied, expired — always auditable.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="For Guests"
        title="No More Awkward"
        titleAccent="Last-Minute Texts."
        body={[
          'Guests find the late checkout request button right in their portal — one tap, done.',
          'They\'re shown the standard checkout time and can request their preferred departure time.',
          'Once submitted, the host is notified immediately and responds directly from their dashboard.',
          'No app required. Works on any phone, any browser, from check-in to checkout.',
        ]}
        screenshotSrc="/images/screenshots/late-checkout-hero.png"
        reverse={false}
        hideScreenshot
      />

      <SplitSection
        eyebrow="For Hosts"
        title="Full Control,"
        titleAccent="Minimal Effort."
        body={[
          'Pending requests appear prominently in your activity dashboard — never missed.',
          'Approve or deny with one tap. Guests are notified immediately.',
          'See all requests across all properties in a single unified view.',
          'Requests auto-expire after 8 hours if not reviewed — the dashboard stays clean.',
        ]}
        screenshotLabel="Dashboard — Late Checkout Management" screenshotSrc="/images/screenshots/late-checkout-dashboard.png"
        reverse={true}
      />

      <Divider />

      <FAQSection faqs={[
        { q: 'How does a guest request a late checkout?', a: 'Guests tap the late checkout button in their QR portal, select their preferred departure time, and submit. The request is sent to you instantly and you can approve or deny with a single tap from your dashboard.' },
        { q: 'How am I notified of a late checkout request?', a: 'You receive an immediate SMS and email notification when a guest submits a request. All pending requests also appear prominently in your manager dashboard so nothing gets missed.' },
        { q: 'Can I approve or deny from my phone?', a: 'Yes. Your manager dashboard is fully mobile-friendly. You can review and respond to late checkout requests from anywhere, in seconds.' },
        { q: 'What happens if I don\'t respond to a request?', a: 'Requests automatically expire after 8 hours if not reviewed. The guest is notified that their request was not approved, and the dashboard stays clean with no lingering open items.' },
        { q: 'Does the guest get notified of my decision?', a: 'Yes. As soon as you approve or deny, the guest receives an immediate notification in their portal. There is no need for any follow-up messages between you and your guest.' },
        { q: 'Is there a fee for the late checkout feature?', a: 'No. Late checkout management is included in every Pillar plan at no additional cost.' },
      ]} />

      <CTASection
        title="Give Guests Flexibility Without the Hassle"
        subtitle="Included with every Pillar plan. No extra setup needed."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
