import { NextRequest, NextResponse } from 'next/server';
import { computeSerpOverlapMatrix } from '@/lib/serp-overlap';
import { normalizeKeyword } from '@/lib/autocomplete';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords, apiKey } = body as { keywords?: string[]; apiKey?: string };

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords array is required' }, { status: 400 });
    }

    const cleanKeywords = keywords.map(normalizeKeyword).filter(Boolean).slice(0, 8);
    if (cleanKeywords.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid keywords are required to compute SERP overlap' },
        { status: 400 }
      );
    }

    // Rate Limiting by IP
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    const rateLimit = checkRateLimit(`serp-${clientIp}`, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit reached. Please wait ${rateLimit.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const overlapData = await computeSerpOverlapMatrix(cleanKeywords, apiKey);

    return NextResponse.json({
      success: true,
      data: overlapData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to calculate SERP overlap';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
