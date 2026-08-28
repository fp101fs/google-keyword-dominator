'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { ExportButton } from './ExportButton';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  FileText,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import { INTENT_DEFINITIONS } from '@/lib/intent';
import { GscConnectedSnapshot } from '@/lib/gsc/types';

interface KeywordTableProps {
  seed: string;
  keywords: KeywordItem[];
  country: string;
  language: string;
  totalBeforeFiltering: number;
  onOpenContentBrief?: () => void;
  onOpenContentGap?: () => void;
  onInspectSerp?: (keyword: KeywordItem) => void;
  gscSnapshot?: GscConnectedSnapshot | null;
  onOpenGscModal?: () => void;
  onGenerateBriefForKeyword?: (keyword: string) => void;
}

type SortField = 'keyword' | 'seedKeyword' | 'source' | 'country' | 'ap' | 'diff' | 'hot' | 'relativeScore' | 'intent' | 'wordCount' | 'gscPos';
type SortDirection = 'asc' | 'desc';

export const KeywordTable: React.FC<KeywordTableProps> = ({
  seed,
  keywords,
  country,
  language,
  totalBeforeFiltering,
  onOpenContentBrief,
  onOpenContentGap,
  onInspectSerp,
  gscSnapshot,
  onOpenGscModal,
  onGenerateBriefForKeyword,
}) => {
  const [sortField, setSortField] = useState<SortField>('relativeScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Map GSC performance queries for 1-click lookup
  const gscMap = useMemo(() => {
    const map = new Map<string, { position: number; impressions: number; clicks: number; isStriking?: boolean }>();
    if (!gscSnapshot) return map;
    gscSnapshot.queries.forEach((q) => {
      map.set(q.query.toLowerCase().trim(), {
        position: q.position,
        impressions: q.impressions,
        clicks: q.clicks,
        isStriking: q.isStrikingDistance,
      });
    });
    return map;
  }, [gscSnapshot]);

  const toggleTooltip = (col: string) => {
    setActiveTooltip(activeTooltip === col ? null : col);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'keyword' || field === 'source' || field === 'country' ? 'asc' : 'desc');
    }
  };

  const sortedKeywords = useMemo(() => {
    return [...keywords].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'gscPos') {
        const posA = gscMap.get(a.keyword.toLowerCase().trim())?.position || 999;
        const posB = gscMap.get(b.keyword.toLowerCase().trim())?.position || 999;
        comparison = posA - posB;
      } else if (sortField === 'keyword' || sortField === 'seedKeyword' || sortField === 'source' || sortField === 'country' || sortField === 'intent') {
        comparison = (a[sortField] || '').localeCompare(b[sortField] || '');
      } else if (sortField === 'diff') {
        const diffWeight = { Low: 1, Med: 2, High: 3 };
        comparison = diffWeight[a.diff] - diffWeight[b.diff];
      } else if (sortField === 'hot') {
        const hotWeight = { 'Hottest keyword': 3, 'Hot keyword': 2, Trending: 1, '-': 0 };
        comparison = hotWeight[a.hot] - hotWeight[b.hot];
      } else {
        comparison = a[sortField] - b[sortField];
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [keywords, sortField, sortDirection, gscMap]);

  const copyRow = async (kw: string, index: number) => {
    await navigator.clipboard.writeText(kw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'Low':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Low</span>;
      case 'Med':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Med</span>;
      case 'High':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">High</span>;
      default:
        return null;
    }
  };

  const getHotBadge = (hot: string) => {
    switch (hot) {
      case 'Hottest keyword':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs">🔥 Hottest</span>;
      case 'Hot keyword':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">Hot</span>;
      case 'Trending':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Trending</span>;
      default:
        return <span className="text-slate-300">-</span>;
    }
  };

  const getIntentBadge = (intent: string) => {
    const def = INTENT_DEFINITIONS[intent as keyof typeof INTENT_DEFINITIONS];
    if (!def) return null;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${def.badgeClass}`}
        title={def.description}
      >
        {def.label}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <span>Keywords Explorer</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {sortedKeywords.length} results
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {sortedKeywords.length} of {totalBeforeFiltering} discovered autocomplete variations
          </p>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenContentGap && (
            <button
              onClick={onOpenContentGap}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Content Gap</span>
            </button>
          )}

          {onOpenGscModal && (
            <button
              onClick={onOpenGscModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>GSC Striking Distance</span>
            </button>
          )}

          {onOpenContentBrief && (
            <button
              onClick={onOpenContentBrief}
              disabled={keywords.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Brief</span>
            </button>
          )}

          <ExportButton
            seed={seed}
            keywords={sortedKeywords}
            country={country}
            language={language}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[920px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* Keyword */}
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors w-auto"
                onClick={() => handleSort('keyword')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Keyword</span>
                  {sortField === 'keyword' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>

              {/* Real GSC Ranking Position */}
              {gscSnapshot && (
                <th
                  className="py-3 px-2 cursor-pointer hover:text-emerald-700 transition-colors w-24 text-center bg-emerald-50/60 text-emerald-900"
                  onClick={() => handleSort('gscPos')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Your GSC</span>
                    {sortField === 'gscPos' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500 opacity-50" />
                    )}
                  </div>
                </th>
              )}

              {/* Intent */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-28 text-center"
                onClick={() => handleSort('intent')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Intent</span>
                </div>
              </th>

              {/* Source */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-20 text-center"
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Source</span>
                </div>
              </th>

              {/* Country */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-16 text-center"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Country</span>
                </div>
              </th>

              {/* AP Rank */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-20 text-center"
                onClick={() => handleSort('ap')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>AP Rank</span>
                </div>
              </th>

              {/* Diff */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-18 text-center"
                onClick={() => handleSort('diff')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Diff</span>
                </div>
              </th>

              {/* Hot */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-20 text-center"
                onClick={() => handleSort('hot')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Hot</span>
                </div>
              </th>

              {/* Score */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-20 text-right"
                onClick={() => handleSort('relativeScore')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Score</span>
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-3 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedKeywords.map((item, idx) => {
              const gscData = gscMap.get(item.keyword.toLowerCase().trim());

              return (
                <tr
                  key={`${item.keyword}-${idx}`}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {/* Keyword */}
                  <td className="py-3 px-4 font-semibold text-slate-900 break-words">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{item.keyword}</span>
                      {gscData?.isStriking && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                          Page 2
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Real GSC Rank Position */}
                  {gscSnapshot && (
                    <td className="py-3 px-2 text-center text-xs font-mono font-bold bg-emerald-50/30">
                      {gscData ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-black ${
                              gscData.position <= 10
                                ? 'text-emerald-700'
                                : gscData.position <= 20
                                ? 'text-blue-700'
                                : 'text-slate-600'
                            }`}
                          >
                            #{gscData.position.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {gscData.impressions} imp
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  )}

                  {/* Intent */}
                  <td className="py-3 px-2 text-center">
                    {getIntentBadge(item.intent)}
                  </td>

                  {/* Source */}
                  <td className="py-3 px-2 text-center">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-medium text-[10px] text-slate-700 truncate max-w-full">
                      {item.source}
                    </span>
                  </td>

                  {/* Country */}
                  <td className="py-3 px-2 text-xs text-slate-600 text-center font-bold">
                    {item.country}
                  </td>

                  {/* AP */}
                  <td className="py-3 px-2 text-xs text-slate-700 font-bold text-center">
                    <span className={item.ap <= 3 ? 'text-blue-600 font-black' : ''}>
                      {item.apFormatted}
                    </span>
                  </td>

                  {/* Diff */}
                  <td className="py-3 px-2 text-center">
                    {getDiffBadge(item.diff)}
                  </td>

                  {/* Hot */}
                  <td className="py-3 px-2 text-center">
                    {getHotBadge(item.hot)}
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 text-right font-black text-slate-800 text-xs">
                    {item.relativeScore}
                  </td>

                  {/* Actions & Hover Micro-Actions (#5) */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onGenerateBriefForKeyword && (
                        <button
                          onClick={() => onGenerateBriefForKeyword(item.keyword)}
                          title="Generate 1-Click Content Brief"
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onInspectSerp && (
                        <button
                          onClick={() => onInspectSerp(item)}
                          title="Inspect Live SERP Overview"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => copyRow(item.keyword, idx)}
                        title="Copy keyword"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
