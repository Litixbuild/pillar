import { notFound } from "next/navigation";
import { getManagerLayoutBySlug, getPropertyBySlug, getPropertyFieldsBySlug } from "@/lib/airtable";
import PropertyExperience from "@/components/property/PropertyExperience";

// Force dynamic rendering to fetch data at request time
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const [property, layout, fields] = await Promise.all([
    getPropertyBySlug(slug),
    getManagerLayoutBySlug(slug),
    getPropertyFieldsBySlug(slug),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <PropertyExperience
      slug={slug}
      property={property}
      managerLayout={layout || []}
      rawFields={fields || {}}
    />
  );
}
