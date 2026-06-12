"use client";

import { useEffect, useState } from "react";

export default function CommercialTemplate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.22s ease-out" }}>
      {children}
    </div>
  );
}
