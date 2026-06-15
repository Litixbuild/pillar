import type { Metadata } from 'next';
import Link from 'next/link';
import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';

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
];

export default function BlogIndexPage() {
  return (
    <FeaturePageLayout>
      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 64px)', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.40em', textTransform: 'uppercase', color: SANDY, marginBottom: 20 }}>The Pillar Blog</p>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 400, lineHeight: 1.12, color: '#fff', marginBottom: 18 }}>
          Smarter Hosting,<br /><span style={{ color: SANDY }}>Better Stays.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto' }}>
          Practical guides for rental hosts who want to spend less time on messages and more time on what matters.
        </p>
      </section>

      <Divider />

      <section style={{ padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px)', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ padding: '32px 0', borderBottom: '1px solid rgba(245,237,213,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>{post.category}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{post.date}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.20)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{post.readTime}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 400, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3, margin: 0 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>
                  {post.excerpt}
                </p>
                <span style={{ fontSize: 12, color: SANDY, letterSpacing: '0.10em' }}>Read article →</span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
          Ready to put these ideas into practice? Pillar gives you QR guest portals, AI concierge, and property guides out of the box.
        </p>
        <Link href="/manager/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '13px 28px', borderRadius: 10, textDecoration: 'none' }}>
          Try Pillar Free
        </Link>
      </section>
    </FeaturePageLayout>
  );
}
