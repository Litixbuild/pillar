import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder } from '@/components/FeaturePageLayout';

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

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
        <ScreenshotPlaceholder label="Late Checkout — Guest Request Flow" aspect="16/9" />
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
          'They\'re shown the standard checkout time and asked for their preferred departure time.',
          'Status updates — pending, approved, denied — display directly in the portal.',
          'No app required. Works on any phone, any browser, from check-in to checkout.',
        ]}
        screenshotLabel="Guest Portal — Late Checkout Request"
        reverse={false}
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
        screenshotLabel="Dashboard — Late Checkout Management"
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Give Guests Flexibility Without the Hassle"
        subtitle="Included with every Pillar plan. No extra setup needed."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
