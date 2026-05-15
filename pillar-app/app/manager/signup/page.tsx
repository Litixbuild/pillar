"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

const SANDY = "#F5EDD5";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ManagerSignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("pillar-dashboard-theme");
    if (stored) setDark(stored === "dark");
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("pillar-dashboard-theme", next ? "dark" : "light");
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh" }}
    >
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top", opacity: dark ? 1 : 0 }} />
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ backgroundImage: "url(/images/mainbackground.png)", backgroundSize: "cover", backgroundPosition: "center top", opacity: dark ? 0 : 1 }} />
      {/* Back arrow — top left */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 text-white/35 transition-colors duration-200 hover:text-white/70"
        aria-label="Back to home"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Dark mode toggle — top right */}
      <button
        type="button"
        onClick={toggleMode}
        className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
        style={{
          borderColor: "rgba(245,237,213,0.28)",
          background: "rgba(245,237,213,0.08)",
          color: SANDY,
        }}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

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
          <div className="mx-auto mt-3 h-px w-8" style={{ background: "linear-gradient(to right, rgba(245,237,213,0.5), transparent)" }} />
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F5EDD5]/65">
              Full Name
            </p>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Smith"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F5EDD5]/65">
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@domain.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F5EDD5]/65">
              Password
            </p>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F5EDD5]/65">
              Confirm Password
            </p>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "linear-gradient(to right, #F5EDD5, #e8d9b8)",
              color: "#3d2a0a",
              boxShadow: "0 0 20px rgba(245,237,213,0.25)",
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <div className="pt-0.5 text-center">
            <Link
              href="/manager/login"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: "rgba(245,237,213,0.55)" }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
