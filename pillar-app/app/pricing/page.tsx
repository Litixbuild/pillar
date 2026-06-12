import FeaturePageLayout, { Divider } from '@/components/FeaturePageLayout';
import Link from 'next/link';

const SANDY = '#F5EDD5';
const GOLD = '#D4AF6A';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15, flexShrink: 0 }}>
      <path d="M20 6L9 17l-5-5" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BASE_FEATURES = [
  'First property fully included',
  'QR guest portal, branded & customisable',
  'AI concierge powered by Gemini',
  'Property guides, photos & amenity windows',
  'Work orders with smart routing',
  'Late checkout request management',
  'Email & SMS notifications',
  'Field-level encryption for sensitive data',
  'Manager dashboard & activity log',
  'Stripe-managed billing — cancel any time',
];

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: 'You can create an account and set up your first property for free. Billing begins when you publish and activate your portal.',
  },
  {
    q: 'Can I add more properties later?',
    a: 'Yes. Add additional property slots from your billing dashboard at any time. Each extra property is $9.99/month, added to your existing subscription.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel at any time from the billing portal. Your properties remain active until the end of your billing period, then your portals deactivate.',
  },
  {
    q: 'Is there a long-term commitment?',
    a: 'No. Pillar is month-to-month. No annual contracts, no cancellation fees.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your unique referral code with other hosts. When they sign up and subscribe, you earn account credits automatically. The more you refer, the more you earn.',
  },
  {
    q: 'Does the AI concierge cost extra?',
    a: 'No. The AI concierge is included in every plan, for every property, at no additional charge.',
  },
];

export default function PricingPage() {
  return (
    <FeaturePageLayout>
      {/* Hero */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 40px) clamp(48px, 6vw, 72px)', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.40em', textTransform: 'uppercase', color: SANDY, marginBottom: 20 }}>Pricing</p>
        <h1 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 400, lineHeight: 1.12, color: '#fff', marginBottom: 18 }}>
          Simple. Transparent.<br /><span style={{ color: SANDY }}>No Surprises.</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 17px)', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto' }}>
          One plan. Every feature. Pricing that makes sense whether you manage one property or twenty.
        </p>
      </section>

      <Divider />

      {/* Pricing cards */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* Base plan */}
          <div style={{ padding: '36px 32px', borderRadius: 18, border: `1px solid rgba(212,175,106,0.30)`, background: 'rgba(212,175,106,0.05)', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.30em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Base Plan</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 52, fontWeight: 300, lineHeight: 1, color: '#fff' }}>$14.99</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', paddingBottom: 8 }}>/month</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 32, lineHeight: 1.6 }}>
              Everything included for your first property. No feature limits.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36, flex: 1 }}>
              {BASE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 1 }}><CheckIcon /></div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/manager/login"
              style={{ display: 'block', textAlign: 'center', padding: '13px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, borderRadius: 10, textDecoration: 'none' }}>
              Get Started
            </Link>
          </div>

          {/* Additional properties */}
          <div style={{ padding: '36px 32px', borderRadius: 18, border: '1px solid rgba(245,237,213,0.10)', background: 'rgba(245,237,213,0.03)', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.30em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Additional Properties</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 52, fontWeight: 300, lineHeight: 1, color: '#fff' }}>$9.99</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', paddingBottom: 8 }}>/mo per property</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginBottom: 32, lineHeight: 1.6 }}>
              Scale your portfolio at a reduced rate. Every feature, every property.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <div style={{ padding: '20px', borderRadius: 12, border: '1px solid rgba(245,237,213,0.08)', background: 'rgba(245,237,213,0.03)' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 12, letterSpacing: '0.06em' }}>Example portfolio cost</p>
                {[
                  ['1 property', '$14.99/mo'],
                  ['2 properties', '$24.98/mo'],
                  ['5 properties', '$54.95/mo'],
                  ['10 properties', '$104.90/mo'],
                ].map(([label, cost]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(245,237,213,0.06)' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)' }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>{cost}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              <Link href="/manager/login"
                style={{ display: 'block', textAlign: 'center', padding: '13px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(255,255,255,0.85)', background: 'rgba(245,237,213,0.09)', border: '1px solid rgba(245,237,213,0.18)', borderRadius: 10, textDecoration: 'none' }}>
                Add Properties
              </Link>
            </div>
          </div>

        </div>
      </section>

      <Divider />

      {/* Referral section */}
      <section id="referral" style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: SANDY, marginBottom: 18 }}>Referral Program</p>
        <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, color: '#fff', marginBottom: 18 }}>
          Share Pillar.<br /><span style={{ color: SANDY }}>Earn Credits.</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.60)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
          Every manager account comes with a unique referral code. Share it with other hosts — when they sign up and subscribe, you earn account credits automatically. No limits on how much you can earn.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, maxWidth: 640, margin: '0 auto' }}>
          {[
            { step: '01', label: 'Find your code', desc: 'Your unique referral code is in your manager dashboard.' },
            { step: '02', label: 'Share it', desc: 'Send it to any host who would benefit from Pillar.' },
            { step: '03', label: 'Earn credits', desc: 'When they subscribe, credits appear on your account automatically.' },
          ].map(({ step, label, desc }) => (
            <div key={step} style={{ padding: '22px 20px', borderRadius: 14, border: '1px solid rgba(245,237,213,0.08)', background: 'rgba(245,237,213,0.03)', textAlign: 'left' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.25em', color: GOLD, marginBottom: 10 }}>{step}</p>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.90)', marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* FAQ */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 40px)', maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.36em', textTransform: 'uppercase', color: SANDY, marginBottom: 18, textAlign: 'center' }}>FAQ</p>
        <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 400, color: '#fff', marginBottom: 36, textAlign: 'center', lineHeight: 1.2 }}>
          Common Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQ.map(({ q, a }) => (
            <div key={q} style={{ padding: '20px 0', borderBottom: '1px solid rgba(245,237,213,0.07)' }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.90)', marginBottom: 10 }}>{q}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.54)', lineHeight: 1.65 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 8vw, 96px) clamp(16px, 4vw, 40px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-lux-title), Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
          Start With One Property
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
          $14.99/month. Every feature included. Cancel any time.
        </p>
        <Link href="/manager/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1410', background: SANDY, padding: '13px 32px', borderRadius: 10, textDecoration: 'none' }}>
          Get Started Today
        </Link>
      </section>
    </FeaturePageLayout>
  );
}
