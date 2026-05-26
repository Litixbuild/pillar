"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ManagerThemeToggle from "@/components/ManagerThemeToggle";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/qr-codes", label: "QR Codes" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={
        "rounded-lg px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors " +
        (isActive
          ? "bg-black/7 text-black/75 dark:bg-white/10 dark:text-white/85"
          : "text-black/40 hover:bg-black/4 hover:text-black/65 dark:text-white/35 dark:hover:bg-white/5 dark:hover:text-white/60")
      }
    >
      {label}
    </Link>
  );
}

export default function AdminNav({ email }: { email: string }) {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-[#F5F3EE]/95 backdrop-blur-md dark:border-white/6 dark:bg-[#070e17]/95">
      {/* Top row */}
      <div className="flex items-center justify-between px-5 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/images/pillarlogowhite.png"
            alt="Pillar"
            width={80}
            height={40}
            className="h-auto w-14 opacity-80 invert dark:invert-0"
          />
          <span className="rounded-md border border-red-500/20 bg-red-500/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-red-600/65 dark:text-red-400/80">
            Admin
          </span>
          {/* Nav inline on desktop */}
          <nav className="ml-3 hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-black/30 sm:block dark:text-white/25">{email}</span>
          <ManagerThemeToggle />
          <button
            onClick={handleLogout}
            className="text-[11px] font-medium text-black/35 transition-colors hover:text-black/65 active:scale-95 dark:text-white/30 dark:hover:text-white/60"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex items-center gap-0.5 border-t border-black/5 px-4 py-1.5 md:hidden dark:border-white/4">
        {NAV_LINKS.map((l) => (
          <NavLink key={l.href} href={l.href} label={l.label} />
        ))}
      </nav>
    </header>
  );
}
