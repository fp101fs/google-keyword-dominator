'use client';

import React from 'react';
import { Search, X, Compass, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { SearchIntent, INTENT_DEFINITIONS } from '@/lib/intent';

export type ExplorerSubTab = 'all' | 'matching' | 'questions' | 'prepositions' | 'comparisons';

export interface FilterState {
  search: string;
  minWords: number;
  maxWords: number;
  minScore: number;
  maxScore: number;
  selectedSource: string;
  intent: SearchIntent | "all";
  subTab: ExplorerSubTab;
}

interface KeywordFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  availableSources: string[];
  totalResults: number;
  filteredCount: number;
}

export const KeywordFilters: React.FC<KeywordFiltersProps> = ({
  filters,
  onChange,
  availableSources,
  totalResults,
  filteredCount,
}) => {
  const handleReset = () => {
    onChange({
      search: '',
      minWords: 0,
      maxWords: 20,
      minScore: 0,
      maxScore: 100,
      selectedSource: 'all',
      intent: 'all',
      subTab: 'all',
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.minWords > 0 ||
    filters.maxWords < 20 ||
    filters.minScore > 0 ||
    filters.maxScore < 100 ||
    filters.selectedSource !== 'all' ||
    filters.intent !== 'all' ||
    filters.subTab !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      {/* Ahrefs-Style Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onChange({ ...filters, subTab: 'all' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.subTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Terms ({filteredCount}/{totalResults})</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, subTab: 'matching' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.subTab === 'matching'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Matching Terms</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, subTab: 'questions' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.subTab === 'questions'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions (How, What, Why)</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, subTab: 'comparisons' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.subTab === 'comparisons'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>Vs &amp; Comparisons</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, subTab: 'prepositions' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.subTab === 'prepositions'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>Prepositions (For, With, Near)</span>
          </button>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Text Search Filter */}
        <div className="lg:col-span-4 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Filter keyword list..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Word Count Slider */}
        <div className="lg:col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Min Words</span>
            <span className="text-blue-600 font-mono font-black">{filters.minWords} words</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            value={filters.minWords}
            onChange={(e) => onChange({ ...filters, minWords: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Min Score Slider */}
        <div className="lg:col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span>Min Score</span>
            <span className="text-blue-600 font-mono font-black">{filters.minScore}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Source Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.selectedSource}
            onChange={(e) => onChange({ ...filters, selectedSource: e.target.value })}
            className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Sources</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1-Click Search Intent Filter Badges */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Intent Clusters:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onChange({ ...filters, intent: 'all' })}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filters.intent === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Intents
          </button>
          {(Object.keys(INTENT_DEFINITIONS) as (keyof typeof INTENT_DEFINITIONS)[]).map((key) => {
            const def = INTENT_DEFINITIONS[key];
            const isSelected = filters.intent === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ ...filters, intent: key })}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isSelected ? 'bg-blue-600 text-white shadow-2xs' : `${def.badgeClass} hover:opacity-80`
                }`}
              >
                {def.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
