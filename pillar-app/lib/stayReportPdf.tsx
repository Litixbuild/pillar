import fs from 'fs';
import path from 'path';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { PropertyStay } from '@/lib/stays';
import type { StayConsent } from '@/lib/stayConsent';
import type { StayCleaningPhoto } from '@/lib/stayCleaningPhotos';
import type { StayDamagePhoto } from '@/lib/stayDamageReports';

const GOLD = '#A87C0A';
const GOLD_LIGHT = '#D4AF37';
const INK = '#1e293b';
const MUTED = '#64748b';
const HAIRLINE = '#E4DCC4';

const LOGO_DATA_URI = (() => {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public/images/pillarlogoblack.png'));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
})();

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingHorizontal: 40, paddingBottom: 56, fontSize: 10, color: INK, fontFamily: 'Helvetica' },

  // Letterhead
  logo: { height: 26, width: 35.8, marginBottom: 14, alignSelf: 'center' },
  goldRule: { height: 2, backgroundColor: GOLD_LIGHT, marginBottom: 16 },
  kicker: { fontSize: 8, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 7 },
  title: { fontSize: 21, fontFamily: 'Times-Bold', marginBottom: 3 },
  address: { color: MUTED, fontSize: 9.5, marginBottom: 14 },

  // Compact 2-column facts grid
  factsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: HAIRLINE, borderBottomWidth: 1, borderBottomColor: HAIRLINE, paddingVertical: 10, marginBottom: 20 },
  factCell: { width: '50%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingRight: 12 },
  factLabel: { color: MUTED, fontSize: 8.5 },
  factValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },

  // Section block — only as tall as its own content, no forced page breaks
  section: { marginBottom: 18 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9, paddingBottom: 7, borderBottomWidth: 1, borderBottomColor: HAIRLINE },
  sectionAccentBar: { width: 2.5, height: 12, backgroundColor: GOLD_LIGHT, borderRadius: 2, marginRight: 7 },
  sectionLabel: { fontSize: 7.5, color: GOLD, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 2 },
  sectionTitle: { fontSize: 12.5, fontFamily: 'Helvetica-Bold' },

  paragraph: { lineHeight: 1.5, marginBottom: 6, fontSize: 9.8 },
  emptyNote: { color: MUTED, fontSize: 9.5, fontStyle: 'italic' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: { width: 116, marginBottom: 10 },
  photo: { width: 116, height: 86, objectFit: 'cover', borderRadius: 3, borderWidth: 1, borderColor: HAIRLINE },
  photoCaption: { fontSize: 7.8, marginTop: 3 },
  photoMeta: { fontSize: 7, color: MUTED, marginTop: 1 },

  consentRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: HAIRLINE, paddingVertical: 5 },

  disclaimer: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: HAIRLINE, fontSize: 7.5, lineHeight: 1.5, color: MUTED },

  footer: { position: 'absolute', bottom: 22, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: MUTED, borderTopWidth: 1, borderTopColor: HAIRLINE, paddingTop: 7 },
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export interface StayReportData {
  propertyName: string;
  propertyAddress: string;
  managerName?: string | null;
  stay: PropertyStay;
  consents: StayConsent[];
  cleaningPhotos: StayCleaningPhoto[];
  damagePhotos: StayDamagePhoto[];
  narrative: string;
  generatedAt: string;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factCell}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionAccentBar} />
      <View>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
  );
}

