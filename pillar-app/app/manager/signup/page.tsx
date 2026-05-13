"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function ManagerSignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh", backgroundImage: "url(/images/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(6,13,20,0.58)" }} />

      {/* Teal radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 45% at 50% -5%, rgba(20,184,166,0.12) 0%, transparent 68%)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">

        {/* Logo */}
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={300}
          height={200}
          className="mb-6 h-auto w-52 opacity-90 sm:mb-8 sm:w-72"
          priority
        />

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="text-xl font-light tracking-tight text-white sm:text-2xl">
            Create Account
          </h1>
          <div className="mx-auto mt-3 h-px w-8 bg-linear-to-r from-teal-400/50 to-transparent" />
        </div>

        {/* Error */}
        {error ? (
          <div className="mb-4 w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300/80">
            {error}
          </div>
        ) : null}

        {/* Form */}
        <form
          className="w-full space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") || "");
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");
            const confirmPassword = String(fd.get("confirmPassword") || "");

            const res = await fetch("/api/manager/signup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, email, password, confirmPassword }),
            });

            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              setError(data.error || "Signup failed. Please try again.");
              setLoading(false);
              return;
            }

            window.location.href = "/manager";
          }}
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
              Full Name
            </p>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Smith"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@domain.com"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
              Password
            </p>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
              Confirm Password
            </p>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.42)] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <div className="pt-0.5 text-center">
            <Link
              href="/manager/login"
              className="text-[11px] uppercase tracking-[0.18em] text-teal-400/45 transition-colors duration-200 hover:text-teal-400/75"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>

        {/* Back link */}
        <Link
          href="/"
          className="mt-5 text-[11px] uppercase tracking-[0.2em] text-white/25 transition-colors duration-200 hover:text-white/50 sm:mt-7"
        >
          ← Back to Pillar
        </Link>
      </div>
    </div>
  );
}
