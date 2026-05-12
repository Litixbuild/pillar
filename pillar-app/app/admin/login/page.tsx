"use client";

import Image from "next/image";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh", backgroundImage: "url(/images/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(6,13,20,0.72)" }} />

      {/* Subtle red glow to visually distinguish admin from manager login */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 45% at 50% -5%, rgba(239,68,68,0.10) 0%, transparent 68%)" }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={300}
          height={200}
          className="mb-6 h-auto w-44 opacity-80 sm:mb-8"
          priority
        />

        <div className="mb-7 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-red-400/60">
            Admin Access
          </p>
          <h1 className="mt-2 text-xl font-light tracking-tight text-white sm:text-2xl">
            Pillar Admin
          </h1>
          <div className="mx-auto mt-3 h-px w-8 bg-linear-to-r from-red-400/40 to-transparent" />
        </div>

        <form
          className="w-full space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");

            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              alert(data.error || "Login failed");
              return;
            }

            window.location.href = "/admin";
          }}
        >
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-red-400/55">
              Email
            </p>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="admin@domain.com"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-red-500/35 focus:ring-1 focus:ring-red-500/18"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-red-400/55">
              Password
            </p>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-white/8 bg-[#0f1e2d]/70 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/22 focus:border-red-500/35 focus:ring-1 focus:ring-red-500/18"
            />
          </div>

          <button
            type="submit"
            className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-red-600 to-red-400 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.18)] transition-all duration-300 hover:shadow-[0_0_32px_rgba(239,68,68,0.35)] active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
