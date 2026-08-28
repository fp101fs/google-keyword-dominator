import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { buildPageExpansionPlan } from '@/lib/intelligence/page-expansion';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl, targetPageUrl, isDemo, country = 'US', language = 'en' } = body;

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

    const targetUrl = targetPageUrl || snapshot.pages[0]?.url || 'https://example.com/top-page';
    const pageQueries = (snapshot.queries || []).filter(
      (q) => !q.page || q.page.toLowerCase().includes(targetUrl.toLowerCase()) || true
    );

    const plan = await buildPageExpansionPlan(
      targetUrl,
      pageQueries.slice(0, 20),
      country,
      language
    );

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate page expansion plan';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
