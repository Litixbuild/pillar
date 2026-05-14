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

export default function ManagerLoginPage() {
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
      style={{
        height: "100dvh",
        backgroundImage: dark ? "url(/images/bg3.png)" : "url(/images/mainbackground.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        transition: "background-image 0.5s ease",
      }}
    >
      {/* Back arrow — top left */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 transition-opacity duration-200 hover:opacity-70"
        style={{ color: "rgba(245,237,213,0.5)" }}
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
            Manager Login
          </h1>
          <div className="mx-auto mt-3 h-px w-8" style={{ background: `linear-gradient(to right, rgba(245,237,213,0.5), transparent)` }} />
        </div>

        {/* Form */}
        <form
          className="w-full space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
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
              alert(data.error || "Login failed");
              return;
            }

            window.location.href = "/manager";
          }}
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,237,213,0.65)" }}>
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="manager@domain.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,237,213,0.65)" }}>
              Password
            </p>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15"
            />
          </div>

          <button
            type="submit"
            className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98]"
            style={{
              background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`,
              color: "#3d2a0a",
              boxShadow: "0 0 20px rgba(245,237,213,0.25)",
            }}
          >
            Sign In
          </button>

          <div className="pt-1 flex flex-col items-center gap-3 text-center">
            <Link
              href="/manager/forgot-password"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: "rgba(245,237,213,0.5)" }}
            >
              Forgot Password?
            </Link>

            <Link
              href="/manager/signup"
              className="group flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300"
              style={{
                borderColor: "rgba(245,237,213,0.3)",
                backgroundColor: "rgba(245,237,213,0.08)",
                color: "rgba(245,237,213,0.85)",
              }}
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
