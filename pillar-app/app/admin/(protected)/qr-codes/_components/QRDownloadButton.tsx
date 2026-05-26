"use client";

import { useState } from "react";

export default function QRDownloadButton({ url, label }: { url: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex-1 rounded-lg py-2 text-center text-xs font-medium text-black/40 transition-colors hover:bg-black/4 hover:text-black/70 disabled:opacity-40 dark:text-white/35 dark:hover:bg-white/5 dark:hover:text-white/65"
    >
      {loading ? "…" : "Download"}
    </button>
  );
}
