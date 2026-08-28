'use client';

import React, { useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { SerpOverlapMatrixData } from '@/lib/serp-overlap';
import { Grid, Sparkles, Loader2, Globe, CheckCircle2, AlertCircle, Info, Play } from 'lucide-react';

interface SerpOverlapMatrixProps {
  seed: string;
  keywords: KeywordItem[];
}

export const SerpOverlapMatrix: React.FC<SerpOverlapMatrixProps> = ({ seed, keywords }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(() =>
    keywords.slice(0, 5).map((k) => k.keyword)
  );
  const [overlapData, setOverlapData] = useState<SerpOverlapMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'url' | 'domain'>('url');

  const handleFetchMatrix = async (kwList?: string[]) => {
    const targetKeywords = kwList || selectedKeywords;
    if (targetKeywords.length < 2) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/serp-overlap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: targetKeywords,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch SERP data');
      setOverlapData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compute SERP overlap';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeywordSelection = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      if (selectedKeywords.length <= 2) return; // keep minimum 2
      const updated = selectedKeywords.filter((k) => k !== kw);
      setSelectedKeywords(updated);
    } else {
      if (selectedKeywords.length >= 8) return; // max 8
      const updated = [...selectedKeywords, kw];
      setSelectedKeywords(updated);
    }
  };

  const getHeatmapColor = (value: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'bg-slate-100 text-slate-500 font-bold';
    if (value >= 5) return 'bg-emerald-600 text-white font-black';
    if (value >= 3) return 'bg-emerald-500 text-white font-bold';
    if (value >= 2) return 'bg-emerald-100 text-emerald-900 font-bold';
    if (value === 1) return 'bg-emerald-50 text-emerald-800 font-medium';
    return 'bg-white text-slate-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              SERP Overlap Matrix
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                Rank 2 &bull; 96/100
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Live SERP ranking comparison for &quot;<strong>{seed}</strong>&quot;: discover which keywords share identical URLs and ranking domains on Google.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center gap-2">
          {overlapData && (
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('url')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Exact URL Overlap
              </button>
              <button
                onClick={() => setViewMode('domain')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'domain' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Domain Overlap
              </button>
            </div>
          )}

          <button
            onClick={() => handleFetchMatrix()}
            disabled={isLoading || selectedKeywords.length < 2}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
            <span>{overlapData ? 'Recompute Matrix' : 'Analyze Live SERPs'}</span>
          </button>
        </div>
      </div>

      {/* Select Keywords Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Selected Keywords to Compare ({selectedKeywords.length}/8):
          </span>
          <span className="text-slate-400 text-[11px]">Click pill to add/remove terms</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.slice(0, 12).map((k) => {
            const isSelected = selectedKeywords.includes(k.keyword);
            return (
              <button
                key={k.keyword}
                onClick={() => toggleKeywordSelection(k.keyword)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {k.keyword}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unanalyzed Initial State */}
      {!overlapData && !isLoading && !error && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 bg-slate-50/60 rounded-2xl border border-slate-200 text-center p-6">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-sm font-bold text-slate-800">Ready to Compute Live SERP Overlaps</h4>
            <p className="text-xs text-slate-500">
              Analyze the top 10 Google search results across your selected keywords to detect ranking overlap and avoid cannibalization.
            </p>
          </div>
          <button
            onClick={() => handleFetchMatrix()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Compute SERP Overlap Matrix</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-800">Fetching Live Top 10 Search Results via Jina Search</h4>
            <p className="text-xs text-slate-500">Cross-referencing ranking URLs across {selectedKeywords.length} terms...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Matrix Display */}
      {overlapData && !isLoading && !error && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overlap Explanation Alert */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>How to read this matrix:</strong> Numbers indicate how many search results are shared in common. If two keywords share <strong>3+ URLs (30%+)</strong>, you should target them on the <em>same page</em> to avoid keyword cannibalization.
            </p>
          </div>

          {/* NxN Grid Heatmap */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2.5 text-left border border-slate-200 bg-slate-50 min-w-[140px]">
                    Keyword Comparison
                  </th>
                  {overlapData.keywords.map((kw, i) => (
                    <th
                      key={i}
                      className="p-2.5 border border-slate-200 max-w-[120px] truncate"
                      title={kw}
                    >
                      #{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overlapData.keywords.map((kwA, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-2.5 text-left font-semibold text-slate-800 border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-400 font-mono mr-1.5">#{rowIdx + 1}</span>
                      <span className="truncate">{kwA}</span>
                    </td>
                    {overlapData.keywords.map((kwB, colIdx) => {
                      const isDiagonal = rowIdx === colIdx;
                      const count =
                        viewMode === 'url'
                          ? overlapData.matrix[rowIdx][colIdx]
                          : overlapData.domainMatrix[rowIdx][colIdx];

                      return (
                        <td
                          key={colIdx}
                          className={`p-2.5 border border-slate-200 transition-colors select-none ${getHeatmapColor(
                            count,
                            isDiagonal
                          )}`}
                        >
                          {isDiagonal ? (
                            <span className="text-[10px] uppercase font-mono">10 URLs</span>
                          ) : (
                            <span className="font-bold text-sm">{count}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Overlap Insights & Cannibalization Alerts */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Cannibalization &amp; Clustering Opportunities
            </h4>

            {overlapData.topOverlaps.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No high URL overlap found between these queries. They target distinct search intents and deserve separate landing pages.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {overlapData.topOverlaps.slice(0, 4).map((pair, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {pair.keywordA} <span className="text-slate-400">&harr;</span> {pair.keywordB}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {pair.overlapCount} Shared URLs ({pair.overlapPercentage}%)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong>Recommendation:</strong>{' '}
                      {pair.overlapCount >= 3 ? (
                        <span className="text-rose-700 font-semibold">
                          Target on 1 unified page (high SERP cannibalization risk).
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">
                          Target on separate pages with internal cross-links.
                        </span>
                      )}
                    </div>

                    {pair.sharedDomains.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">Shared Domains: {pair.sharedDomains.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