export function StayReportDocument({ data }: { data: StayReportData }) {
  const { propertyName, propertyAddress, managerName, stay, consents, cleaningPhotos, damagePhotos, narrative, generatedAt } = data;
  const referenceCode = stay.id.slice(0, 8).toUpperCase();

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* Letterhead */}
        {LOGO_DATA_URI ? <Image src={LOGO_DATA_URI} style={styles.logo} /> : null}
        <View style={styles.goldRule} />

        <Text style={styles.kicker}>Guest Stay Verification &amp; Incident Report</Text>
        <Text style={styles.title}>{propertyName}</Text>
        {propertyAddress ? <Text style={styles.address}>{propertyAddress}</Text> : null}

        {/* Compact facts grid */}
        <View style={styles.factsGrid}>
          <Fact label="Reference" value={referenceCode} />
          <Fact label="Report generated" value={formatDate(generatedAt)} />
          <Fact label="Stay started" value={formatDate(stay.started_at)} />
          <Fact
            label="Stay status"
            value={stay.status === 'active' ? 'Ongoing' : `Closed ${stay.ended_at ? formatDate(stay.ended_at) : ''}`}
          />
          {managerName ? <Fact label="Prepared by" value={managerName} /> : null}
          <Fact label="Cleanliness confirmations" value={String(consents.length)} />
          <Fact label="Pre-arrival photos" value={String(cleaningPhotos.length)} />
          <Fact label="Damage photos" value={String(damagePhotos.length)} />
        </View>

        {/* Summary narrative */}
        <View style={styles.section}>
          <SectionHeading label="Summary" title="Narrative" />
          {narrative.split('\n').filter(Boolean).map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
        </View>

        {/* Guest consent confirmation */}
        <View style={styles.section}>
          <SectionHeading label="Section 1" title="Guest Consent Confirmation" />
          <Text style={[styles.paragraph, { color: MUTED }]}>
            Before viewing the property guide, guests were required to check the following box:
            &ldquo;I confirm that this home was clean and undamaged when I arrived.&rdquo;
          </Text>
          {consents.length === 0 ? (
            <Text style={styles.emptyNote}>No consent confirmations were recorded for this stay.</Text>
          ) : (
            consents.map((c) => (
              <View key={c.id} style={styles.consentRow} wrap={false}>
                <Text>{formatDate(c.consented_at)}</Text>
                <Text style={{ color: MUTED }}>{c.ip_address ?? 'IP unavailable'}</Text>
              </View>
            ))
          )}
        </View>

        {/* Pre-arrival condition */}
        <View style={styles.section}>
          <SectionHeading label="Section 2" title="Pre-Arrival Condition" />
          {cleaningPhotos.length === 0 ? (
            <Text style={styles.emptyNote}>No pre-arrival cleaning photos were submitted for this stay.</Text>
          ) : (
            <View style={styles.photoGrid}>
              {cleaningPhotos.map((p) => (
                <View key={p.id} style={styles.photoCard} wrap={false}>
                  <Image src={p.photo_url} style={styles.photo} />
                  <Text style={styles.photoMeta}>
                    {formatDate(p.uploaded_at)}{p.uploader_label ? ` — ${p.uploader_label}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Damage documentation */}
        <View style={styles.section}>
          <SectionHeading label="Section 3" title="Damage Documentation" />
          {damagePhotos.length === 0 ? (
            <Text style={styles.emptyNote}>No damage was reported during this stay.</Text>
          ) : (
            <View style={styles.photoGrid}>
              {damagePhotos.map((p) => (
                <View key={p.id} style={styles.photoCard} wrap={false}>
                  <Image src={p.photo_url} style={styles.photo} />
                  {p.caption ? <Text style={styles.photoCaption}>{p.caption}</Text> : null}
                  <Text style={styles.photoMeta}>{formatDate(p.created_at)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Disclaimer — appears once, not repeated per page */}
        <Text style={styles.disclaimer}>
          Host-prepared documentation generated by Pillar (pmpillar.com). This is not an official determination
          by any third-party platform. The narrative summary above is AI-assisted drafting based solely on the
          facts recorded in this report — please review before submitting. All photographs are original,
          unaltered uploads with recorded timestamps.
        </Text>

        {/* Footer — brand + page numbers, repeats on every generated page */}
        <View style={styles.footer} fixed>
          <Text>Pillar · pmpillar.com</Text>
          <Text>Ref. {referenceCode}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
