"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SANDY = "#F5EDD5";
const SANDY_RGB = "245,237,213";

export default function AccountMfaPage() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/manager/account/mfa")
      .then((r) => r.json())
      .then((d: { mfa_enabled?: boolean }) => setMfaEnabled(d.mfa_enabled === true))
      .catch(() => setMfaEnabled(false));
  }, []);

  async function handleEnable() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/manager/account/mfa", { method: "POST" });
    if (res.ok) {
      setMfaEnabled(true);
      setMsg({ text: "Two-factor authentication enabled. You'll receive a code at your account email next login.", ok: true });
    } else {
      setMsg({ text: "Failed to enable. Please try again.", ok: false });
    }
    setLoading(false);
  }

  async function handleDisable() {
    if (!confirm("Disable two-factor authentication? All trusted devices will be removed.")) return;
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/manager/account/mfa", { method: "DELETE" });
    if (res.ok) {
      setMfaEnabled(false);
      setMsg({ text: "Two-factor authentication disabled.", ok: true });
    } else {
      setMsg({ text: "Failed to disable. Please try again.", ok: false });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "rgba(10,10,10,0.97)" }}>
      <div className="mx-auto max-w-lg px-6 py-12">

        <Link href="/manager" className="mb-8 inline-flex items-center gap-2 text-sm transition-opacity duration-200 hover:opacity-70" style={{ color: `rgba(${SANDY_RGB},0.55)` }}>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="lux-title mb-2 text-3xl font-light tracking-wide text-white">Two-Factor Authentication</h1>
        <p className="mb-8 text-sm" style={{ color: `rgba(${SANDY_RGB},0.50)` }}>
          When enabled, a 6-digit code is emailed to your account address each time you sign in from a new device.
        </p>

        {/* Status indicator */}
        {mfaEnabled === null ? (
          <div className="mb-6 h-14 animate-pulse rounded-2xl bg-white/5" />
        ) : (
          <div
            className="mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{
              border: `1px solid ${mfaEnabled ? 'rgba(52,211,153,0.22)' : 'rgba(255,255,255,0.07)'}`,
              background: mfaEnabled ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <div className="h-2 w-2 flex-none rounded-full" style={{ background: mfaEnabled ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.25)' }} />
            <p className="text-sm font-medium" style={{ color: mfaEnabled ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.55)' }}>
              {mfaEnabled ? 'Enabled — code sent to your email at each new login' : 'Not enabled'}
            </p>
          </div>
        )}

        {msg ? (
          <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${msg.ok ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300/80' : 'border-rose-500/25 bg-rose-500/10 text-rose-300/80'}`}>
            {msg.text}
          </div>
        ) : null}

        {mfaEnabled === false && (
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            style={{ background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: "#3d2a0a", boxShadow: "0 0 20px rgba(245,237,213,0.18)" }}
          >
            {loading ? "Saving…" : "Enable Two-Factor Authentication"}
          </button>
        )}

        {mfaEnabled === true && (
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            className="h-11 w-full rounded-xl border text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-50"
            style={{ border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.80)" }}
          >
            {loading ? "Disabling…" : "Disable Two-Factor Authentication"}
          </button>
        )}

        <p className="mt-8 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
          After entering your code, you can check "Remember this device for 30 days" to skip verification on that device for a month.
        </p>
      </div>
    </div>
  );
}
