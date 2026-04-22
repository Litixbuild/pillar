import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/airtable";
import PropertyExperience from "./PropertyExperience";

// Force dynamic rendering to fetch data at request time
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyExperience slug={slug} property={property} />;
}
