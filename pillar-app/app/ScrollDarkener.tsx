"use client";

import { useEffect, useRef } from "react";

export default function ScrollDarkener() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const opacity = Math.min(window.scrollY / 5000, 0.12);
      ref.current.style.background = `rgba(0,0,0,${opacity})`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -5 }}
    />
  );
}
