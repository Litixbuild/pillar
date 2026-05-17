"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const SANDY = "#F5EDD5";

type PageStatus = "verifying" | "ready" | "saving" | "success" | "error";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<PageStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pillar-theme");
    if (stored) setDark(stored === "dark");
  }, []);

  function toggleMode() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem("pillar-theme", next ? "dark" : "light");
  }

  useEffect(() => {
    async function establish() {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));

      try {
        if (params.get("code")) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.get("code")!);
          if (error) throw error;
          setStatus("ready");
          return;
        }

        if (params.get("token_hash") && params.get("type") === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: params.get("token_hash")!,
            type: "recovery",
          });
          if (error) throw error;
          setStatus("ready");
          return;
        }

        if (hash.get("access_token") && hash.get("type") === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token") ?? "",
          });
          if (error) throw error;
          setStatus("ready");
          return;
        }

        throw new Error("No valid reset token found in URL.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(
          msg.includes("expired") || msg.includes("invalid")
            ? "This reset link has expired or already been used. Please request a new one."
            : "Invalid reset link. Please request a new one."
        );
        setStatus("error");
      }
    }

    establish();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError("");

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");

    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFieldError("Passwords do not match.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setFieldError(error.message || "Failed to update password. Please try again.");
      setStatus("ready");
      return;
    }

    await supabase.auth.signOut();
    setStatus("success");
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-[#F5EDD5]/15";

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-5"
      style={{ height: "100dvh" }}
    >
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/mainbackground.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      {/* Back arrow — top left */}
      <Link
        href="/manager/login"
        className="absolute top-5 left-5 z-20 transition-opacity duration-200 hover:opacity-70"
        style={{ color: "rgba(245,237,213,0.5)" }}
        aria-label="Back to login"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Dark mode toggle — top right */}
      <button
        type="button"
        onClick={toggleMode}
        className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200"
        style={{
          borderColor: "rgba(245,237,213,0.28)",
          background: "rgba(245,237,213,0.08)",
          color: SANDY,
        }}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">

        {/* Logo */}
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={300}
          height={200}
          className="mb-6 h-auto w-52 opacity-90 sm:mb-8 sm:w-72"
          priority
        />

        {/* Verifying */}
        {status === "verifying" && (
          <p className="text-sm" style={{ color: "rgba(245,237,213,0.55)" }}>
            Verifying reset link…
          </p>
        )}

        {/* Expired / invalid */}
        {status === "error" && (
          <>
            <div className="mb-7 text-center">
              <h1 className="text-xl font-light tracking-tight text-white sm:text-2xl">
                Link Expired
              </h1>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: "linear-gradient(to right, rgba(245,237,213,0.5), transparent)" }} />
            </div>
            <p className="mb-8 text-center text-sm leading-relaxed" style={{ color: "rgba(245,237,213,0.65)" }}>
              {errorMsg}
            </p>
            <Link
              href="/manager/forgot-password"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: "rgba(245,237,213,0.55)" }}
            >
              Request a New Link →
            </Link>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="mb-7 text-center">
              <h1 className="text-xl font-light tracking-tight text-white sm:text-2xl">
                Password Updated
              </h1>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: "linear-gradient(to right, rgba(245,237,213,0.5), transparent)" }} />
            </div>
            <p className="mb-8 text-center text-sm leading-relaxed" style={{ color: "rgba(245,237,213,0.65)" }}>
              Your password has been changed. You can now sign in with your new password.
            </p>
            <Link
              href="/manager/login"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
              style={{ color: "rgba(245,237,213,0.55)" }}
            >
              Go to Login →
            </Link>
          </>
        )}

        {/* New password form */}
        {(status === "ready" || status === "saving") && (
          <>
            <div className="mb-7 text-center">
              <h1 className="text-xl font-light tracking-tight text-white sm:text-2xl">
                New Password
              </h1>
              <div className="mx-auto mt-3 h-px w-8" style={{ background: "linear-gradient(to right, rgba(245,237,213,0.5), transparent)" }} />
            </div>

            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,237,213,0.65)" }}>
                  New Password
                </p>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,237,213,0.65)" }}>
                  Confirm Password
                </p>
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              {fieldError && (
                <p className="text-xs text-rose-300/80">{fieldError}</p>
              )}

              <button
                type="submit"
                disabled={status === "saving"}
                className="mt-1 h-11 w-full rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: `linear-gradient(to right, ${SANDY}, #e8d9b8)`,
                  color: "#3d2a0a",
                  boxShadow: "0 0 20px rgba(245,237,213,0.25)",
                }}
              >
                {status === "saving" ? "Updating…" : "Update Password"}
              </button>

              <div className="pt-0.5 text-center">
                <Link
                  href="/manager/login"
                  className="text-[11px] uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-80"
                  style={{ color: "rgba(245,237,213,0.55)" }}
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
