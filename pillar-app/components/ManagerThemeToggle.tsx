"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("pillar_manager_theme");
  if (stored === "light" || stored === "dark") return stored;
  // Default to dark for the manager portal.
  return "dark";
}

export default function ManagerThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        window.localStorage.setItem("pillar_manager_theme", next);
        applyTheme(next);
      }}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur transition " +
        "border-black/10 bg-black/5 text-black/80 hover:bg-black/10 " +
        "dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 " +
        className
      }
      aria-label="Toggle light/dark mode"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden
        className="opacity-90"
      >
        <path
          fill="currentColor"
          d="M21 14.5A8.38 8.38 0 0 1 12.5 21 9.5 9.5 0 0 1 10 2a.75.75 0 0 1 .88.97A8 8 0 0 0 12.5 19.5a6.9 6.9 0 0 0 7.02-4.8.75.75 0 0 1 1.48-.2Z"
        />
      </svg>
    </button>
  );
}
