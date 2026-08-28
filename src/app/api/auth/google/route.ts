import { NextRequest, NextResponse } from 'next/server';
import { buildGoogleAuthUrl } from '@/lib/gsc/google-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const authUrl = buildGoogleAuthUrl(origin);
    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Auth configuration error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
