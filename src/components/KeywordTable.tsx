'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { ExportButton } from './ExportButton';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, HelpCircle, Copy, Check, FileText, Search, Target, TrendingUp } from 'lucide-react';
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
      setSortDirection(field === 'keyword' || field === 'source' ? 'asc' : 'desc');
    }
  };

  const sortedKeywords = useMemo(() => {
    const list = [...keywords];
    const diffOrder = { High: 3, Med: 2, Low: 1 };
    const hotOrder = { 'Hottest keyword': 4, 'Hot keyword': 3, Trending: 2, '-': 1 };

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'keyword') {
        comparison = a.keyword.localeCompare(b.keyword);
      } else if (sortField === 'seedKeyword') {
        comparison = a.seedKeyword.localeCompare(b.seedKeyword);
      } else if (sortField === 'source') {
        comparison = a.source.localeCompare(b.source);
      } else if (sortField === 'country') {
        comparison = a.country.localeCompare(b.country);
      } else if (sortField === 'ap') {
        comparison = a.ap - b.ap;
      } else if (sortField === 'diff') {
        comparison = diffOrder[a.diff] - diffOrder[b.diff];
      } else if (sortField === 'hot') {
        comparison = hotOrder[a.hot] - hotOrder[b.hot];
      } else if (sortField === 'intent') {
        comparison = a.intent.localeCompare(b.intent);
      } else if (sortField === 'relativeScore') {
        comparison = a.relativeScore - b.relativeScore;
      } else if (sortField === 'wordCount') {
        comparison = a.wordCount - b.wordCount;
      } else if (sortField === 'gscPos') {
        const posA = gscMap.get(a.keyword.toLowerCase().trim())?.position || 999;
        const posB = gscMap.get(b.keyword.toLowerCase().trim())?.position || 999;
        comparison = posA - posB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [keywords, sortField, sortDirection, gscMap]);

  const copyRow = async (kw: string, index: number) => {
    await navigator.clipboard.writeText(kw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'High':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'Med':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Med</span>;
      case 'Low':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Low</span>;
      default:
        return <span>{diff}</span>;
    }
  };

  const getHotBadge = (hot: string) => {
    switch (hot) {
      case 'Hottest keyword':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800">Hottest</span>;
      case 'Hot keyword':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Hot</span>;
      case 'Trending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">Trend</span>;
      default:
        return <span className="text-slate-300 font-bold">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Genuine Autocomplete Data
            </span>
            {gscSnapshot ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                GSC Overlay Active ({gscSnapshot.property})
              </span>
            ) : onOpenGscModal && (
              <button
                onClick={onOpenGscModal}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              >
                + Connect GSC
              </button>
            )}
            <span className="text-xs text-slate-500">
              Country: <strong className="text-slate-700 uppercase">{country}</strong> | Lang: <strong className="text-slate-700 uppercase">{language}</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {keywords.length === totalBeforeFiltering ? (
              <span>{keywords.length} Real Keyword Suggestions</span>
            ) : (
              <span>
                {keywords.length} of {totalBeforeFiltering} Keywords Displayed
              </span>
            )}
          </h2>
        </div>

        {/* Action / Export / Ahrefs Tools Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenContentGap && (
            <button
              onClick={onOpenContentGap}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-rose-600" />
              <span>Ahrefs Content Gap</span>
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

      {/* Data Table with Expanded Keyword Column & Optional GSC Overlay */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[920px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* Keyword (Expanded Main Column) */}
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

              {/* Real GSC Ranking Position (If GSC is connected) */}
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

              {/* Seed Keyword */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-24"
                onClick={() => handleSort('seedKeyword')}
              >
                <div className="flex items-center gap-1">
                  <span>Seed</span>
                  {sortField === 'seedKeyword' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>

              {/* Intent (Shortened) */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-20 text-center"
                onClick={() => handleSort('intent')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Intent</span>
                  {sortField === 'intent' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>

              {/* Source */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-22 text-center"
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Source</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('source'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
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

              {/* AP */}
              <th
                className="py-3 px-2 cursor-pointer hover:text-blue-600 transition-colors w-16 text-center"
                onClick={() => handleSort('ap')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>AP</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('ap'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
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

              {/* Hot (Shortened) */}
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
              <th className="py-3 px-3 text-right w-20">Actions</th>
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
                  {/* Keyword (Expanded) */}
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

                  {/* Real GSC Position & Impressions (If connected) */}
                  {gscSnapshot && (
                    <td className="py-3 px-2 text-center bg-emerald-50/20 font-mono text-xs">
                      {gscData ? (
                        <div title={`GSC: ${gscData.impressions.toLocaleString()} imp, ${gscData.clicks} clicks`}>
                          <span className={`font-black ${gscData.position <= 10 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            #{gscData.position}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-sans">
                            {gscData.impressions >= 1000 ? `${(gscData.impressions / 1000).toFixed(1)}k imp` : `${gscData.impressions} imp`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  )}

                  {/* Seed Keyword */}
                  <td className="py-3 px-2 text-xs text-slate-500 font-medium truncate">
                    {item.seedKeyword}
                  </td>

                  {/* Short Intent Badge (Info, Comm, Buy, Nav) */}
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${INTENT_DEFINITIONS[item.intent]?.badgeClass || 'bg-slate-100'}`}
                      title={INTENT_DEFINITIONS[item.intent]?.label || item.intent}
                    >
                      {INTENT_DEFINITIONS[item.intent]?.shortLabel || item.intent}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="py-3 px-2 text-xs text-slate-600 text-center">
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

                  {/* Hot (Shortened) */}
                  <td className="py-3 px-2 text-center">
                    {getHotBadge(item.hot)}
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 text-right font-black text-slate-800 text-xs">
                    {item.relativeScore}
                  </td>

                  {/* Actions & Ahrefs SERP Trigger */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}&gl=${country.toLowerCase()}&hl=${language}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Google Search"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
