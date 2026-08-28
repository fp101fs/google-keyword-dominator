'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Zap,
  FileText,
  LifeBuoy,
  Globe,
  ArrowRight,
  Copy,
  Check,
  CheckCircle,
  Loader2,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { GscConnectedSnapshot, GscProperty } from '@/lib/gsc/types';
import { GscGapOpportunity, PageExpansionPlan, RankingsRescueTask } from '@/lib/intelligence/types';

interface SearchIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  gscSnapshot: GscConnectedSnapshot | null;
  properties: GscProperty[];
  selectedProperty: string;
  onSelectProperty: (url: string) => void;
  onExpandQueryInGkd: (query: string) => void;
  isAuthenticated: boolean;
  onConnectDemo: () => Promise<void>;
}

export const SearchIntelligenceModal: React.FC<SearchIntelligenceModalProps> = ({
  isOpen,
  onClose,
  gscSnapshot,
  properties,
  selectedProperty,
  onSelectProperty,
  onExpandQueryInGkd,
  isAuthenticated,
}) => {
  const [activeTab, setActiveTab] = useState<'gsc_gap' | 'page_expansion' | 'rankings_rescue' | 'factory'>('gsc_gap');

  // GSC Gap Opportunities State
  const [gapOpportunities, setGapOpportunities] = useState<GscGapOpportunity[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState<boolean>(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Page Expansion State
  const [expansionPlan, setExpansionPlan] = useState<PageExpansionPlan | null>(null);
  const [isLoadingExpansion, setIsLoadingExpansion] = useState<boolean>(false);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>('');

  // Rankings Rescue State
  const [rescueTasks, setRescueTasks] = useState<RankingsRescueTask[]>([]);
  const [isLoadingRescue, setIsLoadingRescue] = useState<boolean>(false);

  // Content Factory Automation State
  const [factoryMode, setFactoryMode] = useState<'copilot' | 'autopilot' | 'research'>('copilot');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const propertyTarget = selectedProperty || gscSnapshot?.property || '';

  // Trigger analysis when modal opens or property changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadData() {
      // 1. Gaps
      setIsLoadingGaps(true);
      try {
        const res = await fetch('/api/intelligence/gsc-gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: propertyTarget,
            isDemo: !isAuthenticated,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.opportunities) {
          setGapOpportunities(data.opportunities);
        }
      } catch (err) {
        console.error('Error fetching gaps:', err);
      } finally {
        if (isMounted) setIsLoadingGaps(false);
      }

      // 2. Expansion
      setIsLoadingExpansion(true);
      try {
        const res = await fetch('/api/intelligence/page-expansion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: propertyTarget,
            targetPageUrl: selectedPageUrl,
            isDemo: !isAuthenticated,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.plan) {
          setExpansionPlan(data.plan);
        }
      } catch (err) {
        console.error('Error fetching expansion:', err);
      } finally {
        if (isMounted) setIsLoadingExpansion(false);
      }

      // 3. Rescue
      setIsLoadingRescue(true);
      try {
        const res = await fetch('/api/intelligence/rankings-rescue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: propertyTarget,
            isDemo: !isAuthenticated,
          }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.tasks) {
          setRescueTasks(data.tasks);
        }
      } catch (err) {
        console.error('Error fetching rescue:', err);
      } finally {
        if (isMounted) setIsLoadingRescue(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, propertyTarget, selectedPageUrl, isAuthenticated]);

  const handleManualReanalyze = () => {
    setIsLoadingGaps(true);
    setIsLoadingExpansion(true);
    setIsLoadingRescue(true);

    fetch('/api/intelligence/gsc-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl: propertyTarget, isDemo: !isAuthenticated }),
    })
      .then((r) => r.json())
      .then((d) => d.success && setGapOpportunities(d.opportunities))
      .finally(() => setIsLoadingGaps(false));

    fetch('/api/intelligence/page-expansion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl: propertyTarget, targetPageUrl: selectedPageUrl, isDemo: !isAuthenticated }),
    })
      .then((r) => r.json())
      .then((d) => d.success && setExpansionPlan(d.plan))
      .finally(() => setIsLoadingExpansion(false));

    fetch('/api/intelligence/rankings-rescue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl: propertyTarget, isDemo: !isAuthenticated }),
    })
      .then((r) => r.json())
      .then((d) => d.success && setRescueTasks(d.tasks))
      .finally(() => setIsLoadingRescue(false));
  };

  if (!isOpen) return null;

  const filteredGaps = gapOpportunities.filter((op) => {
    if (selectedTierFilter === 'all') return true;
    return op.tier === selectedTierFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl shadow-inner">
              <Zap className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                Autonomous Search Intelligence Suite
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-blue-500 text-white rounded-full">
                  PRO
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Ground-truth Google Search Console performance multiplied by real Autocomplete demand.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600 font-medium">Domain:</span>
            {properties.length > 1 ? (
              <select
                value={selectedProperty}
                onChange={(e) => onSelectProperty(e.target.value)}
                className="p-1 px-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 cursor-pointer"
              >
                {properties.map((p) => (
                  <option key={p.siteUrl} value={p.siteUrl}>
                    {p.siteUrl}
                  </option>
                ))}
              </select>
            ) : (
              <strong className="text-slate-900 font-bold">
                {selectedProperty || gscSnapshot?.property || (isAuthenticated ? 'Connected Account' : 'Demo Mode (trailgearhub.com)')}
              </strong>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <a
                href="/api/auth/google"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Connect Live GSC</span>
              </a>
            )}
            <button
              onClick={handleManualReanalyze}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGaps || isLoadingExpansion || isLoadingRescue ? 'animate-spin text-blue-600' : ''}`} />
              <span>Re-Analyze</span>
            </button>
          </div>
        </div>

        {/* Intelligence Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-6 pt-3 bg-white text-xs font-bold overflow-x-auto">
          {/* Tab 1: GSC Gap Finder */}
          <button
            onClick={() => setActiveTab('gsc_gap')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gsc_gap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. GSC Gap Finder ({gapOpportunities.length})</span>
          </button>

          {/* Tab 2: Existing-Page Expansion */}
          <button
            onClick={() => setActiveTab('page_expansion')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'page_expansion'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Page Expansion Engine</span>
          </button>

          {/* Tab 3: Rankings Rescue */}
          <button
            onClick={() => setActiveTab('rankings_rescue')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rankings_rescue'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>3. Rankings Rescue Automation ({rescueTasks.length})</span>
          </button>

          {/* Tab 4: Autonomous SEO Content Factory */}
          <button
            onClick={() => setActiveTab('factory')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'factory'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. SEO Opportunity &rarr; Content Factory</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* ===================== TAB 1: GSC GAP FINDER ===================== */}
          {activeTab === 'gsc_gap' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Topical Gap Matrix: GSC Reality &times; Autocomplete Demand
                  </h4>
                  <p className="text-xs text-slate-500">
                    Discovers what Google associates with your site vs. what your pages are currently missing.
                  </p>
                </div>

                {/* Tier Filter Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setSelectedTierFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTierFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({gapOpportunities.length})
                  </button>
                  <button
                    onClick={() => setSelectedTierFilter('green_striking')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTierFilter === 'green_striking' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    Striking (8-25)
                  </button>
                  <button
                    onClick={() => setSelectedTierFilter('yellow_new_content')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTierFilter === 'yellow_new_content' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900'
                    }`}
                  >
                    New Content
                  </button>
                  <button
                    onClick={() => setSelectedTierFilter('red_low_ctr')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTierFilter === 'red_low_ctr' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    Low CTR
                  </button>
                </div>
              </div>

              {isLoadingGaps ? (
                <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Expanding GSC Queries through Autocomplete...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGaps.map((item, idx) => (
                    <div
                      key={`${item.query}-${idx}`}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">{item.query}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.tierBadgeClass}`}>
                              {item.tierLabel}
                            </span>
                            {item.position > 0 && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                Pos #{item.position}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">{item.tierDescription}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.impressions > 0 && (
                            <div className="text-right">
                              <div className="text-xs font-black text-slate-900">{item.impressions.toLocaleString()}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Impressions</div>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              onExpandQueryInGkd(item.query);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>Explore in GKD</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Action Recipe Box */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 truncate">
                          <span className="font-bold text-slate-900">Action:</span>
                          <span className="truncate">{item.actionPromptTemplate}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(`gap-${idx}`, item.actionPromptTemplate)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedId === `gap-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `gap-${idx}` ? 'Copied' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: PAGE EXPANSION ENGINE ===================== */}
          {activeTab === 'page_expansion' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  &ldquo;What Should This Existing Page Rank For?&rdquo;
                </h4>
                <p className="text-xs text-slate-500">
                  Select an existing ranking URL. GKD expands all queries driving impressions for it and prescribes exact missing H2 sub-sections and FAQs.
                </p>

                {gscSnapshot?.pages && gscSnapshot.pages.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-slate-700">Target URL:</span>
                    <select
                      value={selectedPageUrl || gscSnapshot.pages[0]?.url}
                      onChange={(e) => setSelectedPageUrl(e.target.value)}
                      className="p-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer flex-1"
                    >
                      {gscSnapshot.pages.map((p) => (
                        <option key={p.url} value={p.url}>
                          {p.url} ({p.impressions.toLocaleString()} imp &bull; {p.clicks} clicks)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoadingExpansion ? (
                <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Analyzing Page Autocomplete Sub-Clusters...</p>
                </div>
              ) : expansionPlan ? (
                <div className="space-y-5">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Total Impressions</div>
                      <div className="text-base font-black text-slate-900">{expansionPlan.totalImpressions.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Total Clicks</div>
                      <div className="text-base font-black text-emerald-600">{expansionPlan.totalClicks.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Average Position</div>
                      <div className="text-base font-black text-blue-600">#{expansionPlan.avgPosition}</div>
                    </div>
                  </div>

                  {/* Title & Meta Recommendations */}
                  {expansionPlan.titleMetaRecommendation && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                          Recommended Title &amp; Snippet Optimization
                        </span>
                        <button
                          onClick={() => handleCopy('title-meta', `Title: ${expansionPlan.titleMetaRecommendation?.recommendedTitle}\nMeta: ${expansionPlan.titleMetaRecommendation?.recommendedMeta}`)}
                          className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'title-meta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === 'title-meta' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="text-slate-800"><strong>New Title:</strong> {expansionPlan.titleMetaRecommendation.recommendedTitle}</p>
                        <p className="text-slate-700"><strong>New Meta:</strong> {expansionPlan.titleMetaRecommendation.recommendedMeta}</p>
                        <p className="text-[11px] text-emerald-800 italic">{expansionPlan.titleMetaRecommendation.reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Missing Subtopics to Add to this Page */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Prescribed Sections &amp; FAQs to Add to this Existing Page
                    </h5>

                    <div className="divide-y divide-slate-100">
                      {expansionPlan.missingSubtopics.map((sub, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{sub.suggestedHeading}</span>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                sub.type === 'faq' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {sub.type === 'faq' ? 'FAQ Section' : 'H2 Sub-Section'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">Query Target: &ldquo;{sub.targetQuery}&rdquo; &bull; Demand Score: {sub.relevanceScore}/100</p>
                          </div>

                          <button
                            onClick={() => handleCopy(`sub-${idx}`, `## ${sub.suggestedHeading}\n\nWrite a 200-word authoritative section for our page on "${expansionPlan.pageUrl}" covering "${sub.targetQuery}".`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedId === `sub-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === `sub-${idx}` ? 'Copied' : 'Draft Prompt'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ===================== TAB 3: RANKINGS RESCUE ===================== */}
          {activeTab === 'rankings_rescue' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-amber-600" />
                  Automated Rankings Rescue Protocol
                </h4>
                <p className="text-xs text-slate-500">
                  Isolates pages losing ground or stuck on Page 2 (Positions 11–20) and prescribes exact fixes.
                </p>
              </div>

              {isLoadingRescue ? (
                <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Evaluating Rescue Opportunities...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rescueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">{task.title}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              task.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {task.severity.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{task.rootCause}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-900">{task.impactMetrics.impressions.toLocaleString()} imp</div>
                          <div className="text-[10px] text-slate-400 font-bold">Pos #{task.impactMetrics.position}</div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-amber-950">Prescribed SEO Fix:</span>
                          <button
                            onClick={() => handleCopy(task.id, task.copyablePrompt)}
                            className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === task.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === task.id ? 'Copied Prompt' : 'Copy 1-Click Fix'}</span>
                          </button>
                        </div>
                        <p className="text-slate-700">{task.prescribedFix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 4: AUTONOMOUS CONTENT FACTORY ===================== */}
          {activeTab === 'factory' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600" />
                      Autonomous SEO Opportunity &rarr; Content Factory
                    </h4>
                    <p className="text-xs text-slate-500">
                      Closed-loop engine: First-Party GSC &rarr; Autocomplete Expansion &rarr; Opportunity Scoring &rarr; Execution.
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setFactoryMode('copilot')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        factoryMode === 'copilot' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Copilot (Review First)
                    </button>
                    <button
                      onClick={() => setFactoryMode('autopilot')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        factoryMode === 'autopilot' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Autopilot
                    </button>
                    <button
                      onClick={() => setFactoryMode('research')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        factoryMode === 'research' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Research Only
                    </button>
                  </div>
                </div>

                {/* Closed Loop Visual Workflow */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-center text-[10px] font-bold">
                  <div className="p-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">1. GSC Ingestion</div>
                  <div className="p-2 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200">2. Autocomplete</div>
                  <div className="p-2 bg-purple-50 text-purple-800 rounded-lg border border-purple-200">3. Scoring Model</div>
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">4. Brief / Content</div>
                  <div className="p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">5. Publish &amp; Verify</div>
                  <div className="p-2 bg-sky-50 text-sky-800 rounded-lg border border-sky-200">6. Closed GSC Loop</div>
                </div>
              </div>

              {/* High-Score Opportunity Queue */}
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Prioritized Opportunities in Factory Queue ({gapOpportunities.slice(0, 5).length})
                </h5>

                {gapOpportunities.slice(0, 5).map((op, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{op.query}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${op.tierBadgeClass}`}>
                            {op.recommendedAction}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Source Seed: &ldquo;{op.sourceGscQuery}&rdquo; &bull; Demand Score: {op.autocompleteScore}/100</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onExpandQueryInGkd(op.query);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Generate SEO Brief</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Real GSC First-Party Data + Authentic Search Autocomplete</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
