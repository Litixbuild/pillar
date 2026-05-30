import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SMS Opt-In Policy — Pillar',
  description: 'How property managers opt in to receive SMS notifications from Pillar.',
};

export default function SmsPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-widest text-slate-800">
            PILLAR
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="mb-2 text-3xl font-light tracking-tight text-slate-900">SMS Opt-In Policy</h1>
        <p className="mb-10 text-sm text-slate-400">How Pillar sends SMS notifications to property managers</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">

          {/* Program description */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Program Description</h2>
            <p>
              Pillar sends transactional SMS notifications to property managers who have opted in through
              the Pillar dashboard. Messages are sent only when a tenant submits a maintenance work order
              or a late checkout request through that manager's property page. No marketing messages are sent.
            </p>
          </section>

          {/* Opt-in method */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">How Managers Opt In</h2>
            <p className="mb-4">
              Opt-in is completed entirely through a web form inside the Pillar manager dashboard.
              The process has two entry points:
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="mb-1 font-semibold text-slate-800">1. Work Order Category Settings</p>
                <p className="text-slate-500">
                  Inside the manager dashboard, each work order category (e.g. Plumbing, Electric, HVAC)
                  has a <strong>Routing Phone</strong> field. When a manager enters their phone number in
                  this field and saves, they are consenting to receive an SMS notification whenever a
                  tenant submits a work order for that specific category.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="mb-1 font-semibold text-slate-800">2. Property Settings — Manager Phone</p>
                <p className="text-slate-500">
                  In the property's general settings, the <strong>Manager Phone</strong> field accepts a
                  phone number to receive late checkout request notifications from tenants. Entering a
                  number here constitutes opt-in for late checkout alerts.
                </p>
              </div>
            </div>

            <p className="mt-4">
              Both fields display the label <em>"Phone number for SMS alerts"</em> adjacent to the input.
              No pre-checked boxes or implied consent — the manager actively types their number and saves.
            </p>
          </section>

          {/* Consent language */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Consent Language Shown at Opt-In</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 font-mono text-xs text-slate-700">
              By entering your phone number, you agree to receive SMS notifications from Pillar when
              tenants submit requests for this property. Message and data rates may apply.
              Reply STOP to opt out at any time.
            </div>
          </section>

          {/* Sample messages */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Sample Messages</h2>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs text-slate-700">
                Pillar: New work order submitted - Plumbing at [Sunset Villa]. Details: Leak under kitchen sink.
                Manage at pmpillar.com. Reply STOP to opt out.
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs text-slate-700">
                Pillar: Late checkout requested at Oak Manor. Submitted May 29, 2026, 3:45 PM.
                Manage at pmpillar.com. Reply STOP to opt out.
              </div>
            </div>
          </section>

          {/* Message frequency */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Message Frequency</h2>
            <p>
              Message frequency varies based on tenant activity. Managers receive one SMS per tenant
              submission (work order or late checkout request). There is no fixed recurring schedule —
              messages are triggered solely by tenant actions.
            </p>
          </section>

          {/* Opt-out */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">How to Opt Out</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Reply <strong>STOP</strong> to any message to immediately stop all SMS notifications.</li>
              <li>Remove your phone number from the Work Order category settings or Property settings inside the Pillar dashboard at any time.</li>
              <li>Contact us at <a href="mailto:support@pmpillar.com" className="underline underline-offset-2 text-slate-800">support@pmpillar.com</a> to request removal.</li>
            </ul>
          </section>

          {/* Help */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Help</h2>
            <p>
              Reply <strong>HELP</strong> to any message or email{' '}
              <a href="mailto:support@pmpillar.com" className="underline underline-offset-2 text-slate-800">
                support@pmpillar.com
              </a>{' '}
              for assistance.
            </p>
          </section>

          {/* Rates */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Rates</h2>
            <p>Message and data rates may apply depending on your mobile carrier and plan.</p>
          </section>

          {/* Non-sharing */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">Privacy</h2>
            <p>
              We do not sell, share, rent, or disclose mobile phone numbers to third parties for marketing
              purposes. Phone numbers are used solely to deliver the transactional notifications described
              above. See our full{' '}
              <Link href="/privacy" className="underline underline-offset-2 text-slate-800">Privacy Policy</Link>.
            </p>
          </section>

        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Pillar &nbsp;·&nbsp;{' '}
        <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
        &nbsp;·&nbsp;{' '}
        <Link href="/terms" className="hover:text-slate-600">Terms</Link>
      </div>
    </div>
  );
}
