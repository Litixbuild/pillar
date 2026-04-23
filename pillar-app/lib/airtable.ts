import Airtable from 'airtable';

// Cache the Airtable base + property lookups to reduce repeated network latency.
let cachedBase: ReturnType<Airtable['base']> | null = null;
const propertyBySlugCache = new Map<
  string,
  { atMs: number; value: Property | null }
>();

function firstNonEmptyEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

function envPresence(names: string[]): Record<string, boolean> {
  return Object.fromEntries(
    names.map((n) => [n, typeof process.env[n] === 'string' && !!process.env[n]?.trim()])
  );
}

function getBase() {
  const token = firstNonEmptyEnv('AIRTABLE_TOKEN', 'AIRTABLE_API_KEY', 'AIRTABLE_PAT');
  const baseId = firstNonEmptyEnv('AIRTABLE_BASE_ID', 'AIRTABLE_BASE');

  if (!token || !baseId) {
    // Intentionally do NOT print secrets; just presence + Netlify context.
    console.error('[airtable] Missing required env vars', {
      requiredPresence: envPresence([
        'AIRTABLE_TOKEN',
        'AIRTABLE_API_KEY',
        'AIRTABLE_PAT',
        'AIRTABLE_BASE_ID',
        'AIRTABLE_BASE',
      ]),
      netlify: {
        CONTEXT: process.env.CONTEXT,
        NETLIFY: process.env.NETLIFY,
        SITE_NAME: process.env.SITE_NAME,
      },
      nodeEnv: process.env.NODE_ENV,
    });
    throw new Error(
      'AIRTABLE_TOKEN and AIRTABLE_BASE_ID must be set (or alternates: AIRTABLE_API_KEY/AIRTABLE_PAT, AIRTABLE_BASE)'
    );
  }

  if (cachedBase) return cachedBase;

  cachedBase = new Airtable({
    apiKey: token,
  }).base(baseId);

  return cachedBase;
}

export interface Property {
  PropertyName: string;
  PropertyAddress: string;
  PropertyZipCode: string;
  DetailedHouseBio: string;
  WiFiName: string;
  WiFiPassword: string;
  GarageCode?: string;
  HouseRules: string;
  ManagerPhone: string;
  HeroImage?: string;
  Video1_File?: string;
  PoolHeater?: string;
  Television?: string;
  CoffeeMachine?: string;
}

export interface LocalSpot {
  Name: string;
  Category: string;
  Address?: string;
  Website?: string;
  Phone?: string;
  Notes?: string;
}

function getLocalSpotsTableName(): string {
  return (process.env.AIRTABLE_LOCAL_SPOTS_TABLE || 'LocalSpots').trim();
}

function getLocalSpotsZipFieldName(): string {
  return (process.env.AIRTABLE_LOCAL_SPOTS_ZIP_FIELD || 'ZipCode').trim();
}

function getPropertiesTableName(): string {
  return (process.env.AIRTABLE_PROPERTIES_TABLE || 'Properties').trim();
}

function getPropertiesSlugFieldName(): string {
  return (process.env.AIRTABLE_PROPERTIES_SLUG_FIELD || 'Slug').trim();
}

export async function getLocalSpotsByZip(zipCode: string): Promise<LocalSpot[]> {
  const zip = zipCode.trim();
  if (!zip) return [];

  const base = getBase();
  const tableName = getLocalSpotsTableName();
  const zipFieldName = getLocalSpotsZipFieldName();

  const sanitizedZip = zip.replace(/'/g, "\\'");
  const records = await base(tableName)
    .select({
      filterByFormula: `{${zipFieldName}} = '${sanitizedZip}'`,
      maxRecords: 50,
    })
    .firstPage();

  return records
    .map((r) => r.fields as Record<string, unknown>)
    .map((f) => ({
      Name: (f.Name as string) || '',
      Category: (f.Category as string) || '',
      Address: (f.Address as string) || undefined,
      Website: (f.Website as string) || undefined,
      Phone: (f.Phone as string) || undefined,
      Notes: (f.Notes as string) || undefined,
    }))
    .filter((s) => s.Name && s.Category);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    const ttlMs = Math.max(
      0,
      Number(process.env.AIRTABLE_PROPERTY_CACHE_TTL_MS || 60_000)
    );
    const now = Date.now();
    const cacheKey = slug.trim();

    if (cacheKey) {
      const cached = propertyBySlugCache.get(cacheKey);
      if (cached && now - cached.atMs < ttlMs) return cached.value;
    }

    const base = getBase();

    // Escape single quotes in slug to prevent formula injection
    const sanitizedSlug = cacheKey.replace(/'/g, "\\'");

    const tableName = getPropertiesTableName();
    const slugFieldName = getPropertiesSlugFieldName();

    const records = await base(tableName)
      .select({
        filterByFormula: `{${slugFieldName}} = '${sanitizedSlug}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      if (cacheKey) propertyBySlugCache.set(cacheKey, { atMs: now, value: null });
      return null;
    }

    const record = records[0];
    const fields = record.fields as Record<string, unknown>;

    const firstAttachmentUrl = (v: unknown): string | undefined => {
      if (!Array.isArray(v)) return undefined;
      const first = (v as Array<{ url?: unknown }>)[0];
      return first && typeof first.url === 'string' ? first.url : undefined;
    };

    const heroImageUrl = firstAttachmentUrl(fields.HeroImage);
    const video1FileUrl = firstAttachmentUrl(fields.Video1_File);
    const poolHeaterUrl = firstAttachmentUrl(fields.PoolHeater);
    const televisionUrl = firstAttachmentUrl(fields.Television);
    const coffeeMachineUrl = firstAttachmentUrl(fields.CoffeeMachine);

    const out: Property = {
      PropertyName: (fields.PropertyName as string) || '',
      PropertyAddress: (fields.PropertyAddress as string) || 'Not provided',
      PropertyZipCode: (fields.PropertyZipCode as string) || 'Not provided',
      DetailedHouseBio: (fields.DetailedHouseBio as string) || 'Not provided',
      WiFiName: (fields.WiFiName as string) || '',
      WiFiPassword: (fields.WiFiPassword as string) || '',
      GarageCode: (fields.GarageCode as string) || '',
      HouseRules: (fields.HouseRules as string) || '',
      ManagerPhone: (fields.ManagerPhone as string) || '',
      HeroImage: heroImageUrl,
      Video1_File: video1FileUrl,
      PoolHeater: poolHeaterUrl,
      Television: televisionUrl,
      CoffeeMachine: coffeeMachineUrl,
    };

    if (cacheKey) propertyBySlugCache.set(cacheKey, { atMs: now, value: out });
    return out;
  } catch (error) {
    const err = error as unknown;
    const message =
      (err instanceof Error ? err.message : undefined) ||
      (typeof err === 'object' && err && 'error' in err
        ? String((err as { error?: { message?: unknown } }).error?.message || '')
        : '') ||
      (error instanceof Error ? error.message : 'Unknown Airtable error');

    throw new Error(`Airtable request failed: ${message}`);
  }
}
