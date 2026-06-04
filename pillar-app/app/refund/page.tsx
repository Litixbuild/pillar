import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Pillar',
  description: 'Refund and Cancellation Policy for Pillar property management platform.',
};

const LAST_UPDATED = 'June 4, 2026';
const CONTACT_EMAIL = 'support@pmpillar.com';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-widest text-slate-800">
            PILLAR
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 transition-colors hover:text-slate-600 uppercase tracking-widest">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-slate-400 transition-colors hover:text-slate-600 uppercase tracking-widest">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-light tracking-tight text-slate-900">Refund &amp; Cancellation Policy</h1>
        <p className="mb-10 text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">1. Subscriptions</h2>
            <p>
              Pillar may offer monthly, annual, per-property, per-unit, custom, or other subscription plans
              as stated on an order form, invoice, checkout page, or written agreement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">2. Cancellation</h2>
            <p>
              Customers may cancel a subscription according to the process stated in the applicable order
              form or through the billing portal if available. Unless otherwise stated, cancellation takes
              effect at the end of the current billing period. You will retain access to paid features
              through the end of the period for which you have already been charged.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">3. Refunds</h2>
            <p>
              Unless an order form or written agreement states otherwise, fees are non-refundable and
              non-creditable. Pillar may provide refunds, credits, or goodwill accommodations at its
              sole discretion. To request a refund or credit consideration, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-800 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>{' '}
              with your account information and reason for the request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">4. Trials and Promotions</h2>
            <p>
              Any trial, beta access, discount, promotion, or special offer is subject to the terms
              stated at the time of offer and may be modified or discontinued as permitted by law.
              Trial periods do not automatically convert to a paid subscription without prior notice
              and your affirmative consent where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">5. Nonpayment</h2>
            <p>
              Pillar may suspend or terminate access for unpaid fees, failed payment methods,
              chargebacks, or suspected payment fraud. In the event of a suspension, Pillar will
              make reasonable efforts to notify you before taking action. Reactivation of a suspended
              account may require payment of all outstanding balances.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">6. Plan Changes</h2>
            <p className="mb-3">
              You may upgrade or downgrade your subscription plan at any time through the billing portal
              or by contacting us.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Upgrades:</strong> Take effect immediately. You will be charged a prorated amount for the remainder of the current billing period.</li>
              <li><strong>Downgrades:</strong> Take effect at the start of the next billing period. No prorated refund is issued for the current period.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">7. Billing Disputes</h2>
            <p>
              If you believe you have been charged in error, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-800 underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>{' '}
              within 30 days of the charge. We will review the matter and respond promptly. Initiating
              a chargeback without first contacting us may result in account suspension and forfeiture
              of the disputed amount.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">8. Changes to This Policy</h2>
            <p>
              Pillar reserves the right to update this Refund &amp; Cancellation Policy at any time.
              The &ldquo;Last Updated&rdquo; date at the top of this page reflects the most recent revision.
              Continued use of the Service after changes are posted constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">9. Contact</h2>
            <p>
              Questions about this policy? Contact us at{' '}
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
        <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/contact" className="hover:text-slate-600">Contact</Link>
      </div>
    </div>
  );
}
