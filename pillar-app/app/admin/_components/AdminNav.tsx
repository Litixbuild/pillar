"use client";

import Image from "next/image";

export default function AdminNav({ email }: { email: string }) {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/6 bg-[#070e17]/90 px-6 py-3 backdrop-blur-sm md:px-10">
      <div className="flex items-center gap-3">
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={80}
          height={40}
          className="h-auto w-16 opacity-80"
        />
        <span className="rounded-md border border-red-500/20 bg-red-500/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-[11px] text-white/30 sm:block">{email}</span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/8 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40 transition-colors hover:border-white/16 hover:text-white/70"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
