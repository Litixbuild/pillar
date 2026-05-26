"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

const INPUT_CLS =
  "h-12 w-full rounded-xl border border-black/10 bg-black/3 px-4 text-base text-[#2C2C2C] outline-none transition-all placeholder:text-black/25 focus:border-black/25 focus:ring-1 focus:ring-black/10 dark:border-white/8 dark:bg-white/4 dark:text-white dark:placeholder:text-white/22 dark:focus:border-white/20 dark:focus:ring-white/8";

const LABEL_CLS =
  "text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40 dark:text-white/40";

export default function QRCreator() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [reason, setReason] = useState("");
  const [baseUrl, setBaseUrl] = useState(APP_URL);
  const [path, setPath] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showColors, setShowColors] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fall back to current origin only in development (when no env var set)
  useEffect(() => {
    if (!baseUrl) setBaseUrl(window.location.origin);
  }, [baseUrl]);

  const normalizedPath = path.trim()
    ? path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`
    : "";

  const finalUrl = customMode
    ? customUrl.trim()
    : (baseUrl.replace(/\/$/, "") + normalizedPath);

  const isValid =
    reason.trim().length > 0 &&
    (customMode ? customUrl.trim().length > 0 : baseUrl.trim().length > 0);

  async function handleSave() {
    if (!isValid) return;
    setError(null);
    setSaved(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Composite onto a solid background so the PNG is never transparent
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d")!;
    ctx.fillStyle = bgColor || "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const imageDataUrl = exportCanvas.toDataURL("image/png");

    startTransition(async () => {
      const res = await fetch("/api/admin/qr-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: reason.trim(), url: finalUrl, imageDataUrl }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Failed to save");
        return;
      }

      setSaved(true);
      setReason("");
      setPath("");
      setCustomUrl("");
      setFgColor("#000000");
      setBgColor("#ffffff");
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-white dark:border-white/6 dark:bg-[#0a1520]">
      {/* Header */}
      <div className="border-b border-black/6 px-6 py-4 dark:border-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/30 dark:text-white/30">
          New QR Code
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">

          {/* Form */}
          <div className="space-y-5">

            {/* Reason */}
            <div className="space-y-2">
              <p className={LABEL_CLS}>Reason</p>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Business Card, Website Footer, Instagram Bio"
                className={INPUT_CLS}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className={LABEL_CLS}>URL</p>
                <button
                  type="button"
                  onClick={() => setCustomMode((v) => !v)}
                  className="text-[10px] text-black/35 underline underline-offset-2 transition-colors hover:text-black/60 dark:text-white/30 dark:hover:text-white/55"
                >
                  {customMode ? "Use app URL" : "Use custom URL"}
                </button>
              </div>

              {customMode ? (
                <input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  type="url"
                  placeholder="https://example.com/page"
                  className={INPUT_CLS}
                />
              ) : (
                <div className="flex h-12 overflow-hidden rounded-xl border border-black/10 transition-all focus-within:border-black/25 focus-within:ring-1 focus-within:ring-black/10 dark:border-white/8 dark:focus-within:border-white/20 dark:focus-within:ring-white/8">
                  <input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-36 shrink-0 truncate border-r border-black/8 bg-black/4 px-3 text-xs text-black/45 outline-none dark:border-white/6 dark:bg-white/4 dark:text-white/35"
                    placeholder="https://yourdomain.com"
                    aria-label="Base domain"
                  />
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/p/property-name"
                    className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#2C2C2C] outline-none placeholder:text-black/25 dark:text-white dark:placeholder:text-white/22"
                    aria-label="Path"
                  />
                </div>
              )}

              {finalUrl && normalizedPath && (
                <p className="truncate font-mono text-[10px] text-black/30 dark:text-white/25">
                  {finalUrl}
                </p>
              )}
            </div>

            {/* Color toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowColors((v) => !v)}
                className="text-[10px] text-black/35 underline underline-offset-2 transition-colors hover:text-black/60 dark:text-white/30 dark:hover:text-white/55"
              >
                {showColors ? "Hide colors" : "Customize colors"}
              </button>

              {showColors && (
                <div className="mt-4 flex gap-6">
                  <div className="space-y-2">
                    <p className={LABEL_CLS}>Foreground</p>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-black/10 bg-transparent p-0.5 dark:border-white/10"
                      />
                      <span className="font-mono text-xs text-black/40 dark:text-white/35">{fgColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={LABEL_CLS}>Background</p>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-black/10 bg-transparent p-0.5 dark:border-white/10"
                      />
                      <span className="font-mono text-xs text-black/40 dark:text-white/35">{bgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSave}
              disabled={!isValid || isPending}
              className="h-12 w-full rounded-xl bg-[#2C2C2C] text-sm font-medium tracking-wide text-white transition-all hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#2C2C2C] dark:hover:bg-white/90 md:w-auto md:px-10"
            >
              {isPending ? "Saving…" : saved ? "Saved ✓" : "Generate & Save"}
            </button>
          </div>

          {/* Live preview */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/30">
              Preview
            </p>
            <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/6 dark:bg-white">
              <QRCodeCanvas
                ref={canvasRef}
                value={finalUrl || "https://example.com"}
                size={600}
                fgColor={fgColor}
                bgColor={bgColor}
                level="M"
                style={{ width: 200, height: 200, display: "block" }}
              />
            </div>
            {reason && (
              <p className="max-w-52 text-center text-[11px] text-black/40 dark:text-white/35">
                {reason}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
