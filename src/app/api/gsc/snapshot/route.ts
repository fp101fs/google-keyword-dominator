import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const siteUrl = searchParams.get('siteUrl');

    if (!siteUrl) {
      return NextResponse.json({ error: 'siteUrl is required' }, { status: 400 });
    }

    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
    }

    const snapshot = await getGscPropertySnapshot(token, siteUrl);
    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load GSC snapshot';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
