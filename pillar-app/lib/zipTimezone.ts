import { lookup } from 'zipcode-to-timezone';

/** Resolves the IANA timezone for a US zip code, or null if unknown. */
export function timeZoneForZip(zip: string | undefined | null): string | null {
  if (!zip) return null;
  const digits = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(digits)) return null;
  return lookup(digits);
}

/** Current hour (0-23) at the given zip code, falling back to the local device clock. */
export function currentHourForZip(zip: string | undefined | null): number {
  const tz = timeZoneForZip(zip);
  if (!tz) return new Date().getHours();
  const formatted = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date());
  return Number(formatted);
}
