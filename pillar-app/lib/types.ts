export type FieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<Record<string, unknown>>;

export type PropertyFields = Record<string, FieldValue>;

export interface ManagerLayoutItem {
  field: string;
}

export interface AmenityWindow {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text' | 'image';
  icon?: string;
  url?: string;
  body?: string;
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
  HeroImage?: string;
  LogoUrl?: string;
  LogoSize?: number;
  BackgroundKey?: string;
  AccentColor?: string;
  HeadingColor?: string;
  TextColor?: string;
  windows?: AmenityWindow[];
}

function parseLayoutItem(x: unknown): ManagerLayoutItem | null {
  if (!x || typeof x !== 'object') return null;
  const f = (x as { field?: unknown }).field;
  if (typeof f !== 'string' || !f.trim()) return null;
  return { field: f.trim() };
}

export function parseManagerLayout(raw: unknown): ManagerLayoutItem[] {
  // JSONB columns: Supabase returns a parsed array directly
  if (Array.isArray(raw)) return raw.map(parseLayoutItem).filter((x): x is ManagerLayoutItem => Boolean(x));
  // TEXT columns: stored as a JSON string
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map(parseLayoutItem).filter((x): x is ManagerLayoutItem => Boolean(x));
  } catch {
    return [];
  }
}

export function serializeManagerLayout(items: ManagerLayoutItem[]): string {
  return JSON.stringify(
    items
      .map((x) => ({ field: typeof x.field === 'string' ? x.field.trim() : '' }))
      .filter((x) => x.field)
  );
}

export function isValidWindowType(t: unknown): t is AmenityWindow['type'] {
  return t === 'video' || t === 'pdf' || t === 'text' || t === 'image';
}

function parseWindowItem(x: unknown): AmenityWindow | null {
  if (!x || typeof x !== 'object') return null;
  const w = x as Record<string, unknown>;
  if (typeof w.id !== 'string' || !w.id.trim()) return null;
  if (typeof w.title !== 'string') return null;
  if (!isValidWindowType(w.type)) return null;
  return {
    id: w.id.trim(),
    title: w.title,
    type: w.type,
    icon: typeof w.icon === 'string' ? w.icon : undefined,
    url: typeof w.url === 'string' ? w.url : undefined,
    body: typeof w.body === 'string' ? w.body : undefined,
  };
}

export function parseWindows(raw: unknown): AmenityWindow[] {
  // JSONB columns: Supabase returns a parsed array directly
  if (Array.isArray(raw)) return raw.map(parseWindowItem).filter((x): x is AmenityWindow => Boolean(x));
  // TEXT columns: stored as a JSON string
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map(parseWindowItem).filter((x): x is AmenityWindow => Boolean(x));
  } catch {
    return [];
  }
}

export function serializeWindows(items: AmenityWindow[]): string {
  return JSON.stringify(items);
}

export function generateWindowId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
