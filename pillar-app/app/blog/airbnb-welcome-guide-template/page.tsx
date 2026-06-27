import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'The Ultimate Airbnb Welcome Guide Template (Copy & Paste) | Pillar Blog',
  description: 'A complete, ready-to-use welcome guide template for Airbnb and vacation rental hosts. Copy each section, fill in your property details, and you have a guide in under 20 minutes.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The Ultimate Airbnb Welcome Guide Template (Copy & Paste)',
  description: 'A complete, ready-to-use welcome guide template for Airbnb and vacation rental hosts.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/airbnb-welcome-guide-template',
};

const SECTIONS = [
  {
    title: 'Welcome Message',
    template: `Welcome to [Property Name]! We're so glad you're here. This guide has everything you need for your stay — WiFi, check-in/checkout details, house rules, and our favorite local spots. If you can't find what you're looking for, message us anytime.`,
  },
  {
    title: 'WiFi',
    template: `Network: [Network Name]\nPassword: [Password]`,
  },
  {
    title: 'Getting In',
    template: `Door code: [Code]\nThe code is entered on the keypad by the front door. Press the lock icon afterward to confirm. If the code doesn't work, call/text us at [Phone Number].`,
  },
  {
    title: 'Parking',
    template: `Park in [location — e.g. "the driveway" or "spot #4 in the lot"]. Please don't park in [restricted spot], as it's reserved for [reason].`,
  },
  {
    title: 'Checkout',
    template: `Checkout is at [Time]. Before you go: start the dishwasher if used, take trash to [bin location], turn off lights/AC, and lock the door behind you. No need to strip the beds.`,
  },
  {
    title: 'House Rules',
    template: `- No smoking inside\n- Quiet hours after [Time]\n- Max [Number] guests\n- Pets: [allowed/not allowed — details]\n- No parties or events`,
  },
  {
    title: 'Local Recommendations',
    template: `Coffee: [Spot name] — [one-line description]\nDinner: [Spot name] — [one-line description]\nGrocery: [Spot name] — [distance]\nThings to do: [1–2 nearby activities]`,
  },
  {
    title: 'In Case of Issues',
    template: `If something isn't working or you notice an issue, let us know right away so we can fix it during your stay. Emergency services: 911. Nearest urgent care: [Name, distance].`,
  },
];

export default function WelcomeGuideTemplatePage() {
  return (
    <FeaturePageLayout>
      <BlogTheme>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'var(--b-faint)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--b-category)' }}>Property Setup</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: 'var(--b-heading)', marginBottom: 20 }}>
          The Ultimate Airbnb Welcome Guide Template (Copy & Paste)
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>June 2026</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>6 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'var(--b-muted)' }}>

          <p style={{ marginBottom: 24 }}>
            Writing a welcome guide from scratch takes longer than it should, mostly because it is hard to know what to include until you have already gotten the messages asking for it. This template skips that step — it is built from the questions hosts actually get asked, section by section.
          </p>

          <p style={{ marginBottom: 40 }}>
            Copy each section below, swap in the bracketed details for your property, and you have a complete welcome guide in under 20 minutes.
          </p>

          {SECTIONS.map((section, i) => (
            <div key={section.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', fontWeight: 400, color: 'var(--b-heading)', marginBottom: 14, lineHeight: 1.2 }}>
                {i + 1}. {section.title}
              </h2>
              <pre style={{
                background: 'var(--b-bg)',
                border: '1px solid var(--b-border)',
                borderRadius: 10,
                padding: '18px 20px',
                fontSize: 13.5,
                lineHeight: 1.7,
                color: 'var(--b-muted)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                margin: 0,
              }}>
                {section.template}
              </pre>
            </div>
          ))}

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Where to Put It
          </h2>

          <p style={{ marginBottom: 24 }}>
            A welcome guide only works if guests actually see it. Pasting it into a single pre-arrival message means it competes with booking confirmations, receipts, and everything else in their inbox — most guests skim it once and never find it again when they actually need the door code at 11pm.
          </p>

          <p style={{ marginBottom: 36 }}>
            Putting the same content into a <Link href="/platform/property-guides" style={{ color: 'var(--b-accent)', textDecoration: 'none', borderBottom: '1px solid var(--b-ring)' }}>digital property guide accessed by QR code</Link> at the property solves this. Guests scan a code on the counter or by the door and the whole guide opens instantly on their phone — no searching old messages, no app to download.
          </p>

        </div>

        <div style={{ borderTop: '1px solid var(--b-border)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--b-faint)', marginBottom: 20 }}>
            Pillar turns this template into a QR-code guest portal — built in minutes, accessible the second a guest arrives.
          </p>
          <Link href="/manager/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
            Try Pillar Free
          </Link>
        </div>
      </article>

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 56px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--b-faint)', marginBottom: 20 }}>More from the blog</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/blog/digital-property-guide-what-to-include" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Digital Property Guide: What to Include (And What to Leave Out) →
          </Link>
          <Link href="/blog/vacation-rental-house-rules-template" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Vacation Rental House Rules Template (2026 Update) →
          </Link>
        </div>
      </section>
    </BlogTheme>
    </FeaturePageLayout>
  );
}
