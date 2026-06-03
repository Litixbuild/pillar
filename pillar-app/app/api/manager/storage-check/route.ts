import { cookies } from 'next/headers';
import { getManagerCookieName, verifyManagerSession } from '@/lib/managerAuth';
import { createServiceClient } from '@/lib/supabase';
import { requirePropertyAccess } from '@/lib/properties';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'property-media';

export async function GET(req: Request) {
  try {
    const jar = await cookies();
    const token = jar.get(getManagerCookieName())?.value || '';
    const session = token ? verifyManagerSession(token) : null;

    const results: Record<string, unknown> = {
      sessionExists: !!session,
      sessionHasUserId: !!session?.userId,
      userId: session?.userId ?? null,
    };

    if (!session?.userId) {
      results.fatal = 'No userId in session — this is why uploads return 401. Log out and log back in.';
      return Response.json(results, { status: 200 });
    }

    // Check a specific property slug if passed as ?slug=...
    const { searchParams } = new URL(req.url);
    const testSlug = searchParams.get('slug');
    if (testSlug) {
      const access = await requirePropertyAccess(session.userId, testSlug);
      results.propertyAccess = access;
      results.propertySlugTested = testSlug;
    }

    const supabase = createServiceClient();

    // Check bucket
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET);
    results.bucket = bucket ? { id: bucket.id, public: bucket.public } : null;
    results.bucketError = bucketError?.message ?? null;

    // Create bucket if missing
    if (bucketError) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
      results.createError = createError?.message ?? 'created ok';
    }

    // Test upload
    const testPath = `${session.userId}/_storage_check/test.txt`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(testPath, Buffer.from('ok'), { contentType: 'text/plain', upsert: true });
    results.testUploadError = uploadError?.message ?? null;
    results.testUploadOk = !uploadError;

    if (!uploadError) {
      await supabase.storage.from(BUCKET).remove([testPath]);
    }

    results.envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    return Response.json(results, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
