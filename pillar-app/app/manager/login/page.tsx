"use client";

import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ManagerLoginPage() {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh", backgroundImage: "url(/images/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay — lets background.png show through */}
      <div className="absolute inset-0" style={{ background: "rgba(6,13,20,0.58)" }} />

      {/* Teal radial glow — matches the edit / amenities screens */}
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
            Manager Login
          </h1>
          <div className="mx-auto mt-3 h-px w-8 bg-linear-to-r from-teal-400/50 to-transparent" />
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/55">
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="manager@domain.com"
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-teal-500/35 focus:ring-1 focus:ring-teal-500/18"
            />
          </div>

          <button
            type="submit"
            className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-teal-500 to-cyan-400 text-sm font-semibold text-[#070e17] shadow-[0_0_20px_rgba(20,184,166,0.22)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.42)] active:scale-[0.98]"
          >
            Sign In
          </button>

          <div className="pt-0.5 text-center">
            <Link
              href="/manager/forgot-password"
              className="text-[11px] uppercase tracking-[0.18em] text-teal-400/45 transition-colors duration-200 hover:text-teal-400/75"
            >
              Forgot Password?
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
