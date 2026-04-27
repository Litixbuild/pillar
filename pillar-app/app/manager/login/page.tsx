"use client";

import ManagerThemeToggle from "@/components/ManagerThemeToggle";

export const dynamic = "force-dynamic";

export default function ManagerLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3EE] via-white to-[#F5F3EE] text-[#2C2C2C] dark:from-[#0F0F0F] dark:via-[#1B1B1B] dark:to-black dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-8">
        <div className="mb-6 flex justify-center">
          <img
            src="/images/pillarlogoblack.png"
            alt="Pillar"
            className="h-48 w-auto dark:hidden"
          />
          <img
            src="/images/pillarlogowhite.png"
            alt="Pillar"
            className="hidden h-48 w-auto dark:block"
          />
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <div className="space-y-2 text-center">
            <div className="lux-title text-2xl">Manager Login</div>
            <div className="text-sm text-black/60 dark:text-white/70">
              Sign in to view your properties.
            </div>
          </div>

          <form
            className="mt-6 space-y-4"
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
            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wide text-[#2C2C2C]/70 dark:text-white/70">
                Email
              </label>
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#2C2C2C] outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#D4AF6A]/40 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                placeholder="manager@domain.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium tracking-wide text-[#2C2C2C]/70 dark:text-white/70">
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#2C2C2C] outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#D4AF6A]/40 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#2C2C2C] text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-black dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Sign in
            </button>

            <div className="pt-4 flex justify-center">
              <ManagerThemeToggle />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
