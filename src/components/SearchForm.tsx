'use client';

import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, Loader2, HelpCircle, Layers, Split, PlusCircle } from 'lucide-react';
import { CountrySelector } from './CountrySelector';
import { LanguageSelector } from './LanguageSelector';
import { PlatformTabs } from './PlatformTabs';
import { PlatformType } from '@/lib/platforms';

export interface SearchParams {
  query: string;
  country: string;
  language: string;
  platform: PlatformType;
  alphabet: boolean;
  questions: boolean;
  prepositions: boolean;
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  initialParams?: Partial<SearchParams>;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
  initialParams,
}) => {
  const [query, setQuery] = useState(initialParams?.query || '');
  const [country, setCountry] = useState(initialParams?.country || 'US');
  const [language, setLanguage] = useState(initialParams?.language || 'en');
  const [platform, setPlatform] = useState<PlatformType>(initialParams?.platform || 'google');
  const [alphabet, setAlphabet] = useState(initialParams?.alphabet || false);
  const [questions, setQuestions] = useState(initialParams?.questions || false);
  const [prepositions, setPrepositions] = useState(initialParams?.prepositions || false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch({
      query: query.trim(),
      country,
      language,
      platform,
      alphabet,
      questions,
      prepositions,
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 md:p-6 transition-all space-y-4">
      {/* 1. Multi-Platform Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <PlatformTabs
          activePlatform={platform}
          onChange={setPlatform}
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={() => setIsBulkMode(!isBulkMode)}
          disabled={isLoading}
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isBulkMode ? 'Single Seed Mode' : 'Bulk Multi-Seed Search'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Input / Bulk Textarea */}
        <div>
          <label htmlFor="seed-keyword-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
            <span>{isBulkMode ? 'Enter up to 5 Seed Keywords (one per line or comma-separated)' : 'Enter Seed Keyword or Wildcard Query'}</span>
            <span className="text-slate-400 font-normal text-xs lowercase">Tip: use &quot;*&quot; for wildcards (e.g. best * tools)</span>
          </label>
          
          {isBulkMode ? (
            <div className="relative">
              <textarea
                id="seed-keyword-input"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="coffee maker&#10;espresso machine&#10;french press"
                disabled={isLoading}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-slate-900 placeholder:text-slate-400 font-medium rounded-xl text-sm transition-all disabled:opacity-60 resize-none"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Discovering Bulk Keywords...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Search All Seeds</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="seed-keyword-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. coffee maker, best * for podcasting, marketing tips..."
                disabled={isLoading}
                className="w-full pl-11 pr-32 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-slate-900 placeholder:text-slate-400 font-medium rounded-xl text-base transition-all disabled:opacity-60"
              />
              <div className="absolute right-2">
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location & Language Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <CountrySelector
            selectedCountry={country}
            onChange={setCountry}
            disabled={isLoading}
          />
          <LanguageSelector
            selectedLanguage={language}
            onChange={setLanguage}
            disabled={isLoading}
          />
        </div>

        {/* Expansion & Advanced Features Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 py-1 focus:outline-none cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Expansion Options' : 'Expand Search (A-Z, Questions, Prepositions)'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              {/* Alphabet Expansion */}
              <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-slate-200/80 hover:border-blue-300 cursor-pointer transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={alphabet}
                  onChange={(e) => setAlphabet(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Alphabet (A-Z)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Queries &quot;seed + a..z&quot; and &quot;0..9&quot; to fetch comprehensive long-tail terms.
                  </p>
                </div>
              </label>

              {/* Questions Expansion */}
              <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-slate-200/80 hover:border-indigo-300 cursor-pointer transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={questions}
                  onChange={(e) => setQuestions(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    Question Modifiers
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Queries &quot;how/what/why/best + seed&quot; to uncover informational intent searches.
                  </p>
                </div>
              </label>

              {/* Prepositions Expansion */}
              <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-slate-200/80 hover:border-emerald-300 cursor-pointer transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={prepositions}
                  onChange={(e) => setPrepositions(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-emerald-600" />
                    Prepositions
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Queries &quot;seed + for/with/near/to&quot; for commercial &amp; transactional intent.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
