import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { listGscProperties } from '@/lib/gsc/gsc-service';

export async function GET() {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ authenticated: false, properties: [] });
    }

    const properties = await listGscProperties(token);
    return NextResponse.json({
      authenticated: true,
      properties,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch properties';
    return NextResponse.json({ authenticated: false, error: msg }, { status: 500 });
  }
}
