"use client";

import Image from "next/image";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Invalid credentials");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10"
      style={{
        backgroundImage: "url(/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(5,11,18,0.78)" }} />

      {/* Red accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(239,68,68,0.12) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex w-full max-w-90 flex-col items-center">
        {/* Logo */}
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={300}
          height={200}
          className="mb-8 h-auto w-40 opacity-75"
          priority
        />

        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-red-400/55">
            Admin Access
          </p>
          <h1 className="mt-2 font-serif text-3xl font-light text-white">
            Pillar Admin
          </h1>
          <div className="mx-auto mt-4 h-px w-10 bg-linear-to-r from-transparent via-red-400/35 to-transparent" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-red-400/50">
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="admin@domain.com"
              className="h-12 w-full rounded-xl border border-white/8 bg-white/6 px-4 text-base text-white outline-none transition-all placeholder:text-white/20 focus:border-red-500/40 focus:bg-white/8 focus:ring-1 focus:ring-red-500/15"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-red-400/50">
              Password
            </p>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-xl border border-white/8 bg-white/6 px-4 text-base text-white outline-none transition-all placeholder:text-white/20 focus:border-red-500/40 focus:bg-white/8 focus:ring-1 focus:ring-red-500/15"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300/90">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-linear-to-r from-red-600 to-red-500 text-sm font-semibold tracking-wide text-white shadow-[0_0_24px_rgba(239,68,68,0.20)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(239,68,68,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
