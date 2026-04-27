import Airtable from 'airtable';

// Cache the Airtable base + property lookups to reduce repeated network latency.
let cachedBase: ReturnType<Airtable['base']> | null = null;
const propertyBySlugCache = new Map<string, { atMs: number; value: Property | null }>();

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
  Slug?: string;
  PropertyName: string;
  PropertyAddress: string;
  PropertyZipCode: string;
  DetailedHouseBio: string;
  WiFiName: string;
  WiFiPassword: string;
  GarageCode?: string;
  HouseRules: string;
  ManagerPhone: string;
  ManagerName?: string;
  ManagerEmail?: string;
  ManagerPassword?: string;
  HeroImage?: string;
  Video1_File?: string;
  PoolHeater?: string;
  Television?: string;
  CoffeeMachine?: string;
}

export type AirtableFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<Record<string, unknown>>;

export type AirtableFields = Record<string, AirtableFieldValue>;

export type ManagerLayoutItem = {
  field: string;
};

function getPropertiesLayoutFieldName(): string {
  return (process.env.AIRTABLE_PROPERTIES_LAYOUT_FIELD || 'ManagerLayout').trim();
}

export function parseManagerLayout(raw: unknown): ManagerLayoutItem[] {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map((x) => {
        if (!x || typeof x !== 'object') return null;
        const f = (x as { field?: unknown }).field;
        if (typeof f !== 'string' || !f.trim()) return null;
        return { field: f.trim() } satisfies ManagerLayoutItem;
      })
      .filter((x): x is ManagerLayoutItem => Boolean(x));
  } catch {
    return [];
  }
}

