"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 21h22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="14" width="6" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="5"  y="7"  width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="7"  width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="16" y="7"  width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3H11a2 2 0 000 4h2a2 2 0 000-4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const TABS = [
  { label: "Home",     href: "/commercial",        icon: HomeIcon,     match: (p: string) => p === "/commercial" },
  { label: "Hotels",   href: "/commercial/hotels",  icon: HotelIcon,    match: (p: string) => p.startsWith("/commercial/hotels") },
  { label: "Activity", href: "/commercial/activity",icon: ActivityIcon, match: (p: string) => p.startsWith("/commercial/activity") },
  { label: "Account",  href: "/commercial/account", icon: AccountIcon,  match: (p: string) => p.startsWith("/commercial/account") },
];

export default function CommercialBottomNav() {
  const pathname = usePathname();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    fetch("/api/commercial/open-count")
      .then((r) => r.json())
      .then((d: { count?: number }) => setOpenCount(d.count ?? 0))
      .catch(() => null);
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/8 bg-white/95 backdrop-blur-lg dark:border-white/[0.07] dark:bg-[rgba(8,8,8,0.96)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Commercial navigation"
    >
      <div className="mx-auto flex max-w-2xl items-center">
        {TABS.map(({ label, href, icon: Icon, match }) => {
          const active    = match(pathname);
          const showBadge = label === "Activity" && openCount > 0;
          return (
            <Link
              key={label}
              href={href}
              className={[
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-150",
                active ? "text-[#7A5A1E] dark:text-[#F5EDD5]" : "text-black/30 dark:text-white/35",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon />
                {showBadge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
                    {openCount > 99 ? "99+" : openCount}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
