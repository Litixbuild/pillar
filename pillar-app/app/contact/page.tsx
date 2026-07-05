import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Pillar',
  description: 'Get in touch with the Pillar team.',
};

const CONTACT_EMAIL = 'support@pmpillar.com';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-widest text-slate-800">
            PILLAR
          </Link>
          <Link href="/manager/login" className="text-xs text-slate-400 transition-colors hover:text-slate-600 uppercase tracking-widest">
            Login
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-slate-400">Get in Touch</p>
        <h1 className="mb-4 text-3xl font-light tracking-tight text-slate-900">Contact Us</h1>
        <p className="mb-12 text-sm leading-relaxed text-slate-500">
          Have a question, need support, or just want to say hello? We&apos;re a small team and
          we read every message. You can expect a response within one business day.
        </p>

        {/* Contact cards */}
        <div className="grid gap-5 sm:grid-cols-2">

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Email Support</p>
              <p className="mt-1 text-xs text-slate-500">For billing, technical issues, and general questions</p>
              <p className="mt-3 text-xs font-medium text-slate-700 underline underline-offset-2 group-hover:text-slate-900">
                {CONTACT_EMAIL}
              </p>
            </div>
          </a>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Response Time</p>
              <p className="mt-1 text-xs text-slate-500">We aim to respond to all inquiries within one business day.</p>
              <p className="mt-3 text-xs text-slate-400">Monday – Friday, 9am – 6pm ET</p>
            </div>
          </div>

        </div>

        {/* FAQ section */}
        <div className="mt-16">
          <h2 className="mb-6 text-xl font-light tracking-tight text-slate-900">Common Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How do I get started with Pillar?',
                a: 'Create a free account at pmpillar.com, add your property, and you\'ll have a live guest portal within minutes. No credit card required to explore the platform.',
              },
              {
                q: 'How do I cancel my subscription?',
                a: 'You can cancel anytime through the billing portal inside your dashboard, or by emailing us at support@pmpillar.com. Cancellations take effect at the end of your current billing period.',
              },
              {
                q: 'Can I add multiple properties?',
                a: 'Yes. Each subscription tier includes a set number of property slots. You can upgrade your plan or add additional slots at any time from your dashboard.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes — new accounts get their first month free. After 30 days, billing starts at $14.99/month for your first property, plus $9.99/month for each additional property. Cancel during the trial and you won\'t be charged.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards through our secure Stripe-powered billing portal.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-100 pb-6">
                <p className="mb-2 text-sm font-semibold text-slate-800">{q}</p>
                <p className="text-sm leading-relaxed text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        &copy; 2026 Pillar. All rights reserved. &nbsp;·&nbsp;{' '}
        <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
        {' '}&nbsp;·&nbsp;{' '}
        <Link href="/refund" className="hover:text-slate-600">Refund Policy</Link>
      </div>
    </div>
  );
}
