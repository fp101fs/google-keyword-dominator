'use client';

import React, { useMemo, useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { Network, Copy, Check } from 'lucide-react';

interface VisualSearchTreeProps {
  seed: string;
  keywords: KeywordItem[];
}

export const VisualSearchTree: React.FC<VisualSearchTreeProps> = ({ seed, keywords }) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // Group keywords into meaningful intent & modifier branches
  const branches = useMemo(() => {
    const questions = keywords.filter((k) =>
      /^(how|what|why|where|when|who|which|can|is|are)/i.test(k.keyword) ||
      k.sources.some((s) => s.startsWith('question-'))
    );
    const prepositions = keywords.filter((k) =>
      /\b(for|with|without|near|to|in|on|like|under)\b/i.test(k.keyword) ||
      k.sources.some((s) => s.startsWith('prep-'))
    );
    const comparisons = keywords.filter((k) =>
      /\b(vs|best|top|or|versus|alternative|review)\b/i.test(k.keyword)
    );
    const alphabetLongTail = keywords.filter((k) =>
      !questions.includes(k) && !prepositions.includes(k) && !comparisons.includes(k)
    );

    return {
      Questions: { list: questions.slice(0, 15), color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      Prepositions: { list: prepositions.slice(0, 15), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'Comparisons & Best': { list: comparisons.slice(0, 15), color: 'bg-amber-50 text-amber-700 border-amber-200' },
      'Alphabet Variations': { list: alphabetLongTail.slice(0, 15), color: 'bg-blue-50 text-blue-700 border-blue-200' },
    };
  }, [keywords]);

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Visual Keyword Relationship Graph
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Interactive Tree
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Concentric search clusters branching out from your seed term &quot;<strong>{seed}</strong>&quot;
            </p>
          </div>
        </div>

        {/* Cluster Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCluster('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedCluster === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Clusters
          </button>
          {Object.keys(branches).map((clusterName) => (
            <button
              key={clusterName}
              onClick={() => setSelectedCluster(clusterName)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedCluster === clusterName
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {clusterName}
            </button>
          ))}
        </div>
      </div>

      {/* Radial Mindmap Container */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-inner">
        {/* Center Seed Core Node */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 border border-white/20 text-center animate-pulse">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200 block">
              Core Seed Node
            </span>
            <span className="text-lg sm:text-xl font-black text-white">{seed}</span>
          </div>
        </div>

        {/* Branch Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {Object.entries(branches).map(([clusterName, clusterData]) => {
            if (selectedCluster !== 'all' && selectedCluster !== clusterName) return null;
            return (
              <div
                key={clusterName}
                className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:bg-white/15 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      {clusterName}
                    </span>
                    <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                      {clusterData.list.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-3 max-h-60 overflow-y-auto pr-1">
                    {clusterData.list.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCopy(item.keyword)}
                        className="group flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-blue-600/30 border border-white/5 hover:border-blue-400/40 text-xs font-medium text-slate-100 transition-all cursor-pointer"
                        title="Click to copy keyword"
                      >
                        <span className="truncate mr-2">{item.keyword}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-blue-300 font-mono">
                            {item.apFormatted}
                          </span>
                          {copiedKeyword === item.keyword ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/40 group-hover:text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-white/50 text-center pt-2">
                  Click any node to copy
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
