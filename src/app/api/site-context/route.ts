import { NextRequest, NextResponse } from 'next/server';
import { buildSiteContextProfile, fetchSiteSitemapUrls } from '@/lib/intelligence/site-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, sitemapOnly } = body as { url?: string; sitemapOnly?: boolean };

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL or domain is required' }, { status: 400 });
    }

    if (sitemapOnly) {
      const sitemapResult = await fetchSiteSitemapUrls(url);
      return NextResponse.json({
        success: true,
        sitemap: sitemapResult,
      });
    }

    const profile = await buildSiteContextProfile(url);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to extract site context';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
