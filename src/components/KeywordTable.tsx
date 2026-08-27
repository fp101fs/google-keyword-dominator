'use client';

import React, { useState, useMemo } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { ExportButton } from './ExportButton';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Info, Copy, Check } from 'lucide-react';

interface KeywordTableProps {
  seed: string;
  keywords: KeywordItem[];
  country: string;
  language: string;
  totalBeforeFiltering: number;
}

type SortField = 'keyword' | 'relativeScore' | 'wordCount' | 'charCount';
type SortDirection = 'asc' | 'desc';

export const KeywordTable: React.FC<KeywordTableProps> = ({
  seed,
  keywords,
  country,
  language,
  totalBeforeFiltering,
}) => {
  const [sortField, setSortField] = useState<SortField>('relativeScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'keyword' ? 'asc' : 'desc');
    }
  };

  const sortedKeywords = useMemo(() => {
    const list = [...keywords];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'keyword') {
        comparison = a.keyword.localeCompare(b.keyword);
      } else if (sortField === 'relativeScore') {
        comparison = a.relativeScore - b.relativeScore;
      } else if (sortField === 'wordCount') {
        comparison = a.wordCount - b.wordCount;
      } else if (sortField === 'charCount') {
        comparison = a.charCount - b.charCount;
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

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 25) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Genuine Google Data
            </span>
            <span className="text-xs text-slate-500">
              Country: <strong className="text-slate-700 uppercase">{country}</strong> | Lang: <strong className="text-slate-700 uppercase">{language}</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            {keywords.length === totalBeforeFiltering ? (
              <span>{keywords.length} Real Keyword Suggestions Found</span>
            ) : (
              <span>
                {keywords.length} of {totalBeforeFiltering} Keywords Displayed
              </span>
            )}
          </h2>
        </div>

        {/* Action / Export Buttons */}
        <ExportButton
          seed={seed}
          keywords={sortedKeywords}
          country={country}
          language={language}
        />
      </div>

      {/* Transparency Note about Relative Score */}
      <div className="px-4 py-2.5 bg-amber-50/60 border-b border-amber-100 text-xs text-amber-900/90 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Relative Score (0–100):</strong> Calculated mathematically based only on suggestion rank position and frequency across discovery subqueries in this specific result set. It is <em>not</em> Google search volume or commercial competition.
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                onClick={() => handleSort('keyword')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Keyword Suggestion</span>
                  {sortField === 'keyword' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none w-36"
                onClick={() => handleSort('relativeScore')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Relative Score</span>
                  {sortField === 'relativeScore' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none w-28 text-center"
                onClick={() => handleSort('wordCount')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Words</span>
                  {sortField === 'wordCount' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none w-24 text-center hidden md:table-cell"
                onClick={() => handleSort('charCount')}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Chars</span>
                  {sortField === 'charCount' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedKeywords.map((item, idx) => (
              <tr
                key={`${item.keyword}-${idx}`}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-semibold">{item.keyword}</span>
                    {item.sources.length > 1 && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600" title={`Found in: ${item.sources.join(', ')}`}>
                        {item.sources.length} queries
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.relativeScore}%` }}
                      />
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md border ${getScoreBadgeColor(
                        item.relativeScore
                      )}`}
                    >
                      {item.relativeScore}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-xs font-medium text-slate-600">
                  <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {item.wordCount}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-xs text-slate-500 hidden md:table-cell">
                  {item.charCount}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
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
