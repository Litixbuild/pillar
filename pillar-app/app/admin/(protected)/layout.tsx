import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import AdminNav from "../_components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#070e17] text-white">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
}
