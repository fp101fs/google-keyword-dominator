import { NextRequest, NextResponse } from 'next/server';
import { getExpandedKeywords, normalizeKeyword, KeywordItem } from '@/lib/autocomplete';
import { computeContentGap } from '@/lib/content-gap';
import { checkRateLimit } from '@/lib/rate-limit';
import { synthesizeCompetitorGapWithLlm } from '@/lib/llm';
import { fetchSiteSitemapUrls } from '@/lib/intelligence/site-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetSeed, competitorSeeds, country = 'US', language = 'en' } = body as {
      targetSeed?: string;
      competitorSeeds?: string[];
      country?: string;
      language?: string;
    };

    const cleanTarget = normalizeKeyword(targetSeed || '');
    const cleanCompetitors = (competitorSeeds || [])
      .map(normalizeKeyword)
      .filter(Boolean)
      .slice(0, 3);

    if (!cleanTarget || cleanCompetitors.length === 0) {
      return NextResponse.json(
        { error: 'Target seed and at least one competitor seed are required.' },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    const rateLimit = checkRateLimit(`gap-${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit reached. Please wait ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    // 1. Fetch Target seed keywords
    const targetResults = await getExpandedKeywords({
      seeds: [cleanTarget],
      country,
      language,
    });

    // 2. Fetch Competitors seed keywords + check for competitor sitemaps
    const competitorMap: Record<string, KeywordItem[]> = {};
    const competitorSitemaps: Record<string, string[]> = {};

    await Promise.all(
      cleanCompetitors.map(async (comp) => {
        const resPromise = getExpandedKeywords({
          seeds: [comp],
          country,
          language,
        });

        // If competitor looks like a domain (e.g. "descript.com" or "descript"), check sitemap
        let sitemapPromise: Promise<{ sitemapUrl?: string; urls: string[] }> = Promise.resolve({ urls: [] });
        if (comp.includes('.') || !comp.includes(' ')) {
          const compDomain = comp.includes('.') ? comp : `${comp}.com`;
          sitemapPromise = fetchSiteSitemapUrls(`https://${compDomain}`).catch(() => ({ urls: [] }));
        }

        const [res, sitemap] = await Promise.all([resPromise, sitemapPromise]);
        competitorMap[comp] = res.keywords;
        if (sitemap.urls.length > 0) {
          competitorSitemaps[comp] = sitemap.urls.slice(0, 10);
        }
      })
    );

    // 3. Compute Gap Matrix
    const gapAnalysis = computeContentGap(
      cleanTarget,
      targetResults.keywords,
      cleanCompetitors,
      competitorMap
    );

    // 4. Call genuine LLM via web_search to synthesize competitor strategy & differentiation
    const gapKeywords = gapAnalysis.gapOpportunities.map((k) => k.keyword);
    const llmStrategy = await synthesizeCompetitorGapWithLlm(cleanTarget, cleanCompetitors, gapKeywords);

    return NextResponse.json({
      success: true,
      data: gapAnalysis,
      llmStrategy,
      competitorSitemaps,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze content gap';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
