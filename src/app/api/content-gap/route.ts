import { NextRequest, NextResponse } from 'next/server';
import { getExpandedKeywords, normalizeKeyword, KeywordItem } from '@/lib/autocomplete';
import { computeContentGap } from '@/lib/content-gap';
import { checkRateLimit } from '@/lib/rate-limit';

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
      .slice(0, 3); // limit up to 3 competitors

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

    // 2. Fetch Competitors seed keywords
    const competitorMap: Record<string, KeywordItem[]> = {};
    await Promise.all(
      cleanCompetitors.map(async (comp) => {
        const res = await getExpandedKeywords({
          seeds: [comp],
          country,
          language,
        });
        competitorMap[comp] = res.keywords;
      })
    );

    // 3. Compute Gap
    const gapResult = computeContentGap(
      cleanTarget,
      targetResults.keywords,
      cleanCompetitors,
      competitorMap
    );

    return NextResponse.json({
      success: true,
      data: gapResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to analyze Content Gap';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
