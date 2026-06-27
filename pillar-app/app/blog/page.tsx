import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { BlogTheme, Divider } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Blog — Property Management Tips for Rental Hosts | Pillar',
  description: 'Practical guides for vacation rental hosts and property managers. Reduce guest messages, improve reviews, and run a more efficient rental operation.',
};

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

const POSTS = [
  {
    slug: 'reduce-guest-messages-rental-host',
    date: 'June 2025',
    readTime: '6 min read',
    category: 'Guest Experience',
    title: 'How to Reduce Guest Messages as a Rental Host (Without Sacrificing Reviews)',
    excerpt: 'The average rental host fields 15–20 messages per booking. Most ask the same five questions. Here\'s how to eliminate repetitive messages while improving your guest experience at the same time.',
  },
  {
    slug: 'best-tools-vacation-rental-managers-2026',
    date: 'June 2025',
    readTime: '8 min read',
    category: 'Tools & Software',
    title: 'Best Tools for Vacation Rental Managers in 2026',
    excerpt: 'From channel managers to guest communication platforms, the rental software market is crowded. We break down which tools actually move the needle for hosts managing one to twenty properties.',
  },
  {
    slug: 'digital-property-guide-what-to-include',
    date: 'June 2025',
    readTime: '5 min read',
    category: 'Property Setup',
    title: 'Digital Property Guide: What to Include (And What to Leave Out)',
    excerpt: 'A great digital property guide eliminates questions before they\'re asked. A bad one overwhelms guests with information they\'ll never read. Here\'s what actually belongs in yours.',
  },
  {
    slug: 'best-vacation-rental-guest-portals-2026',
    date: 'June 2026',
    readTime: '7 min read',
    category: 'Tools & Software',
    title: 'Best Vacation Rental Guest Portals in 2026 (Compared)',
    excerpt: 'A side-by-side look at the top guest portal platforms for vacation rental hosts — what each one does well, where it falls short, and which is right for your property count.',
  },
  {
    slug: 'airbnb-welcome-guide-template',
    date: 'June 2026',
    readTime: '6 min read',
    category: 'Property Setup',
    title: 'The Ultimate Airbnb Welcome Guide Template (Copy & Paste)',
    excerpt: 'A complete, ready-to-use welcome guide template for Airbnb and vacation rental hosts. Copy each section, fill in your details, and you have a guide in under 20 minutes.',
  },
  {
    slug: 'stop-guests-calling-you-airbnb',
    date: 'June 2026',
    readTime: '6 min read',
    category: 'Guest Experience',
    title: 'How to Stop Guests Calling You at 2am (The QR Code Solution)',
    excerpt: 'Late-night guest calls are almost always preventable. Here\'s why they happen and how a QR-code guest portal with an AI concierge stops them before they start.',
  },
  {
    slug: 'vacation-rental-damage-claim-guide',
    date: 'June 2026',
    readTime: '7 min read',
    category: 'Operations',
    title: 'How to File a Vacation Rental Damage Claim That Actually Works',
    excerpt: 'Most damage claims get denied for lack of evidence, not lack of damage. Here\'s the documentation you need before, during, and after a stay to make a claim that holds up.',
  },
  {
    slug: 'airbnb-maintenance-requests-guide',
    date: 'June 2026',
    readTime: '6 min read',
    category: 'Operations',
    title: 'How to Manage Airbnb Maintenance Requests Without the Chaos',
    excerpt: 'Maintenance issues that go unreported until checkout cost you reviews and repair money. Here\'s how to build a reporting system that catches problems while guests are still there.',
  },
  {
    slug: 'late-checkout-vacation-rental-guide',
    date: 'June 2026',
    readTime: '5 min read',
    category: 'Guest Experience',
    title: 'How to Handle Late Checkout Requests as a Vacation Rental Host',
    excerpt: 'Late checkout requests don\'t have to be awkward negotiations over text. Here\'s how to set a policy and a process that protects your turnover schedule without saying no every time.',
  },
  {
    slug: 'vacation-rental-house-rules-template',
    date: 'June 2026',
    readTime: '5 min read',
    category: 'Property Setup',
    title: 'Vacation Rental House Rules Template (2026 Update)',
    excerpt: 'A ready-to-use house rules template covering occupancy, noise, pets, smoking, and more — plus guidance on which rules actually prevent problems and which just create friction.',
  },
  {
    slug: 'ai-concierge-for-airbnb-hosts',
    date: 'June 2026',
    readTime: '6 min read',
    category: 'Guest Experience',
    title: 'AI Concierge for Airbnb: What It Is and Why Hosts Need It',
    excerpt: 'An AI concierge answers guest questions instantly, at any hour, without you typing a single reply. Here\'s what it actually does and where it fits alongside your existing guest portal.',
  },
];

export default function BlogIndexPage() {
  return (
    <FeaturePageLayout>
      <BlogTheme>
      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 64px)', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.40em', textTransform: 'uppercase', color: 'var(--b-accent)', marginBottom: 20 }}>The Pillar Blog</p>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 400, lineHeight: 1.12, color: 'var(--b-heading)', marginBottom: 18 }}>
          Smarter Hosting,<br /><span style={{ color: 'var(--b-accent)' }}>Better Stays.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.7, color: 'var(--b-muted)', maxWidth: 480, margin: '0 auto' }}>
          Practical guides for rental hosts who want to spend less time on messages and more time on what matters.
        </p>
      </section>

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ padding: '32px 0', borderBottom: '1px solid var(--b-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--b-category)' }}>{post.category}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
                  <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>{post.date}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--b-dot)' }} />
                  <span style={{ fontSize: 11, color: 'var(--b-faint)' }}>{post.readTime}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 400, color: 'var(--b-body)', lineHeight: 1.3, margin: 0 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--b-faint)', lineHeight: 1.65, margin: 0 }}>
                  {post.excerpt}
                </p>
                <span style={{ fontSize: 12, color: 'var(--b-accent)', letterSpacing: '0.10em' }}>Read article →</span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--b-faint)', lineHeight: 1.7, marginBottom: 28 }}>
          Ready to put these ideas into practice? Pillar gives you QR guest portals, AI concierge, and property guides out of the box.
        </p>
        <Link href="/manager/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '13px 28px', borderRadius: 10, textDecoration: 'none' }}>
          Try Pillar Free
        </Link>
      </section>
    </BlogTheme>
    </FeaturePageLayout>
  );
}
