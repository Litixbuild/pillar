import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'How to Handle Late Checkout Requests as a Vacation Rental Host | Pillar Blog',
  description: 'Late checkout requests don\'t have to be awkward negotiations over text. Here\'s how to set a policy and a process that protects your turnover schedule without saying no every time.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Handle Late Checkout Requests as a Vacation Rental Host',
  description: 'How to set a late checkout policy and process that protects your turnover schedule.',
  author: { '@type': 'Organization', name: 'Pillar' },
  publisher: { '@type': 'Organization', name: 'Pillar', url: 'https://pmpillar.com' },
  datePublished: '2026-06-26',
  url: 'https://pmpillar.com/blog/late-checkout-vacation-rental-guide',
};

export default function LateCheckoutGuidePage() {
  return (
    <FeaturePageLayout>
      <BlogTheme>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(32px, 5vw, 56px)', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Link href="/blog" style={{ fontSize: 11, color: 'var(--b-faint)', textDecoration: 'none', letterSpacing: '0.08em' }}>← Blog</Link>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--b-category)' }}>Guest Experience</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.18, color: 'var(--b-heading)', marginBottom: 20 }}>
          How to Handle Late Checkout Requests as a Vacation Rental Host
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
            "Any chance we could check out a bit later?" is one of the most common messages a host receives, and one of the most uncomfortable to answer. Say yes too often and your cleaner shows up to a property still occupied. Say no by default and you create friction at the exact moment that should be leaving guests with a good last impression.
          </p>

          <p style={{ marginBottom: 40 }}>
            The discomfort usually comes from treating it as a one-off negotiation instead of a policy. Hosts who handle this well have a clear answer before the question ever comes in.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 8, marginBottom: 18, lineHeight: 1.2 }}>
            Decide Your Policy Before You're Asked
          </h2>

          <p style={{ marginBottom: 24 }}>
            The hosts who dread late checkout requests are usually deciding case by case, under time pressure, without knowing their own turnover schedule off the top of their head. Fix this by deciding upfront:
          </p>

          <ul style={{ paddingLeft: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Is late checkout free, or does it come with a fee? Many hosts charge a flat rate (e.g. $25–50) for an extra hour or two — this also reduces requests that are just "asking to see."',
              'What is the latest you would ever allow, and what would it depend on? If you have a same-day check-in scheduled, the answer is no, full stop. If the next guest arrives that evening, there may be room.',
              'Who actually checks if it is feasible? If a cleaner is involved, the decision is not just yours to make instantly — it depends on their schedule too.',
            ].map(item => (
              <li key={item} style={{ color: 'var(--b-muted)' }}>{item}</li>
            ))}
          </ul>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Make the Request Formal, Not Conversational
          </h2>

          <p style={{ marginBottom: 24 }}>
            A request sent as a casual text — "hey is it cool if we leave a bit later?" — puts you in the position of either negotiating in real time or leaving the guest hanging while you check your calendar. Neither is a good experience for either side.
          </p>

          <p style={{ marginBottom: 24 }}>
            A <Link href="/platform/late-checkout" style={{ color: 'var(--b-accent)', textDecoration: 'none', borderBottom: '1px solid var(--b-ring)' }}>structured request through the guest portal</Link> changes this. The guest submits a request with their desired time, you see it against your actual turnover schedule, and you approve or deny with one tap. No back-and-forth, no awkward "let me check," no ambiguity about whether the request actually went through.
          </p>

          <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 400, color: 'var(--b-heading)', marginTop: 44, marginBottom: 18, lineHeight: 1.2 }}>
            Why Saying No Doesn't Have to Hurt the Review
          </h2>

          <p style={{ marginBottom: 24 }}>
            Hosts often say yes to requests they should decline, purely out of fear that a "no" will show up in the review. In practice, guests rarely penalize a clear, prompt, polite no. What they penalize is silence, or a yes that gets walked back at the last minute because the cleaner was not actually available.
          </p>

          <p style={{ marginBottom: 36 }}>
            A fast, clear answer — even a no — reads as professional. A vague or reversed answer reads as disorganized, and that is what actually shows up in reviews.
          </p>

        </div>

        <div style={{ borderTop: '1px solid var(--b-border)', paddingTop: 36, marginTop: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--b-faint)', marginBottom: 20 }}>
            Pillar lets guests request late checkout from their portal — you approve or deny with one tap, no texts required.
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
          <Link href="/blog/vacation-rental-house-rules-template" style={{ textDecoration: 'none', color: 'var(--b-muted)', fontSize: 14, lineHeight: 1.5 }}>
            Vacation Rental House Rules Template (2026 Update) →
          </Link>
        </div>
      </section>
    </BlogTheme>
    </FeaturePageLayout>
  );
}
