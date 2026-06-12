"use client";

import { useState, useEffect } from "react";
import CommercialBottomNav from "../CommercialBottomNav";

export const dynamic = "force-dynamic";

export default function CommercialAccountPage() {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [oldPw,   setOldPw]   = useState("");
  const [newPw,   setNewPw]   = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved,  setPwSaved]  = useState(false);
  const [pwError,  setPwError]  = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/commercial/me")
      .then((r) => r.json())
      .then((d: { name?: string; email?: string }) => {
        setName(d.name ?? "");
        setEmail(d.email ?? "");
      })
      .catch(console.error);
  }, []);

  async function handleSaveName() {
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch("/api/commercial/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) { setError(data.error ?? "Save failed."); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword() {
    if (!oldPw || !newPw) return;
    setPwSaving(true); setPwError(null); setPwSaved(false);
    const res = await fetch("/api/commercial/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) { setPwError(data.error ?? "Failed."); setPwSaving(false); return; }
    setPwSaved(true); setPwSaving(false); setOldPw(""); setNewPw("");
    setTimeout(() => setPwSaved(false), 2500);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/commercial/logout", { method: "POST" });
    window.location.href = "/commercial/login";
  }

  const inputCls = "h-11 w-full rounded-xl border border-[rgba(100,80,40,0.16)] bg-[rgba(100,80,40,0.03)] px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-[rgba(100,80,40,0.28)] focus:border-[rgba(100,80,40,0.35)] dark:border-white/10 dark:bg-white/4 dark:text-white dark:placeholder:text-white/25";
  const labelCls = "text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.60)] dark:text-white/45";

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100" style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0" style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 space-y-5">
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(100,80,40,0.55)] dark:text-white/50">Commercial</p>
          <h1 className="mt-1 text-[1.75rem] font-light leading-tight tracking-tight text-slate-900 dark:text-white">Account</h1>
        </div>

        {/* Profile */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <div className="border-b border-[rgba(100,80,40,0.08)] px-6 py-4 dark:border-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/45">Profile</p>
          </div>
          <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
            <div className="px-6 py-4 space-y-1.5">
              <label className={labelCls}>Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
            </div>
            <div className="px-6 py-4 space-y-1.5">
              <label className={labelCls}>Email</label>
              <p className="text-sm text-slate-700 dark:text-white/65">{email || "—"}</p>
              <p className="text-[11px] text-[rgba(100,80,40,0.40)] dark:text-white/30">Email is set by your administrator and cannot be changed here.</p>
            </div>
          </div>
          {error && <p className="px-6 pb-2 text-xs text-rose-500">{error}</p>}
          <div className="border-t border-[rgba(100,80,40,0.08)] px-6 py-4 dark:border-white/5">
            <button type="button" onClick={handleSaveName} disabled={saving} className="h-9 rounded-xl bg-[#111] px-5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-[#F5EDD5] dark:text-[#3d2a0a]">
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Name"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 shadow-[0_4px_20px_rgba(100,80,40,0.07)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <div className="border-b border-[rgba(100,80,40,0.08)] px-6 py-4 dark:border-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgba(100,80,40,0.60)] dark:text-white/45">Change Password</p>
          </div>
          <div className="divide-y divide-[rgba(100,80,40,0.07)] dark:divide-white/5">
            <div className="px-6 py-4 space-y-1.5">
              <label className={labelCls}>Current Password</label>
              <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className={inputCls} />
            </div>
            <div className="px-6 py-4 space-y-1.5">
              <label className={labelCls}>New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} />
            </div>
          </div>
          {pwError && <p className="px-6 pb-2 text-xs text-rose-500">{pwError}</p>}
          <div className="border-t border-[rgba(100,80,40,0.08)] px-6 py-4 dark:border-white/5">
            <button type="button" onClick={handleChangePassword} disabled={!oldPw || !newPw || pwSaving} className="h-9 rounded-xl bg-[#111] px-5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-[#F5EDD5] dark:text-[#3d2a0a]">
              {pwSaving ? "Updating…" : pwSaved ? "Updated ✓" : "Update Password"}
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="rounded-2xl border border-[rgba(100,80,40,0.10)] bg-white/88 px-6 py-5 shadow-sm backdrop-blur dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(100,80,40,0.55)] dark:text-white/40">Session</p>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className="mt-3 h-9 rounded-xl border border-[rgba(100,80,40,0.22)] bg-[rgba(100,80,40,0.05)] px-4 text-xs font-semibold text-[rgba(100,80,40,0.70)] transition hover:bg-[rgba(100,80,40,0.10)] disabled:opacity-40 dark:border-white/12 dark:bg-white/5 dark:text-white/60">
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>

      <CommercialBottomNav />
    </div>
  );
}
