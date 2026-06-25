import { notFound } from "next/navigation";
import { getManagerLayoutBySlug, getPropertyBySlug, getPropertyFieldsBySlug } from "@/lib/properties";
import { getActiveStay } from "@/lib/stays";
import PropertyExperience from "@/components/property/PropertyExperience";
import StayConsentGate from "@/components/property/StayConsentGate";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const [property, layout, fields, activeStay] = await Promise.all([
    getPropertyBySlug(slug),
    getManagerLayoutBySlug(slug),
    getPropertyFieldsBySlug(slug),
    getActiveStay(slug),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <StayConsentGate slug={slug} stayId={activeStay?.id ?? null} property={property}>
      <PropertyExperience
        slug={slug}
        property={property}
        managerLayout={layout || []}
        rawFields={fields || {}}
      />
    </StayConsentGate>
  );
}
