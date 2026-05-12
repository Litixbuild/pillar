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

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  const [
    profilesRes,
    usersRes,
    propertiesRes,
    windowsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("properties").select("id, slug, name, manager_id, hero_image_url, logo_url, created_at").order("created_at", { ascending: false }),
    supabase.from("property_windows").select("property_slug"),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const authUsers = (usersRes.data?.users ?? []) as AuthUser[];
  const properties = (propertiesRes.data ?? []) as PropertyRow[];
  const windows = (windowsRes.data ?? []) as WindowRow[];

  // Lookup maps
  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const userMap = new Map(authUsers.map((u) => [u.id, u]));

  // Window count per property slug
  const windowCountMap = new Map<string, number>();
  windows.forEach((w) => {
    windowCountMap.set(w.property_slug, (windowCountMap.get(w.property_slug) ?? 0) + 1);
  });

  // Property count per manager
  const propCountMap = new Map<string, number>();
  properties.forEach((p) => {
    propCountMap.set(p.manager_id, (propCountMap.get(p.manager_id) ?? 0) + 1);
  });

  // Build manager list (exclude admins)
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
    <div className="space-y-10 p-6 md:p-10">

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Managers" value={managers.length} />
        <StatCard label="Properties" value={properties.length} />
        <StatCard label="Total Sections" value={windows.length} />
        <StatCard label="Missing Hero Image" value={propertiesWithoutHero} warn={propertiesWithoutHero > 0} />
      </div>

      {/* Managers table */}
      <section>
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
          Property Managers
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/6 bg-[#0a1520]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[10px] uppercase tracking-[0.18em] text-white/25">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Joined</Th>
                <Th>Last Sign In</Th>
                <Th>Properties</Th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/4 transition-colors last:border-0 hover:bg-white/2"
                >
                  <Td>
                    <span className="font-medium text-white/80">{m.name}</span>
                  </Td>
                  <Td>{m.email}</Td>
                  <Td>{m.joinedAt ? fmt(m.joinedAt) : "—"}</Td>
                  <Td>
                    <span className={!m.lastSignIn ? "text-white/25" : ""}>
                      {m.lastSignIn ? fmt(m.lastSignIn) : "Never"}
                    </span>
                  </Td>
                  <Td>{m.propertyCount}</Td>
                </tr>
              ))}
              {managers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-white/25">
                    No managers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Properties table */}
      <section>
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
          All Properties
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/6 bg-[#0a1520]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[10px] uppercase tracking-[0.18em] text-white/25">
                <Th>Property</Th>
                <Th>Slug</Th>
                <Th>Manager</Th>
                <Th>Sections</Th>
                <Th>Hero</Th>
                <Th>Logo</Th>
                <Th>Created</Th>
                <Th>Links</Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const profile = profileMap.get(p.manager_id);
                const user = userMap.get(p.manager_id);
                const managerName = profile?.full_name || user?.email || "—";
                const windowCount = windowCountMap.get(p.slug) ?? 0;

                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/4 transition-colors last:border-0 hover:bg-white/2"
                  >
                    <Td>
                      <span className="font-medium text-white/80">{p.name}</span>
                    </Td>
                    <Td>
                      <code className="text-xs text-teal-400/60">{p.slug}</code>
                    </Td>
                    <Td>{managerName}</Td>
                    <Td>{windowCount}</Td>
                    <Td>
                      <Dot on={!!p.hero_image_url} />
                    </Td>
                    <Td>
                      <Dot on={!!p.logo_url} />
                    </Td>
                    <Td>{fmt(p.created_at)}</Td>
                    <Td>
                      <div className="flex gap-4">
                        <Link
                          href={`/p/${p.slug}`}
                          target="_blank"
                          className="text-xs text-teal-400/60 transition-colors hover:text-teal-400"
                        >
                          Guest ↗
                        </Link>
                        <Link
                          href={`/manager/properties/${p.slug}/details`}
                          target="_blank"
                          className="text-xs text-white/30 transition-colors hover:text-white/60"
                        >
                          Manager ↗
                        </Link>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-white/25">
                    No properties yet
                  </td>
                </tr>
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
    <div className="rounded-2xl border border-white/6 bg-[#0a1520] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">{label}</p>
      <p className={`mt-2 text-3xl font-light tabular-nums ${warn ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3.5 text-white/55">{children}</td>;
}

function Dot({ on }: { on: boolean }) {
  return (
    <span className={on ? "text-teal-400" : "text-white/20"}>
      {on ? "✓" : "✗"}
    </span>
  );
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
