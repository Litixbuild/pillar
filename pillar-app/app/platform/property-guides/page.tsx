import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, PhoneHero } from '@/components/FeaturePageLayout';

function WifiIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function KeyIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BookIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M8 7h8M8 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
function ImageIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" /><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" /><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function VideoIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" /></svg>; }
function LayoutIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }

export default function PropertyGuidesPage() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="Property Guides"
        title="Everything They Need,"
        titleAccent="Right When They Need It."
        subtitle="Build a complete digital guide for your property — WiFi passwords, door codes, house rules, and appliance how-tos — all beautifully organised and instantly accessible."
        cta="Build Your Guide"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
        <PhoneHero left="/images/screenshots/property-guides-hero.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <WifiIcon />, title: 'WiFi Credentials', desc: 'Display your network name and password clearly. Encrypted at rest, readable on scan.' },
        { icon: <KeyIcon />, title: 'Door & Garage Codes', desc: 'Securely store entry codes and surface them only via the authenticated guest portal.' },
        { icon: <BookIcon />, title: 'House Rules', desc: 'Set expectations clearly from arrival. Noise policies, check-out times, pet rules — all in one place.' },
        { icon: <ImageIcon />, title: 'Photo Galleries', desc: 'Showcase your property with a rich photo gallery — rooms, outdoor spaces, and amenities.' },
        { icon: <VideoIcon />, title: 'Video & PDF Guides', desc: 'Attach video tutorials or PDF manuals for appliances, hot tubs, smart home systems, and more.' },
        { icon: <LayoutIcon />, title: 'Custom Amenity Windows', desc: 'Create unlimited custom guide sections — from pool access to trash pickup schedules.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Amenity Windows"
        title="As Many Guides"
        titleAccent="As You Need."
        body={[
          'Create unlimited "windows" — individual guide sections for any amenity or topic.',
          'Each window supports rich content: text, images, videos, and PDF attachments.',
          'Organise by category so guests can find exactly what they need without scrolling through everything.',
          'Update any guide at any time from the dashboard — guests always see the latest version.',
        ]}
        screenshotLabel="Dashboard — Amenity Window Editor" screenshotSrc="/images/screenshots/property-guides-editor.png"
        reverse={false}
      />

      <SplitSection
        eyebrow="Security First"
        title="Sensitive Info,"
        titleAccent="Protected by Design."
        body={[
          'All codes and passwords are encrypted at rest using AES-256-GCM — the same standard used by banks.',
          'Only accessible through the authenticated guest portal — never exposed in plain text URLs.',
          'Each portal URL is a unique UUID with 122 bits of entropy. Practically impossible to guess.',
          'Update codes at any time and changes reflect immediately across every guest session.',
        ]}
        screenshotLabel="Dashboard — Property Settings" screenshotSrc="/images/screenshots/property-guides-settings.mp4"
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Build Your Property Guide Today"
        subtitle="Takes 10 minutes. Saves hundreds of messages per year."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
