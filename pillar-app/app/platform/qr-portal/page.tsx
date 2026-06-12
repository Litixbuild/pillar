import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, PhoneHero } from '@/components/FeaturePageLayout';

function QRCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="3" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5.5" y="5.5" width="2" height="2" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="16.5" y="5.5" width="2" height="2" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5.5" y="16.5" width="2" height="2" fill="currentColor" />
      <path d="M14 14h2v2h-2zM18 14h3M18 16v2h3M14 18v3h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function LockOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 11V7a5 5 0 019.9-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function QRPortalPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="QR Guest Portal"
        title="One Scan."
        titleAccent="Everything They Need."
        subtitle="No app to download. No account to create. A single QR code gives your guests instant access to everything your property has to offer — from arrival to departure."
        cta="Get Started Free"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
        <PhoneHero left="/images/screenshots/qr-portal-hero.png" right="/images/screenshots/qr-portal-guest.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <QRCodeIcon />, title: 'Unique QR Per Property', desc: 'Each property gets its own permanent QR code, generated instantly from your dashboard.' },
        { icon: <PhoneIcon />, title: 'No App Required', desc: 'Works on any smartphone browser — iOS, Android, any device. Zero friction for your guests.' },
        { icon: <ZapIcon />, title: 'Instant Access', desc: 'The moment they scan, everything loads. WiFi, house rules, guides — all right there.' },
        { icon: <RefreshIcon />, title: 'Always Up To Date', desc: 'Update your property info any time. Every scan reflects the latest version automatically.' },
        { icon: <StarIcon />, title: 'Five-Star Impressions', desc: 'A seamless arrival experience sets the tone for the entire stay — and for your reviews.' },
        { icon: <LockOpenIcon />, title: 'Secure by Design', desc: 'Each portal URL uses a unique UUID — 122 bits of entropy. Practically unguessable.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="How It Works"
        title="Set Up Once."
        titleAccent="Works Forever."
        body={[
          'Create your property in the Pillar dashboard and add your WiFi, codes, house rules, and guides.',
          'Download your unique QR code as a high-resolution image — print it, frame it, put it on the counter.',
          'Guests arrive, scan, and instantly access everything. You never have to send a message again.',
          'Update any information at any time from the dashboard — the QR code stays the same.',
        ]}
        screenshotLabel="Dashboard — QR Code Generator" screenshotSrc="/images/screenshots/qr-portal-setup.png" hideScreenshot
        reverse={false}
      />

      <SplitSection
        eyebrow="Guest Experience"
        title="Frictionless From"
        titleAccent="First Glance."
        body={[
          'A clean, branded interface that reflects the quality of your property.',
          'House rules, WiFi password, door codes, and appliance guides all in one scroll.',
          'Built-in AI concierge answers questions, suggests local spots, and plans their day.',
          'Late checkout requests handled directly in the portal — no texts, no calls.',
        ]}
        screenshotLabel="Guest Portal — Property View" screenshotSrc="/images/screenshots/qr-portal-guest.png" phoneScreenshot
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Ready to Elevate Your Guest Experience?"
        subtitle="Set up your first property in minutes. No credit card required."
        buttonText="Start For Free"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