export async function getPropertyFieldsBySlug(
  slug: string
): Promise<AirtableFields | null> {
  const base = getBase();
  const tableName = getPropertiesTableName();
  const slugFieldName = getPropertiesSlugFieldName();

  const sanitizedSlug = slug.trim().replace(/'/g, "\\'");
  const records = await base(tableName)
    .select({
      filterByFormula: `{${slugFieldName}} = '${sanitizedSlug}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (!records.length) return null;
  const fields = records[0].fields as Record<string, unknown>;
  return fields as AirtableFields;
}

export async function getManagerLayoutBySlug(
  slug: string
): Promise<ManagerLayoutItem[] | null> {
  const fields = await getPropertyFieldsBySlug(slug);
  if (!fields) return null;
  const layoutField = getPropertiesLayoutFieldName();
  return parseManagerLayout(fields[layoutField]);
}

export async function setManagerLayoutBySlug(
  slug: string,
  items: ManagerLayoutItem[]
): Promise<void> {
  const base = getBase();
  const tableName = getPropertiesTableName();
  const slugFieldName = getPropertiesSlugFieldName();
  const layoutField = getPropertiesLayoutFieldName();

  const sanitizedSlug = slug.trim().replace(/'/g, "\\'");
  const records = await base(tableName)
    .select({
      filterByFormula: `{${slugFieldName}} = '${sanitizedSlug}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (!records.length) {
    throw new Error('Property not found');
  }

  const recordId = records[0].id;
  try {
    await base(tableName).update([
      {
        id: recordId,
        fields: {
          [layoutField]: serializeManagerLayout(items),
        },
      },
    ]);
  } catch (e) {
    const err = e as unknown;
    const statusCode =
      typeof err === 'object' && err && 'statusCode' in err
        ? (err as { statusCode?: unknown }).statusCode
        : undefined;
    const airtableMessage =
      typeof err === 'object' && err && 'message' in err
        ? (err as { message?: unknown }).message
        : undefined;
    const nestedErrorMessage =
      typeof err === 'object' && err && 'error' in err
        ? (err as { error?: { message?: unknown } }).error?.message
        : undefined;

    const message =
      (err instanceof Error ? err.message : undefined) ||
      (typeof nestedErrorMessage === 'string' ? nestedErrorMessage : undefined) ||
      (typeof airtableMessage === 'string' ? airtableMessage : undefined) ||
      'Unknown Airtable error';

    throw new Error(
      `Failed to update Airtable layout field '${layoutField}' on table '${tableName}' for slug '${slug.trim()}': ${typeof statusCode === 'number' ? `HTTP ${statusCode}: ` : ''}${message}`
    );
  }
}

export function serializeManagerLayout(items: ManagerLayoutItem[]): string {
  return JSON.stringify(
    items
      .map((x) => ({ field: typeof x.field === 'string' ? x.field.trim() : '' }))
      .filter((x) => x.field)
  );
}

export async function getPropertiesByManagerEmail(email: string): Promise<Property[]> {
  const e = email.trim().toLowerCase();
  if (!e) return [];

  const base = getBase();
  const tableName = getPropertiesTableName();
  const slugFieldName = getPropertiesSlugFieldName();

  // Escape single quotes to avoid formula injection.
  const sanitized = e.replace(/'/g, "\\'");
  const records = await base(tableName)
    .select({
      filterByFormula: `{ManagerEmail} = '${sanitized}'`,
      maxRecords: 200,
    })
    .firstPage();

  return records.map((r) => r.fields as Record<string, unknown>).map((fields) => {
    const firstAttachmentUrl = (v: unknown): string | undefined => {
      if (!Array.isArray(v)) return undefined;
      const first = (v as Array<{ url?: unknown }>)[0];
      return first && typeof first.url === 'string' ? first.url : undefined;
    };

    return {
      Slug: typeof fields[slugFieldName] === 'string' ? ((fields[slugFieldName] as string) || '').trim() || undefined : undefined,
      PropertyName: (fields.PropertyName as string) || '',
      PropertyAddress: (fields.PropertyAddress as string) || 'Not provided',
      PropertyZipCode: (fields.PropertyZipCode as string) || 'Not provided',
      DetailedHouseBio: (fields.DetailedHouseBio as string) || 'Not provided',
      WiFiName: (fields.WiFiName as string) || '',
      WiFiPassword: (fields.WiFiPassword as string) || '',
      GarageCode: (fields.GarageCode as string) || '',
      HouseRules: (fields.HouseRules as string) || '',
      ManagerPhone: (fields.ManagerPhone as string) || '',
      ManagerName: (fields.ManagerName as string) || undefined,
      ManagerEmail: (fields.ManagerEmail as string) || undefined,
      ManagerPassword: (fields.ManagerPassword as string) || undefined,
      HeroImage: firstAttachmentUrl(fields.HeroImage),
      Video1_File: firstAttachmentUrl(fields.Video1_File),
      PoolHeater: firstAttachmentUrl(fields.PoolHeater),
      Television: firstAttachmentUrl(fields.Television),
      CoffeeMachine: firstAttachmentUrl(fields.CoffeeMachine),
    } satisfies Property;
  });
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

    const statusCode =
      typeof err === 'object' && err && 'statusCode' in err
        ? (err as { statusCode?: unknown }).statusCode
        : undefined;

    const nestedErrorMessage =
      typeof err === 'object' && err && 'error' in err
        ? (err as { error?: { message?: unknown } }).error?.message
        : undefined;

    const airtableMessageField =
      typeof err === 'object' && err && 'message' in err
        ? (err as { message?: unknown }).message
        : undefined;

    const message =
      (err instanceof Error ? err.message : undefined) ||
      (typeof nestedErrorMessage === 'string' ? nestedErrorMessage : undefined) ||
      (typeof nestedErrorMessage === 'number' ? String(nestedErrorMessage) : undefined) ||
      'Unknown Airtable error';

    // Safe diagnostics: no secrets, but enough to fix schema/auth issues.
    console.error('[airtable] getPropertyBySlug failed', {
      slug: slug.trim(),
      tableName: getPropertiesTableName(),
      slugFieldName: getPropertiesSlugFieldName(),
      statusCode,
      airtableMessage:
        typeof airtableMessageField === 'string'
          ? airtableMessageField
          : typeof airtableMessageField === 'number'
            ? String(airtableMessageField)
            : undefined,
      airtableErrorMessage:
        typeof nestedErrorMessage === 'string'
          ? nestedErrorMessage
          : typeof nestedErrorMessage === 'number'
            ? String(nestedErrorMessage)
            : undefined,
      hasErrorField:
        typeof err === 'object' && !!err && 'error' in err && !!(err as { error?: unknown }).error,
      errorKeys:
        typeof err === 'object' && err
          ? Object.keys(err as Record<string, unknown>).slice(0, 20)
          : undefined,
    });

    throw new Error(
      `Airtable request failed: ${typeof statusCode === 'number' ? `HTTP ${statusCode}: ` : ''}${message}`
    );
  }
}
