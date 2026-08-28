'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, SlidersHorizontal, Layers } from 'lucide-react';
import { PlatformTabs } from './PlatformTabs';
import { PlatformType } from '@/lib/platforms';
import { COUNTRIES } from '@/lib/countries';
import { LANGUAGES } from '@/lib/languages';

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
  onOpenContentGap?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
  initialParams,
}) => {
  const [platform, setPlatform] = useState<PlatformType>(initialParams?.platform || 'google');
  const [query, setQuery] = useState<string>(initialParams?.query || '');
  const [country, setCountry] = useState<string>(initialParams?.country || 'US');
  const [language, setLanguage] = useState<string>(initialParams?.language || 'en');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Expansion toggles (Deep Discovery)
  const [alphabet, setAlphabet] = useState<boolean>(true);
  const [questions, setQuestions] = useState<boolean>(true);
  const [prepositions, setPrepositions] = useState<boolean>(true);

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
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-5 sm:p-7 space-y-5 transition-all">
      {/* Platform Switcher + Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <PlatformTabs
          activePlatform={platform}
          onChange={(p) => setPlatform(p)}
          disabled={isLoading}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkMode(!isBulkMode)}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isBulkMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Multi-Seed (Up to 5)</span>
          </button>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="search-input" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {isBulkMode ? 'Enter Seeds (Comma or Line Separated)' : 'Seed Keyword / Topic'}
          </label>
          <div className="relative flex items-center">
            {isBulkMode ? (
              <textarea
                id="search-input"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. coffee maker, espresso machine, cold brew&#10;Enter up to 5 seed keywords..."
                disabled={isLoading}
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-2xs"
              />
            ) : (
              <>
                <div className="absolute left-4 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. ai tools, real estate, keto diet, seo..."
                  disabled={isLoading}
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 font-semibold text-base focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </>
            )}
          </div>
        </div>

        {/* Controls Row: Country, Language & Submit Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Country Selector with Flags */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Target Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Language Selector with Flags */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-4 flex items-end sm:pt-4">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Discovering...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Discover Keywords</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Deep Discovery Expansion Toggles */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Expansion Modifiers' : 'Deep Discovery Modifiers (A-Z, Questions, Prepositions)'}</span>
          </button>

          {showAdvanced && (
            <div className="flex items-center gap-4 flex-wrap animate-fadeIn">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={alphabet}
                  onChange={(e) => setAlphabet(e.target.checked)}
                  disabled={isLoading}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Alphabet (A-Z)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={questions}
                  onChange={(e) => setQuestions(e.target.checked)}
                  disabled={isLoading}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Questions (How, What, Why)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={prepositions}
                  onChange={(e) => setPrepositions(e.target.checked)}
                  disabled={isLoading}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Prepositions (For, With, Near)</span>
              </label>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
