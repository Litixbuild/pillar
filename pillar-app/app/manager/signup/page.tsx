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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" style={{ width: 17, height: 17 }} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function UserFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.5c1.3-3 4-4.5 7-4.5s5.7 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MailFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7.5l8 5.5 8-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

  const backArrowColor = dark ? "rgba(245,237,213,0.50)" : "rgba(100,80,40,0.55)";
  const toggleStyle = dark
    ? { borderColor: "rgba(245,237,213,0.28)", background: "rgba(245,237,213,0.08)", color: SANDY }
    : { borderColor: "rgba(100,80,40,0.20)", background: "rgba(255,255,255,0.80)", color: "rgba(100,80,40,0.70)" };

  const labelColor = dark ? `rgba(${SANDY_RGB},0.65)` : "rgba(100,80,40,0.65)";
  const headingColor = dark ? "#ffffff" : "#111111";
  const dividerColor = dark ? "rgba(245,237,213,0.35)" : "rgba(100,80,40,0.20)";
  const signInColor = dark ? "rgba(245,237,213,0.55)" : "rgba(100,80,40,0.55)";
  const fieldIconColor = dark ? "rgba(245,237,213,0.45)" : "rgba(100,80,40,0.45)";

  // Pill-shaped inputs with a leading icon, mimicking the reference design
  const inputCls = dark
    ? "h-9 w-full rounded-full border border-white/10 bg-black/30 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-white/25 focus:bg-black/40"
    : "h-9 w-full rounded-full border border-[rgba(100,80,40,0.18)] bg-[rgba(255,255,255,0.70)] pl-10 pr-4 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-[rgba(100,80,40,0.38)] focus:border-[rgba(100,80,40,0.40)]";

  const submitStyle = dark
    ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: "#3d2a0a", boxShadow: "0 0 20px rgba(245,237,213,0.25)" }
    : { background: "#111111", color: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.14)" };

  // Frosted ghost style — near-transparent fill with backdrop blur, so the
  // buttons read as frosted glass over the page background.
  const ghostStyle = dark
    ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(245,237,213,0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }
    : { background: "rgba(100,80,40,0.05)", border: "1px solid rgba(100,80,40,0.18)", color: "rgba(61,42,10,0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" };

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden px-6 pt-12 pb-4"
      style={{ height: "100dvh" }}
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
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col items-center justify-center">

        {/* Email verification screen */}
        {verificationEmail ? (
          <div className="w-full text-center">
            <div className="mb-5">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={dark ? { borderColor: "rgba(245,237,213,0.18)", background: "rgba(245,237,213,0.10)" } : { borderColor: "rgba(100,80,40,0.18)", background: "rgba(100,80,40,0.06)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" style={{ color: dark ? "rgba(245,237,213,0.85)" : "rgba(100,80,40,0.75)" }} aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-light tracking-tight" style={{ color: headingColor }}>Check your inbox</h2>
              <p className="mt-2 text-sm" style={{ color: labelColor }}>
                We sent a verification link to
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: headingColor }}>{verificationEmail}</p>
              <p className="mt-3 text-xs" style={{ color: dark ? "rgba(245,237,213,0.45)" : "rgba(100,80,40,0.45)" }}>
                Click the link in the email to verify your account, then come back and sign in.
              </p>
            </div>
            <Link
              href="/manager/login"
              className="inline-flex h-9 w-full items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98]"
              style={submitStyle}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
        {/* Hero image — flexes to absorb all leftover height (2:3 ratio, never causes scroll) */}
        <div className="relative mb-3 min-h-0 max-w-full flex-1 overflow-hidden rounded-2xl" style={{ aspectRatio: "941 / 1672", transform: "scale(1.33)" }}>
          <Image src="/images/newbg4.png" alt="" fill sizes="340px" className="object-contain" priority />
        </div>

        {/* Heading */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-light tracking-tight" style={{ color: headingColor }}>
            Create Account
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: signInColor }}>
            Set up your first property in minutes.
          </p>
        </div>

        {/* Error */}
        {error ? (
          <div className="mb-4 w-full rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300/80">
            {error}
          </div>
        ) : null}

        {/* Form */}
        <form
          className="w-full space-y-2.5"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const fd = new FormData(e.currentTarget);
            const name = String(fd.get("name") || "");
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");
            if (password.length < 8) {
              setError("Password must be at least 8 characters.");
              setLoading(false);
              return;
            }
            const res = await fetch("/api/manager/signup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, email, password, confirmPassword: password }),
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
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: fieldIconColor }}><UserFieldIcon /></span>
            <input id="signup-name" name="name" type="text" autoComplete="name" required placeholder="Name" aria-label="Full name" className={inputCls} />
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: fieldIconColor }}><MailFieldIcon /></span>
            <input id="signup-email" name="email" type="email" autoComplete="username" required placeholder="Email" aria-label="Email" className={inputCls} />
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: fieldIconColor }}><LockFieldIcon /></span>
            <input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Password (min. 8 characters)" aria-label="Password" className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3! h-9 w-full rounded-full text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
            style={submitStyle}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          {/* Google sign-up */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="h-px flex-1" style={{ background: dividerColor }} />
            <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: labelColor }}>or</span>
            <div className="h-px flex-1" style={{ background: dividerColor }} />
          </div>
          <div className="flex justify-center">
            <a
              href="/api/manager/auth/google"
              aria-label="Sign in with Google"
              title="Sign in with Google"
              className="flex h-9 w-9 items-center justify-center transition-all duration-300 hover:opacity-80 active:scale-[0.96]"
            >
              <GoogleIcon />
            </a>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/manager/login"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: signInColor }}
            >
              Already have an account? Sign in
            </Link>
          </div>

          <p className="pt-1 text-center text-[10px] leading-relaxed" style={{ color: dark ? "rgba(245,237,213,0.35)" : "rgba(100,80,40,0.40)" }}>
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
