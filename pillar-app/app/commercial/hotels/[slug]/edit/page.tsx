"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommercialBottomNav from "../../../CommercialBottomNav";
import type { HotelProperty } from "@/lib/hotelProperties";

export const dynamic = "force-dynamic";

/* ─── Constants ──────────────────────────────────────────────────────── */

const SANDY     = "#F5EDD5";
const SANDY_RGB = "245,237,213";

type BgKey = "bg1" | "bg2" | "bg4" | "bg5" | "bg6";
const BG_KEYS: BgKey[] = ["bg1", "bg2", "bg4", "bg5", "bg6"];
const BG_PALETTES: Record<BgKey, { label: string; accent: string; heading: string; text: string }> = {
  bg1: { label: "Azure",     accent: "#144c8c", heading: "#0f2d5c", text: "rgba(20,70,140,0.62)"  },
  bg2: { label: "Sage",      accent: "#1e5a37", heading: "#0f2e1c", text: "rgba(30,90,55,0.62)"   },
  bg4: { label: "Ember",     accent: "#964110", heading: "#3d1a05", text: "rgba(150,65,10,0.62)"  },
  bg5: { label: "Blush",     accent: "#9b2855", heading: "#3d0d24", text: "rgba(155,40,85,0.62)"  },
  bg6: { label: "Sandstone", accent: "#6e4b1e", heading: "#2d1a08", text: "rgba(110,75,30,0.65)" },
};

