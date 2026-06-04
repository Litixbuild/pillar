import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — Pillar',
  description: 'Cookie Policy for Pillar property management platform.',
};

const EFFECTIVE_DATE = 'June 4, 2026';
const CONTACT_EMAIL = 'support@pmpillar.com';

export default function CookiesPage() {
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
        <h1 className="mb-2 text-3xl font-light tracking-tight text-slate-900">Cookie Policy</h1>
        <p className="mb-10 text-sm text-slate-400">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-600">

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are widely
              used to make websites work efficiently, to remember your preferences, and to provide information
              to site owners. Pillar uses cookies and similar technologies to operate and improve the platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">2. How We Use Cookies</h2>
            <p className="mb-3">We use cookies for the following purposes:</p>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Purpose</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Essential</td>
                    <td className="px-4 py-3 text-slate-500">Authentication sessions, security tokens, and core platform functionality.</td>
                    <td className="px-4 py-3 text-slate-500">Session / 30 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Preference</td>
                    <td className="px-4 py-3 text-slate-500">Remembers your display settings such as dark/light mode.</td>
                    <td className="px-4 py-3 text-slate-500">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Analytics</td>
                    <td className="px-4 py-3 text-slate-500">Helps us understand how pages are used so we can improve the platform.</td>
                    <td className="px-4 py-3 text-slate-500">Up to 2 years</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-800">Payment</td>
                    <td className="px-4 py-3 text-slate-500">Set by Stripe to facilitate secure payment processing.</td>
                    <td className="px-4 py-3 text-slate-500">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">3. Essential Cookies</h2>
            <p>
              Essential cookies are required for the platform to function. They enable core features
              such as logging in, navigating between pages, and accessing your dashboard. Because these
              cookies are strictly necessary to deliver the Service, they cannot be disabled without
              significantly affecting your experience.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">4. Local Storage</h2>
            <p>
              In addition to cookies, we use browser local storage and session storage to store
              lightweight preference data — for example, your theme selection (dark/light mode) and
              temporary UI state. This data is stored only on your device and is not transmitted to
              our servers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">5. Third-Party Cookies</h2>
            <p className="mb-3">
              Certain third-party services we use may set their own cookies. We do not control these
              cookies and recommend reviewing each provider&apos;s privacy policy for details:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Stripe</strong> — Payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-slate-800 underline underline-offset-2">Stripe Privacy Policy</a></li>
              <li><strong>Supabase</strong> — Database and authentication infrastructure.</li>
              <li><strong>Vercel</strong> — Hosting and edge delivery.</li>
            </ul>
            <p className="mt-3">
              We do not use third-party advertising cookies or sell your browsing data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">6. Managing Cookies</h2>
            <p className="mb-3">
              You can control and delete cookies through your browser settings. Most browsers allow
              you to:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>View cookies stored on your device and delete them individually or in bulk.</li>
              <li>Block third-party cookies.</li>
              <li>Block cookies from specific sites.</li>
              <li>Block all cookies from being set.</li>
              <li>Delete all cookies when you close your browser.</li>
            </ul>
            <p className="mt-3">
              Please be aware that disabling essential cookies will impact your ability to use the
              Pillar platform, including the ability to log in to your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">7. Guest Portal</h2>
            <p>
              Guests accessing a property page (e.g., <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">pmpillar.com/p/[property]</code>)
              do not need to create an account. Session storage may be used on guest pages solely
              to remember in-session UI state (such as a dismissed notification) and is cleared
              when the browser tab is closed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">8. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. The effective date at the top of
              this page reflects the most recent revision. Continued use of the platform after
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-800">9. Contact</h2>
            <p>
              Questions about this Cookie Policy? Contact us at{' '}
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
        <Link href="/refund" className="hover:text-slate-600">Refund Policy</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/contact" className="hover:text-slate-600">Contact</Link>
      </div>
    </div>
  );
}
