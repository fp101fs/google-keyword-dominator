'use client';

import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export interface FilterState {
  search: string;
  minWords: number;
  maxWords: number;
  minScore: number;
  maxScore: number;
  selectedSource: string;
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
    });
  };

  const isFiltered =
    filters.search !== '' ||
    filters.minWords > 0 ||
    filters.maxWords < 20 ||
    filters.minScore > 0 ||
    filters.maxScore < 100 ||
    filters.selectedSource !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Filter Results</h3>
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-blue-600">{filteredCount}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> real Google autocomplete keywords
            </p>
          </div>
        </div>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search within keywords */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Search in Keywords
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Filter keyword text..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Word Count Range */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
            <span>Word Count</span>
            <span className="text-slate-700 font-bold">
              {filters.minWords} - {filters.maxWords >= 20 ? '20+' : filters.maxWords} words
            </span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="15"
              value={filters.minWords}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minWords: Math.min(Number(e.target.value), filters.maxWords),
                })
              }
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Relative Score Range */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex justify-between">
            <span>Min Relative Score</span>
            <span className="text-slate-700 font-bold">{filters.minScore}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Discovery Source Filter */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Discovery Subquery
          </label>
          <select
            value={filters.selectedSource}
            onChange={(e) => onChange({ ...filters, selectedSource: e.target.value })}
            className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 text-slate-800 cursor-pointer"
          >
            <option value="all">All Sources ({availableSources.length} subqueries)</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