/* ─── Shared primitives ──────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-[rgba(245,237,213,0.70)]">
      {children}
    </p>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-all duration-200 focus:border-slate-400 dark:focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-slate-100 dark:focus:ring-[#F5EDD5]/15"
    />
  );
}

function TextArea({
  value, onChange, placeholder, rows = 4,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-all duration-200 focus:border-slate-400 dark:focus:border-[#F5EDD5]/30 focus:ring-1 focus:ring-slate-100 dark:focus:ring-[#F5EDD5]/15"
    />
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function HotelEditPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;

  const [dark,  setDark]  = useState(false);
  const [hotel, setHotel] = useState<HotelProperty | null>(null);

  // Text fields
  const [name,                 setName]                 = useState("");
  const [address,              setAddress]              = useState("");
  const [city,                 setCity]                 = useState("");
  const [stateVal,             setStateVal]             = useState("");
  const [description,          setDescription]          = useState("");
  const [managerName,          setManagerName]          = useState("");
  const [managerEmail,         setManagerEmail]         = useState("");
  const [managerPhone,         setManagerPhone]         = useState("");
  const [frontDeskNumber,      setFrontDeskNumber]      = useState("");
  const [wifiName,             setWifiName]             = useState("");
  const [wifiPassword,         setWifiPassword]         = useState("");
  const [poolCode,             setPoolCode]             = useState("");
  const [gymCode,              setGymCode]              = useState("");
  const [elevatorCode,         setElevatorCode]         = useState("");
  const [parkingInstructions,  setParkingInstructions]  = useState("");
  const [checkOutInstructions, setCheckOutInstructions] = useState("");
  const [hotelRules,           setHotelRules]           = useState("");
  const [breakfastInfo,        setBreakfastInfo]        = useState("");

  // Images
  const [heroUrl,     setHeroUrl]     = useState<string | undefined>();
  const [logoUrl,     setLogoUrl]     = useState<string | undefined>();
  const [logoUrlDark, setLogoUrlDark] = useState<string | undefined>();

  // Upload states
  const [heroUploading,     setHeroUploading]     = useState(false);
  const [heroUploadError,   setHeroUploadError]   = useState<string | null>(null);
  const [logoUploading,     setLogoUploading]     = useState(false);
  const [logoUploadError,   setLogoUploadError]   = useState<string | null>(null);
  const [logoDkUploading,   setLogoDkUploading]   = useState(false);
  const [logoDkUploadError, setLogoDkUploadError] = useState<string | null>(null);

  const heroFileRef   = useRef<HTMLInputElement | null>(null);
  const logoFileRef   = useRef<HTMLInputElement | null>(null);
  const logoDkFileRef = useRef<HTMLInputElement | null>(null);

  // Theme
  const [bgIndex,     setBgIndex]     = useState(0);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaved,  setThemeSaved]  = useState(false);

  // Save
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // Delete
  const [showDelete,    setShowDelete]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark") || localStorage.getItem("pillar-theme") === "dark");
  }, []);

  useEffect(() => {
    fetch(`/api/commercial/hotels/${slug}`)
      .then((r) => r.json())
      .then((d: { hotel?: HotelProperty }) => {
        const h = d.hotel;
        if (!h) return;
        setHotel(h);
        setName(h.name);
        setAddress(h.address);
        setCity(h.city);
        setStateVal(h.state);
        setDescription(h.description);
        setManagerName(h.managerName);
        setManagerEmail(h.managerEmail);
        setManagerPhone(h.managerPhone);
        setFrontDeskNumber(h.frontDeskNumber);
        setWifiName(h.wifiName);
        setWifiPassword(h.wifiPassword);
        setPoolCode(h.poolCode);
        setGymCode(h.gymCode);
        setElevatorCode(h.elevatorCode);
        setParkingInstructions(h.parkingInstructions);
        setCheckOutInstructions(h.checkOutInstructions);
        setHotelRules(h.houseRules);
        setBreakfastInfo(h.restaurantInfo);
        setHeroUrl(h.heroImageUrl);
        setLogoUrl(h.logoUrl);
        setLogoUrlDark(h.logoUrlDark);
        if (h.accentColor) {
          const idx = BG_KEYS.findIndex((k) => BG_PALETTES[k].accent === h.accentColor);
          if (idx >= 0) setBgIndex(idx);
        }
      })
      .catch(console.error);
  }, [slug]);

  async function uploadFile(field: string, file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("field", field);
    const res  = await fetch(`/api/commercial/hotels/${slug}/upload`, { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !data?.url) throw new Error(data?.error ?? "Upload failed");
    return data.url;
  }

  async function handleHeroUpload(file: File) {
    setHeroUploading(true); setHeroUploadError(null);
    try   { setHeroUrl(await uploadFile("hero", file)); }
    catch (e) { setHeroUploadError(e instanceof Error ? e.message : "Upload failed"); }
    finally   { setHeroUploading(false); }
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true); setLogoUploadError(null);
    try   { setLogoUrl(await uploadFile("logo", file)); }
    catch (e) { setLogoUploadError(e instanceof Error ? e.message : "Upload failed"); }
    finally   { setLogoUploading(false); }
  }

  async function handleLogoDkUpload(file: File) {
    setLogoDkUploading(true); setLogoDkUploadError(null);
    try   { setLogoUrlDark(await uploadFile("logo_dark", file)); }
    catch (e) { setLogoDkUploadError(e instanceof Error ? e.message : "Upload failed"); }
    finally   { setLogoDkUploading(false); }
  }

  async function handleSave() {
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch(`/api/commercial/hotels/${slug}`, {
      method:  "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name, address, city, state: stateVal,
        description,
        manager_name:           managerName,
        manager_email:          managerEmail,
        manager_phone:          managerPhone,
        front_desk_number:      frontDeskNumber,
        wifi_name:              wifiName,
        wifi_password:          wifiPassword,
        pool_code:              poolCode,
        gym_code:               gymCode,
        elevator_code:          elevatorCode,
        parking_instructions:   parkingInstructions,
        check_out_instructions: checkOutInstructions,
        house_rules:            hotelRules,
        restaurant_info:        breakfastInfo,
      }),
    });
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) { setError(d.error ?? "Save failed."); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleApplyTheme() {
    setThemeSaving(true); setThemeSaved(false);
    const pal = BG_PALETTES[BG_KEYS[bgIndex]];
    await fetch(`/api/commercial/hotels/${slug}`, {
      method:  "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accent_color: pal.accent, heading_color: pal.heading, text_color: pal.text }),
    });
    setThemeSaved(true); setThemeSaving(false);
    setTimeout(() => setThemeSaved(false), 2500);
  }

  async function handleDelete() {
    if (deleteConfirm.toLowerCase() !== "delete") return;
    setDeleting(true);
    const res = await fetch(`/api/commercial/hotels/${slug}`, { method: "DELETE" });
    if (res.ok) { window.location.href = "/commercial/hotels"; }
    else        { setDeleting(false); }
  }

  /* ── Derived styles ─────────────────────────────────── */
  const cardStyle: React.CSSProperties = {
    background:     dark ? "rgba(8,8,8,0.95)"               : "rgba(255,255,255,0.92)",
    border:         dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
    backdropFilter: "blur(20px)",
    boxShadow:      dark ? "0 4px 32px rgba(0,0,0,0.45)"    : "0 4px 32px rgba(0,0,0,0.08)",
  };
  const headerBorder: React.CSSProperties = {
    borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
  };
  const sectionLabel: React.CSSProperties = {
    color: dark ? `rgba(${SANDY_RGB},0.60)` : "rgba(51,65,85,0.65)",
  };
  const uploadBtnStyle: React.CSSProperties = {
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    border:     dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
    color:      dark ? "rgba(255,255,255,0.60)" : "rgba(30,41,59,0.65)",
  };
  const pal = BG_PALETTES[BG_KEYS[bgIndex]];

  if (!hotel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-black/40 dark:text-white/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Backgrounds */}
      <div
        className="fixed inset-0 -z-10 opacity-0 dark:opacity-100"
        style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-100 dark:opacity-0"
        style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }}
      />

      <div className="relative mx-auto max-w-2xl px-4 pb-48 pt-6 space-y-4">

        {/* Back link */}
        <Link
          href={`/commercial/hotels/${slug}`}
          className="mb-1 flex items-center gap-1.5 self-start text-sm font-semibold transition"
          style={{ color: dark ? "rgba(255,255,255,0.45)" : "rgba(30,41,59,0.50)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {hotel.name}
        </Link>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* ── Identity ────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Identity</p>
          </div>
          <div className="space-y-4 p-5">
            <FieldGroup label="Hotel Name">
              <TextInput value={name} onChange={setName} placeholder="e.g. Grand Pillar Hotel" />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Street Address">
                <TextInput value={address} onChange={setAddress} placeholder="123 Main St" />
              </FieldGroup>
              <FieldGroup label="City">
                <TextInput value={city} onChange={setCity} placeholder="Miami" />
              </FieldGroup>
            </div>
            <FieldGroup label="State / Province">
              <TextInput value={stateVal} onChange={setStateVal} placeholder="FL" />
            </FieldGroup>
          </div>
        </div>

        {/* ── Guest Content ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Guest Content</p>
          </div>
          <div className="space-y-5 p-5">

            {/* Cover Photo */}
            <div>
              <p
                className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: dark ? "rgba(255,255,255,0.40)" : "rgba(51,65,85,0.50)" }}
              >
                Cover Photo
              </p>
              <p
                className="mb-3 text-[11px]"
                style={{ color: dark ? "rgba(255,255,255,0.32)" : "rgba(51,65,85,0.48)" }}
              >
                Background image guests see on the welcome screen when scanning the QR code.
              </p>
              <div
                className="relative mb-2 flex min-h-35 items-center justify-center overflow-hidden rounded-xl"
                style={{
                  background:         !heroUrl ? (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)") : undefined,
                  border:             dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                  backgroundImage:    heroUrl ? `url(${heroUrl})` : undefined,
                  backgroundSize:     "cover",
                  backgroundPosition: "center",
                }}
              >
                {!heroUrl && (
                  <span className="text-xs" style={{ color: dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)" }}>
                    No cover photo
                  </span>
                )}
              </div>
              <input
                type="file"
                ref={heroFileRef}
                accept="image/*"
                className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) await handleHeroUpload(f); }}
              />
              <button
                type="button"
                disabled={heroUploading}
                onClick={() => heroFileRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                style={uploadBtnStyle}
              >
                <UploadIcon />
                {heroUploading ? "Uploading…" : heroUrl ? "Replace Photo" : "Upload Photo"}
              </button>
              {heroUploadError && (
                <p className="mt-1 rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">
                  {heroUploadError}
                </p>
              )}
            </div>

            <FieldGroup label="Hotel Description">
              <TextArea value={description} onChange={setDescription} placeholder="Describe your hotel for guests…" rows={3} />
            </FieldGroup>
            <FieldGroup label="Check-Out Instructions">
              <TextArea value={checkOutInstructions} onChange={setCheckOutInstructions} placeholder="e.g. Check out by 11 AM, leave keys at front desk…" rows={3} />
            </FieldGroup>
            <FieldGroup label="Hotel Rules">
              <TextArea value={hotelRules} onChange={setHotelRules} placeholder="Noise policy, pet policy, pool hours…" rows={3} />
            </FieldGroup>
            <FieldGroup label="Breakfast Information">
              <TextArea value={breakfastInfo} onChange={setBreakfastInfo} placeholder="Breakfast hours, location, what's included…" rows={3} />
            </FieldGroup>
            <FieldGroup label="Parking Instructions">
              <TextArea value={parkingInstructions} onChange={setParkingInstructions} placeholder="Valet, self-park, garage entrance…" rows={2} />
            </FieldGroup>
          </div>
        </div>

        {/* ── WiFi & Access ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>WiFi & Access</p>
            <p className="mt-0.5 text-[10px]" style={{ color: dark ? "rgba(255,255,255,0.28)" : "rgba(51,65,85,0.42)" }}>
              Sensitive fields are encrypted at rest.
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="WiFi Network">
                <TextInput value={wifiName} onChange={setWifiName} placeholder="Network name" />
              </FieldGroup>
              <FieldGroup label="WiFi Password">
                <TextInput value={wifiPassword} onChange={setWifiPassword} placeholder="Password" />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Pool Code">
                <TextInput value={poolCode} onChange={setPoolCode} placeholder="e.g. 1234" />
              </FieldGroup>
              <FieldGroup label="Gym Code">
                <TextInput value={gymCode} onChange={setGymCode} placeholder="e.g. 5678" />
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Elevator Code">
                <TextInput value={elevatorCode} onChange={setElevatorCode} placeholder="e.g. 9999" />
              </FieldGroup>
              <FieldGroup label="Front Desk Number">
                <TextInput value={frontDeskNumber} onChange={setFrontDeskNumber} placeholder="Ext. 0 or full number" />
              </FieldGroup>
            </div>
          </div>
        </div>

        {/* ── Staff Contact ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Staff Contact</p>
          </div>
          <div className="space-y-4 p-5">
            <FieldGroup label="Manager Name">
              <TextInput value={managerName} onChange={setManagerName} placeholder="Full name" />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Manager Email">
                <TextInput value={managerEmail} onChange={setManagerEmail} placeholder="manager@hotel.com" type="email" />
              </FieldGroup>
              <FieldGroup label="Manager Phone">
                <TextInput value={managerPhone} onChange={setManagerPhone} placeholder="+1 (555) 000-0000" type="tel" />
              </FieldGroup>
            </div>
            <p
              className="text-[10px] leading-relaxed"
              style={{ color: dark ? `rgba(${SANDY_RGB},0.38)` : "rgba(30,41,59,0.40)" }}
            >
              The manager phone receives SMS work order alerts. Manager email receives email notifications.
            </p>
          </div>
        </div>

        {/* ── Branding ─────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>Branding</p>
          </div>
          <div className="p-5">
            <p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: dark ? "rgba(255,255,255,0.40)" : "rgba(51,65,85,0.50)" }}
            >
              Logo
            </p>
            <div className="grid grid-cols-2 gap-3">

              {/* Dark-mode logo — shown on dark background */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium" style={{ color: dark ? "rgba(255,255,255,0.50)" : "rgba(51,65,85,0.55)" }}>
                  Dark Mode
                </p>
                <div
                  className="flex min-h-25 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: "#0a0a0a",
                    backgroundImage:
                      "linear-gradient(45deg,#1a1a1a 25%,transparent 25%),linear-gradient(135deg,#1a1a1a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1a 75%),linear-gradient(135deg,transparent 75%,#1a1a1a 75%)",
                    backgroundSize:     "10px 10px",
                    backgroundPosition: "0 0,5px 0,5px -5px,0 5px",
                    border:             "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {logoUrl
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={logoUrl} alt="Dark mode logo" className="object-contain p-3" style={{ maxWidth: "100%", maxHeight: "80px" }} />
                    : <span className="text-xs" style={{ color: "rgba(255,255,255,0.20)" }}>No logo</span>}
                </div>
                <input
                  type="file" ref={logoFileRef} accept="image/*" className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) await handleLogoUpload(f); }}
                />
                <button
                  type="button" disabled={logoUploading}
                  onClick={() => logoFileRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                  style={uploadBtnStyle}
                >
                  <UploadIcon />
                  {logoUploading ? "Uploading…" : logoUrl ? "Replace" : "Upload"}
                </button>
                {logoUploadError && (
                  <p className="rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">
                    {logoUploadError}
                  </p>
                )}
              </div>

              {/* Light-mode logo — shown on white background */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium" style={{ color: dark ? "rgba(255,255,255,0.50)" : "rgba(51,65,85,0.55)" }}>
                  Light Mode
                </p>
                <div
                  className="flex min-h-25 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    backgroundColor: "#ffffff",
                    backgroundImage:
                      "linear-gradient(45deg,#e8e8e8 25%,transparent 25%),linear-gradient(135deg,#e8e8e8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e8e8 75%),linear-gradient(135deg,transparent 75%,#e8e8e8 75%)",
                    backgroundSize:     "10px 10px",
                    backgroundPosition: "0 0,5px 0,5px -5px,0 5px",
                    border:             "1px solid rgba(0,0,0,0.10)",
                  }}
                >
                  {logoUrlDark
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={logoUrlDark} alt="Light mode logo" className="object-contain p-3" style={{ maxWidth: "100%", maxHeight: "80px" }} />
                    : <span className="text-xs" style={{ color: "rgba(0,0,0,0.22)" }}>No logo</span>}
                </div>
                <input
                  type="file" ref={logoDkFileRef} accept="image/*" className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) await handleLogoDkUpload(f); }}
                />
                <button
                  type="button" disabled={logoDkUploading}
                  onClick={() => logoDkFileRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-45"
                  style={uploadBtnStyle}
                >
                  <UploadIcon />
                  {logoDkUploading ? "Uploading…" : logoUrlDark ? "Replace" : "Upload"}
                </button>
                {logoDkUploadError && (
                  <p className="rounded-lg bg-rose-500/10 px-2 py-1.5 text-[11px] font-medium text-rose-400">
                    {logoDkUploadError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Guest Portal Theme ───────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabel}>
              Guest Portal Theme
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: dark ? "rgba(255,255,255,0.28)" : "rgba(51,65,85,0.42)" }}>
              Sets the accent colour guests see when they scan your QR code.
            </p>
          </div>
          <div className="p-5">

            {/* Carousel */}
            <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: "160px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${BG_KEYS[bgIndex]}.png`}
                alt={pal.label}
                className="h-full w-full object-cover"
                style={{ minHeight: "160px" }}
              />

              {/* Hotel name preview overlay */}
              <div
                className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4"
                style={{ background: "linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 60%)" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: `${pal.heading}cc` }}
                >
                  Preview
                </p>
                <p className="text-xl font-light leading-tight" style={{ color: pal.heading }}>
                  {hotel.name || "Your Hotel"}
                </p>
                <div className="mt-2 h-px w-6" style={{ background: `${pal.accent}66` }} />
              </div>

              {/* Prev arrow */}
              <button
                type="button"
                onClick={() => setBgIndex((i) => Math.max(0, i - 1))}
                disabled={bgIndex === 0}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all disabled:opacity-20"
                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.20)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Next arrow */}
              <button
                type="button"
                onClick={() => setBgIndex((i) => Math.min(BG_KEYS.length - 1, i + 1))}
                disabled={bgIndex === BG_KEYS.length - 1}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all disabled:opacity-20"
                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.20)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Name + dot indicators */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: dark ? SANDY : "#1e293b" }}>
                {pal.label}
              </p>
              <div className="flex items-center gap-1.5">
                {BG_KEYS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBgIndex(idx)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height:          "6px",
                      width:           idx === bgIndex ? "20px" : "6px",
                      backgroundColor: idx === bgIndex
                        ? pal.accent
                        : dark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Colour swatches */}
            <div className="mt-3 flex items-center gap-2">
              {(["accent", "heading", "text"] as const).map((k) => (
                <div
                  key={k}
                  className="h-5 w-5 rounded-full border"
                  style={{
                    backgroundColor: pal[k],
                    borderColor:     dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
                  }}
                />
              ))}
              <p className="ml-1 self-center text-[10px]"
                style={{ color: dark ? "rgba(255,255,255,0.30)" : "rgba(51,65,85,0.45)" }}>
                Accent · Heading · Text
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyTheme}
              disabled={themeSaving}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
              style={
                themeSaved
                  ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.30)" }
                  : dark
                    ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                    : { background: "#111111", color: "#ffffff", boxShadow: "0 0 20px rgba(0,0,0,0.14)" }
              }
            >
              {themeSaving ? "Applying…" : themeSaved ? `${pal.label} Applied ✓` : `Apply ${pal.label} Theme`}
            </button>
          </div>
        </div>

        {/* ── Danger Zone ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/60 px-6 py-5 dark:border-rose-500/20 dark:bg-rose-500/5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-600/80 dark:text-rose-400/70">
            Danger Zone
          </p>
          <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/60">
            Permanently delete this hotel and all rooms, amenities, and work orders.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="mt-3 h-9 rounded-xl border border-rose-300/60 bg-rose-100/80 px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-200/80 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400"
          >
            Delete Hotel
          </button>
        </div>

      </div>

      {/* ── Fixed save bar ──────────────────────────────────────── */}
      <div className="fixed inset-x-0 z-40 px-4 pb-2" style={{ bottom: "76px" }}>
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 disabled:opacity-50"
            style={
              saved
                ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.30)" }
                : dark
                  ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                  : { background: "#111111", color: "#ffffff", boxShadow: "0 0 20px rgba(0,0,0,0.14)" }
            }
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <CommercialBottomNav />

      {/* ── Delete confirmation modal ────────────────────────── */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowDelete(false); setDeleteConfirm(""); } }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-[#111]">
            <div className="h-1 w-full bg-rose-500" />
            <div className="p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Delete Hotel?</h2>
              <p className="mt-2 text-sm text-black/55 dark:text-white/50">
                This will permanently delete <strong>{hotel.name}</strong> and all associated data. This cannot be undone.
              </p>
              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/35">
                  Type <span className="text-rose-500">delete</span> to confirm
                </p>
                <input
                  autoFocus
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="delete"
                  className="h-11 w-full rounded-xl border border-black/10 bg-black/3 px-4 text-sm outline-none focus:border-rose-400/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/25"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteConfirm.toLowerCase() !== "delete" || deleting}
                  className="h-10 flex-1 rounded-xl bg-rose-500 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-40"
                >
                  {deleting ? "Deleting…" : "Delete Permanently"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                  className="h-10 rounded-xl border border-black/10 px-4 text-sm font-semibold text-black/50 dark:border-white/10 dark:text-white/45"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
