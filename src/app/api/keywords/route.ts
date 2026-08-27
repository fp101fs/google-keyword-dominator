import { NextRequest, NextResponse } from 'next/server';
import { getExpandedKeywords, normalizeKeyword } from '@/lib/autocomplete';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || 'US';
    const language = searchParams.get('language') || 'en';
    const alphabet = searchParams.get('alphabet') === 'true';
    const questions = searchParams.get('questions') === 'true';
    const prepositions = searchParams.get('prepositions') === 'true';

    const normalized = normalizeKeyword(query);
    if (!normalized) {
      return NextResponse.json(
        { error: 'Seed query cannot be empty.' },
        { status: 400 }
      );
    }

    if (normalized.length > 100) {
      return NextResponse.json(
        { error: 'Seed query exceeds maximum length of 100 characters.' },
        { status: 400 }
      );
    }

    // Rate Limiting by IP
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous';

    const rateLimit = checkRateLimit(clientIp, 45, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please wait ${rateLimit.resetInSeconds} seconds before requesting more keywords.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
          },
        }
      );
    }

    // Fetch genuine autocomplete suggestions
    const { keywords, totalQueriesExecuted } = await getExpandedKeywords({
      seed: normalized,
      country,
      language,
      includeAlphabet: alphabet,
      includeQuestions: questions,
      includePrepositions: prepositions,
    });

    return NextResponse.json(
      {
        seed: normalized,
        country,
        language,
        total: keywords.length,
        totalQueriesExecuted,
        keywords,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve autocomplete suggestions';
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
