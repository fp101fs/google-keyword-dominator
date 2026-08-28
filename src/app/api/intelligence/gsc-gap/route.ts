import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { computeGscGapOpportunities } from '@/lib/intelligence/gap-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl, isDemo, country = 'US', language = 'en' } = body;

    let snapshot;
    if (isDemo || !siteUrl) {
      snapshot = getGscDemoSnapshot();
    } else {
      const token = await getValidAccessToken();
      if (!token) {
        // Fallback to demo snapshot if token is missing
        snapshot = getGscDemoSnapshot();
      } else {
        snapshot = await getGscPropertySnapshot(token, siteUrl);
      }
    }

    const opportunities = await computeGscGapOpportunities(
      snapshot.queries || [],
      snapshot.pages || [],
      country,
      language
    );

    return NextResponse.json({
      success: true,
      property: snapshot.property,
      totalGscQueries: snapshot.queries.length,
      opportunities,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze GSC gaps';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
