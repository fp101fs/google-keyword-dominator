import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/gsc/google-auth';
import { getGscPropertySnapshot } from '@/lib/gsc/gsc-service';
import { getGscDemoSnapshot } from '@/lib/gsc/demo-data';
import { computeGscGapOpportunities } from '@/lib/intelligence/gap-engine';
import { generateLlmGapAction } from '@/lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteUrl, isDemo, country = 'US', language = 'en' } = body;

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

    const opportunities = await computeGscGapOpportunities(
      snapshot.queries || [],
      snapshot.pages || [],
      country,
      language
    );

    // Enhance top 3 opportunities with LLM strategic recommendations
    const enhancedOpportunities = await Promise.all(
      opportunities.map(async (op, idx) => {
        if (idx < 3) {
          const llmAction = await generateLlmGapAction(
            op.query,
            op.tierLabel,
            op.position > 0 ? { position: op.position, impressions: op.impressions } : undefined
          );
          if (llmAction) {
            return {
              ...op,
              recommendedAction: llmAction.actionDescription,
            };
          }
        }
        return op;
      })
    );

    return NextResponse.json({
      success: true,
      property: snapshot.property,
      totalGscQueries: snapshot.queries.length,
      opportunities: enhancedOpportunities,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze GSC gaps';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
