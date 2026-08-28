import { NextRequest, NextResponse } from 'next/server';
import { generateOpenRouterRawText } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step, seed, input, siteContext, outline } = body;

    if (!step) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    let systemPrompt = 'You are an expert editorial writer and SEO strategist.';
    let userPrompt = input || '';

    const contextStr = siteContext?.siteName
      ? `Target Site: ${siteContext.siteName} (${siteContext.businessType || 'Website'}) &bull; Audience: ${siteContext.targetAudience || 'General Audience'}`
      : '';

    switch (step) {
      case 'research':
        systemPrompt = 'You are an elite SEO research analyst. Gather dense, high-signal information for a top-ranking article.';
        userPrompt = `Produce a concise bullet list of key facts, search intent angles, core pain points, and actionable talking points for a comprehensive guide on: "${seed}".
${contextStr}
No fluff, no generic introductory filler. Focus on authentic value.`;
        break;

      case 'outline':
        systemPrompt = 'You are an expert content strategist. Create a logical, engaging article outline.';
        userPrompt = `Given these research notes for "${seed}":
${input}
${outline && outline.length > 0 ? `Include these mandatory sections:\n- ${outline.join('\n- ')}` : ''}

Generate a clear, comprehensive article outline with:
- Catchy, high-CTR H1 Title
- 5 to 7 logical H2 sections (with 2 bullet points of what to cover under each)
- 4 common FAQ questions`;
        break;

      case 'write':
        systemPrompt = 'You are a premier editorial writer. Write clear, engaging, highly informative long-form articles.';
        userPrompt = `Given this outline and research:
${input}

Write the full, complete, in-depth article in Markdown.
- Use natural, engaging paragraph prose.
- Cover all H2 sections thoroughly with practical examples and clear explanations.
- Target 1,200 to 1,800 words.
- Write with authority, directness, and zero fluff.`;
        break;

      case 'humanize':
        systemPrompt = 'You are a strict human editor removing all traces of AI-generated robotic writing.';
        userPrompt = `Rewrite the following article text to read like it was written by an authentic human domain expert, strictly following Wikipedia's "Signs of AI writing" rules:
- Remove AI cliches: (landscape, delve, testament, actually, additionally, game-changer, pivotal, boasts).
- Remove copula avoidance: replace (serves as / features) with (is / has).
- Remove negative parallelisms: ("it's not just X, it's Y").
- Remove formulaic transitions and signposting: ("let's dive in", "in conclusion", "it is important to remember").
- Remove em-dashes and excessive bolding. Use varied, natural sentence rhythm.
- Return ONLY the final polished humanized text.

TEXT TO HUMANIZE:
${input}`;
        break;

      case 'audit':
        systemPrompt = 'You are a strict editorial quality auditor.';
        userPrompt = `Grade how authentic and human-written the following article is out of 100 points based on sentence variety, absence of AI cliches, natural tone, and actionable depth.
At the very end of your response, output a single line: "TOTAL: NN/100" (e.g. TOTAL: 94/100).

ARTICLE:
${(input || '').substring(0, 3000)}`;
        break;

      case 'polish':
        systemPrompt = 'You are an expert copy editor formatting final markdown.';
        userPrompt = `Given this humanized article:
${input}

Format it cleanly with the # Title on line 1, followed by clean H2 sections and structured FAQ schema blocks if applicable. Return only the final markdown.`;
        break;
    }

    const outputText = await generateOpenRouterRawText(systemPrompt, userPrompt, step === 'write' ? 0.4 : 0.2);

    if (!outputText) {
      throw new Error(`The AI model produced no text for step: ${step}. Please verify your OpenRouter credits/API key.`);
    }

    return NextResponse.json({
      success: true,
      step,
      outputText,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Step generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
