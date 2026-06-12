import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, ScreenshotPlaceholder } from '@/components/FeaturePageLayout';

function WrenchIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BellIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function GridIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>; }
function PhoneIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.5 12.5 19.79 19.79 0 01.46 3.82 2 2 0 012.44 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 9.4a16 16 0 006.29 6.29l1.76-1.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function WorkOrdersPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Work Orders"
        title="Maintenance Done Right,"
        titleAccent="Every Time."
        subtitle="Guests submit maintenance requests directly from their portal. The right person gets notified automatically — no missed messages, no guesswork."
        cta="See It In Action"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 1280, margin: '0 auto' }}>
        <ScreenshotPlaceholder label="Manager Dashboard — Property Health, Resolution Stats & Saved Calls" aspect="16/9" src="/images/screenshots/manager-dashboard.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <GridIcon />, title: 'Categorised Requests', desc: 'Set up custom categories like Plumbing, HVAC, Electrical — guests pick the right one.' },
        { icon: <BellIcon />, title: 'Instant Notifications', desc: 'Email and SMS alerts fire the moment a guest submits a request. Nothing falls through the cracks.' },
        { icon: <PhoneIcon />, title: 'Smart Routing', desc: 'Each category routes to the right contact — your plumber, electrician, or property manager directly.' },
        { icon: <WrenchIcon />, title: 'Detailed Submissions', desc: 'Guests describe the issue in detail. You have everything you need before making the first call.' },
        { icon: <CheckIcon />, title: 'Resolution Tracking', desc: 'Mark orders resolved from the dashboard. Full status history kept for every property.' },
        { icon: <ClockIcon />, title: 'Activity Log', desc: 'Complete history of every work order, by property — searchable and filterable.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Smart Routing"
        title="The Right Person"
        titleAccent="Gets the Message."
        body={[
          'Configure each category with a specific contact — phone number, email, or both.',
          'When a guest submits a plumbing request, your plumber is notified. Not you. Not general support.',
          'SMS and email notifications sent simultaneously for maximum reliability.',
          'Customize notification format per category — include the property address, guest name, and description.',
        ]}
        screenshotLabel="Dashboard — Category Routing Setup" screenshotSrc="/images/screenshots/work-orders-routing.png"
        reverse={false}
      />

      <SplitSection
        eyebrow="Full Visibility"
        title="Nothing Falls"
        titleAccent="Through the Cracks."
        body={[
          'Every open work order visible at a glance from your manager dashboard.',
          'Filter by property, status (open / resolved), or date range.',
          'Resolve orders directly from the dashboard with a single click.',
          'Full history preserved — ideal for tracking recurring issues across properties.',
        ]}
        screenshotLabel="Dashboard — Work Order Activity" screenshotSrc="/images/screenshots/work-orders-activity.png"
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Stop Managing Maintenance by Text"
        subtitle="A structured system for every request. Set up in under 5 minutes."
        buttonText="Get Started Free"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
