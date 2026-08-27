'use client';

import React, { useState, useMemo } from 'react';
import { SearchForm, SearchParams } from '@/components/SearchForm';
import { KeywordFilters, FilterState } from '@/components/KeywordFilters';
import { KeywordTable } from '@/components/KeywordTable';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { FAQ } from '@/components/FAQ';
import { KeywordItem } from '@/lib/autocomplete';
import { Sparkles, ShieldCheck, Globe, Zap, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeParams, setActiveParams] = useState<SearchParams>({
    query: '',
    country: 'US',
    language: 'en',
    alphabet: false,
    questions: false,
    prepositions: false,
  });

  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    minWords: 0,
    maxWords: 20,
    minScore: 0,
    maxScore: 100,
    selectedSource: 'all',
  });

  const handleSearch = async (params: SearchParams) => {
    setActiveParams(params);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const url = new URL('/api/keywords', window.location.origin);
      url.searchParams.set('q', params.query);
      url.searchParams.set('country', params.country);
      url.searchParams.set('language', params.language);
      if (params.alphabet) url.searchParams.set('alphabet', 'true');
      if (params.questions) url.searchParams.set('questions', 'true');
      if (params.prepositions) url.searchParams.set('prepositions', 'true');

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: Failed to fetch keyword suggestions`);
      }

      setKeywords(data.keywords || []);
      // Reset filter on new search
      setFilters({
        search: '',
        minWords: 0,
        maxWords: 20,
        minScore: 0,
        maxScore: 100,
        selectedSource: 'all',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while searching.';
      setError(message);
      setKeywords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestedSeed: string) => {
    const updated = {
      ...activeParams,
      query: suggestedSeed,
    };
    setActiveParams(updated);
    handleSearch(updated);
  };

  // Extract unique discovery sources
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    keywords.forEach((k) => k.sources.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [keywords]);

  // Apply filters
  const filteredKeywords = useMemo(() => {
    return keywords.filter((item) => {
      // 1. Text filter
      if (filters.search && !item.keyword.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      // 2. Word count
      if (item.wordCount < filters.minWords) return false;
      if (filters.maxWords < 20 && item.wordCount > filters.maxWords) return false;
      // 3. Score
      if (item.relativeScore < filters.minScore || item.relativeScore > filters.maxScore) {
        return false;
      }
      // 4. Source
      if (filters.selectedSource !== 'all' && !item.sources.includes(filters.selectedSource)) {
        return false;
      }
      return true;
    });
  }, [keywords, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Keyword Dominator <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">Google Pro</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Genuine Google Autocomplete Intelligence</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Real Autocomplete Data
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero Header */}
        <section className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Free Google Keyword Research Tool
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Discover Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Google Autocomplete</span> Keyword Ideas
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Generate authentic long-tail keyword suggestions directly from Google search completion endpoints. Target any country or language, explore wildcards (*), and expand with A-Z modifiers.
          </p>
        </section>

        {/* Search Form Card */}
        <section className="max-w-4xl mx-auto">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            initialParams={activeParams}
          />
        </section>

        {/* Error State */}
        {error && (
          <section className="max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Search Error</h4>
                <p className="text-sm text-rose-800">{error}</p>
                <p className="text-xs text-rose-600 pt-1">
                  Note: We never fabricate or simulate fake keywords when an error occurs.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Results Area */}
        <section className="max-w-5xl mx-auto space-y-6">
          {isLoading && (
            <LoadingState
              seed={activeParams.query}
              country={activeParams.country}
              language={activeParams.language}
            />
          )}

          {!isLoading && !error && !hasSearched && (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          )}

          {!isLoading && !error && hasSearched && keywords.length === 0 && (
            <EmptyState
              hasSearched={true}
              seed={activeParams.query}
              onSuggestionClick={handleSuggestionClick}
            />
          )}

          {!isLoading && !error && keywords.length > 0 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Filtering Toolbar */}
              <KeywordFilters
                filters={filters}
                onChange={setFilters}
                availableSources={availableSources}
                totalResults={keywords.length}
                filteredCount={filteredKeywords.length}
              />

              {/* Data Table */}
              <KeywordTable
                seed={activeParams.query}
                keywords={filteredKeywords}
                country={activeParams.country}
                language={activeParams.language}
                totalBeforeFiltering={keywords.length}
              />
            </div>
          )}
        </section>

        {/* Features / Benefits Grid */}
        <section className="pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why SEO Pros Rely on Autocomplete Intelligence
            </h2>
            <p className="text-sm text-slate-500">
              Google Autocomplete represents actual user searches typed into the search engine in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Country &amp; Multi-Language</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Target localized Google search markets across US, UK, Canada, Australia, France, Germany, Japan, and more with exact language code matching.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Wildcard (*) Search Queries</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Place asterisks anywhere inside your search phrase to let Google fill in the blanks with genuine high-converting search variations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Data Integrity</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zero fabricated search volume, zero hallucinated keywords, and zero fake competition scores. Every suggestion is 100% genuine Google data.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-8">
          <FAQ />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            Google Keyword Dominator &bull; Production Autocomplete Research Tool
          </p>
          <p>
            Built with Next.js, React, TypeScript, and Tailwind CSS. Deployable to Vercel.
          </p>
          <p className="text-slate-400">
            Data sourced from authentic Google completion endpoints without synthesis or fabrication.
          </p>
        </div>
      </footer>
    </div>
  );
}
