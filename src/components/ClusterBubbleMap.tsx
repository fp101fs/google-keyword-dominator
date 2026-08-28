'use client';

import React, { useMemo, useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { CircleDot, ZoomIn, Copy, Check } from 'lucide-react';

interface ClusterBubbleMapProps {
  seed: string;
  keywords: KeywordItem[];
}

interface ClusterGroup {
  id: string;
  label: string;
  count: number;
  avgScore: number;
  color: string;
  badgeClass: string;
  keywords: KeywordItem[];
}

export const ClusterBubbleMap: React.FC<ClusterBubbleMapProps> = ({ seed, keywords }) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  // Group keywords into semantic clusters based on Intent & Modifier roots
  const clusters = useMemo(() => {
    const map = new Map<string, KeywordItem[]>();

    keywords.forEach((k) => {
      let clusterKey = 'General & Broad';
      const kw = k.keyword.toLowerCase();

      if (k.intent === 'transactional' || /\b(buy|price|cost|cheap|deal|shop)\b/i.test(kw)) {
        clusterKey = 'Buyer & Transactional Intent';
      } else if (/\b(how to|guide|tutorial|steps|diy)\b/i.test(kw)) {
        clusterKey = 'How-To & Guides';
      } else if (/\b(best|top|recommended|highest rated)\b/i.test(kw)) {
        clusterKey = 'Best & Top Lists';
      } else if (/\b(vs|or|versus|comparison|alternative)\b/i.test(kw)) {
        clusterKey = 'Comparisons & Alternatives';
      } else if (/\b(for|with|without|in|near me)\b/i.test(kw)) {
        clusterKey = 'Context & Prepositions';
      } else if (/\b(what|why|where|who|when|can|is)\b/i.test(kw)) {
        clusterKey = 'Questions & Explanations';
      } else if (k.intent === 'informational') {
        clusterKey = 'Informational Discovery';
      }

      if (!map.has(clusterKey)) {
        map.set(clusterKey, []);
      }
      map.get(clusterKey)!.push(k);
    });

    const colors: Record<string, { color: string; badge: string }> = {
      'Buyer & Transactional Intent': { color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'Best & Top Lists': { color: 'from-amber-500 to-orange-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
      'How-To & Guides': { color: 'from-blue-500 to-cyan-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
      'Comparisons & Alternatives': { color: 'from-purple-500 to-indigo-600', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
      'Context & Prepositions': { color: 'from-pink-500 to-rose-600', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
      'Questions & Explanations': { color: 'from-indigo-500 to-blue-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      'Informational Discovery': { color: 'from-sky-500 to-blue-600', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
      'General & Broad': { color: 'from-slate-600 to-slate-800', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
    };

    const groupList: ClusterGroup[] = [];
    map.forEach((items, label) => {
      const avgScore = Number((items.reduce((acc, i) => acc + i.relativeScore, 0) / items.length).toFixed(1));
      const styling = colors[label] || colors['General & Broad'];
      groupList.push({
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        count: items.length,
        avgScore,
        color: styling.color,
        badgeClass: styling.badge,
        keywords: items.sort((a, b) => b.relativeScore - a.relativeScore),
      });
    });

    return groupList.sort((a, b) => b.count - a.count);
  }, [keywords]);

  const activeCluster = useMemo(() => {
    if (!selectedClusterId) return null;
    return clusters.find((c) => c.id === selectedClusterId) || null;
  }, [selectedClusterId, clusters]);

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
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <CircleDot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Topical Cluster Bubble Map
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                Interactive Groupings
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive bubbles sized by volume of keywords discovered for &quot;<strong>{seed}</strong>&quot;. Click any bubble to inspect and copy terms.
            </p>
          </div>
        </div>

        {selectedClusterId && (
          <button
            onClick={() => setSelectedClusterId(null)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            &larr; View All Bubbles
          </button>
        )}
      </div>

      {/* Bubble Canvas */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 min-h-[380px] flex flex-col justify-center relative overflow-hidden shadow-inner">
        {!activeCluster ? (
          /* All Bubbles Grid / Canvas */
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
            {clusters.map((cluster) => {
              // Calculate scale based on keyword count (min 110px, max 200px)
              const maxCount = Math.max(1, ...clusters.map((c) => c.count));
              const size = Math.round(110 + (cluster.count / maxCount) * 80);

              return (
                <div
                  key={cluster.id}
                  onClick={() => setSelectedClusterId(cluster.id)}
                  style={{ width: `${size}px`, height: `${size}px` }}
                  className={`bg-gradient-to-tr ${cluster.color} rounded-full flex flex-col items-center justify-center p-3 text-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/20 hover:border-white select-none relative group`}
                >
                  <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5 text-white/80" />
                  </div>
                  <span className="text-[11px] font-extrabold tracking-tight leading-tight line-clamp-2 drop-shadow-sm px-1">
                    {cluster.label}
                  </span>
                  <span className="text-xl font-black mt-1 drop-shadow">
                    {cluster.count}
                  </span>
                  <span className="text-[9px] text-white/80 font-medium mt-0.5">
                    Score: {cluster.avgScore}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Zoomed In Cluster View */
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-purple-300 block">
                  Focused Cluster
                </span>
                <h4 className="text-xl font-black text-white">{activeCluster.label}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-white/10 text-white rounded-full">
                  {activeCluster.count} keywords
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-white/10 text-purple-200 rounded-full">
                  Avg Score: {activeCluster.avgScore}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {activeCluster.keywords.map((kw, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(kw.keyword)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer group"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-100">{kw.keyword}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-blue-200 font-mono">
                      AP: {kw.apFormatted}
                    </span>
                    <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-bold text-amber-300">
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
    </div>
  );
};
