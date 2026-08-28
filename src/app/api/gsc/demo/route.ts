import { NextResponse } from 'next/server';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';

export async function GET() {
  const snapshot = getGscDemoSnapshot();
  return NextResponse.json({
    success: true,
    snapshot,
  });
}
