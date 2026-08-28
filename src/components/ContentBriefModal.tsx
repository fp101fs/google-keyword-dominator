'use client';

import React, { useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { X, Copy, Check, FileText, HelpCircle, Layers, Gauge } from 'lucide-react';
import { PageGraderDrawer } from './PageGraderDrawer';

interface ContentBriefModalProps {
  seed: string;
  keywords: KeywordItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ContentBriefModal: React.FC<ContentBriefModalProps> = ({
  seed,
  keywords,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGraderOpen, setIsGraderOpen] = useState(false);

  if (!isOpen) return null;

  // Primary Focus Keywords (Top 5 genuine search terms)
  const primaryKeywords = keywords.slice(0, 5);

  // STRICT 100% REAL AUTOCOMPLETE QUESTIONS ONLY:
  // Must match real question prefixes from Google Autocomplete or question-* sources.
  // Zero synthetic text, zero template prefixes added.
  const questionKeywords = keywords.filter((k) =>
    /^(how|what|why|can|is|are|which|where|does|do|should|will|who)\b/i.test(k.keyword) ||
    k.sources.some((s) => s.startsWith('question-'))
  ).slice(0, 6);

  // 100% REAL AUTOCOMPLETE H2 SUBHEADINGS:
  // Subheadings are the exact high-demand commercial/comparison queries retrieved from Google.
  const secondaryKeywords = keywords.filter((k) =>
    k.intent === 'commercial' || k.intent === 'transactional' || /(best|top|vs|guide|tips|how to|review|alternative|generator|creator)/i.test(k.keyword)
  ).slice(0, 6);

  const brief = {
    targetSeed: seed,
    totalKeywordsDiscovered: keywords.length,
    coreChecklist: primaryKeywords.map((k) => k.keyword),
    h2Queries: secondaryKeywords.map((k) => k.keyword),
    faqQueries: questionKeywords.map((k) => k.keyword),
  };

  const markdownContent = `# Content Brief: ${seed}

## Target Seed
- **Seed Keyword:** \`${brief.targetSeed}\`
- **Total Discovered Long-Tail Queries:** ${brief.totalKeywordsDiscovered}

## Primary Keywords to Include
${brief.coreChecklist.map((kw) => `- [ ] ${kw}`).join('\n')}

## Recommended H2 Subheadings (Top Commercial Search Queries)
${brief.h2Queries.map((kw) => `## ${kw}`).join('\n')}

${brief.faqQueries.length > 0 ? `## Recommended FAQs (Google Autocomplete Questions)
${brief.faqQueries.map((kw) => `### Q: ${kw}\n- *Target Query:* \`${kw}\``).join('\n\n')}` : ''}

---
*100% Real Autocomplete Data from Google Keyword Dominator (GKD)*
`;

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  1-Click SEO Content Brief
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                    Real Search Data
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Target Seed: <strong className="text-slate-800 font-semibold">{seed || 'Seed Topic'}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* Core Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Primary Keywords to Include
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {brief.coreChecklist.map((kw, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="truncate">{kw}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* H2 Subheadings (Raw Real Commercial Queries) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Recommended H2 Subheadings (Real Google Search Queries)
              </span>
              <div className="space-y-1.5">
                {brief.h2Queries.map((kw, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono">
                    ## {kw}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Questions (Raw Real Google Question Queries) */}
            {brief.faqQueries.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Recommended FAQs (Real Google Question Queries)
                </span>
                <div className="space-y-2">
                  {brief.faqQueries.map((kw, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-start gap-1.5 font-mono">
                        <span className="text-blue-600 font-black">Q:</span>
                        <span>{kw}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setIsGraderOpen(true)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>Grade Live Page (0-100 SEO)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Brief' : 'Copy Markdown'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Page Grader Drawer */}
      <PageGraderDrawer
        isOpen={isGraderOpen}
        onClose={() => setIsGraderOpen(false)}
        targetKeyword={seed}
      />
    </>
  );
};
