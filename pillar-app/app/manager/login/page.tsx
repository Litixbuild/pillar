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

export default function ManagerLoginPage() {
  const [dark, setDark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const backArrowColor = dark ? "rgba(245,237,213,0.50)" : "rgba(255,255,255,0.80)";
  const toggleStyle = dark
    ? { borderColor: "rgba(245,237,213,0.28)", background: "rgba(245,237,213,0.08)", color: SANDY }
    : { borderColor: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.90)" };


  const labelColor = dark ? `rgba(${SANDY_RGB},0.65)` : "rgba(255,255,255,0.65)";
  const headingColor = "#ffffff";
  const dividerColor = dark ? "rgba(245,237,213,0.5)" : "rgba(255,255,255,0.35)";

  const inputCls = "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-white/25 focus:ring-1 focus:ring-white/12";

  const submitStyle = dark
    ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: "#3d2a0a", boxShadow: "0 0 20px rgba(245,237,213,0.25)" }
    : { background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.14)" };

  const forgotColor = dark ? "rgba(245,237,213,0.50)" : "rgba(255,255,255,0.55)";

  const signupStyle = dark
    ? { borderColor: "rgba(245,237,213,0.30)", backgroundColor: "rgba(245,237,213,0.08)", color: "rgba(245,237,213,0.85)" }
    : { borderColor: "rgba(255,255,255,0.30)", backgroundColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.85)" };

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh" }}
    >
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/mainbackground.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      {/* Back arrow — top left */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 transition-opacity duration-200 hover:opacity-70"
        style={{ color: backArrowColor }}
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
        style={toggleStyle}
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
          className="mb-6 h-auto w-44 opacity-90 sm:mb-8 sm:w-56"
          priority
        />

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="text-xl font-light tracking-tight sm:text-2xl" style={{ color: headingColor }}>
            Manager Login
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
          className="w-full space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const form = e.currentTarget as HTMLFormElement;
            const fd = new FormData(form);
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");
            const res = await fetch("/api/manager/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              setError(data.error || "Login failed. Please try again.");
              setLoading(false);
              return;
            }
            window.location.href = "/manager";
          }}
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Email</p>
            <input name="email" type="email" autoComplete="username" required placeholder="manager@domain.com" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Password</p>
            <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
            style={submitStyle}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="pt-1 flex flex-col items-center gap-3 text-center">
            <Link
              href="/manager/forgot-password"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: forgotColor }}
            >
              Forgot Password?
            </Link>

            <Link
              href="/manager/signup"
              className="group flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              style={signupStyle}
            >
              Don&apos;t have an account?
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">Sign up →</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
