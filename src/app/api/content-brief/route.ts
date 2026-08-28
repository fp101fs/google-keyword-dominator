import { NextRequest, NextResponse } from 'next/server';
import { generateContentBrief } from '@/lib/content-brief';
import { KeywordItem, normalizeKeyword } from '@/lib/autocomplete';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seed, keywords } = body as { seed?: string; keywords?: KeywordItem[] };

    const normalizedSeed = normalizeKeyword(seed || '');
    if (!normalizedSeed) {
      return NextResponse.json({ error: 'Seed keyword is required' }, { status: 400 });
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords array cannot be empty' }, { status: 400 });
    }

    const brief = generateContentBrief(normalizedSeed, keywords);

    return NextResponse.json({
      success: true,
      brief,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate content brief';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
