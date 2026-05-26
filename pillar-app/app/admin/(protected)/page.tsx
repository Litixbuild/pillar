import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: string | null;
}

interface PropertyRow {
  id: string;
  slug: string;
  name: string;
  manager_id: string;
  hero_image_url: string | null;
  logo_url: string | null;
  created_at: string;
}

interface WindowRow {
  property_slug: string;
}

function fmt(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [profilesRes, usersRes, propertiesRes, windowsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("properties").select("id, slug, name, manager_id, hero_image_url, logo_url, created_at").order("created_at", { ascending: false }),
    supabase.from("property_windows").select("property_slug"),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const authUsers = (usersRes.data?.users ?? []) as AuthUser[];
  const properties = (propertiesRes.data ?? []) as PropertyRow[];
  const windows = (windowsRes.data ?? []) as WindowRow[];

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const userMap = new Map(authUsers.map((u) => [u.id, u]));

  const windowCountMap = new Map<string, number>();
  windows.forEach((w) => {
    windowCountMap.set(w.property_slug, (windowCountMap.get(w.property_slug) ?? 0) + 1);
  });

  const propCountMap = new Map<string, number>();
  properties.forEach((p) => {
    propCountMap.set(p.manager_id, (propCountMap.get(p.manager_id) ?? 0) + 1);
  });

  const managers = profiles
    .filter((p) => p.role !== "admin")
    .map((p) => {
      const user = userMap.get(p.id);
      return {
        id: p.id,
        name: p.full_name || "—",
        email: user?.email || "—",
        joinedAt: user?.created_at ?? null,
        lastSignIn: user?.last_sign_in_at ?? null,
        propertyCount: propCountMap.get(p.id) ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const propertiesWithoutHero = properties.filter((p) => !p.hero_image_url).length;

  return (
    <div className="space-y-8 p-5 md:p-10">

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/30 dark:text-white/25">
            Admin
          </p>
          <h1 className="font-serif text-3xl font-light text-[#2C2C2C] dark:text-white md:text-4xl">
            Overview
          </h1>
        </div>
        <p className="pb-0.5 text-[11px] text-black/30 dark:text-white/25">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Managers" value={managers.length} />
        <StatCard label="Properties" value={properties.length} />
        <StatCard label="Sections" value={windows.length} />
        <StatCard label="Missing Hero" value={propertiesWithoutHero} warn={propertiesWithoutHero > 0} />
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/25">
          Tools
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <Link
            href="/admin/qr-codes"
            className="group flex items-center justify-between rounded-2xl border border-black/8 bg-white p-4 transition-all hover:border-black/14 hover:shadow-sm active:scale-[0.98] dark:border-white/6 dark:bg-[#0a1520] dark:hover:border-white/12"
          >
            <div>
              <p className="text-xs font-medium text-[#2C2C2C] dark:text-white/85">QR Codes</p>
              <p className="mt-0.5 text-[10px] text-black/35 dark:text-white/30">Generate & manage</p>
            </div>
            <span className="text-base text-black/20 transition-transform group-hover:translate-x-0.5 dark:text-white/20">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Managers */}
      <section>
        <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/25">
          Property Managers
          <span className="ml-2 font-normal text-black/25 dark:text-white/20">({managers.length})</span>
        </h2>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {managers.length === 0 && (
            <div className="rounded-2xl border border-black/8 bg-white p-8 text-center dark:border-white/6 dark:bg-[#0a1520]">
              <p className="text-sm text-black/30 dark:text-white/30">No managers yet</p>
            </div>
          )}
          {managers.map((m) => (
            <div key={m.id} className="rounded-2xl border border-black/8 bg-white p-4 dark:border-white/6 dark:bg-[#0a1520]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#2C2C2C] dark:text-white/90">{m.name}</p>
                  <p className="mt-0.5 truncate text-sm text-black/45 dark:text-white/40">{m.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[11px] text-black/50 dark:bg-white/8 dark:text-white/45">
                  {m.propertyCount} {m.propertyCount === 1 ? "property" : "properties"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-black/5 pt-3 text-[11px] text-black/35 dark:border-white/4 dark:text-white/30">
                <span>{m.joinedAt ? `Joined ${fmt(m.joinedAt)}` : "No join date"}</span>
                <span>·</span>
                <span className={!m.lastSignIn ? "text-black/25 dark:text-white/20" : ""}>
                  {m.lastSignIn ? `Last seen ${fmt(m.lastSignIn)}` : "Never signed in"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-black/8 bg-white dark:border-white/6 dark:bg-[#0a1520] md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/6 text-[10px] uppercase tracking-[0.18em] text-black/30 dark:border-white/6 dark:text-white/25">
                <Th>Name</Th><Th>Email</Th><Th>Joined</Th><Th>Last Sign In</Th><Th>Properties</Th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id} className="border-b border-black/5 transition-colors last:border-0 hover:bg-black/2 dark:border-white/4 dark:hover:bg-white/2">
                  <Td><span className="font-medium text-black/80 dark:text-white/80">{m.name}</span></Td>
                  <Td>{m.email}</Td>
                  <Td>{fmt(m.joinedAt) ?? "—"}</Td>
                  <Td>
                    <span className={!m.lastSignIn ? "text-black/25 dark:text-white/25" : ""}>
                      {m.lastSignIn ? fmt(m.lastSignIn) : "Never"}
                    </span>
                  </Td>
                  <Td>{m.propertyCount}</Td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-sm text-black/25 dark:text-white/25">No managers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Properties */}
      <section>
        <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/25">
          All Properties
          <span className="ml-2 font-normal text-black/25 dark:text-white/20">({properties.length})</span>
        </h2>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {properties.length === 0 && (
            <div className="rounded-2xl border border-black/8 bg-white p-8 text-center dark:border-white/6 dark:bg-[#0a1520]">
              <p className="text-sm text-black/30 dark:text-white/30">No properties yet</p>
            </div>
          )}
          {properties.map((p) => {
            const profile = profileMap.get(p.manager_id);
            const user = userMap.get(p.manager_id);
            const managerName = profile?.full_name || user?.email || "—";
            const windowCount = windowCountMap.get(p.slug) ?? 0;

            return (
              <div key={p.id} className="rounded-2xl border border-black/8 bg-white p-4 dark:border-white/6 dark:bg-[#0a1520]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#2C2C2C] dark:text-white/90">{p.name}</p>
                    <code className="mt-0.5 block truncate text-xs text-teal-700/70 dark:text-teal-400/60">/{p.slug}</code>
                  </div>
                  <div className="flex shrink-0 gap-1.5 pt-0.5">
                    <span className={`text-sm ${p.hero_image_url ? "text-teal-600 dark:text-teal-400" : "text-black/15 dark:text-white/15"}`} title="Hero image">
                      {p.hero_image_url ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-black/40 dark:text-white/35">
                  <span>{managerName}</span>
                  <span>·</span>
                  <span>{windowCount} section{windowCount !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{fmt(p.created_at)}</span>
                </div>
                <div className="mt-3 flex gap-4 border-t border-black/5 pt-3 dark:border-white/4">
                  <Link href={`/p/${p.slug}`} target="_blank" className="text-xs text-teal-700/70 transition-colors hover:text-teal-700 dark:text-teal-400/60 dark:hover:text-teal-400">
                    Guest ↗
                  </Link>
                  <Link href={`/manager/properties/${p.slug}/details`} target="_blank" className="text-xs text-black/35 transition-colors hover:text-black/65 dark:text-white/30 dark:hover:text-white/60">
                    Manager ↗
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-2xl border border-black/8 bg-white dark:border-white/6 dark:bg-[#0a1520] md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/6 text-[10px] uppercase tracking-[0.18em] text-black/30 dark:border-white/6 dark:text-white/25">
                <Th>Property</Th><Th>Slug</Th><Th>Manager</Th><Th>Sections</Th><Th>Hero</Th><Th>Logo</Th><Th>Created</Th><Th>Links</Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const profile = profileMap.get(p.manager_id);
                const user = userMap.get(p.manager_id);
                const managerName = profile?.full_name || user?.email || "—";
                const windowCount = windowCountMap.get(p.slug) ?? 0;

                return (
                  <tr key={p.id} className="border-b border-black/5 transition-colors last:border-0 hover:bg-black/2 dark:border-white/4 dark:hover:bg-white/2">
                    <Td><span className="font-medium text-black/80 dark:text-white/80">{p.name}</span></Td>
                    <Td><code className="text-xs text-teal-700/70 dark:text-teal-400/60">{p.slug}</code></Td>
                    <Td>{managerName}</Td>
                    <Td>{windowCount}</Td>
                    <Td><Dot on={!!p.hero_image_url} /></Td>
                    <Td><Dot on={!!p.logo_url} /></Td>
                    <Td>{fmt(p.created_at)}</Td>
                    <Td>
                      <div className="flex gap-4">
                        <Link href={`/p/${p.slug}`} target="_blank" className="text-xs text-teal-700/70 transition-colors hover:text-teal-700 dark:text-teal-400/60 dark:hover:text-teal-400">Guest ↗</Link>
                        <Link href={`/manager/properties/${p.slug}/details`} target="_blank" className="text-xs text-black/30 transition-colors hover:text-black/60 dark:text-white/30 dark:hover:text-white/60">Manager ↗</Link>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {properties.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-black/25 dark:text-white/25">No properties yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-5 dark:border-white/6 dark:bg-[#0a1520]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/30 dark:text-white/30">{label}</p>
      <p className={`mt-2 font-serif text-4xl font-light tabular-nums ${warn ? "text-red-500 dark:text-red-400" : "text-[#2C2C2C] dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3.5 text-left font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-black/55 dark:text-white/55">{children}</td>;
}

function Dot({ on }: { on: boolean }) {
  return (
    <span className={on ? "text-teal-600 dark:text-teal-400" : "text-black/20 dark:text-white/20"}>
      {on ? "✓" : "✗"}
    </span>
  );
}
