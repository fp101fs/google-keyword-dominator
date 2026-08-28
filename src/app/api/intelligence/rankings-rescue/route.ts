import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { computeRankingsRescueTasks } from '@/lib/intelligence/rankings-rescue';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl, isDemo } = body;

    let snapshot;
    if (isDemo || !siteUrl) {
      snapshot = getGscDemoSnapshot();
    } else {
      const token = await getValidAccessToken();
      if (!token) {
        snapshot = getGscDemoSnapshot();
      } else {
        snapshot = await getGscPropertySnapshot(token, siteUrl);
      }
    }

    const tasks = computeRankingsRescueTasks(
      snapshot.queries || []
    );

    return NextResponse.json({
      success: true,
      property: snapshot.property,
      tasks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to calculate rankings rescue tasks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
