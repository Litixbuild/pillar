import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Best Vacation Rental Guest Portals in 2026 (Compared) | Pillar Blog',
  description: 'A side-by-side look at the top guest portal platforms for vacation rental hosts — what each one does well, where it falls short, and which is right for your property count.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Best Vacation Rental Guest Portals in 2026 (Compared)',
  description: 'A side-by-side look at the top guest portal platforms for vacation rental hosts in 2026.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/best-vacation-rental-guest-portals-2026',
};

const PORTALS = [
  {
    name: 'Pillar',
    summary: 'A QR-code guest portal paired with an AI concierge, work order routing, and late checkout requests — built specifically for hosts who want the guest experience layer and the operations layer in one place, without per-property licensing fees stacking up.',
    bestFor: 'Hosts who want a portal plus an AI concierge and maintenance routing, not just a digital guidebook',
    link: '/pricing',
    linkLabel: 'See pricing →',
  },
  {
    name: 'Touch Stay',
    summary: 'One of the longest-running digital guidebook tools. Strong template library and translation support. Built primarily as a guidebook — it does not include an AI concierge or maintenance request routing, so guest questions outside the guide still come to you directly.',
    bestFor: 'Hosts who only need a polished, static digital guidebook',
  },
  {
    name: 'Hostfully Guidebooks',
    summary: 'Bundled inside Hostfully\'s broader property management suite. Good if you are already using Hostfully for booking management, since the guidebook ties into the same dashboard. Less compelling as a standalone purchase.',
    bestFor: 'Existing Hostfully PMS customers',
  },
  {
    name: 'Duve',
    summary: 'Positions itself as a full guest experience platform with upsells and pre-arrival messaging built in. Feature-rich, but the pricing and onboarding are built around mid-size and larger portfolios rather than independent hosts with a handful of units.',
    bestFor: 'Larger portfolios that want upsell and pre-arrival automation',
  },
  {
    name: 'YourWelcome',
    summary: 'Pairs a physical branded tablet at the property with a software guidebook. The hardware is a nice touch for a high-end stay, but it adds an upfront cost and another device that can break, lose connection, or need a reset between guests.',
    bestFor: 'High-end properties that want a physical in-room device',
  },
  {
    name: 'Operto Guest',
    summary: 'Part of a broader smart-home and access automation platform. The guidebook feature is solid but is really an add-on to Operto\'s core business in remote lock and noise monitoring — you are buying into a bigger ecosystem to get it.',
    bestFor: 'Hosts already invested in Operto\'s smart-home stack',
  },
];

export default function GuestPortalsComparedPage() {
  return (
    <FeaturePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>Tools & Software</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: '#fff', marginBottom: 20 }}>
          Best Vacation Rental Guest Portals in 2026 (Compared)
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>June 2026</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>7 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'rgba(255,255,255,0.72)' }}>

          <p style={{ marginBottom: 24 }}>
            A guest portal is the single highest-leverage tool a vacation rental host can add to their stack. Instead of guests texting you for the WiFi password or the door code, they scan a QR code at the property and find everything themselves — instantly, at the moment they need it.
          </p>

          <p style={{ marginBottom: 40 }}>
            The category has grown crowded, though, and the products inside it solve different problems. Some are pure digital guidebooks. Others bundle a portal into a bigger property management suite. Here is how the main options actually compare.
          </p>

          {PORTALS.map((portal, i) => (
            <div key={portal.name} style={{ marginBottom: 44 }}>
              <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)', fontWeight: 400, color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
                {i + 1}. {portal.name}
              </h2>
              <p style={{ marginBottom: 14 }}>{portal.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
                  <span style={{ color: SANDY, fontWeight: 500 }}>Best for: </span>{portal.bestFor}
                </p>
                {'link' in portal && portal.link && (
                  <Link href={portal.link} style={{ fontSize: 11, color: SANDY, textDecoration: 'none', letterSpacing: '0.10em', borderBottom: '1px solid rgba(245,237,213,0.35)', paddingBottom: 1 }}>
                    {(portal as { link: string; linkLabel: string }).linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            What to Actually Look For
          </h2>

          <p style={{ marginBottom: 24 }}>
            Most guest portals look similar in a demo — a clean page with WiFi info, house rules, and local recommendations. The differences show up after a guest has used one for a real stay. Three questions matter more than the feature list:
          </p>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Does it handle the conversational questions, or only the static ones? A guidebook answers "what is the WiFi password." It does not answer "is there a good taco place within walking distance." Only a portal with a built-in AI concierge handles both.',
              'What happens when something breaks? If a guest notices a leaky faucet, can they report it through the same portal, or do they have to find your phone number? A portal without maintenance routing just moves the messaging problem instead of solving it.',
              'Is pricing per property or flat? Tools that charge per unit get expensive fast as you scale past a handful of properties. Flat or tiered pricing matters more than it seems once you are managing more than three or four units.',
            ].map(item => (
              <li key={item} style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginBottom: 36 }}>
            The right choice depends on what you already have. If you are deep into a property management suite, the bundled guidebook inside it might be good enough. If guest communication is your actual bottleneck, a dedicated portal with an <Link href="/platform/ai-concierge" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>AI concierge</Link> and <Link href="/platform/work-orders" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>maintenance routing</Link> built in will save you more time than a static guidebook ever could.
          </p>

        </div>

        <div style={{ borderTop: '1px solid rgba(245,237,213,0.10)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Pillar combines a QR guest portal, AI concierge, and work orders in one platform — set up in under 10 minutes, starting at $14.99/month.
          </p>
          <Link href="/manager/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
            Try Pillar Free
          </Link>
        </div>
      </article>

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 56px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', marginBottom: 20 }}>More from the blog</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link href="/blog/reduce-guest-messages-rental-host" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            How to Reduce Guest Messages as a Rental Host →
          </Link>
          <Link href="/blog/stop-guests-calling-you-airbnb" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            How to Stop Guests Calling You at 2am (The QR Code Solution) →
          </Link>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
