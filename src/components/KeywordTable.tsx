'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { ExportButton } from './ExportButton';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, HelpCircle, Copy, Check, FileText, Search, Target } from 'lucide-react';
import { INTENT_DEFINITIONS } from '@/lib/intent';

interface KeywordTableProps {
  seed: string;
  keywords: KeywordItem[];
  country: string;
  language: string;
  totalBeforeFiltering: number;
  onOpenContentBrief?: () => void;
  onOpenContentGap?: () => void;
  onInspectSerp?: (keyword: KeywordItem) => void;
}

type SortField = 'keyword' | 'seedKeyword' | 'source' | 'country' | 'ap' | 'diff' | 'hot' | 'relativeScore' | 'intent' | 'wordCount';
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
}) => {
  const [sortField, setSortField] = useState<SortField>('relativeScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [keywords, sortField, sortDirection]);

  const copyRow = async (kw: string, index: number) => {
    await navigator.clipboard.writeText(kw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'High':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'Med':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Med</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Low</span>;
      default:
        return <span>{diff}</span>;
    }
  };

  const getHotBadge = (hot: string) => {
    switch (hot) {
      case 'Hottest keyword':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">Hottest keyword</span>;
      case 'Hot keyword':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Hot keyword</span>;
      case 'Trending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Trending</span>;
      default:
        return <span className="text-slate-300 font-bold">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Genuine Autocomplete Data
            </span>
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

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
              {/* Keyword */}
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
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

              {/* Seed Keyword */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-32"
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

              {/* Intent */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-28 text-center"
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
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-28"
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center gap-1">
                  <span>Source</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('source'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                  {sortField === 'source' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
                {activeTooltip === 'source' && (
                  <div className="absolute z-20 mt-1 p-2 bg-slate-900 text-white font-normal normal-case text-[10px] rounded shadow-lg max-w-xs">
                    The platform or query engine that surfaced this suggestion.
                  </div>
                )}
              </th>

              {/* Country */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-20 text-center"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Country</span>
                </div>
              </th>

              {/* AP */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-24 text-center"
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
                  {sortField === 'ap' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
                {activeTooltip === 'ap' && (
                  <div className="absolute z-20 mt-1 p-2 bg-slate-900 text-white font-normal normal-case text-[10px] rounded shadow-lg max-w-xs text-left">
                    <strong>Autocomplete Placement (AP):</strong> The exact rank position this keyword appeared at in autocomplete (1st, 2nd, 3rd, etc.).
                  </div>
                )}
              </th>

              {/* Diff */}
              <th
                className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors w-24 text-center"
                onClick={() => handleSort('diff')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Diff</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('diff'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                  {sortField === 'diff' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
                {activeTooltip === 'diff' && (
                  <div className="absolute z-20 mt-1 p-2 bg-slate-900 text-white font-normal normal-case text-[10px] rounded shadow-lg max-w-xs text-left">
                    <strong>Difficulty (Diff):</strong> Categorized as Low, Med, or High reflecting relative competition for search engine placement based on AP, score, and word length.
                  </div>
                )}
              </th>

              {/* Hot */}
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors w-36 text-center"
                onClick={() => handleSort('hot')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Hot</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('hot'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                  {sortField === 'hot' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
                {activeTooltip === 'hot' && (
                  <div className="absolute z-20 mt-1 p-2 bg-slate-900 text-white font-normal normal-case text-[10px] rounded shadow-lg max-w-xs text-left">
                    <strong>Hot:</strong> Most popular and highest ranking keywords. Lower AP indicates higher search prominence.
                  </div>
                )}
              </th>

              {/* Score */}
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors w-28 text-right"
                onClick={() => handleSort('relativeScore')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Score</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleTooltip('score'); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                  {sortField === 'relativeScore' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
                {activeTooltip === 'score' && (
                  <div className="absolute z-20 mt-1 right-4 p-2 bg-slate-900 text-white font-normal normal-case text-[10px] rounded shadow-lg max-w-xs text-left">
                    <strong>Score:</strong> Relative popularity and frequency score calculated across this result set (0-100).
                  </div>
                )}
              </th>

              {/* Actions & Ahrefs SERP Inspector */}
              <th className="py-3 px-3 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedKeywords.map((item, idx) => (
              <tr
                key={`${item.keyword}-${idx}`}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                {/* Keyword */}
                <td className="py-3 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>{item.keyword}</span>
                  </div>
                </td>

                {/* Seed Keyword */}
                <td className="py-3 px-3 text-xs text-slate-500 font-medium truncate max-w-[120px]">
                  {item.seedKeyword}
                </td>

                {/* Intent Badge */}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${INTENT_DEFINITIONS[item.intent]?.badgeClass || 'bg-slate-100'}`}>
                    {INTENT_DEFINITIONS[item.intent]?.label || item.intent}
                  </span>
                </td>

                {/* Source */}
                <td className="py-3 px-3 text-xs text-slate-600">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px] text-slate-700">
                    {item.source}
                  </span>
                </td>

                {/* Country */}
                <td className="py-3 px-3 text-xs text-slate-600 text-center font-bold">
                  {item.country}
                </td>

                {/* AP */}
                <td className="py-3 px-3 text-xs text-slate-700 font-bold text-center">
                  <span className={item.ap <= 3 ? 'text-blue-600 font-black' : ''}>
                    {item.apFormatted}
                  </span>
                </td>

                {/* Diff */}
                <td className="py-3 px-3 text-center">
                  {getDiffBadge(item.diff)}
                </td>

                {/* Hot */}
                <td className="py-3 px-4 text-center">
                  {getHotBadge(item.hot)}
                </td>

                {/* Score */}
                <td className="py-3 px-4 text-right font-black text-slate-800">
                  {item.relativeScore}
                </td>

                {/* Actions & Ahrefs SERP Trigger */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Ahrefs 1-Click SERP Overview */}
                    {onInspectSerp && (
                      <button
                        onClick={() => onInspectSerp(item)}
                        title="Inspect Live SERP Overview & Top 10 Competitors"
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => copyRow(item.keyword, idx)}
                      title="Copy keyword"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                      title="Open Google Search in new tab"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
