"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type PageStatus = "verifying" | "ready" | "saving" | "success" | "error";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<PageStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldError, setFieldError] = useState("");

  // On mount, exchange whatever Supabase put in the URL for a live session.
  useEffect(() => {
    async function establish() {
      const supabase = createClient();
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));

      try {
        // PKCE flow — Supabase redirects back with ?code=
        if (params.get("code")) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            params.get("code")!
          );
          if (error) throw error;
          setStatus("ready");
          return;
        }

        // token_hash flow — older Supabase recovery links
        if (params.get("token_hash") && params.get("type") === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: params.get("token_hash")!,
            type: "recovery",
          });
          if (error) throw error;
          setStatus("ready");
          return;
        }

        // Implicit flow — access_token arrives in the URL hash fragment
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
        setErrorMsg(msg.includes("expired") || msg.includes("invalid")
          ? "This reset link has expired or already been used. Please request a new one."
          : "Invalid reset link. Please request a new one.");
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

    // Sign out of the Supabase session — manager will log in fresh via the app's login
    await supabase.auth.signOut();
    setStatus("success");
  }

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative"
      style={{
        backgroundImage: "url(/images/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.62)" }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <Image
          src="/images/pillarlogowhite.png"
          alt="Pillar"
          width={150}
          height={100}
          className="mb-8 opacity-90"
          priority
        />

        <div
          className="w-full rounded-2xl p-8"
          style={{
            backgroundColor: "rgba(6, 9, 14, 0.72)",
            border: "1px solid rgba(212,175,106,0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Verifying token */}
          {status === "verifying" && (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Verifying reset link…
              </p>
            </div>
          )}

          {/* Invalid / expired link */}
          {status === "error" && (
            <div className="text-center">
              <div className="text-3xl mb-4">⚠️</div>
              <h1 className="font-serif text-2xl text-white mb-3">Link Expired</h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                {errorMsg}
              </p>
              <Link
                href="/manager/forgot-password"
                className="text-xs uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-70"
                style={{ color: "#D4AF6A" }}
              >
                Request a New Link →
              </Link>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center">
              <div className="text-3xl mb-4">✓</div>
              <h1 className="font-serif text-2xl text-white mb-3">Password Updated</h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                Your password has been changed successfully. You can now sign
                in with your new password.
              </p>
              <Link
                href="/manager/login"
                className="text-xs uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-70"
                style={{ color: "#D4AF6A" }}
              >
                Go to Login →
              </Link>
            </div>
          )}

          {/* New password form */}
          {(status === "ready" || status === "saving") && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl text-white mb-2">New Password</h1>
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(212,175,106,0.7)" }}>
                  Choose a strong password
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    New Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 placeholder:text-white/25"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(212,175,106,0.6)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Confirm Password
                  </label>
                  <input
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter your password"
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 placeholder:text-white/25"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(212,175,106,0.6)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    }}
                  />
                </div>

                {fieldError && (
                  <p className="text-xs" style={{ color: "#f87171" }}>{fieldError}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "saving"}
                  className="w-full h-11 rounded-xl text-sm uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:opacity-85 disabled:opacity-50 mt-2"
                  style={{ background: "#D4AF6A", color: "#06090e" }}
                >
                  {status === "saving" ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>

        {status !== "success" && (
          <Link
            href="/manager/login"
            className="mt-8 text-[11px] uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-60"
            style={{ color: "rgba(212,175,106,0.55)" }}
          >
            ← Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}
