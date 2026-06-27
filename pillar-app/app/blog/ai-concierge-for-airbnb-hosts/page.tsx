import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'AI Concierge for Airbnb: What It Is and Why Hosts Need It | Pillar Blog',
  description: 'An AI concierge answers guest questions instantly, at any hour, without you typing a single reply. Here\'s what it actually does and where it fits alongside your existing guest portal.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'AI Concierge for Airbnb: What It Is and Why Hosts Need It',
  description: 'What an AI concierge actually does for vacation rental hosts and how it fits alongside a guest portal.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/ai-concierge-for-airbnb-hosts',
};

export default function AiConciergeGuidePage() {
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
          AI Concierge for Airbnb: What It Is and Why Hosts Need It
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
            "AI concierge" gets used loosely in vacation rental marketing, so it is worth being precise about what it actually means: a chat-based assistant, available inside your guest portal, that answers a guest's question in natural language — instantly, at any hour, without you writing a reply.
          </p>

          <p style={{ marginBottom: 40 }}>
            It is not a chatbot that recites your house rules back word for word. Done well, it behaves like a knowledgeable local friend who happens to be available at 2am.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 8, marginBottom: 18, lineHeight: 1.2 }}>
            What It Actually Answers
          </h2>

          <p style={{ marginBottom: 24 }}>
            A static property guide handles the fixed questions — WiFi, door codes, checkout time. An AI concierge handles everything that does not have a single right answer written down anywhere:
          </p>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '"What\'s a good restaurant for a date night near here?" — with real recommendations, not a generic list',
              '"Can you build us a day itinerary for tomorrow?" — pulling together activities based on the area',
              '"Is there a pharmacy open right now?" — practical, time-sensitive questions',
              '"How do I work the thermostat / the smart lock / the espresso machine?" — property-specific questions the AI has been given context on',
            ].map(item => (
              <li key={item} style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginBottom: 24 }}>
            The pattern across all of these: they are questions a guest would otherwise have to message you about, at whatever hour they happened to think of it, and wait for a reply.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Where It Fits Alongside a Guest Portal
          </h2>

          <p style={{ marginBottom: 24 }}>
            An AI concierge is not a replacement for a <Link href="/platform/qr-portal" style={{ color: SANDY, textDecoration: 'none', borderBottom: '1px solid rgba(245,237,213,0.35)' }}>QR guest portal</Link> — it lives inside one. The portal handles the static, structured information. The concierge handles everything conversational that the static guide cannot anticipate. Together, almost the entire range of guest questions gets answered without reaching your phone.
          </p>

          <p style={{ marginBottom: 24 }}>
            This matters because hosts often assume a good property guide alone will eliminate messages. It eliminates the predictable ones. The unpredictable, conversational ones — which are often the ones that show up at the most inconvenient hour — need something that can actually hold a conversation.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: '#fff', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Does It Feel Impersonal to Guests?
          </h2>

          <p style={{ marginBottom: 36 }}>
            This is the most common hesitation, and in practice it runs the other way. Guests are not disappointed that an AI answered their question about nearby coffee shops at 7am — they are relieved they did not have to wait for you to wake up. The personal touch hosts actually care about — a handwritten welcome note, a thoughtful recommendation, checking in after a long travel day — still comes from you. The AI concierge just takes the repetitive, time-sensitive questions off your plate so you have the bandwidth for the parts of hosting that genuinely benefit from a human.
          </p>

        </div>

        <div style={{ borderTop: '1px solid rgba(245,237,213,0.10)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
            Pillar's AI concierge lives inside your guest portal and answers questions instantly, at any hour — no typing required from you.
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
          <Link href="/blog/stop-guests-calling-you-airbnb" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            How to Stop Guests Calling You at 2am (The QR Code Solution) →
          </Link>
          <Link href="/blog/best-vacation-rental-guest-portals-2026" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.5 }}>
            Best Vacation Rental Guest Portals in 2026 (Compared) →
          </Link>
        </div>
      </section>
    </FeaturePageLayout>
  );
}
