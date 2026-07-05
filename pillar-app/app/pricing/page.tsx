import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, Divider, PricingCardsSection, StepsSection, FAQSection, CTASection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Pillar Pricing — First Month Free, Then $14.99/Month',
  description: 'Try Pillar free for 30 days. Then $14.99/month for your first property, $9.99 for each additional. Every feature included, no long-term contracts — cancel any time.',
};

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
    a: 'Yes — your first month is completely free. Subscribe, set up your first property, and pay nothing for 30 days. After the trial, billing starts automatically at $14.99/month. The trial covers one property — adding more during the trial starts billing right away ($14.99/month plus $9.99/month per additional property). Cancel any time during the trial and you won\'t be charged.',
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
      <PageHero
        eyebrow="Pricing"
        title="Simple. Transparent."
        titleAccent="No Surprises."
        subtitle="One plan. Every feature. Pricing that makes sense whether you manage one property or twenty."
      />

      <Divider />

      <PricingCardsSection
        basePlan={{
          label: 'Base Plan',
          price: '$14.99',
          priceUnit: '/month',
          description: 'First month free, then $14.99/month. Everything included for your first property. No feature limits.',
          features: BASE_FEATURES,
          ctaText: 'Start Free Month',
          ctaHref: '/manager/login',
        }}
        addonPlan={{
          label: 'Additional Properties',
          price: '$9.99',
          priceUnit: '/mo per property',
          description: 'Scale your portfolio at a reduced rate. Every feature, every property.',
          exampleRows: [
            ['1 property', '$14.99/mo'],
            ['2 properties', '$24.98/mo'],
            ['5 properties', '$54.95/mo'],
            ['10 properties', '$104.90/mo'],
          ],
          ctaText: 'Add Properties',
          ctaHref: '/manager/login',
        }}
      />

      <Divider />

      <StepsSection
        eyebrow="Referral Program"
        title="Share Pillar."
        titleAccent="Earn Credits."
        intro="Every manager account comes with a unique referral code. Share it with other hosts — when they sign up and subscribe, you earn account credits automatically. No limits on how much you can earn."
        steps={[
          { step: '01', label: 'Find your code', desc: 'Your unique referral code is in your manager dashboard.' },
          { step: '02', label: 'Share it', desc: 'Send it to any host who would benefit from Pillar.' },
          { step: '03', label: 'Earn credits', desc: 'When they subscribe, credits appear on your account automatically.' },
        ]}
      />

      <Divider />

      <FAQSection faqs={FAQ} />

      <Divider />

      <CTASection
        title="Start With One Property"
        subtitle="First month free, then $14.99/month. Every feature included. Cancel any time."
        buttonText="Start Your Free Month"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
