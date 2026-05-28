import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pmpillar.com';
  const response = NextResponse.redirect(`${appUrl}/manager/signup`);
  response.cookies.set('pillar_ref', code.toUpperCase(), {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: true,
  });
  return response;
}
