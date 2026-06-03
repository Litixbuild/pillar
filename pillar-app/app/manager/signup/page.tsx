"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

const SANDY = "#F5EDD5";
const SANDY_RGB = "245,237,213";

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
  const [dark, setDark] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pillar-theme");
    if (stored) setDark(stored === "dark");
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem("pillar-theme", next ? "dark" : "light");
  }

  const logoSrc = dark ? "/images/pillarlogowhite.png" : "/images/pillarlogoblack.png";
  const backArrowColor = dark ? "rgba(245,237,213,0.50)" : "rgba(100,80,40,0.55)";
  const toggleStyle = dark
    ? { borderColor: "rgba(245,237,213,0.28)", background: "rgba(245,237,213,0.08)", color: SANDY }
    : { borderColor: "rgba(100,80,40,0.20)", background: "rgba(255,255,255,0.80)", color: "rgba(100,80,40,0.70)" };

  const labelColor = dark ? `rgba(${SANDY_RGB},0.65)` : "rgba(100,80,40,0.65)";
  const headingColor = dark ? "#ffffff" : "#111111";
  const dividerColor = dark ? "rgba(245,237,213,0.5)" : "rgba(100,80,40,0.25)";
  const signInColor = dark ? "rgba(245,237,213,0.55)" : "rgba(100,80,40,0.55)";

  const inputCls = dark
    ? "h-10 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-white/25 focus:ring-1 focus:ring-white/[0.12]"
    : "h-10 w-full rounded-xl border border-[rgba(100,80,40,0.18)] bg-[rgba(100,80,40,0.04)] px-4 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-[rgba(100,80,40,0.30)] focus:border-[rgba(100,80,40,0.35)]";

  const submitStyle = dark
    ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: "#3d2a0a", boxShadow: "0 0 20px rgba(245,237,213,0.25)" }
    : { background: "#111111", color: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.14)" };

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-y-auto px-5 py-10"
      style={{ minHeight: "100dvh" }}
    >
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      {/* Back arrow — top left */}
      <Link
        href="/manager/login"
        className="absolute top-5 left-5 z-20 transition-opacity duration-200 hover:opacity-70"
        style={{ color: backArrowColor }}
        aria-label="Back to login"
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
        style={toggleStyle}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">

        {/* Logo */}
        <Image
          src={logoSrc}
          alt="Pillar"
          width={300}
          height={200}
          className="mb-4 h-auto w-36 opacity-90 sm:w-44"
          priority
        />

        {/* Email verification screen */}
        {verificationEmail ? (
          <div className="w-full text-center">
            <div className="mb-5">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white/80" aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-light tracking-tight text-white">Check your inbox</h2>
              <p className="mt-2 text-sm text-white/55">
                We sent a verification link to
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">{verificationEmail}</p>
              <p className="mt-3 text-xs text-white/40">
                Click the link in the email to verify your account, then come back and sign in.
              </p>
            </div>
            <Link
              href="/manager/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98]"
              style={submitStyle}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
        {/* Heading */}
        <div className="mb-5 text-center">
          <h1 className="text-xl font-light tracking-tight sm:text-2xl" style={{ color: headingColor }}>
            Create Account
          </h1>
          <div className="mx-auto mt-3 h-px w-8" style={{ background: `linear-gradient(to right, ${dividerColor}, transparent)` }} />
        </div>

        {/* Error */}
        {error ? (
          <div className="mb-4 w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300/80">
            {error}
          </div>
        ) : null}

        {/* Form */}
        <form
          className="w-full space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") || "");
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");
            const confirmPassword = String(fd.get("confirmPassword") || "");
            if (password !== confirmPassword) {
              setError("Passwords do not match.");
              setLoading(false);
              return;
            }
            if (password.length < 8) {
              setError("Password must be at least 8 characters.");
              setLoading(false);
              return;
            }
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
            setVerificationEmail(email);
            setLoading(false);
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Full Name</label>
            <input id="signup-name" name="name" type="text" autoComplete="name" required placeholder="Jane Smith" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Email</label>
            <input id="signup-email" name="email" type="email" autoComplete="username" required placeholder="you@domain.com" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Password</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Min. 8 characters" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-confirm" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Confirm Password</label>
            <input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Min. 8 characters" className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-0.5 h-10 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
            style={submitStyle}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <div className="pt-0.5 text-center">
            <Link
              href="/manager/login"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: signInColor }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
