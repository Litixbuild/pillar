import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Digital Property Guide: What to Include (And What to Leave Out) | Pillar Blog',
  description: 'A great digital property guide eliminates questions before they\'re asked. A bad one overwhelms guests. Here\'s exactly what belongs in yours — and what doesn\'t.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Digital Property Guide: What to Include (And What to Leave Out)',
  description: 'A great digital property guide eliminates questions before they\'re asked. Here\'s exactly what belongs in yours.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2025-06-01',
  url: 'https://pmpillar.com/blog/digital-property-guide-what-to-include',
};

const INCLUDE = [
  { title: 'WiFi credentials', desc: 'Network name and password, clearly formatted. If you have separate networks for 2.4GHz and 5GHz, include both. This is the single most asked question across all rental types.' },
  { title: 'Entry information', desc: 'Door code, garage code, lockbox location, smart lock instructions. Include a note about what to do if entry fails — a backup contact number is appropriate here.' },
  { title: 'Parking instructions', desc: 'Where to park, how many vehicles are allowed, any permit requirements, where not to park. Include this even if it seems obvious. It almost always generates questions.' },
  { title: 'Checkout procedure', desc: 'Checkout time, exactly what you expect guests to do (dishes, trash, towels), and any fees associated with not doing it. Clear expectations prevent disputes and get your property ready faster.' },
  { title: 'House rules (the essentials)', desc: 'Noise cut-off time, pet policy, smoking policy, maximum occupancy. Keep it to the rules that actually matter to you and that guests need to know before they settle in.' },
  { title: 'Emergency contacts', desc: 'Your number, a backup contact, and the building\'s emergency number if applicable. Include the address of the nearest urgent care or hospital. Guests never need this until they urgently do.' },
  { title: 'Appliance guides for non-obvious items', desc: 'Your guests are smart, but your smart TV remote, your induction cooktop, your keyless entry system, or your outdoor shower may not work the way they expect. A short how-to for these items prevents frustrated messages.' },
  { title: 'Trash and recycling', desc: 'Which bins to use, where to put them, what day collection happens. This is genuinely confusing in unfamiliar homes and generates questions every time.' },
];

const OMIT = [
  { title: 'Your full biography', desc: 'Guests do not need to know how long you have owned the property or your hosting philosophy. Keep it transactional. They are looking for parking instructions, not a story.' },
  { title: 'Every house rule you have ever thought of', desc: 'A list of 30 rules signals anxiety, not professionalism. Include the rules that have consequences or that guests actually need to know. Leave out "please enjoy your stay" level instructions.' },
  { title: 'Redundant platform information', desc: 'Guests already have their booking confirmation. You do not need to repeat the reservation details, the cancellation policy, or the check-in date in the guide.' },
  { title: 'Outdated information', desc: 'An amenity window describing a restaurant that closed two years ago, or instructions for an appliance you replaced, actively undermines trust. A guide is only an asset if it is accurate.' },
];

export default function PropertyGuidePage() {
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
          Digital Property Guide: What to Include (And What to Leave Out)
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>June 2025</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>5 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'var(--b-muted)' }}>

          <p style={{ marginBottom: 24 }}>
            The purpose of a digital property guide is simple: answer the questions guests will have before they have to ask. When a guide does this well, guests feel confident, message volume drops, and the stay starts on the right foot. When it does this badly — too much information, badly organised, or missing the obvious things — guests are still confused, but now they are also annoyed at having read through something useless.
          </p>

          <p style={{ marginBottom: 40 }}>
            Here is what actually belongs in a property guide, and what you should leave out.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 8, marginBottom: 24, lineHeight: 1.2 }}>
            What to Include
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 48 }}>
            {INCLUDE.map((item, i) => (
              <div key={item.title} style={{ display: 'flex', gap: 18 }}>
                <span style={{ fontSize: 11, color: 'var(--b-category)', fontWeight: 500, flexShrink: 0, paddingTop: 2 }}>0{i + 1}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--b-body)', marginBottom: 8 }}>{item.title}</p>
                  <p style={{ marginBottom: 0, color: 'var(--b-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 24, lineHeight: 1.2 }}>
            What to Leave Out
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 48 }}>
            {OMIT.map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: 18 }}>
                <span style={{ fontSize: 14, color: 'var(--b-faint)', flexShrink: 0, paddingTop: 1 }}>✕</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--b-muted)', marginBottom: 8 }}>{item.title}</p>
                  <p style={{ marginBottom: 0, color: 'var(--b-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Format Matters as Much as Content
          </h2>

          <p style={{ marginBottom: 24 }}>
            A PDF attached to a booking message is not a property guide — it is a document guests will not open at 10pm when they cannot find the parking spot. A guide needs to be accessible on the device guests actually have in their hand: their phone, when they need it.
          </p>

          <p style={{ marginBottom: 24 }}>
            A <Link href="/platform/qr-portal" style={{ color: 'var(--b-accent)', textDecoration: 'none', borderBottom: '1px solid var(--b-ring)' }}>QR code at the property</Link> — on the counter, by the door, framed on the wall — means guests have access to the guide at the exact moment they need it. No app, no login, no digging through messages. They scan, it opens, they find the answer.
          </p>

          <p style={{ marginBottom: 36 }}>
            The best property guides are also kept current. Set a reminder to review yours every quarter. Restaurant hours change, appliances get replaced, house rules evolve. A guide with outdated information is actively worse than no guide at all.
          </p>

        </div>

        <div style={{ borderTop: '1px solid var(--b-border)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--b-faint)', marginBottom: 20 }}>
            Pillar makes it easy to build and maintain a digital property guide that guests access by scanning a QR code. Set up in under 10 minutes.
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
          <Link href="/blog/reduce-guest-messages-rental-host" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            How to Reduce Guest Messages as a Rental Host →
          </Link>
          <Link href="/blog/best-tools-vacation-rental-managers-2026" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Best Tools for Vacation Rental Managers in 2026 →
          </Link>
          <Link href="/blog/airbnb-welcome-guide-template" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            The Ultimate Airbnb Welcome Guide Template (Copy & Paste) →
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
