import FeaturePageLayout, { PageHero, FeatureGrid, SplitSection, CTASection, Divider, PhoneHero } from '@/components/FeaturePageLayout';

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
        { icon: <SparkleIcon />, title: 'Powered by Gemini', desc: 'State-of-the-art AI from Google delivers thoughtful, nuanced answers every time.' },
        { icon: <MapPinIcon />, title: 'Local Discovery', desc: 'Restaurants, activities, hidden gems — curated recommendations based on your property\'s location.' },
        { icon: <CalendarIcon />, title: 'Day Itinerary Builder', desc: 'Guests describe their mood and the AI builds a full itinerary: breakfast through dessert.' },
        { icon: <MoonIcon />, title: '24/7 Availability', desc: 'No more late-night texts to you. The concierge never sleeps, never misses a question.' },
        { icon: <HomeIcon />, title: 'Property Knowledge', desc: 'WiFi, check-out reminders, appliance how-tos — the AI knows your property inside and out.' },
        { icon: <CloudIcon />, title: 'Live Weather', desc: 'Real-time weather data helps guests plan outdoor activities and dress appropriately.' },
      ]} />

      <Divider />

      <SplitSection
        eyebrow="Local Intelligence"
        title="More Than Answers."
        titleAccent="Curated Experiences."
        body={[
          'The AI searches real local listings and surfaces restaurants, bars, cafes, and attractions near your property.',
          'Results include ratings, hours, and distance — everything a guest needs to decide in seconds.',
          'Multi-turn conversation means guests can refine, ask follow-ups, and get truly personalised recommendations.',
          'Every recommendation is contextual — based on time of day, guest preferences, and what\'s actually open.',
        ]}
        screenshotLabel="AI Concierge — Local Recommendations" screenshotSrc="/images/screenshots/ai-concierge-local.webm" phoneScreenshot
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
        screenshotLabel="AI Concierge — Itinerary View" screenshotSrc="/images/screenshots/ai-concierge-itinerary.webm" phoneScreenshot
        reverse={true}
      />

      <Divider />

      <CTASection
        title="Give Your Guests a Concierge They'll Talk About"
        subtitle="Included with every Pillar plan. No extra setup required."
        buttonText="Get Started"
        buttonHref="/manager/login"
      />
    </FeaturePageLayout>
  );
}
