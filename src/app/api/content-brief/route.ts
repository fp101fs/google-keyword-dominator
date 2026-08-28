import { NextRequest, NextResponse } from 'next/server';
import { generateContentBrief } from '@/lib/content-brief';
import { KeywordItem, normalizeKeyword } from '@/lib/autocomplete';
import { generateLlmContentBrief } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seed, keywords, siteContext, gscContext } = body as {
      seed?: string;
      keywords?: KeywordItem[];
      siteContext?: {
        siteName?: string;
        businessType?: string;
        targetAudience?: string;
        situationalSummary?: string;
        sampleSitemapUrls?: string[];
      };
      gscContext?: {
        position?: number;
        impressions?: number;
        ctr?: number;
      };
    };

    const normalizedSeed = normalizeKeyword(seed || '');
    if (!normalizedSeed) {
      return NextResponse.json({ error: 'Seed keyword is required' }, { status: 400 });
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords array cannot be empty' }, { status: 400 });
    }

    // 1. Base structured brief from raw autocomplete queries
    const brief = generateContentBrief(normalizedSeed, keywords);

    // 2. Call genuine LLM with enriched site context, sitemap URLs & GSC performance data
    const rawKeywordsList = keywords.map((k) => k.keyword);
    const llmResult = await generateLlmContentBrief(normalizedSeed, rawKeywordsList, siteContext, gscContext);

    return NextResponse.json({
      success: true,
      brief,
      llmData: llmResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate content brief';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
