import { createServiceClient } from './supabase';

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

    const { count } = await supabase
      .from('rate_limit_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart);

    if ((count ?? 0) >= limit) return false;

    await supabase.from('rate_limit_attempts').insert({ key });
    return true;
  } catch {
    return true; // Fail open — never block legitimate users on a DB error
  }
}
