import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase';

type Row = Record<string, unknown>;

export interface CleanerToken {
  id: string;
  property_slug: string;
  token: string;
  created_at: string;
}

function rowToToken(row: Row): CleanerToken {
  return {
    id: String(row.id),
    property_slug: String(row.property_slug),
    token: String(row.token),
    created_at: String(row.created_at),
  };
}

function generateToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export async function getOrCreateCleanerToken(slug: string): Promise<CleanerToken> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('cleaner_upload_tokens')
    .select('*')
    .eq('property_slug', slug)
    .maybeSingle();
  if (existing) return rowToToken(existing as Row);

  const { data, error } = await supabase
    .from('cleaner_upload_tokens')
    .insert({ property_slug: slug, token: generateToken() })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create cleaner link');
  return rowToToken(data as Row);
}

export async function getPropertySlugForToken(token: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('cleaner_upload_tokens')
    .select('property_slug')
    .eq('token', token)
    .maybeSingle();
  return data ? String((data as Row).property_slug) : null;
}
