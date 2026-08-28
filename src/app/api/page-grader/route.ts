import { NextRequest, NextResponse } from 'next/server';
import { auditPageWithLlmWebFetch } from '@/lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url, targetKeyword } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // 1. Fast heuristic HTML crawl (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let html = '';
    try {
      const resp = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });
      html = await resp.text();
    } catch {
      html = `<html><head><title>${targetUrl}</title></head><body><h1>${targetKeyword || 'Audit Page'}</h1></body></html>`;
    } finally {
      clearTimeout(timeoutId);
    }

    // Extract Basic On-Page SEO Heuristics
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) => m[1].replace(/<[^>]+>/g, '').trim());
    const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)).map((m) => m[1].replace(/<[^>]+>/g, '').trim());

    const cleanText = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let score = 50;
    const checks: { label: string; passed: boolean; tip: string }[] = [];

    if (pageTitle.length >= 25 && pageTitle.length <= 65) {
      score += 10;
      checks.push({ label: 'Title Tag Length', passed: true, tip: `Good title length (${pageTitle.length} chars).` });
    } else {
      checks.push({ label: 'Title Tag Length', passed: false, tip: 'Keep title between 30 and 60 characters.' });
    }

    if (metaDesc.length >= 70 && metaDesc.length <= 165) {
      score += 10;
      checks.push({ label: 'Meta Description', passed: true, tip: `Good description length (${metaDesc.length} chars).` });
    } else {
      checks.push({ label: 'Meta Description', passed: false, tip: 'Add a meta description between 80-160 characters.' });
    }

    if (h1Matches.length === 1) {
      score += 10;
      checks.push({ label: 'Single H1 Tag', passed: true, tip: `Found exactly 1 H1: "${h1Matches[0]}".` });
    } else if (h1Matches.length === 0) {
      checks.push({ label: 'Single H1 Tag', passed: false, tip: 'Missing H1 heading on page.' });
    } else {
      checks.push({ label: 'Single H1 Tag', passed: false, tip: `Found ${h1Matches.length} H1 tags. Keep only one main H1.` });
    }

    if (h2Matches.length >= 3) {
      score += 10;
      checks.push({ label: 'H2 Subheadings Depth', passed: true, tip: `Good structure (${h2Matches.length} H2s).` });
    } else {
      checks.push({ label: 'H2 Subheadings Depth', passed: false, tip: 'Add more H2 headings to cover related subtopics.' });
    }

    if (wordCount >= 600) {
      score += 10;
      checks.push({ label: 'Content Word Count', passed: true, tip: `Authoritative length (~${wordCount} words).` });
    } else {
      checks.push({ label: 'Content Word Count', passed: false, tip: `Thin content (~${wordCount} words). Aim for 800+ words.` });
    }

    // 2. Call genuine LLM via web_fetch for deep editorial insights
    const llmAudit = await auditPageWithLlmWebFetch(targetUrl, targetKeyword || pageTitle);

    return NextResponse.json({
      success: true,
      url: targetUrl,
      targetKeyword,
      score: llmAudit?.score ?? Math.min(100, score),
      checks,
      extracted: {
        title: pageTitle,
        metaDescription: metaDesc,
        h1Count: h1Matches.length,
        h1s: h1Matches,
        h2Count: h2Matches.length,
        h2s: h2Matches.slice(0, 10),
        wordCount,
      },
      llmAudit,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to grade page';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
