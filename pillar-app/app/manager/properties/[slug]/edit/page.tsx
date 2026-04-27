import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getManagerCookieName, verifyManagerSession } from "@/lib/managerAuth";
import {
  getManagerLayoutBySlug,
  getPropertyBySlug,
  getPropertyFieldsBySlug,
  getPropertiesByManagerEmail,
  type AirtableFields,
  type ManagerLayoutItem,
  type Property,
} from "@/lib/airtable";
import ManagerPropertyEditorClient from "./ui";

export const dynamic = "force-dynamic";

async function requireSession() {
  const jar = await cookies();
  const token = jar.get(getManagerCookieName())?.value || "";
  return token ? verifyManagerSession(token) : null;
}

async function requirePropertyAccess(email: string, slug: string): Promise<boolean> {
  const props = await getPropertiesByManagerEmail(email);
  return props.some((p) => (p.Slug || "").trim() === slug.trim());
}

export default async function ManagerPropertyEditPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  if (!session) redirect("/manager/login");

  const { slug } = await props.params;
  const ok = await requirePropertyAccess(session.email, slug);
  if (!ok) redirect("/manager");

  const [property, fields, layout] = await Promise.all([
    getPropertyBySlug(slug),
    getPropertyFieldsBySlug(slug),
    getManagerLayoutBySlug(slug),
  ]);

  if (!property || !fields || !layout) redirect("/manager");

  return (
    <ManagerPropertyEditorClient
      slug={slug}
      property={property as Property}
      rawFields={fields as AirtableFields}
      initialLayout={layout as ManagerLayoutItem[]}
    />
  );
}
