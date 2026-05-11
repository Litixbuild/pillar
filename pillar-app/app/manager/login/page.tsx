"use client";

import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ManagerLoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative"
      style={{
        backgroundImage: "url(/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.62)" }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo */}
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={150}
          height={100}
          className="mb-8 opacity-90"
          priority
        />

        {/* Card */}
        <div
          className="w-full rounded-2xl p-8"
          style={{
            backgroundColor: "rgba(6, 9, 14, 0.72)",
            border: "1px solid rgba(212,175,106,0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Heading */}
          <div className="text-center mb-8">
            <h1
              className="font-serif text-2xl text-white mb-2"
            >
              Manager Login
            </h1>
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(212,175,106,0.7)" }}>
              Property Portal
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-5"
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
              <label
                className="block text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="manager@domain.com"
                className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 placeholder:text-white/25"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(212,175,106,0.6)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="block text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 placeholder:text-white/25"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(212,175,106,0.6)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl text-sm uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:opacity-85 mt-2"
              style={{ background: "#D4AF6A", color: "#06090e" }}
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="mt-8 text-[11px] uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-60"
          style={{ color: "rgba(212,175,106,0.55)" }}
        >
          ← Back to Pillar
        </Link>
      </div>
    </div>
  );
}
