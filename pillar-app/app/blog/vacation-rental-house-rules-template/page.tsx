import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Vacation Rental House Rules Template (2026 Update) | Pillar Blog',
  description: 'A ready-to-use house rules template covering occupancy, noise, pets, smoking, and more — plus guidance on which rules actually prevent problems and which just create friction.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Vacation Rental House Rules Template (2026 Update)',
  description: 'A ready-to-use house rules template for vacation rental hosts, with guidance on which rules prevent real problems.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/vacation-rental-house-rules-template',
};

const RULE_GROUPS = [
  {
    title: 'Occupancy & Guests',
    rules: [
      'Maximum of [Number] guests at any time, including day visitors',
      'No events, parties, or gatherings beyond registered guests',
      'Visitors must leave by [Time] unless registered as overnight guests',
    ],
  },
  {
    title: 'Noise & Conduct',
    rules: [
      'Quiet hours from [Time] to [Time] — no loud music or outdoor noise',
      'Be respectful of neighbors; this is a residential area',
    ],
  },
  {
    title: 'Smoking & Substances',
    rules: [
      'No smoking or vaping inside the property — [designated outdoor area] only, if applicable',
      'A cleaning fee of $[Amount] applies if smoking odor is detected inside',
    ],
  },
  {
    title: 'Pets',
    rules: [
      '[Pets allowed with prior approval / No pets permitted]',
      'If approved: pets must not be left unattended, and any damage is the guest\'s responsibility',
    ],
  },
  {
    title: 'Property Care',
    rules: [
      'Please treat the property as you would your own home',
      'Report any damage or breakage during your stay rather than at checkout',
      'No moving furniture between rooms',
    ],
  },
  {
    title: 'Checkout',
    rules: [
      'Checkout time is [Time]',
      'Start the dishwasher if used, take trash to [location], and lock up on your way out',
      'Late checkout may be available on request — see your portal to ask',
    ],
  },
];

export default function HouseRulesTemplatePage() {
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
          Vacation Rental House Rules Template (2026 Update)
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>June 2026</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>5 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'var(--b-muted)' }}>

          <p style={{ marginBottom: 24 }}>
            House rules exist to prevent the handful of problems that actually cost you money or peace of mind — not to list every behavior you would prefer. A rules page with 30 items reads as anxious and gets skimmed past entirely. A short, specific list of rules that matter actually gets read and followed.
          </p>

          <p style={{ marginBottom: 40 }}>
            Use the template below as a starting point, then cut anything that does not apply to your property.
          </p>

          {RULE_GROUPS.map((group) => (
            <div key={group.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.15rem, 2vw, 1.4rem)', fontWeight: 400, color: 'var(--b-heading)', marginBottom: 14, lineHeight: 1.2 }}>
                {group.title}
              </h2>
              <ul style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.rules.map((rule) => (
                  <li key={rule} style={{ color: 'var(--b-muted)' }}>{rule}</li>
                ))}
              </ul>
            </div>
          ))}

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Rules That Help vs. Rules That Annoy
          </h2>

          <p style={{ marginBottom: 24 }}>
            Every rule on your list should pass a simple test: does breaking this actually cost you something, or does it just bother you personally? "No shoes on the white sofa" might matter to you, but it is not a house rule — it is a request, and treating it as one keeps your actual rules credible.
          </p>

          <p style={{ marginBottom: 36 }}>
            Rules with real consequences — occupancy limits, smoking, noise, pets — deserve to be enforced and stated clearly, ideally with a stated fee or consequence attached. Everything else belongs in a friendly note in your <Link href="/platform/property-guides" style={{ color: 'var(--b-accent)', textDecoration: 'none', borderBottom: '1px solid var(--b-ring)' }}>property guide</Link>, not your rules list.
          </p>

        </div>

        <div style={{ borderTop: '1px solid var(--b-border)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--b-faint)', marginBottom: 20 }}>
            Pillar puts your house rules right inside the QR guest portal guests already use for WiFi and check-in info.
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
          <Link href="/blog/airbnb-welcome-guide-template" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            The Ultimate Airbnb Welcome Guide Template (Copy & Paste) →
          </Link>
          <Link href="/blog/digital-property-guide-what-to-include" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Digital Property Guide: What to Include (And What to Leave Out) →
          </Link>
        </div>
      </section>
    </BlogTheme>
    </FeaturePageLayout>
  );
}
