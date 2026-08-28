import { NextRequest, NextResponse } from 'next/server';
import { buildGoogleAuthUrl } from '@/lib/gsc/google-auth';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const authUrl = buildGoogleAuthUrl(origin);
  return NextResponse.redirect(authUrl);
}
