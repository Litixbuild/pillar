import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import AdminNav from "../_components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F3EE] text-[#2C2C2C] dark:bg-[#070e17] dark:text-white">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-7xl">{children}</main>
    </div>
  );
}
