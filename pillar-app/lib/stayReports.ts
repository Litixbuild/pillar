import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface StayReport {
  id: string;
  stay_id: string;
  property_slug: string;
  pdf_url: string;
  narrative_text: string | null;
  generated_at: string;
}

function rowToReport(row: Row): StayReport {
  return {
    id: String(row.id),
    stay_id: String(row.stay_id),
    property_slug: String(row.property_slug),
    pdf_url: String(row.pdf_url),
    narrative_text: typeof row.narrative_text === 'string' ? row.narrative_text : null,
    generated_at: String(row.generated_at),
  };
}

export async function saveStayReport(
  stayId: string,
  propertySlug: string,
  pdfUrl: string,
  narrativeText: string
): Promise<StayReport> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('stay_reports')
    .insert({ stay_id: stayId, property_slug: propertySlug, pdf_url: pdfUrl, narrative_text: narrativeText })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to save report');
  return rowToReport(data as Row);
}

export async function getLatestReportForStay(stayId: string): Promise<StayReport | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('stay_reports')
    .select('*')
    .eq('stay_id', stayId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? rowToReport(data as Row) : null;
}
