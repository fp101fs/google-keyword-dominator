'use client';

import React, { useState, useMemo } from 'react';
import { SearchForm, SearchParams } from '@/components/SearchForm';
import { SummaryContainers } from '@/components/SummaryContainers';
import { KeywordFilters, FilterState } from '@/components/KeywordFilters';
import { KeywordTable } from '@/components/KeywordTable';
import { VisualSearchTree } from '@/components/VisualSearchTree';
import { ClusterBubbleMap } from '@/components/ClusterBubbleMap';
import { HierarchicalClusterTree } from '@/components/HierarchicalClusterTree';
import { SerpOverlapMatrix } from '@/components/SerpOverlapMatrix';
import { ContentBriefModal } from '@/components/ContentBriefModal';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { FAQ } from '@/components/FAQ';
import { KeywordItem, KeywordSummaryMetrics } from '@/lib/autocomplete';
import { Sparkles, ShieldCheck, Globe, Zap, AlertCircle, Network, TableProperties, CircleDot, GitFork, Grid } from 'lucide-react';

export default function Home() {
  const [activeParams, setActiveParams] = useState<SearchParams>({
    query: '',
    country: 'US',
    language: 'en',
    platform: 'google',
    alphabet: false,
    questions: false,
    prepositions: false,
  });

  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [metrics, setMetrics] = useState<KeywordSummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'table' | 'bubbles' | 'serp' | 'hierarchy' | 'tree'>('table');
  const [isBriefOpen, setIsBriefOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    minWords: 0,
    maxWords: 20,
    minScore: 0,
    maxScore: 100,
    selectedSource: 'all',
    intent: 'all',
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
      url.searchParams.set('platform', params.platform);
      if (params.alphabet) url.searchParams.set('alphabet', 'true');
      if (params.questions) url.searchParams.set('questions', 'true');
      if (params.prepositions) url.searchParams.set('prepositions', 'true');

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}: Failed to fetch keyword suggestions`);
      }

      setKeywords(data.keywords || []);
      setMetrics(data.metrics || null);

      setFilters({
        search: '',
        minWords: 0,
        maxWords: 20,
        minScore: 0,
        maxScore: 100,
        selectedSource: 'all',
        intent: 'all',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while searching.';
      setError(message);
      setKeywords([]);
      setMetrics(null);
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
      if (filters.search && !item.keyword.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.intent !== 'all' && item.intent !== filters.intent) {
        return false;
      }
      if (item.wordCount < filters.minWords) return false;
      if (filters.maxWords < 20 && item.wordCount > filters.maxWords) return false;
      if (item.relativeScore < filters.minScore || item.relativeScore > filters.maxScore) {
        return false;
      }
      if (filters.selectedSource !== 'all' && !item.sources.includes(filters.selectedSource)) {
        return false;
      }
      return true;
    });
  }, [keywords, filters]);

  // Dynamic live metrics based on filtered results
  const liveMetrics = useMemo((): KeywordSummaryMetrics | null => {
    if (!filteredKeywords.length) return metrics;
    const total = filteredKeywords.length;
    const hotCount = filteredKeywords.filter((k) => k.hot === 'Hottest keyword' || k.hot === 'Hot keyword').length;
    const avgScore = Number((filteredKeywords.reduce((acc, k) => acc + k.relativeScore, 0) / total).toFixed(1));
    const avgAp = Number((filteredKeywords.reduce((acc, k) => acc + k.ap, 0) / total).toFixed(1));
    const apLte3 = filteredKeywords.filter((k) => k.ap <= 3).length;
    const diff = {
      low: filteredKeywords.filter((k) => k.diff === 'Low').length,
      med: filteredKeywords.filter((k) => k.diff === 'Med').length,
      high: filteredKeywords.filter((k) => k.diff === 'High').length,
    };
    return {
      totalKeywords: total,
      hotKeywordsCount: hotCount,
      avgScore,
      avgAp,
      apLte3Count: apLte3,
      difficultyBreakdown: diff,
      seedCount: metrics?.seedCount || 1,
    };
  }, [filteredKeywords, metrics]);

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
                Keyword Dominator <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">Pro Suite</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Multi-Platform Autocomplete &amp; SERP Matrix Intelligence</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Real Autocomplete &amp; SERP Data
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
            Universal Autocomplete &amp; SERP Overlap Engine
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Discover Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Search Autocomplete</span> Ideas
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Generate authentic long-tail keyword suggestions from Google, YouTube, Amazon &amp; Bing. Uncover search intent, explore interactive relationship trees, inspect live SERP overlaps, and export content briefs.
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
        <section className="max-w-6xl mx-auto space-y-6">
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
              {/* Top 7 Summary Metrics Containers in 1 Row */}
              {liveMetrics && <SummaryContainers metrics={liveMetrics} />}

              {/* 5-Way Visualization View Switcher Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* 1. Table View */}
                  <button
                    onClick={() => setActiveView('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === 'table'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>Table View</span>
                  </button>

                  {/* 2. Interactive Cluster Map / Bubble Map */}
                  <button
                    onClick={() => setActiveView('bubbles')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === 'bubbles'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CircleDot className="w-3.5 h-3.5" />
                    <span>Cluster Bubble Map</span>
                    <span className="text-[10px] bg-purple-500/30 text-white px-1.5 py-0.2 rounded font-mono">Rank 1</span>
                  </button>

                  {/* 3. SERP Overlap Matrix */}
                  <button
                    onClick={() => setActiveView('serp')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === 'serp'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>SERP Overlap Matrix</span>
                    <span className="text-[10px] bg-amber-500/30 text-white px-1.5 py-0.2 rounded font-mono">Rank 2</span>
                  </button>

                  {/* 4. Keyword -> Cluster Hierarchy Tree */}
                  <button
                    onClick={() => setActiveView('hierarchy')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === 'hierarchy'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Hierarchy Tree</span>
                    <span className="text-[10px] bg-emerald-500/30 text-white px-1.5 py-0.2 rounded font-mono">Rank 3</span>
                  </button>

                  {/* 5. Radial Relationship Mindmap */}
                  <button
                    onClick={() => setActiveView('tree')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeView === 'tree'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Radial Graph</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium hidden lg:block">
                  Showing results for: <strong className="text-slate-800">{activeParams.query}</strong>
                </div>
              </div>

              {/* View 1: Table */}
              {activeView === 'table' && (
                <>
                  <KeywordFilters
                    filters={filters}
                    onChange={setFilters}
                    availableSources={availableSources}
                    totalResults={keywords.length}
                    filteredCount={filteredKeywords.length}
                  />

                  <KeywordTable
                    seed={activeParams.query}
                    keywords={filteredKeywords}
                    country={activeParams.country}
                    language={activeParams.language}
                    totalBeforeFiltering={keywords.length}
                    onOpenContentBrief={() => setIsBriefOpen(true)}
                  />
                </>
              )}

              {/* View 2: Interactive Bubble Map (Rank 1) */}
              {activeView === 'bubbles' && (
                <ClusterBubbleMap
                  seed={activeParams.query}
                  keywords={filteredKeywords}
                />
              )}

              {/* View 3: SERP Overlap Matrix (Rank 2) */}
              {activeView === 'serp' && (
                <SerpOverlapMatrix
                  seed={activeParams.query}
                  keywords={filteredKeywords}
                />
              )}

              {/* View 4: Keyword -> Cluster Hierarchy Tree (Rank 3) */}
              {activeView === 'hierarchy' && (
                <HierarchicalClusterTree
                  seed={activeParams.query}
                  keywords={filteredKeywords}
                />
              )}

              {/* View 5: Radial Relationship Graph */}
              {activeView === 'tree' && (
                <VisualSearchTree
                  seed={activeParams.query}
                  keywords={filteredKeywords}
                />
              )}
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
              Autocomplete represents actual searches typed into major platforms in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Platform Search</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seamlessly toggle between Google, YouTube, Amazon, and Bing to capture cross-platform search and buyer intent.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Search Intent &amp; SERP Overlap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically classify queries into Informational, Commercial, and Transactional intents, and compare SERP ranking URLs to prevent keyword cannibalization.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Data Integrity</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zero fabricated search volume, zero hallucinated keywords, and zero fake metrics. Every suggestion is authentic completion data.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-8">
          <FAQ />
        </section>
      </main>

      {/* Content Brief Modal */}
      <ContentBriefModal
        seed={activeParams.query}
        keywords={filteredKeywords}
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            Google Keyword Dominator &bull; Production Autocomplete Research Suite
          </p>
          <p>
            Built with Next.js, React, TypeScript, and Tailwind CSS. Deployable to Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
}
