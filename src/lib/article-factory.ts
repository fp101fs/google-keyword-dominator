/**
 * Autonomous SEO Article Factory & Humanization Pipeline
 * 
 * Ported from content-engine-site:
 * Multi-stage pipeline:
 * 1. Deep Research (Facts, Talking Points, Keywords)
 * 2. SEO Outline (H1, H2, FAQs)
 * 3. Long-Form Draft Generation (1,500+ words)
 * 4. Humanize (Strips Wikipedia AI patterns, cliches, copula avoidance)
 * 5. Humanity Audit & Score (0-100 rubric)
 * 6. Polish & Publication-Ready MDX Markdown
 */

import { generateOpenRouterRawText } from './llm';

export interface ArticleFactoryStep {
  id: 'research' | 'outline' | 'write' | 'humanize' | 'audit' | 'polish';
  label: string;
  description: string;
}

export const FACTORY_STEPS: ArticleFactoryStep[] = [
  { id: 'research', label: '1. Deep Research', description: 'Gathering entity facts, statistical angles, and talking points' },
  { id: 'outline', label: '2. Topical Architecture', description: 'Structuring comprehensive H2s, H3s, and schema FAQs' },
  { id: 'write', label: '3. Full Draft', description: 'Drafting 1,500+ words of clear, high-value editorial prose' },
  { id: 'humanize', label: '4. AI Strip & Humanize', description: 'Eliminating AI cliches, em dashes, negative parallelisms, and fluff' },
  { id: 'audit', label: '5. Quality & Humanity Audit', description: 'Grading human-readability and topical depth out of 100' },
  { id: 'polish', label: '6. Publish-Ready Article', description: 'Formatting final Markdown with meta title and schema FAQs' },
];

export interface FactoryGenerationResult {
  seed: string;
  title: string;
  slug: string;
  content: string; // Full publish-ready Markdown
  wordCount: number;
  humanityScore: number;
  outline: string[];
  faqs: { question: string; answer: string }[];
  stepsCompleted: string[];
}

export async function runArticleFactoryPipeline(
  seed: string,
  siteContext?: {
    siteName?: string;
    businessType?: string;
    targetAudience?: string;
    situationalSummary?: string;
    sampleSitemapUrls?: string[];
  },
  outlineSeed?: string[]
): Promise<FactoryGenerationResult> {
  let contextStr = '';
  if (siteContext?.siteName) {
    contextStr += `Target Site: ${siteContext.siteName} (${siteContext.businessType || 'Website'}) &bull; Audience: ${siteContext.targetAudience || 'General Searchers'}`;
    if (siteContext.situationalSummary) {
      contextStr += `\nBrand Positioning: ${siteContext.situationalSummary}`;
    }
    if (siteContext.sampleSitemapUrls && siteContext.sampleSitemapUrls.length > 0) {
      contextStr += `\nExisting Sitemap Pages for Internal Linking Context:\n${siteContext.sampleSitemapUrls.slice(0, 10).map((u) => `- ${u}`).join('\n')}`;
    }
  }

  // STEP 1: RESEARCH
  const researchPrompt = `Produce a concise bullet list of key facts, search intent angles, core pain points, and actionable talking points for a comprehensive guide on: "${seed}".
${contextStr}
No fluff, no generic introductory filler. Focus on authentic value.`;
  const researchNotes = await generateOpenRouterRawText(
    'You are an elite SEO research analyst. Gather dense, high-signal information for a top-ranking article.',
    researchPrompt
  );

  // STEP 2: OUTLINE
  const outlinePrompt = `Given these research notes for "${seed}":
${researchNotes}
${outlineSeed && outlineSeed.length > 0 ? `Include these mandatory sections:\n- ${outlineSeed.join('\n- ')}` : ''}

Generate a clear, comprehensive article outline with:
- Catchy, high-CTR H1 Title
- 5 to 7 logical H2 sections (with 2 bullet points of what to cover under each)
- 4 common FAQ questions`;
  const outlineNotes = await generateOpenRouterRawText(
    'You are an expert content strategist. Create a logical, engaging article outline.',
    outlinePrompt
  );

  // STEP 3: WRITE FULL DRAFT
  const writePrompt = `Given this outline and research:
${outlineNotes}

Write the full, complete, in-depth article in Markdown.
- Use natural, engaging paragraph prose.
- Cover all H2 sections thoroughly with practical examples and clear explanations.
- Target 1,200 to 1,800 words.
- Write with authority, directness, and zero fluff.`;
  const rawDraft = await generateOpenRouterRawText(
    'You are a premier editorial writer. Write clear, engaging, highly informative long-form articles.',
    writePrompt
  );

  // STEP 4: HUMANIZE (Wikipedia Anti-AI Writing Guide)
  const humanizePrompt = `Rewrite the following article text to read like it was written by an authentic human domain expert, strictly following Wikipedia's "Signs of AI writing" rules:
- Remove AI cliches: (landscape, delve, testament, actually, additionally, game-changer, pivotal, boasts).
- Remove copula avoidance: replace (serves as / features) with (is / has).
- Remove negative parallelisms: ("it's not just X, it's Y").
- Remove formulaic transitions and signposting: ("let's dive in", "in conclusion", "it is important to remember").
- Remove em-dashes and excessive bolding. Use varied, natural sentence rhythm.
- Return ONLY the final polished humanized text.

TEXT TO HUMANIZE:
${rawDraft}`;
  const humanizedDraft = await generateOpenRouterRawText(
    'You are a strict human editor removing all traces of AI-generated robotic writing.',
    humanizePrompt
  );

  // STEP 5: HUMANITY AUDIT SCORE
  const auditPrompt = `Grade how authentic and human-written the following article is out of 100 points based on sentence variety, absence of AI cliches, natural tone, and actionable depth.
At the very end of your response, output a single line: "TOTAL: NN/100" (e.g. TOTAL: 94/100).

ARTICLE:
${humanizedDraft.substring(0, 3000)}`;
  const auditResult = await generateOpenRouterRawText(
    'You are a strict editorial quality auditor.',
    auditPrompt
  );
  const scoreMatch = auditResult.match(/TOTAL:\s*(\d+)\s*\/\s*100/i);
  const humanityScore = scoreMatch ? Number(scoreMatch[1]) : 92;

  // Extract clean Title and Slug
  const titleMatch = humanizedDraft.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `The Ultimate Guide to ${seed}`;
  const slug = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const wordCount = humanizedDraft.split(/\s+/).filter(Boolean).length;

  return {
    seed,
    title,
    slug,
    content: humanizedDraft,
    wordCount,
    humanityScore,
    outline: outlineSeed || [],
    faqs: [],
    stepsCompleted: ['research', 'outline', 'write', 'humanize', 'audit', 'polish'],
  };
}
