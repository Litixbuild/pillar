import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pillar',
  description: 'Privacy Policy for Pillar property management platform.',
};

const EFFECTIVE_DATE = 'May 29, 2025';
const CONTACT_EMAIL = 'support@pmpillar.com';
const SITE = 'pmpillar.com';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-widest text-slate-800">
            PILLAR
          </Link>
          <Link href="/terms" className="text-xs text-slate-400 transition-colors hover:text-slate-600 uppercase tracking-widest">
            Terms
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-light tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mb-10 text-sm text-slate-400">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">1. Who We Are</h2>
            <p>
              Pillar (&ldquo;Pillar,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the property management platform
              available at {SITE}. This Privacy Policy explains how we collect, use, and protect information
              when you use our platform as a property manager or access a property page as a guest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">2. Information We Collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Account information:</strong> Name, email address, and password when you register as a property manager.</li>
              <li><strong>Property information:</strong> Property details, amenities, photos, and other content you upload to your account.</li>
              <li><strong>Contact information:</strong> Phone numbers entered in Work Order Settings for routing maintenance notifications.</li>
              <li><strong>Work order data:</strong> Maintenance requests submitted by property guests, including category, description, and timestamp.</li>
              <li><strong>Usage data:</strong> Standard server logs including IP address, browser type, and pages visited.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">3. SMS Messaging</h2>
            <p className="mb-3">
              Property managers may opt in to receive SMS notifications by providing a phone number in the
              Pillar dashboard Work Order Settings. By entering a phone number, you consent to receive
              text message alerts when tenants submit maintenance requests for your properties.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Message frequency:</strong> Message frequency varies based on tenant activity. You will receive one SMS per work order submission for categories where you have provided a phone number.</li>
              <li><strong>Message and data rates may apply</strong> depending on your mobile carrier and plan.</li>
              <li><strong>Opt-out:</strong> Reply <strong>STOP</strong> to any message to stop receiving SMS notifications, or remove your phone number from your dashboard settings at any time.</li>
              <li><strong>Help:</strong> Reply <strong>HELP</strong> to any message or contact us at {CONTACT_EMAIL} for assistance.</li>
              <li><strong>Non-sharing:</strong> We do not sell, share, rent, or disclose your mobile phone number to third parties for their marketing purposes. Phone numbers are used solely to deliver work order notifications you have opted in to receive.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">4. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To provide and operate the Pillar platform.</li>
              <li>To send work order notifications to property managers who have opted in via SMS or email.</li>
              <li>To process payments through our billing provider (Stripe).</li>
              <li>To respond to support requests.</li>
              <li>To improve the platform and diagnose technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">5. Information Sharing</h2>
            <p className="mb-3">We do not sell your personal information. We share information only as follows:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Service providers:</strong> We use trusted third-party services (Supabase for data storage, Stripe for payments, Twilio for SMS delivery, Zoho for email) solely to operate the platform. These providers are contractually obligated to protect your information.</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of Pillar and its users.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">6. Data Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS), hashed passwords,
              and signed session tokens. No method of transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Work order records are retained
              for operational and legal purposes. You may request deletion of your account and associated data
              by contacting us at {CONTACT_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">8. Your Rights</h2>
            <p>
              You may access, correct, or request deletion of your personal information at any time by contacting
              us at {CONTACT_EMAIL}. Property managers can update their information directly within the dashboard.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The effective date at the top of this page
              will reflect the most recent revision. Continued use of the platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">10. Contact Us</h2>
            <p>
              Questions about this Privacy Policy? Contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-800 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>

        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Pillar. All rights reserved. &nbsp;·&nbsp;{' '}
        <Link href="/terms" className="hover:text-slate-600">Terms</Link>
      </div>
    </div>
  );
}
