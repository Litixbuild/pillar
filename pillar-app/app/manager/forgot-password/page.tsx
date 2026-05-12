"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    const email = String(new FormData(e.currentTarget).get("email") || "");

    const res = await fetch("/api/manager/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Something went wrong. Please try again.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

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
          {status === "sent" ? (
            <div className="text-center">
              <div className="text-3xl mb-4">✉️</div>
              <h1 className="font-serif text-2xl text-white mb-3">Check your inbox</h1>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                If that email is registered, we&apos;ve sent a password reset
                link. Check your inbox and follow the link to set a new password.
              </p>
              <Link
                href="/manager/login"
                className="text-xs uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-70"
                style={{ color: "#D4AF6A" }}
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl text-white mb-2">Reset Password</h1>
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(212,175,106,0.7)" }}>
                  We&apos;ll send you a reset link
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="manager@domain.com"
                    className="w-full h-11 rounded-xl px-4 text-sm outline-none transition-all duration-200 placeholder:text-white/25"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(212,175,106,0.6)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                    }}
                  />
                </div>

                {error && (
                  <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-11 rounded-xl text-sm uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:opacity-85 disabled:opacity-50 mt-2"
                  style={{ background: "#D4AF6A", color: "#06090e" }}
                >
                  {status === "loading" ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/manager/login"
          className="mt-8 text-[11px] uppercase tracking-[0.2em] transition-opacity duration-300 hover:opacity-60"
          style={{ color: "rgba(212,175,106,0.55)" }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
