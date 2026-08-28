import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { buildPageExpansionPlan } from '@/lib/intelligence/page-expansion';
import { generateLlmPageTitleMeta } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend Vercel serverless execution limit to 60s

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

    const targetUrl = targetPageUrl || snapshot.pages[0]?.url || 'https://example.com';
    const pageQueries = (snapshot.queries || []).filter(
      (q) => !q.page || q.page === targetUrl || q.page.endsWith(targetUrl)
    );

    const plan = await buildPageExpansionPlan(
      targetUrl,
      pageQueries.length > 0 ? pageQueries : (snapshot.queries || []).slice(0, 10),
      country,
      language
    );

    // Call DeepSeek LLM with graceful 5-second timeout fallback for instant responsiveness
    if (plan.currentQueries.length > 0) {
      try {
        const llmPromise = generateLlmPageTitleMeta(targetUrl, plan.currentQueries);
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
        const llmTitleMeta = await Promise.race([llmPromise, timeoutPromise]);

        if (llmTitleMeta) {
          plan.titleMetaRecommendation = {
            currentTitle: `${targetUrl.split('/').pop() || 'Page'}`,
            recommendedTitle: llmTitleMeta.recommendedTitle,
            currentMeta: '',
            recommendedMeta: llmTitleMeta.recommendedMeta,
            reason: llmTitleMeta.reason,
          };
        }
      } catch {
        // Non-blocking LLM fallback
      }
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to build page expansion plan';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
