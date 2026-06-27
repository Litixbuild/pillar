import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'How to Stop Guests Calling You at 2am (The QR Code Solution) | Pillar Blog',
  description: 'Late-night guest calls are almost always preventable. Here\'s why they happen and how a QR-code guest portal with an AI concierge stops them before they start.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Stop Guests Calling You at 2am (The QR Code Solution)',
  description: 'Why late-night guest calls happen and how a QR-code guest portal with an AI concierge prevents them.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/stop-guests-calling-you-airbnb',
};

export default function StopGuestsCallingPage() {
  return (
    <FeaturePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>Guest Experience</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: '#fff', marginBottom: 20 }}>
          How to Stop Guests Calling You at 2am (The QR Code Solution)
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
            Every host who has managed a short-term rental for more than a few months has a story like this: a phone ringing at 2am because a guest cannot find the door code, or the WiFi will not connect, or they are standing outside in the cold trying to figure out which key goes where.
          </p>

          <p style={{ marginBottom: 24 }}>
            It feels random when it happens, but it almost never is. Late-night calls follow a predictable pattern, and once you see the pattern, the fix is straightforward.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Why the Calls Happen at Night
          </h2>

          <p style={{ marginBottom: 24 }}>
            Most check-ins happen in the afternoon or early evening, but flight delays, traffic, and late flights push a meaningful share of arrivals past 9 or 10pm. By the time a guest reaches the property, they are tired, possibly frustrated, and far less patient with anything that does not work immediately — including instructions buried in a message thread they have to scroll back to find.
          </p>

          <p style={{ marginBottom: 24 }}>
            That combination — exhaustion, urgency, and information that is technically available but hard to find — is what turns a minor hiccup into a phone call to you at an hour you would rather not be answering your phone.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            The Three Calls You Get Most
          </h2>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '"I can\'t get the door open" — the code does not work, the lockbox is in a different spot than expected, or the guest cannot find the entry instructions at all.',
              '"There\'s no WiFi" — the network name or password was sent in a message the guest never saw, or it was typed incorrectly.',
              '"We can\'t find parking" — especially common at properties with non-obvious parking, like a shared driveway or street parking with restrictions.',
            ].map(item => (
              <li key={item} style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginBottom: 24 }}>
            Notice that all three are questions with a fixed, knowable answer. None of them require your judgment or your personal involvement — they require the guest having access to information that already exists, in a place they can actually find it at 11pm with one hand holding a suitcase.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Why a QR Code Works Better Than a Text Message
          </h2>

          <p style={{ marginBottom: 24 }}>
            A pre-arrival message with the door code and WiFi password feels like it should solve this, but it relies on the guest remembering it exists, finding it in their messages, and reading it correctly under pressure. In practice, a surprising number of guests never open it at all.
          </p>

          <p style={{ marginBottom: 24 }}>
            A <Link href="/platform/qr-portal" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>QR code physically at the property</Link> — on the door, by the lockbox, on a small sign near where guests will be standing — removes the "finding it" step entirely. The guest is already standing at the exact spot where the information matters. They scan, the portal opens, the code or WiFi password is right there. No searching, no scrolling, no call.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            What Happens When the Question Isn't in the Guide
          </h2>

          <p style={{ marginBottom: 24 }}>
            Even the best portal cannot anticipate every question. "Is there a 24-hour pharmacy nearby?" or "the thermostat isn't responding, what do I do?" are real questions that come up at odd hours and need a real answer, not just a static page.
          </p>

          <p style={{ marginBottom: 36 }}>
            This is where an <Link href="/platform/ai-concierge" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>AI concierge inside the portal</Link> changes the math. Guests can ask in plain language and get a useful, specific answer immediately — at 2am, without you ever seeing the message. The call that would have woken you up simply does not happen, because the guest never needed to make it.
          </p>

        </div>

        <div style={{ borderTop: '1px solid rgba(245,237,213,0.10)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Pillar's QR portal and AI concierge handle the questions that would otherwise come to you, at any hour.
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
          <Link href="/blog/ai-concierge-for-airbnb-hosts" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            AI Concierge for Airbnb: What It Is and Why Hosts Need It →
          </Link>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
