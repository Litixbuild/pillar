import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'How to Manage Airbnb Maintenance Requests Without the Chaos | Pillar Blog',
  description: 'Maintenance issues that go unreported until checkout cost you reviews and repair money. Here\'s how to build a reporting system that catches problems while guests are still there.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Manage Airbnb Maintenance Requests Without the Chaos',
  description: 'How to build a maintenance reporting system that catches problems while guests are still at the property.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/airbnb-maintenance-requests-guide',
};

export default function MaintenanceRequestsGuidePage() {
  return (
    <FeaturePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>Operations</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: '#fff', marginBottom: 20 }}>
          How to Manage Airbnb Maintenance Requests Without the Chaos
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>June 2026</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>6 min read</span>
        </div>
      </section>

      <Divider />

      <article style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', lineHeight: 1.82, color: 'rgba(255,255,255,0.72)' }}>

          <p style={{ marginBottom: 24 }}>
            A leaky faucet, a dead light bulb, a thermostat that will not respond — none of these are emergencies on their own. What turns them into a problem is how long they go unreported. A guest who does not know how to flag an issue will usually do one of two things: ignore it and mention it in their review, or message you directly with no detail and no urgency until it has already ruined part of their stay.
          </p>

          <p style={{ marginBottom: 40 }}>
            Neither outcome is good. The fix is not better guests — it is a clearer path for guests to report issues the moment they notice them.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 8, marginBottom: 18, lineHeight: 1.2 }}>
            Why "Just Text Me" Doesn't Work
          </h2>

          <p style={{ marginBottom: 24 }}>
            Telling guests to text you if something is wrong feels like a system, but it has two failure modes. First, a meaningful share of guests will not bother — texting a stranger about a minor issue feels awkward, so they let it slide. Second, when they do text, you get an unstructured message with no category, no photo, and no way to route it to the right person without manually following up.
          </p>

          <p style={{ marginBottom: 24 }}>
            At one property, this is manageable. Across five or ten properties, it becomes a constant stream of ad hoc texts that you have to triage, forward, and track in your head.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            What a Real System Looks Like
          </h2>

          <p style={{ marginBottom: 24 }}>
            A proper maintenance reporting flow gives guests a low-friction way to submit a request — through the same <Link href="/platform/qr-portal" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>QR portal</Link> they already use for WiFi and house rules — with three things built in:
          </p>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Categories — plumbing, electrical, HVAC, appliances — so the request lands in front of the right contact automatically',
              'A description field that prompts for specifics, so you are not left guessing what "the thing in the kitchen" means',
              'Instant notification by SMS and email the moment a request comes in, so nothing sits unseen for a day',
            ].map(item => (
              <li key={item} style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginBottom: 24 }}>
            The categorization step matters more than it looks. A plumbing issue and a WiFi issue need to go to completely different people. <Link href="/platform/work-orders" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>Smart routing</Link> means you are not the single point of failure between a guest's report and the person who can actually fix it.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Why This Protects Your Reviews
          </h2>

          <p style={{ marginBottom: 24 }}>
            Guests rarely leave a bad review because something broke. They leave a bad review because something broke and nothing happened about it. A broken AC unit reported on day one and fixed by day two is a non-event. The same broken AC unit, unreported until checkout, becomes "the AC didn't work the whole stay" in a public review that future guests will read.
          </p>

          <p style={{ marginBottom: 36 }}>
            Making it easy to report problems early is not just an operations improvement — it is a direct review-protection strategy. The faster you know, the faster you fix it, and the less likely it ever shows up where future bookings can see it.
          </p>

        </div>

        <div style={{ borderTop: '1px solid rgba(245,237,213,0.10)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Pillar routes categorized maintenance requests to the right contact automatically — by SMS and email, the moment a guest submits one.
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
          <Link href="/blog/vacation-rental-damage-claim-guide" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            How to File a Vacation Rental Damage Claim That Actually Works →
          </Link>
          <Link href="/blog/reduce-guest-messages-rental-host" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            How to Reduce Guest Messages as a Rental Host →
          </Link>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
