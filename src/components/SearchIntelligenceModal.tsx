'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileText,
  LifeBuoy,
  Globe,
  Loader2,
  RefreshCw,
  Layers,
  ChevronRight,
  Compass,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { GscConnectedSnapshot, GscProperty } from '@/lib/gsc/types';
import { GscGapOpportunity, PageExpansionPlan, RankingsRescueTask } from '@/lib/intelligence/types';
import { SearchOpportunityGraph, OpportunityAction } from '@/lib/intelligence/opportunity-graph';
import { ContentBriefModal } from './ContentBriefModal';

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
  const [activeTab, setActiveTab] = useState<'opportunity_graph' | 'gsc_gap' | 'page_expansion' | 'rankings_rescue'>('opportunity_graph');

  // Search Opportunity Graph State
  const [graph, setGraph] = useState<SearchOpportunityGraph | null>(null);
  const [isLoadingGraph, setIsLoadingGraph] = useState<boolean>(false);
  const [selectedActionForWhy, setSelectedActionForWhy] = useState<OpportunityAction | null>(null);
  const [briefSeed, setBriefSeed] = useState<string | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  // GSC Gap Opportunities State
  const [gapOpportunities, setGapOpportunities] = useState<GscGapOpportunity[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState<boolean>(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Page Expansion State & Discovered Sitemap URLs
  const [expansionPlan, setExpansionPlan] = useState<PageExpansionPlan | null>(null);
  const [isLoadingExpansion, setIsLoadingExpansion] = useState<boolean>(false);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>('');
  const [discoveredSitemapUrls, setDiscoveredSitemapUrls] = useState<string[]>([]);

  // Rankings Rescue State
  const [rescueTasks, setRescueTasks] = useState<RankingsRescueTask[]>([]);
  const [isLoadingRescue, setIsLoadingRescue] = useState<boolean>(false);

  const propertyTarget = selectedProperty || gscSnapshot?.property || '';

  // Trigger analysis when modal opens or property changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadData() {
      // 0. Auto-discover Sitemap URLs for Page Expansion dropdown
      if (propertyTarget) {
        try {
          const sitemapRes = await fetch('/api/site-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: propertyTarget, sitemapOnly: true }),
          });
          const sitemapData = await sitemapRes.json();
          if (isMounted && sitemapData.success && sitemapData.sitemap?.urls) {
            setDiscoveredSitemapUrls(sitemapData.sitemap.urls);
          }
        } catch {
          // Non-blocking fallback
        }
      }

      // 1. Search Opportunity Graph (100 Wins)
      setIsLoadingGraph(true);
      try {
        const res = await fetch('/api/intelligence/opportunity-graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteUrl: propertyTarget, isDemo: !isAuthenticated }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.graph) {
          setGraph(data.graph);
        }
      } catch (err) {
        console.error('Error fetching opportunity graph:', err);
      } finally {
        if (isMounted) setIsLoadingGraph(false);
      }

      // 2. Gaps
      setIsLoadingGaps(true);
      try {
        const res = await fetch('/api/intelligence/gsc-gap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteUrl: propertyTarget, isDemo: !isAuthenticated }),
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

      // 3. Expansion Plan
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

      // 4. Rankings Rescue
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
    setIsLoadingGraph(true);
    setIsLoadingGaps(true);
    setIsLoadingExpansion(true);
    setIsLoadingRescue(true);

    fetch('/api/intelligence/opportunity-graph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl: propertyTarget, isDemo: !isAuthenticated }),
    })
      .then((r) => r.json())
      .then((d) => d.success && setGraph(d.graph))
      .finally(() => setIsLoadingGraph(false));

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

  const handleCopyAction = async (action: OpportunityAction) => {
    const text = `SEO Action #${action.rank}: ${action.title}
Action Type: ${action.actionLabel}
Target Query: ${action.targetQuery}
Estimated Traffic Impact: ${action.estimatedTrafficImpact}
Recommendation: ${action.evidence.recommendation}
Evidence:
- ${action.evidence.evidencePoints.join('\n- ')}`;

    await navigator.clipboard.writeText(text);
    setCopiedActionId(action.id);
    setTimeout(() => setCopiedActionId(null), 2000);
  };

  if (!isOpen) return null;

  // Combine GSC ranking pages + discovered sitemap URLs
  const allAvailablePageUrls = Array.from(
    new Set([
      ...(gscSnapshot?.pages || []).map((p) => p.url),
      ...discoveredSitemapUrls,
    ])
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-xl shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  Search Opportunity Operating System
                  <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-blue-500 text-white rounded-full">
                    DeepSeek AI
                  </span>
                </h3>
                <p className="text-xs text-blue-200">
                  Don&apos;t just find keywords. Find what your website should own next.
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
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGraph || isLoadingGaps || isLoadingExpansion || isLoadingRescue ? 'animate-spin text-blue-600' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            </div>
          </div>

          {/* Intelligence Tab Switcher */}
          <div className="flex items-center gap-1 border-b border-slate-200 px-6 pt-3 bg-white text-xs font-bold overflow-x-auto">
            {/* Tab 1: Search Opportunity Graph (100 Wins) */}
            <button
              onClick={() => setActiveTab('opportunity_graph')}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'opportunity_graph'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>1. Opportunity Graph (Next 100 Wins)</span>
            </button>

            {/* Tab 2: GSC Gap Finder */}
            <button
              onClick={() => setActiveTab('gsc_gap')}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'gsc_gap'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. GSC Gap Finder ({gapOpportunities.length})</span>
            </button>

            {/* Tab 3: Existing-Page Expansion */}
            <button
              onClick={() => setActiveTab('page_expansion')}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'page_expansion'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Page Expansion ({allAvailablePageUrls.length})</span>
            </button>

            {/* Tab 4: Rankings Rescue */}
            <button
              onClick={() => setActiveTab('rankings_rescue')}
              className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rankings_rescue'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>4. Rankings Rescue ({rescueTasks.length})</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
            {/* ===================== TAB 1: SEARCH OPPORTUNITY GRAPH (100 WINS) ===================== */}
            {activeTab === 'opportunity_graph' && (
              <div className="space-y-6">
                {isLoadingGraph ? (
                  <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Constructing Search Opportunity Graph &amp; Evidence Chains...
                    </p>
                  </div>
                ) : graph ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Header Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Actions Ranked</span>
                          <span className="text-lg font-black text-slate-900">{graph.totalWinsDiscovered} Next Moves</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Topical Clusters</span>
                          <span className="text-lg font-black text-slate-900">{graph.topicalClustersCount} Core Topics</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Impression Potential</span>
                          <span className="text-lg font-black text-slate-900">{graph.totalSearchVolumePotential.toLocaleString()} Searches</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sitemap Verified</span>
                          <span className="text-lg font-black text-slate-900">{graph.sitemapUrlsCount} Pages</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          Simulated Next 100 Wins (Ranked by Leverage)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Click <strong className="text-blue-600 font-bold">&quot;Why?&quot;</strong> to inspect evidence chain
                        </span>
                      </div>

                      <div className="space-y-2">
                        {graph.actions.map((act) => (
                          <div
                            key={act.id}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                                #{act.rank}
                              </span>
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${act.actionBadgeClass}`}>
                                    {act.actionLabel}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {act.title}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">
                                  Target Query: <code className="text-blue-600 font-semibold">{act.targetQuery}</code>
                                  {act.suggestedSlug && ` &bull; Slug: ${act.suggestedSlug}`}
                                  {act.evidence.sitemapMatchedUrl && (
                                    <span className="ml-2 text-teal-700 font-mono text-[10px] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                      sitemap match: {act.evidence.sitemapMatchedUrl.split('/').pop() || 'page'}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <span className="text-xs font-mono font-black text-emerald-600 tracking-wider bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                {act.estimatedTrafficImpact}
                              </span>

                              <button
                                onClick={() => setSelectedActionForWhy(act)}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>Why?</span>
                              </button>

                              <button
                                onClick={() => setBriefSeed(act.targetQuery)}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Brief</span>
                              </button>

                              <button
                                onClick={() => handleCopyAction(act)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                {copiedActionId === act.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ===================== TAB 2: GSC GAP FINDER ===================== */}
            {activeTab === 'gsc_gap' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Topical Gap Matrix: GSC Reality &times; Autocomplete Demand &times; Sitemap
                    </h4>
                    <p className="text-xs text-slate-500">
                      Discovered {gapOpportunities.length} high-leverage search opportunities your site can rank for.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Filter Tier:</span>
                    <select
                      value={selectedTierFilter}
                      onChange={(e) => setSelectedTierFilter(e.target.value)}
                      className="p-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="all">All Tiers ({gapOpportunities.length})</option>
                      <option value="green_striking">Striking Distance (Pos 11-20)</option>
                      <option value="green_impressions">High Demand Keywords</option>
                      <option value="yellow_new_content">New Content Opportunities</option>
                      <option value="red_low_ctr">Low CTR / Quick Fix</option>
                    </select>
                  </div>
                </div>

                {isLoadingGaps ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Expanding GSC &amp; Sitemap Queries via Autocomplete Matrix...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gapOpportunities
                      .filter((op) => selectedTierFilter === 'all' || op.tier === selectedTierFilter)
                      .map((op, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${op.tierBadgeClass}`}>
                                  {op.tierLabel}
                                </span>
                                <span className="font-extrabold text-sm text-slate-900 font-mono">{op.query}</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Discovered from Seed: <strong className="text-slate-700">&quot;{op.sourceGscQuery}&quot;</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  onExpandQueryInGkd(op.query);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Explore in GKD</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600">
                            <div>
                              <strong className="text-slate-800">Prescription:</strong> {op.recommendedAction}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                              <span>Demand Score: <strong>{op.autocompleteScore}/100</strong></span>
                              {op.position > 0 && <span>Pos: <strong>#{op.position.toFixed(1)}</strong></span>}
                              {op.impressions > 0 && <span>Imp: <strong>{op.impressions.toLocaleString()}</strong></span>}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 3: PAGE EXPANSION ENGINE ===================== */}
            {activeTab === 'page_expansion' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Existing-Page Subtopic Expansion Engine
                      </h4>
                      <p className="text-xs text-slate-500">
                        Turn ranking pages or discovered sitemap URLs into comprehensive topical hubs.
                      </p>
                    </div>

                    {allAvailablePageUrls.length > 0 && (
                      <select
                        value={selectedPageUrl}
                        onChange={(e) => setSelectedPageUrl(e.target.value)}
                        className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer max-w-sm truncate"
                      >
                        {allAvailablePageUrls.map((url) => (
                          <option key={url} value={url}>
                            {url}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {isLoadingExpansion ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Synthesizing Page Expansion Strategy...</p>
                  </div>
                ) : expansionPlan ? (
                  <div className="space-y-4">
                    {expansionPlan.titleMetaRecommendation && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                        <div className="font-extrabold text-emerald-900">Recommended Title &amp; Snippet Optimization</div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-slate-500">Title: </span>
                            <strong className="text-slate-900">{expansionPlan.titleMetaRecommendation.recommendedTitle}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Meta: </span>
                            <span className="text-slate-700">{expansionPlan.titleMetaRecommendation.recommendedMeta}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Missing Subtopics to Add to Page ({expansionPlan.missingSubtopics.length})
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {expansionPlan.missingSubtopics.map((sub, i) => (
                          <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <span>{sub.title}</span>
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 uppercase font-mono">
                                {sub.type}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              Heading: <code className="text-blue-600 font-semibold">{sub.suggestedHeading}</code>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ===================== TAB 4: RANKINGS RESCUE PROTOCOL ===================== */}
            {activeTab === 'rankings_rescue' && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-amber-600" />
                    Rankings Rescue Protocol: Page-2 Striking Distance &amp; Low CTR Fixes
                  </h4>
                  <p className="text-xs text-slate-500">
                    Automated diagnosis of pages losing traffic to weak snippets or stuck on page 2.
                  </p>
                </div>

                {isLoadingRescue ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Diagnosing Rankings Rescue Opportunities...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rescueTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">{task.title}</span>
                              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold uppercase">
                                {task.type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-slate-500">
                              Target Query: <code className="text-blue-600 font-semibold">{task.query}</code>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                            <span>Pos: <strong>#{task.impactMetrics.position.toFixed(1)}</strong></span>
                            <span>Imp: <strong>{task.impactMetrics.impressions.toLocaleString()}</strong></span>
                            <span>CTR: <strong>{(task.impactMetrics.ctr * 100).toFixed(1)}%</strong></span>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50/60 rounded-xl text-slate-700 border border-amber-100">
                          <strong className="text-amber-900 block mb-0.5">Prescribed Fix:</strong>
                          {task.prescribedFix}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span>Search Opportunity Graph Engine &bull; DeepSeek AI &bull; Sitemap Grounded</span>
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

      {/* "Why This Exists" Evidence Modal */}
      {selectedActionForWhy && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Why This Opportunity Exists
                </h4>
              </div>
              <button
                onClick={() => setSelectedActionForWhy(null)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Action #{selectedActionForWhy.rank} &bull; {selectedActionForWhy.actionLabel}
                </span>
                <div className="font-extrabold text-slate-900 text-sm">
                  {selectedActionForWhy.title}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900">Algorithm Confidence:</span>
                <span className="font-mono font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                  {selectedActionForWhy.evidence.confidence}
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Observed Data &amp; Search Signals:
                </span>
                <div className="space-y-1.5">
                  {selectedActionForWhy.evidence.evidencePoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">Prescribed Next Move:</span>
                <p className="text-slate-600 leading-relaxed">
                  {selectedActionForWhy.evidence.recommendation}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setBriefSeed(selectedActionForWhy.targetQuery);
                    setSelectedActionForWhy(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Build Brief for this Action</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal for 1-Click Brief */}
      {briefSeed && (
        <ContentBriefModal
          seed={briefSeed}
          keywords={[
            {
              keyword: briefSeed,
              seedKeyword: briefSeed,
              source: 'Google',
              country: 'US',
              ap: 1,
              apFormatted: '1st',
              diff: 'Med',
              hot: 'Hot keyword',
              relativeScore: 85,
              intent: 'commercial',
              wordCount: briefSeed.split(/\s+/).length,
              charCount: briefSeed.length,
              sources: ['google'],
            },
          ]}
          isOpen={!!briefSeed}
          onClose={() => setBriefSeed(null)}
          siteUrl={propertyTarget}
        />
      )}
    </>
  );
};
