'use client';

import React, { useMemo, useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { LayoutGrid, Copy, Check, Info } from 'lucide-react';

interface TreemapOpportunityProps {
  seed: string;
  keywords: KeywordItem[];
}

interface TreemapBlock {
  name: string;
  intent: string;
  count: number;
  avgScore: number;
  percentage: number;
  badgeClass: string;
  gradient: string;
  keywords: KeywordItem[];
}

export const TreemapOpportunity: React.FC<TreemapOpportunityProps> = ({ seed, keywords }) => {
  const [selectedBlock, setSelectedBlock] = useState<TreemapBlock | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const blocks = useMemo((): TreemapBlock[] => {
    const map = new Map<string, { items: KeywordItem[]; intent: string }>();

    keywords.forEach((k) => {
      let groupName = 'General Long-Tail';
      const kw = k.keyword.toLowerCase();

      if (k.intent === 'transactional' || /\b(buy|price|cost|cheap|deal|shop|discount|order)\b/i.test(kw)) {
        groupName = 'Buyer & Transactional';
      } else if (/\b(how to|guide|tutorial|steps|diy)\b/i.test(kw)) {
        groupName = 'How-To & Guides';
      } else if (/\b(best|top|recommended|highest rated)\b/i.test(kw)) {
        groupName = 'Best & Comparison Lists';
      } else if (/\b(vs|or|versus|alternative)\b/i.test(kw)) {
        groupName = 'Vs & Alternatives';
      } else if (/\b(for|with|without|in|near me)\b/i.test(kw)) {
        groupName = 'Context & Prepositions';
      } else if (/\b(what|why|where|who|when|can|is)\b/i.test(kw)) {
        groupName = 'Questions & Answers';
      }

      if (!map.has(groupName)) {
        map.set(groupName, { items: [], intent: k.intent });
      }
      map.get(groupName)!.items.push(k);
    });

    const gradients: Record<string, { gradient: string; badge: string }> = {
      'Buyer & Transactional': { gradient: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600', badge: 'bg-emerald-100 text-emerald-800' },
      'Best & Comparison Lists': { gradient: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600', badge: 'bg-amber-100 text-amber-800' },
      'How-To & Guides': { gradient: 'from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600', badge: 'bg-blue-100 text-blue-800' },
      'Vs & Alternatives': { gradient: 'from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600', badge: 'bg-purple-100 text-purple-800' },
      'Context & Prepositions': { gradient: 'from-pink-600 to-rose-700 hover:from-pink-500 hover:to-rose-600', badge: 'bg-pink-100 text-pink-800' },
      'Questions & Answers': { gradient: 'from-indigo-600 to-blue-800 hover:from-indigo-500 hover:to-blue-700', badge: 'bg-indigo-100 text-indigo-800' },
      'General Long-Tail': { gradient: 'from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700', badge: 'bg-slate-100 text-slate-800' },
    };

    const totalKw = Math.max(1, keywords.length);
    const list: TreemapBlock[] = [];

    map.forEach((data, name) => {
      const avgScore = Number((data.items.reduce((acc, i) => acc + i.relativeScore, 0) / data.items.length).toFixed(1));
      const percentage = Number(((data.items.length / totalKw) * 100).toFixed(1));
      const styling = gradients[name] || gradients['General Long-Tail'];

      list.push({
        name,
        intent: data.intent,
        count: data.items.length,
        avgScore,
        percentage,
        badgeClass: styling.badge,
        gradient: styling.gradient,
        keywords: data.items.sort((a, b) => b.relativeScore - a.relativeScore),
      });
    });

    return list.sort((a, b) => b.count - a.count);
  }, [keywords]);

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Topic Opportunity Treemap
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Market Share Layout
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Proportional topic market share for &quot;<strong>{seed}</strong>&quot;. Blocks represent search opportunity size by keyword volume.
            </p>
          </div>
        </div>

        {selectedBlock && (
          <button
            onClick={() => setSelectedBlock(null)}
            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            &larr; View Full Treemap
          </button>
        )}
      </div>

      {/* Explanation */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>How to read the Treemap:</strong> Larger rectangles represent higher concentrations of keyword variations. Click any block to drill down into its top-ranking long-tail keywords.
        </p>
      </div>

      {/* Main Treemap Grid Layout */}
      {!selectedBlock ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[360px]">
          {blocks.map((block, idx) => {
            // Span configuration based on ranking size
            const colSpan = idx === 0 ? 'md:col-span-2 lg:col-span-3' : idx === 1 ? 'md:col-span-1 lg:col-span-3' : idx === 2 ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-2';

            return (
              <div
                key={block.name}
                onClick={() => setSelectedBlock(block)}
                className={`${colSpan} bg-gradient-to-br ${block.gradient} rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer select-none border border-white/10 group min-h-[140px]`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white/80 block">
                      {block.percentage}% of Topic Space
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {block.name}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 text-white">
                    {block.count} kw
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/15 text-xs text-white/90">
                  <span>Avg Relative Score: <strong className="text-white">{block.avgScore}%</strong></span>
                  <span className="text-[11px] font-bold underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect Keywords &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Focused Block View */
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block">
                Selected Topic Segment
              </span>
              <h4 className="text-xl font-black text-white">{selectedBlock.name}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                {selectedBlock.count} Keywords ({selectedBlock.percentage}%)
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-300">
                Avg Score: {selectedBlock.avgScore}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {selectedBlock.keywords.map((kw, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(kw.keyword)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer group"
              >
                <span className="truncate mr-2 font-semibold text-slate-100">{kw.keyword}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-blue-200 font-mono">
                    AP: {kw.apFormatted}
                  </span>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-bold text-emerald-300">
                    {kw.relativeScore}
                  </span>
                  {copiedKeyword === kw.keyword ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
