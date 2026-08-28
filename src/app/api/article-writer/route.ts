import { NextRequest, NextResponse } from 'next/server';
import { runArticleFactoryPipeline } from '@/lib/article-factory';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max execution for multi-stage LLM pipeline

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seed, siteContext, outline } = body;

    if (!seed || !seed.trim()) {
      return NextResponse.json({ error: 'Seed query/topic is required' }, { status: 400 });
    }

    const result = await runArticleFactoryPipeline(seed.trim(), siteContext, outline);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Article factory pipeline failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
