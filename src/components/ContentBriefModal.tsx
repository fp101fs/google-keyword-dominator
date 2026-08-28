'use client';

import React, { useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { generateContentBrief, ContentBrief } from '@/lib/content-brief';
import { Copy, Check, X, Sparkles, BookOpen, Layers } from 'lucide-react';

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

  if (!isOpen) return null;

  const brief: ContentBrief = generateContentBrief(seed, keywords);

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(brief.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Programmatic SEO Content Brief
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  1-Click Outline
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Generated from top real autocomplete suggestions for &quot;<strong>{seed}</strong>&quot;
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Target Title & H1 */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Recommended Article Title / H1
            </span>
            <h4 className="text-base font-extrabold text-slate-900">
              {brief.recommendedH1}
            </h4>
          </div>

          {/* Primary & Secondary Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Primary Target Keywords
              </span>
              <ul className="space-y-1 text-xs">
                {brief.primaryKeywords.map((kw, i) => (
                  <li key={i} className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    {kw}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Secondary Long-Tail Terms
              </span>
              <ul className="space-y-1 text-xs max-h-32 overflow-y-auto">
                {brief.secondaryKeywords.map((kw, i) => (
                  <li key={i} className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    {kw}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Structure / Outline */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Proposed H2 Section Architecture
            </span>
            <div className="space-y-2">
              {brief.recommendedH2s.map((h2, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>H2 [{i + 1}]: {h2}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Questions */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Recommended FAQs (Schema Markup Ready)
            </span>
            <div className="space-y-2">
              {brief.faqSection.map((faq, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-1">
                  <div className="font-bold text-indigo-700">Q: {faq.question}</div>
                  <div className="text-[11px] text-slate-500">Targeting query: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{faq.targetKeyword}</code></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            Markdown format compatible with Notion, Docs, &amp; ChatGPT
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Markdown Brief</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
