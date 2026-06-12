"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export const dynamic = "force-dynamic";

const SANDY     = "#F5EDD5";
const SANDY_RGB = "245,237,213";

function SunIcon()  { return <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export default function CommercialLoginPage() {
  const [dark, setDark]           = useState(false);
  const [step, setStep]           = useState<"login" | "mfa">("login");
  const [emailHint, setEmailHint] = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pillar-theme");
    if (stored) setDark(stored === "dark");
  }, []);

  useEffect(() => {
    if (step === "mfa") setTimeout(() => codeRef.current?.focus(), 80);
  }, [step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("pillar-theme", next ? "dark" : "light");
  }

  const logoSrc       = dark ? "/images/pillarlogowhite.png" : "/images/pillarlogoblack.png";
  const backArrowColor = dark ? "rgba(245,237,213,0.50)" : "rgba(100,80,40,0.55)";
  const toggleStyle   = dark
    ? { borderColor: "rgba(245,237,213,0.28)", background: "rgba(245,237,213,0.08)", color: SANDY }
    : { borderColor: "rgba(100,80,40,0.20)", background: "rgba(255,255,255,0.80)", color: "rgba(100,80,40,0.70)" };
  const labelColor    = dark ? `rgba(${SANDY_RGB},0.65)` : "rgba(100,80,40,0.65)";
  const headingColor  = dark ? "#ffffff" : "#111111";
  const dividerColor  = dark ? "rgba(245,237,213,0.5)" : "rgba(100,80,40,0.25)";
  const inputCls      = dark
    ? "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-white/25 focus:ring-1 focus:ring-white/[0.12]"
    : "h-11 w-full rounded-xl border border-[rgba(100,80,40,0.18)] bg-[rgba(100,80,40,0.04)] px-4 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-[rgba(100,80,40,0.30)] focus:border-[rgba(100,80,40,0.35)]";
  const submitStyle   = dark
    ? { background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`, color: "#3d2a0a", boxShadow: "0 0 20px rgba(245,237,213,0.25)" }
    : { background: "#111111", color: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.14)" };
  const forgotColor   = dark ? "rgba(245,237,213,0.50)" : "rgba(100,80,40,0.55)";

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    const res = await fetch("/api/commercial/resend-mfa", { method: "POST" });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed to resend code.");
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden px-5" style={{ height: "100dvh" }}>
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100"  style={{ backgroundImage: "url(/images/bg3.png)",   backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      {/* Dark mode toggle */}
      <button type="button" onClick={toggleMode} className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300" style={toggleStyle}>
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Back arrow (MFA step only) */}
      {step === "mfa" && (
        <button type="button" onClick={() => { setStep("login"); setError(null); }} className="absolute top-5 left-5 z-20 transition-opacity duration-200 hover:opacity-70" style={{ color: backArrowColor }} aria-label="Back to login">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true"><path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Image src={logoSrc} alt="Pillar" width={300} height={200} className="mb-6 h-auto w-44 opacity-90 sm:mb-8 sm:w-56" priority />

        {/* Step 1: Email / Password */}
        {step === "login" && (
          <>
            <div className="mb-7 text-center">
              <h1 className="text-xl font-light tracking-tight sm:text-2xl" style={{ color: headingColor }}>Commercial Portal</h1>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: `linear-gradient(to right, ${dividerColor}, transparent)` }} />
            </div>
            {error && <div className="mb-4 w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300/80">{error}</div>}
            <form
              className="w-full space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null); setLoading(true);
                const fd  = new FormData(e.currentTarget);
                const res = await fetch("/api/commercial/login", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ email: String(fd.get("email") || ""), password: String(fd.get("password") || "") }),
                });
                const data = (await res.json().catch(() => ({}))) as { ok?: boolean; mfa_required?: boolean; email_hint?: string; error?: string };
                if (!res.ok) { setError(data.error ?? "Login failed."); setLoading(false); return; }
                if (data.mfa_required) { setEmailHint(data.email_hint ?? ""); setStep("mfa"); setResendCooldown(30); setLoading(false); return; }
                window.location.href = "/commercial";
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="c-email" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Email</label>
                <input id="c-email" name="email" type="email" autoComplete="username" required placeholder="you@hotel.com" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="c-password" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>Password</label>
                <input id="c-password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className={inputCls} />
              </div>
              <button type="submit" disabled={loading} className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60" style={submitStyle}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: MFA */}
        {step === "mfa" && (
          <>
            <div className="mb-7 text-center">
              <h1 className="text-xl font-light tracking-tight sm:text-2xl" style={{ color: headingColor }}>Verify Identity</h1>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: `linear-gradient(to right, ${dividerColor}, transparent)` }} />
              {emailHint && <p className="mt-4 text-sm" style={{ color: dark ? "rgba(255,255,255,0.60)" : "rgba(100,80,40,0.60)" }}>Code sent to {emailHint}</p>}
            </div>
            {error && <div className="mb-4 w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300/80">{error}</div>}
            <form
              className="w-full space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null); setLoading(true);
                const fd  = new FormData(e.currentTarget);
                const res = await fetch("/api/commercial/verify-mfa", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ code: String(fd.get("code") || "") }),
                });
                const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
                if (!res.ok) { setError(data.error ?? "Verification failed."); setLoading(false); return; }
                window.location.href = "/commercial";
              }}
            >
              <div className="space-y-1.5">
                <label htmlFor="c-code" className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: labelColor }}>6-Digit Code</label>
                <input id="c-code" ref={codeRef} name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required placeholder="123456" className={inputCls + " tracking-[0.5em] text-center"} />
              </div>
              <button type="submit" disabled={loading} className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60" style={submitStyle}>
                {loading ? "Verifying…" : "Verify"}
              </button>
              <div className="pt-1 text-center">
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0} className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80 disabled:opacity-40" style={{ color: forgotColor }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
