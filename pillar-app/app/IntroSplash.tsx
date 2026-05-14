"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function IntroSplash() {
  const [logoVisible, setLogoVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Small tick so the browser has painted before we start the transition
    const t1 = setTimeout(() => setLogoVisible(true), 80);
    // Hold fully visible, then begin fade-out
    const t2 = setTimeout(() => setFading(true), 2400);
    // Remove from DOM once invisible
    const t3 = setTimeout(() => setDone(true), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        backgroundImage: "url(/images/mainbackground.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 1.3s ease-in-out" : "none",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div
        style={{
          opacity: logoVisible ? 1 : 0,
          transition: "opacity 1.6s ease-in-out",
        }}
      >
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={260}
          height={173}
          priority
        />
      </div>
    </div>
  );
}
