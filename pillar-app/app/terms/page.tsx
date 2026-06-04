import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Pillar',
  description: 'Terms of Service for Pillar property management platform.',
};

const EFFECTIVE_DATE = 'May 29, 2025';
const CONTACT_EMAIL = 'support@pmpillar.com';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-widest text-slate-800">
            PILLAR
          </Link>
          <Link href="/privacy" className="text-xs text-slate-400 transition-colors hover:text-slate-600 uppercase tracking-widest">
            Privacy
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-light tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mb-10 text-sm text-slate-400">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using the Pillar platform (&ldquo;Service&rdquo;), you agree to these Terms of
              Service. If you do not agree, do not use the Service. These terms apply to property managers
              who create accounts and to guests who access property pages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">2. Description of Service</h2>
            <p>
              Pillar provides a property management platform that allows property managers to create digital
              property experience pages for their guests, manage amenities and content, and receive maintenance
              work order notifications. Guests can view property information, contact managers, and submit
              work orders through the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">3. Account Registration</h2>
            <p className="mb-3">
              Property managers must create an account to use the Service. You agree to provide accurate,
              current, and complete information and to keep your account credentials confidential. You are
              responsible for all activity that occurs under your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or that are
              inactive for an extended period.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">4. SMS Notifications</h2>
            <p className="mb-3">
              Property managers may provide a phone number to receive SMS work order notifications. By providing
              your phone number in the Pillar dashboard:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>You consent to receive automated SMS notifications when tenants submit maintenance requests.</li>
              <li>Message and data rates may apply.</li>
              <li>Message frequency varies based on tenant activity.</li>
              <li>You may opt out at any time by replying STOP to any message or removing your phone number from your dashboard settings.</li>
              <li>Reply HELP for assistance or contact {CONTACT_EMAIL}.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">5. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Upload content that is false, misleading, defamatory, or infringes on any third party&apos;s rights.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
              <li>Use the Service to send unsolicited messages or spam.</li>
              <li>Reverse engineer, copy, or create derivative works of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">6. Content</h2>
            <p>
              You retain ownership of content you upload to the platform (photos, property descriptions, etc.).
              By uploading content, you grant Pillar a limited license to store, display, and deliver that
              content as part of operating the Service. You are solely responsible for ensuring you have the
              right to upload and share any content you post.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">7. Payment and Subscription</h2>
            <p>
              Certain features of the Service require a paid subscription. Payments are processed securely
              through Stripe. Subscription fees are billed in advance and are non-refundable except where
              required by law. We reserve the right to change pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">8. Disclaimers</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. Pillar does
              not guarantee uninterrupted, error-free operation of the platform. We are not responsible for
              any actions taken by property managers or guests based on information provided through the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Pillar shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of or inability to use the Service,
              even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">10. Termination</h2>
            <p>
              You may cancel your account at any time by contacting us at {CONTACT_EMAIL}. We reserve the
              right to suspend or terminate your access to the Service at any time for violation of these
              Terms, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. The effective date at the top of this page reflects
              the most recent revision. Continued use of the Service after changes are posted constitutes
              your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the United States. Any disputes shall be resolved in
              the appropriate courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">13. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-800 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>

        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Pillar. All rights reserved. &nbsp;·&nbsp;{' '}
        <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/refund" className="hover:text-slate-600">Refund Policy</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/cookies" className="hover:text-slate-600">Cookie Policy</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/contact" className="hover:text-slate-600">Contact</Link>
      </div>
    </div>
  );
}
