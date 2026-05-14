"use client";

import { useEffect, useRef } from "react";

export default function ParallaxBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      // Move background at 15% of scroll speed — subtle parallax
      const offset = window.scrollY * 0.15;
      ref.current.style.backgroundPositionY = `calc(top + ${offset}px)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: "url(/images/mainbackground.png)",
        backgroundSize: "cover",
        backgroundPositionX: "center",
        backgroundPositionY: "top",
      }}
    />
  );
}
