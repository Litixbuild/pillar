"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CommercialBottomNav from "../../../CommercialBottomNav";
import type { RoomType } from "@/lib/roomTypes";
import type { RoomAssignment } from "@/lib/roomAssignments";

export const dynamic = "force-dynamic";

const SANDY     = "#F5EDD5";
const SANDY_RGB = "245,237,213";

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

export default function HotelRoomsPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug;

  const [dark, setDark] = useState(false);
  const [hotelName, setHotelName]   = useState("");
  const [roomTypes, setRoomTypes]   = useState<RoomType[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);

  // Room-type add
  const [newTypeName, setNewTypeName] = useState("");
  const [addingType,  setAddingType]  = useState(false);

  // Range quick-add
  const [rangeStart,    setRangeStart]    = useState("");
  const [rangeEnd,      setRangeEnd]      = useState("");
  const [rangeTypeId,   setRangeTypeId]   = useState("");
  const [addingRange,   setAddingRange]   = useState(false);
  const [rangeError,    setRangeError]    = useState<string | null>(null);

  // Individual quick-add
  const [indivRoom,     setIndivRoom]     = useState("");
  const [indivTypeId,   setIndivTypeId]   = useState("");
  const [addingIndiv,   setAddingIndiv]   = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark") || localStorage.getItem("pillar-theme") === "dark");
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`/api/commercial/hotels/${slug}`).then((r) => r.json()),
      fetch(`/api/commercial/hotels/${slug}/room-types`).then((r) => r.json()),
      fetch(`/api/commercial/hotels/${slug}/rooms`).then((r) => r.json()),
    ]).then(([hd, rtd, rad]: [
      { hotel?: { name: string } },
      { roomTypes?: RoomType[] },
      { assignments?: RoomAssignment[] },
    ]) => {
      setHotelName(hd.hotel?.name ?? "");
      const types = rtd.roomTypes ?? [];
      setRoomTypes(types);
      setAssignments(rad.assignments ?? []);
      if (types.length > 0) {
        setRangeTypeId(types[0].id);
        setIndivTypeId(types[0].id);
      }
    }).catch(console.error);
  }, [slug]);

  async function handleAddType() {
    const name = newTypeName.trim();
    if (!name) return;
    setAddingType(true);
    const res  = await fetch(`/api/commercial/hotels/${slug}/room-types`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await res.json()) as { roomType?: RoomType };
    if (data.roomType) {
      setRoomTypes((p) => [...p, data.roomType!]);
      if (!rangeTypeId) setRangeTypeId(data.roomType.id);
      if (!indivTypeId) setIndivTypeId(data.roomType.id);
    }
    setNewTypeName(""); setAddingType(false);
  }

  async function handleDeleteType(typeId: string) {
    await fetch(`/api/commercial/hotels/${slug}/room-types/${typeId}`, { method: "DELETE" });
    setRoomTypes((p) => p.filter((t) => t.id !== typeId));
    setAssignments((p) => p.filter((a) => a.roomTypeId !== typeId));
  }

  async function handleAddRange() {
    const start = parseInt(rangeStart, 10);
    const end   = parseInt(rangeEnd, 10);
    if (isNaN(start) || isNaN(end) || start > end) {
      setRangeError("Enter valid room numbers (from must be ≤ to)."); return;
    }
    if (!rangeTypeId) { setRangeError("Select a room type first."); return; }
    setAddingRange(true); setRangeError(null);
    const res  = await fetch(`/api/commercial/hotels/${slug}/rooms`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "range", roomTypeId: rangeTypeId, rangeStart: start, rangeEnd: end }),
    });
    const data = (await res.json()) as { assignment?: RoomAssignment };
    if (data.assignment) setAssignments((p) => [...p, data.assignment!]);
    setRangeStart(""); setRangeEnd("");
    setAddingRange(false);
  }

  async function handleAddIndiv() {
    const num = parseInt(indivRoom, 10);
    if (isNaN(num) || !indivTypeId) return;
    setAddingIndiv(true);
    const res  = await fetch(`/api/commercial/hotels/${slug}/rooms`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "individual", roomTypeId: indivTypeId, roomNumber: num }),
    });
    const data = (await res.json()) as { assignment?: RoomAssignment };
    if (data.assignment) setAssignments((p) => [...p, data.assignment!]);
    setIndivRoom("");
    setAddingIndiv(false);
  }

  async function handleDeleteAssignment(id: string) {
    await fetch(`/api/commercial/hotels/${slug}/rooms/${id}`, { method: "DELETE" });
    setAssignments((p) => p.filter((a) => a.id !== id));
  }

  /* ── Styles ───────────────────────────────────────────────── */
  const cardStyle: React.CSSProperties = {
    background:     dark ? "rgba(8,8,8,0.95)"                : "rgba(255,255,255,0.92)",
    border:         dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
    backdropFilter: "blur(20px)",
    boxShadow:      dark ? "0 4px 32px rgba(0,0,0,0.45)"    : "0 4px 32px rgba(0,0,0,0.08)",
  };
  const headerBorder: React.CSSProperties = {
    borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
  };
  const dividerStyle: React.CSSProperties = {
    borderBottom: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
  };
  const sectionLabelColor: React.CSSProperties = {
    color: dark ? `rgba(${SANDY_RGB},0.60)` : "rgba(51,65,85,0.65)",
  };
  const subLabelColor: React.CSSProperties = {
    color: dark ? "rgba(255,255,255,0.28)" : "rgba(51,65,85,0.45)",
  };
  const inputCls =
    "h-10 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none transition-all focus:border-slate-400 dark:focus:border-[#F5EDD5]/30";
  const selectCls =
    "h-10 w-full rounded-xl border bg-white/90 dark:bg-black/20 border-slate-200 dark:border-white/10 px-3 text-sm text-slate-800 dark:text-white outline-none";
  const trashCls =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200/60 bg-rose-50/80 text-rose-500 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/8 dark:text-rose-400";
  const addBtnCls =
    "h-10 shrink-0 rounded-xl px-4 text-xs font-semibold transition-all disabled:opacity-40";

  const hasTypes = roomTypes.length > 0;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-0 dark:opacity-100"
        style={{ backgroundImage: "url(/images/bg3.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div className="fixed inset-0 -z-10 opacity-100 dark:opacity-0"
        style={{ backgroundImage: "url(/images/White.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />

      <div className="relative mx-auto max-w-2xl px-4 pb-36 pt-6 space-y-4">

        <Link
          href={`/commercial/hotels/${slug}`}
          className="mb-1 flex items-center gap-1.5 text-sm font-semibold transition"
          style={{ color: dark ? "rgba(255,255,255,0.45)" : "rgba(30,41,59,0.50)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {hotelName}
        </Link>

        {/* ── Room Types ──────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabelColor}>
              Room Types
            </p>
            <p className="mt-0.5 text-[11px]" style={subLabelColor}>
              Create labels like "Standard", "Suite", or "Presidential Suite". Guests in each room type see their own amenities.
            </p>
          </div>
          <div className="p-5">
            {roomTypes.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
                    style={{
                      background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      border:     dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: dark ? SANDY : "#1e293b" }}>
                      {rt.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteType(rt.id)}
                      className="ml-0.5 rounded-full p-0.5 text-rose-400/70 transition hover:text-rose-500"
                      aria-label={`Delete ${rt.name}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleAddType(); }}
                placeholder="e.g. Suite, Standard, Presidential Suite…"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => void handleAddType()}
                disabled={!newTypeName.trim() || addingType}
                className={addBtnCls}
                style={dark
                  ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                  : { background: "#111", color: "#fff" }}
              >
                {addingType ? "…" : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Room Assignments ─────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl" style={cardStyle}>
          <div className="px-5 py-3.5" style={headerBorder}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={sectionLabelColor}>
              Room Assignments
            </p>
            <p className="mt-0.5 text-[11px]" style={subLabelColor}>
              Map room numbers to a type. When a guest scans the QR code and enters their room number, they see that type's amenities.
            </p>
          </div>

          {!hasTypes ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: dark ? "rgba(255,255,255,0.35)" : "rgba(30,41,59,0.40)" }}>
              Add at least one room type above before assigning rooms.
            </div>
          ) : (
            <>
              {/* Quick Add Range */}
              <div className="px-5 py-4" style={dividerStyle}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.20em]" style={subLabelColor}>
                  Quick Add Range
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleAddRange(); }}
                    placeholder="From"
                    className={inputCls}
                    style={{ minWidth: 0 }}
                  />
                  <span className="shrink-0 text-sm font-medium" style={{ color: dark ? "rgba(255,255,255,0.40)" : "rgba(30,41,59,0.40)" }}>–</span>
                  <input
                    type="number"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleAddRange(); }}
                    placeholder="To"
                    className={inputCls}
                    style={{ minWidth: 0 }}
                  />
                  <select
                    value={rangeTypeId}
                    onChange={(e) => setRangeTypeId(e.target.value)}
                    className={selectCls}
                    style={{ minWidth: 0 }}
                  >
                    {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleAddRange()}
                    disabled={addingRange || !rangeStart || !rangeEnd}
                    className={addBtnCls}
                    style={dark
                      ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                      : { background: "#111", color: "#fff" }}
                  >
                    {addingRange ? "…" : "Add"}
                  </button>
                </div>
                {rangeError && (
                  <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{rangeError}</p>
                )}
                <p className="mt-1.5 text-[11px]" style={subLabelColor}>
                  e.g. 1–50 marks rooms 1 through 50 as that type.
                </p>
              </div>

              {/* Add Individual Room */}
              <div className="px-5 py-4" style={dividerStyle}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.20em]" style={subLabelColor}>
                  Add Single Room
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={indivRoom}
                    onChange={(e) => setIndivRoom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleAddIndiv(); }}
                    placeholder="Room number"
                    className={inputCls}
                    style={{ minWidth: 0 }}
                  />
                  <select
                    value={indivTypeId}
                    onChange={(e) => setIndivTypeId(e.target.value)}
                    className={selectCls}
                    style={{ minWidth: 0 }}
                  >
                    {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleAddIndiv()}
                    disabled={addingIndiv || !indivRoom}
                    className={addBtnCls}
                    style={dark
                      ? { background: `rgba(${SANDY_RGB},0.10)`, color: SANDY, border: `1px solid rgba(${SANDY_RGB},0.20)` }
                      : { background: "#111", color: "#fff" }}
                  >
                    {addingIndiv ? "…" : "Add"}
                  </button>
                </div>
              </div>

              {/* Assignment list */}
              {assignments.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm" style={{ color: dark ? "rgba(255,255,255,0.35)" : "rgba(30,41,59,0.40)" }}>
                  No rooms assigned yet — use the forms above to get started.
                </div>
              ) : (
                <div>
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={dividerStyle}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold" style={{ color: dark ? "rgba(255,255,255,0.85)" : "#1e293b" }}>
                          {a.assignmentType === "range"
                            ? `Rooms ${a.rangeStart}–${a.rangeEnd}`
                            : `Room ${a.roomNumber}`}
                        </p>
                        <span
                          className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                          style={{
                            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            color:      dark ? "rgba(255,255,255,0.55)" : "rgba(30,41,59,0.60)",
                          }}
                        >
                          {a.roomTypeName}
                        </span>
                        {a.label && (
                          <p className="mt-0.5 text-[11px]" style={subLabelColor}>{a.label}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAssignment(a.id)}
                        className={trashCls}
                        aria-label="Delete assignment"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      <CommercialBottomNav />
    </div>
  );
}
