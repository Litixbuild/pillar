import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'How to File a Vacation Rental Damage Claim That Actually Works | Pillar Blog',
  description: 'Most damage claims get denied for lack of evidence, not lack of damage. Here\'s the documentation you need before, during, and after a stay to make a claim that holds up.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to File a Vacation Rental Damage Claim That Actually Works',
  description: 'Most damage claims get denied for lack of evidence. Here is the documentation you need to make a claim that holds up.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/vacation-rental-damage-claim-guide',
};

export default function DamageClaimGuidePage() {
  return (
    <FeaturePageLayout>
      <BlogTheme>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'var(--b-faint)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--b-category)' }}>Operations</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: 'var(--b-heading)', marginBottom: 20 }}>
          How to File a Vacation Rental Damage Claim That Actually Works
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>June 2026</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>7 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'var(--b-muted)' }}>

          <p style={{ marginBottom: 24 }}>
            Most hosts find out how their damage claim process actually works at the worst possible time — after a guest has already left, with a broken table or a stained mattress as the only evidence, and a claims form asking for documentation that does not exist.
          </p>

          <p style={{ marginBottom: 40 }}>
            The claims that get approved and the ones that get denied are rarely separated by how bad the damage was. They are separated by what was documented before the guest ever checked in.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 8, marginBottom: 18, lineHeight: 1.2 }}>
            Why Claims Get Denied
          </h2>

          <p style={{ marginBottom: 24 }}>
            Airbnb's Aircover, Vrbo's damage protection, and most travel insurance providers all require the same basic thing: proof that the damage happened during this specific guest's stay, and proof of the property's condition before they arrived. Without a clear "before" state, the platform has no way to confirm the damage was not already there, and claims get denied by default rather than approved on your word.
          </p>

          <p style={{ marginBottom: 24 }}>
            The second most common reason for denial is timing. Claims filed days after checkout, once a new guest has already stayed in the unit, lose the ability to prove which stay caused the damage at all.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            What to Document Before Every Stay
          </h2>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Timestamped cleaning photos of every room, taken right after turnover and before the next guest arrives',
              'Close-up photos of any existing wear, marks, or pre-existing condition issues — anything that could be mistaken for new damage',
              'A record of guest consent acknowledging the property\'s condition and house rules at check-in',
            ].map(item => (
              <li key={item} style={{ color: 'var(--b-muted)' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginBottom: 24 }}>
            This sounds like extra work, and if you are doing it manually — taking photos on your phone, saving them to an album, hoping you can find the right ones three weeks later when you need them — it is. The documentation only has value if it is timestamped, organized by stay, and easy to retrieve under time pressure.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            What to Document After the Stay
          </h2>

          <p style={{ marginBottom: 24 }}>
            As soon as you notice damage — ideally during turnover cleaning, before the next guest checks in — photograph it from multiple angles with something in frame for scale. Note the date and time. Cross-reference against your pre-stay photos so you can show the before-and-after side by side.
          </p>

          <p style={{ marginBottom: 24 }}>
            The faster you file, the stronger the claim. Most platforms have a window — often as short as 14 days from checkout — to report damage. Waiting until you "get around to it" can forfeit a legitimate claim entirely.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Building the Report
          </h2>

          <p style={{ marginBottom: 24 }}>
            Claims platforms respond better to a single organized report than a scattered batch of photos sent over multiple messages. A clean submission includes: timestamped before-and-after photos, the guest's name and stay dates, a written description of the damage, and an estimated repair or replacement cost with a receipt or quote attached if you have one.
          </p>

          <p style={{ marginBottom: 36 }}>
            This is exactly the gap a built-in verification system closes — automatically timestamping cleaning and damage photos per stay, capturing guest consent at check-in, and bundling everything into one report when you need to file a claim, instead of you reconstructing it from memory and a camera roll.
          </p>

        </div>

        <div style={{ borderTop: '1px solid var(--b-border)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--b-faint)', marginBottom: 20 }}>
            Pillar timestamps cleaning photos, guest consent, and damage evidence automatically — and bundles it into one report your platform can&apos;t wave away.
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
          <Link href="/blog/airbnb-maintenance-requests-guide" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            How to Manage Airbnb Maintenance Requests Without the Chaos →
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
