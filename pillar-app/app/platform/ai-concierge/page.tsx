import type { Metadata } from 'next';
import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, PhoneHero, FAQSection } from '@/components/FeaturePageLayout';

export const metadata: Metadata = {
  title: '24/7 AI Concierge for Vacation Rental Guests | Pillar',
  description: 'Pillar\'s AI concierge answers guest questions around the clock — local restaurant recommendations, itinerary planning, property how-tos, and more. Included in every plan.',
};

function SparkleIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M19.5 19l.75 1.5 1.5-.75-1.5-.75L19.5 19z" fill="currentColor" /></svg>; }
function MapPinIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.4" /><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>; }
function CloudIcon() { return <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20 }}><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function AIConcierge() {
  return (
    <FeaturePageLayout>
      <PageHero
        eyebrow="AI Concierge"
        title="Their Perfect Day,"
        titleAccent="On Demand."
        subtitle="Pillar's built-in AI concierge is always available for your guests. Local recommendations, day planning, property questions — answered in seconds, day or night."
        cta="Try It Free"
        ctaHref="/manager/login"
      />

      <Divider />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>
        <PhoneHero left="/images/screenshots/ai-concierge-hero.png" />
      </section>

      <Divider />

      <FeatureGrid features={[
        { icon: <MapPinIcon />, title: 'Local Discovery', desc: 'Restaurants, activities, hidden gems — curated recommendations based on your property\'s location.' },
        { icon: <CalendarIcon />, title: 'Day Itinerary Builder', desc: 'Guests describe their mood and the AI builds a full itinerary: breakfast through dessert.' },
        { icon: <MoonIcon />, title: '24/7 Availability', desc: 'No more late-night texts to you. The concierge never sleeps, never misses a question.' },
        { icon: <HomeIcon />, title: 'Property Knowledge', desc: 'WiFi, check-out reminders, appliance how-tos — the AI knows your property inside and out.' },
        { icon: <SparkleIcon />, title: 'Smart Recommendations', desc: 'Context-aware suggestions based on time of day, guest preferences, and what\'s actually open.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Local Intelligence"
        title="More Than Answers."
        titleAccent="Curated Experiences."
        body={[
          'The AI surfaces nearby restaurants, bars, cafes, and attractions — each with a real description of the vibe and what makes it worth visiting.',
          'Every result shows ratings, distance, and a direct Google button so guests can pull up the menu or get directions instantly.',
          'Multi-turn conversation lets guests refine and follow up — "something quieter", "closer to the water", "good for kids".',
          'Recommendations are context-aware — based on time of day, what\'s open, and what actually fits the guest\'s mood.',
        ]}
        screenshotLabel="AI Concierge — Local Recommendations" screenshotSrc="/images/screenshots/ai-concierge-local.png" phoneScreenshot
        reverse={false}
      />

      <SplitSection
        eyebrow="Itinerary Planning"
        title="A Full Day,"
        titleAccent="Planned in Seconds."
        body={[
          'Guests say what kind of day they want — relaxed, adventurous, romantic, family-friendly.',
          'The AI builds a complete 6-stop itinerary: breakfast, morning activity, lunch, afternoon, dinner, dessert.',
          'Each stop includes the venue name, why it fits, and practical details like address and vibe.',
          'The result is a shareable, memorable plan that turns a good stay into an exceptional one.',
        ]}
        screenshotLabel="AI Concierge — Itinerary View" screenshotSrc="/images/screenshots/ai-concierge-itinerary.png" phoneScreenshot
        reverse={true}
      />

      <Divider />

      <FAQSection faqs={[
        { q: 'What can the AI concierge help guests with?', a: 'The AI concierge handles local recommendations, day itinerary planning, property how-tos, and general questions about the area. It knows your property details — WiFi, checkout times, appliance instructions — and can answer in real time around the clock.' },
        { q: 'Do guests need to download an app to use the concierge?', a: 'No. The AI concierge is built into the guest portal, which guests access by scanning a QR code. It works in any mobile browser — no download, no account required.' },
        { q: 'Is the AI concierge available 24/7?', a: 'Yes. The concierge is always on. Guests can ask questions at midnight before check-in or at 6am on their last day — they\'ll always get an immediate, helpful response.' },
        { q: 'What kind of local recommendations does it make?', a: 'It surfaces restaurants, bars, cafes, activities, and attractions near your property. Each recommendation includes a description of the vibe, distance, ratings, and a direct link to Google so guests can see the menu or get directions instantly.' },
        { q: 'Does the AI know my specific property?', a: 'Yes. The concierge is trained on your property details — the information you add to your Pillar dashboard. This includes house rules, check-out instructions, appliance guides, and any custom notes you choose to include.' },
        { q: 'Is the AI concierge included in the base plan?', a: 'Yes. The AI concierge is included with every Pillar plan, for every property, at no additional cost.' },
      ]} />

      <CTASection
        title="Give Your Guests a Concierge They'll Talk About"
        subtitle="Included with every Pillar plan. No extra setup required."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
