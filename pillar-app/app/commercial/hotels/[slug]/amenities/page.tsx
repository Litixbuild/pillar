"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommercialBottomNav from "../../../CommercialBottomNav";
import type { AmenityWindow } from "@/lib/types";
import { generateWindowId } from "@/lib/types";
import type { RoomType } from "@/lib/roomTypes";

export const dynamic = "force-dynamic";

const ICONS = ["wifi", "pool", "dumbbell", "elevator", "car", "coffee", "tv", "utensils", "key", "phone", "clock", "star", "info", "leaf", "music"];
const WINDOW_TYPES = ["text", "video", "pdf", "image"] as const;

/* ── Scoped window merges amenity data with its scope ─────── */
interface ScopedWindow extends AmenityWindow {
  scope:     "hotel" | string; // "hotel" = all guests, string = roomTypeId
  scopeName: string;
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── WindowForm ───────────────────────────────────────────── */
function WindowForm({ initial, roomTypes, slug, onSave, onCancel }: {
  initial?:   Partial<ScopedWindow>;
  roomTypes:  RoomType[];
  slug:       string;
  onSave:     (w: ScopedWindow) => void;
  onCancel:   () => void;
}) {
  const [f, setF] = useState<Partial<ScopedWindow>>(initial ?? { type: "text", scope: "hotel" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const valid   = (f.title ?? "").trim().length > 0;

  async function handleUpload(file: File) {
    setUploading(true); setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch(`/api/commercial/hotels/${slug}/media-upload`, { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) throw new Error(data?.error ?? "Upload failed");
      setF((p) => ({ ...p, url: data.url }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const inputCls  = "h-10 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-slate-400 dark:focus:border-white/30";
  const selectCls = "h-10 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 text-sm text-slate-800 dark:text-white outline-none";
  const labelCls  = "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/40";

  const needsUpload = f.type === "image" || f.type === "video";
  const accept      = f.type === "video"
    ? "video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/gif";

  return (
    <div className="border-t border-black/6 bg-black/1.5 px-5 py-5 dark:border-white/5 dark:bg-white/1.5">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
        {initial?.id ? "Edit Amenity" : "Add Amenity"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">

        {/* Title */}
        <div className="space-y-1.5">
          <p className={labelCls}>Title *</p>
          <input
            value={f.title ?? ""}
            onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Pool Hours"
            className={inputCls}
          />
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <p className={labelCls}>Content Type</p>
          <select
            value={f.type ?? "text"}
            onChange={(e) => setF((p) => ({ ...p, type: e.target.value as AmenityWindow["type"], url: undefined }))}
            className={selectCls}
          >
            {WINDOW_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {/* Applies to — only show if there are room types */}
        {roomTypes.length > 0 && (
          <div className="space-y-1.5">
            <p className={labelCls}>Applies to</p>
            <select
              value={f.scope ?? "hotel"}
              onChange={(e) => setF((p) => ({ ...p, scope: e.target.value }))}
              className={selectCls}
            >
              <option value="hotel">All Rooms (Hotel-wide)</option>
              {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name} only</option>)}
            </select>
          </div>
        )}

        {/* Icon */}
        <div className="space-y-1.5">
          <p className={labelCls}>Icon</p>
          <select
            value={f.icon ?? ""}
            onChange={(e) => setF((p) => ({ ...p, icon: e.target.value || undefined }))}
            className={selectCls}
          >
            <option value="">None</option>
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        {/* Body text */}
        {f.type === "text" && (
          <div className="space-y-1.5 sm:col-span-2">
            <p className={labelCls}>Content</p>
            <textarea
              rows={3}
              value={f.body ?? ""}
              onChange={(e) => setF((p) => ({ ...p, body: e.target.value }))}
              placeholder="Text content shown to guests…"
              className="w-full resize-y rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-slate-400 dark:focus:border-white/30"
            />
          </div>
        )}

        {/* PDF URL (URL paste only) */}
        {f.type === "pdf" && (
          <div className="space-y-1.5 sm:col-span-2">
            <p className={labelCls}>PDF URL</p>
            <input
              value={f.url ?? ""}
              onChange={(e) => setF((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
        )}

        {/* Image / Video — upload or paste URL */}
        {needsUpload && (
          <div className="space-y-2 sm:col-span-2">
            <p className={labelCls}>{f.type === "image" ? "Image" : "Video"}</p>

            {/* Preview */}
            {f.url && f.type === "image" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={f.url} alt="Preview" className="max-h-40 w-auto rounded-xl object-contain border border-black/8 dark:border-white/8" />
            )}
            {f.url && f.type === "video" && (
              <video src={f.url} controls className="max-h-40 w-full rounded-xl border border-black/8 dark:border-white/8" />
            )}

            {/* Upload button */}
            <input
              type="file"
              ref={fileRef}
              accept={accept}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) await handleUpload(file);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-black/4 dark:bg-white/6 px-3 text-xs font-semibold text-slate-600 dark:text-white/60 transition hover:bg-black/8 dark:hover:bg-white/10 disabled:opacity-45"
              >
                <UploadIcon />
                {uploading ? "Uploading…" : f.url ? `Replace ${f.type}` : `Upload ${f.type}`}
              </button>
              <span className="self-center text-[11px]" style={{ color: "rgba(100,116,139,0.55)" }}>or paste URL:</span>
              <input
                value={f.url ?? ""}
                onChange={(e) => setF((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://…"
                className="h-9 flex-1 rounded-lg border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none"
              />
            </div>
            {uploadError && (
              <p className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-400">
                {uploadError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={!valid || uploading}
          onClick={() => {
            if (!valid) return;
            const scope     = f.scope ?? "hotel";
            const scopeName = scope === "hotel"
              ? "All Rooms"
              : (roomTypes.find((rt) => rt.id === scope)?.name ?? scope);
            onSave({
              id:        f.id ?? generateWindowId(),
              title:     f.title!.trim(),
              type:      f.type ?? "text",
              icon:      f.icon  || undefined,
              body:      f.body?.trim()  || undefined,
              url:       f.url?.trim()   || undefined,
              scope,
              scopeName,
            });
          }}
          className="h-9 flex-1 rounded-xl bg-[#111] text-xs font-semibold text-white transition disabled:opacity-40 dark:bg-[#F5EDD5] dark:text-[#3d2a0a]"
        >
          {initial?.id ? "Update" : "Add Amenity"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-xl border border-black/10 px-4 text-xs font-semibold text-black/50 dark:border-white/10 dark:text-white/45"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function HotelAmenitiesPage() {
  const params    = useParams<{ slug: string }>();
  const slug      = params.slug;

  const [windows,   setWindows]   = useState<ScopedWindow[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotelName, setHotelName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/commercial/hotels/${slug}`).then((r) => r.json()),
      fetch(`/api/commercial/hotels/${slug}/windows`).then((r) => r.json()),
      fetch(`/api/commercial/hotels/${slug}/room-types`).then((r) => r.json()),
    ])
      .then(async ([hd, wd, rtd]: [
        { hotel?: { name: string } },
        { windows?: AmenityWindow[] },
        { roomTypes?: RoomType[] },
      ]) => {
        setHotelName(hd.hotel?.name ?? "");
        const types: RoomType[] = rtd.roomTypes ?? [];
        setRoomTypes(types);

        const hotelWins: ScopedWindow[] = (wd.windows ?? []).map((w) => ({
          ...w, scope: "hotel", scopeName: "All Rooms",
        }));

        // Fetch per-type windows in parallel
        const typeWinArrays = await Promise.all(
          types.map((rt) =>
            fetch(`/api/commercial/hotels/${slug}/room-types/${rt.id}/windows`)
              .then((r) => r.json())
              .then((d: { windows?: AmenityWindow[] }) =>
                (d.windows ?? []).map((w): ScopedWindow => ({ ...w, scope: rt.id, scopeName: rt.name }))
              )
              .catch(() => [] as ScopedWindow[])
          )
        );

        setWindows([...hotelWins, ...typeWinArrays.flat()]);
      })
      .catch(console.error);
  }, [slug]);

  async function saveScope(scope: string, updated: ScopedWindow[]) {
    setSaving(true); setSaved(false);
    const scopeWins: AmenityWindow[] = updated
      .filter((w) => w.scope === scope)
      .map(({ scope: _s, scopeName: _sn, ...w }) => w);

    const endpoint = scope === "hotel"
      ? `/api/commercial/hotels/${slug}/windows`
      : `/api/commercial/hotels/${slug}/room-types/${scope}/windows`;

    const res = await fetch(endpoint, {
      method:  "POST",
      headers: { "content-type": "application/json" },
      body:    JSON.stringify({ windows: scopeWins }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  function move(id: string, dir: -1 | 1) {
    const i = windows.findIndex((w) => w.id === id);
    if (i < 0) return;
    const next = [...windows];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setWindows(next);
    void saveScope(next[i].scope, next);
  }

  function deleteW(id: string) {
    const target = windows.find((w) => w.id === id);
    if (!target) return;
    const next = windows.filter((w) => w.id !== id);
    setWindows(next);
    void saveScope(target.scope, next);
  }

  function addWindow(w: ScopedWindow) {
    const next = [...windows, w];
    setWindows(next);
    setShowAdd(false);
    void saveScope(w.scope, next);
  }

  function updateWindow(w: ScopedWindow) {
    const prev   = windows.find((x) => x.id === w.id);
    const oldScope = prev?.scope;
    const next   = windows.map((x) => x.id === w.id ? w : x);
    setWindows(next);
    setEditingId(null);
    // If scope changed, save both old and new scope
    if (oldScope && oldScope !== w.scope) void saveScope(oldScope, next);
    void saveScope(w.scope, next);
  }

  const scopeBadgeStyle = (scope: string): React.CSSProperties => ({
    background: scope === "hotel" ? "rgba(20,76,140,0.10)" : "rgba(110,75,30,0.10)",
    color:      scope === "hotel" ? "#144c8c" : "#6e4b1e",
    border:     `1px solid ${scope === "hotel" ? "rgba(20,76,140,0.20)" : "rgba(110,75,30,0.20)"}`,
  });

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100"
        style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0"
        style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-4 pb-36 pt-6">

        <div className="mb-5">
          <Link
            href={`/commercial/hotels/${slug}`}
            className="mb-3 flex items-center gap-1.5 text-sm font-semibold transition"
            style={{ color: "rgba(30,41,59,0.50)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {hotelName}
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-white/40">
                Hotel-Wide &amp; Room-Type
              </p>
              <h1 className="mt-0.5 text-2xl font-light tracking-tight text-slate-900 dark:text-white">
                Amenities
              </h1>
            </div>
            {saved && <span className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
          </div>
          {roomTypes.length > 0 && (
            <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
              Use "Applies to" when adding to assign amenities to a specific room type or all rooms.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/7 bg-white/92 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/7 dark:bg-[rgba(8,8,8,0.92)]">
          {windows.length === 0 && !showAdd ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-400 dark:text-white/35">No amenities yet. Add your first one below.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {windows.map((w, i) => (
                editingId === w.id ? (
                  <WindowForm
                    key={w.id}
                    initial={w}
                    roomTypes={roomTypes}
                    slug={slug}
                    onSave={updateWindow}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div key={w.id} className="flex items-start gap-3 px-5 py-4">
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => move(w.id, -1)}
                        disabled={i === 0}
                        className="rounded p-0.5 text-black/25 transition hover:text-black/55 disabled:opacity-15 dark:text-white/25 dark:hover:text-white/55"
                        aria-label="Move up"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                          <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => move(w.id, 1)}
                        disabled={i === windows.length - 1}
                        className="rounded p-0.5 text-black/25 transition hover:text-black/55 disabled:opacity-15 dark:text-white/25 dark:hover:text-white/55"
                        aria-label="Move down"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-white/40">
                          {w.type}
                        </span>
                        {w.icon && (
                          <span className="text-[10px] text-slate-400 dark:text-white/35">{w.icon}</span>
                        )}
                        {/* Scope badge */}
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={scopeBadgeStyle(w.scope)}
                        >
                          {w.scopeName}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white/85">{w.title}</p>
                      {w.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-white/35">{w.body}</p>
                      )}
                      {w.url && w.type === "image" && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={w.url} alt={w.title} className="mt-1.5 max-h-24 w-auto rounded-lg object-contain border border-black/8 dark:border-white/8" />
                      )}
                      {w.url && w.type === "video" && (
                        <video src={w.url} controls className="mt-1.5 max-h-24 w-full rounded-lg border border-black/8 dark:border-white/8" />
                      )}
                      {w.url && (w.type === "pdf" || (w.type !== "image" && w.type !== "video" && w.url)) && (
                        <p className="mt-0.5 truncate text-xs text-blue-500/70">{w.url}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => { setEditingId(w.id); setShowAdd(false); }}
                        className="h-8 rounded-lg border border-black/12 bg-black/4 px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-black/8 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:bg-white/8"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteW(w.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50/80 text-rose-500 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/8 dark:text-rose-400"
                        aria-label="Delete amenity"
                        disabled={saving}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {showAdd && (
            <WindowForm
              roomTypes={roomTypes}
              slug={slug}
              onSave={addWindow}
              onCancel={() => setShowAdd(false)}
            />
          )}

          <div className="border-t border-black/6 px-5 py-4 dark:border-white/5">
            <button
              type="button"
              onClick={() => { setShowAdd(true); setEditingId(null); }}
              disabled={showAdd || saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/12 bg-black/4 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-black/8 disabled:opacity-40 dark:border-white/12 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/8"
            >
              + Add Amenity
            </button>
          </div>
        </div>

      </div>

      <CommercialBottomNav />
    </div>
  );
}
