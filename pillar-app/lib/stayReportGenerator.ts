import { renderToBuffer } from '@react-pdf/renderer';
import { createServiceClient } from '@/lib/supabase';
import { getPropertyBySlug } from '@/lib/properties';
import type { PropertyStay } from '@/lib/stays';
import { getConsentsForStay } from '@/lib/stayConsent';
import { getCleaningPhotosForStay } from '@/lib/stayCleaningPhotos';
import { getDamagePhotosForStay } from '@/lib/stayDamageReports';
import { draftStayNarrative } from '@/lib/stayReportNarrative';
import { saveStayReport, type StayReport } from '@/lib/stayReports';
import { StayReportDocument } from '@/lib/stayReportPdf';

const BUCKET = 'property-media';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function buildFacts(
  propertyName: string,
  stay: PropertyStay,
  consents: { consented_at: string }[],
  cleaningPhotos: { uploaded_at: string }[],
  damagePhotos: { created_at: string; caption: string | null }[]
): string {
  const lines: string[] = [];
  lines.push(`Property: ${propertyName}`);
  lines.push(`Stay started: ${formatDate(stay.started_at)}`);
  lines.push(stay.status === 'active' ? 'Stay status: ongoing' : `Stay ended: ${stay.ended_at ? formatDate(stay.ended_at) : 'unknown'}`);

  if (consents.length === 0) {
    lines.push('Cleanliness confirmation: none recorded.');
  } else {
    lines.push(`Cleanliness confirmation: recorded ${consents.length} time(s), first at ${formatDate(consents[0].consented_at)}.`);
  }

  if (cleaningPhotos.length === 0) {
    lines.push('Pre-arrival cleaning photos: none submitted.');
  } else {
    lines.push(`Pre-arrival cleaning photos: ${cleaningPhotos.length} submitted, earliest at ${formatDate(cleaningPhotos[0].uploaded_at)}.`);
  }

  if (damagePhotos.length === 0) {
    lines.push('Damage documentation: none reported during this stay.');
  } else {
    lines.push(`Damage documentation: ${damagePhotos.length} photo(s) reported, starting ${formatDate(damagePhotos[0].created_at)}.`);
    const captions = damagePhotos.map((p) => p.caption).filter((c): c is string => !!c);
    if (captions.length > 0) lines.push(`Damage notes from host: ${captions.join(' | ')}`);
  }

  return lines.join('\n');
}

export async function generateStayReport(slug: string, stay: PropertyStay): Promise<StayReport> {
  const [property, consents, cleaningPhotos, damagePhotos] = await Promise.all([
    getPropertyBySlug(slug),
    getConsentsForStay(stay.id),
    getCleaningPhotosForStay(stay.id),
    getDamagePhotosForStay(stay.id),
  ]);

  const propertyName = property?.PropertyName || slug;
  const propertyAddress = property?.PropertyAddress && property.PropertyAddress !== 'Not provided' ? property.PropertyAddress : '';
  const managerName = property?.ManagerName || null;

  const facts = buildFacts(propertyName, stay, consents, cleaningPhotos, damagePhotos);
  const narrative = await draftStayNarrative(facts);

  const generatedAt = new Date().toISOString();
  const pdfBuffer = await renderToBuffer(
    StayReportDocument({
      data: { propertyName, propertyAddress, managerName, stay, consents, cleaningPhotos, damagePhotos, narrative, generatedAt },
    })
  );

  const supabase = createServiceClient();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const path = `${slug}/reports/${stay.id}/report-${id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true });
  if (uploadError) throw new Error(`Failed to upload report: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return saveStayReport(stay.id, slug, publicUrl, narrative);
}
