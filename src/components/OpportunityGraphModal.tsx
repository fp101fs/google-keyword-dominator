'use client';

import React, { useState } from 'react';
import {
  X,
  Compass,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Layers,
  BarChart3,
  Loader2,
  FileText,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { SearchOpportunityGraph, OpportunityAction } from '@/lib/intelligence/opportunity-graph';
import { ContentBriefModal } from './ContentBriefModal';
import { PageGraderDrawer } from './PageGraderDrawer';
import { KeywordItem } from '@/lib/autocomplete';

interface OpportunityGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteUrl?: string;
  isDemo?: boolean;
}

function createDummyKeywordItem(query: string): KeywordItem {
  return {
    keyword: query,
    seedKeyword: query,
    source: 'Google',
    country: 'US',
    ap: 1,
    apFormatted: '1st',
    diff: 'Med',
    hot: 'Hot keyword',
    relativeScore: 85,
    intent: 'commercial',
    wordCount: query.split(/\s+/).length,
    charCount: query.length,
    sources: ['google'],
  };
}

export const OpportunityGraphModal: React.FC<OpportunityGraphModalProps> = ({
  isOpen,
  onClose,
  siteUrl,
  isDemo = false,
}) => {
  const [graph, setGraph] = useState<SearchOpportunityGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActionForWhy, setSelectedActionForWhy] = useState<OpportunityAction | null>(null);
  const [briefSeed, setBriefSeed] = useState<string | null>(null);
  const [graderKeyword, setGraderKeyword] = useState<string | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/intelligence/opportunity-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl, isDemo }),
      });
      const data = await res.json();
      if (data.success && data.graph) {
        setGraph(data.graph);
      }
    } catch (err) {
      console.error('Failed to load opportunity graph:', err);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-xl shadow-inner">
                <Compass className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  Search Opportunity Graph
                  <span className="text-[10px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Next 100 Wins
                  </span>
                </h3>
                <p className="text-xs text-blue-200 font-medium">
                  A live map of what Google thinks your site should own next.
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

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
            {/* CTA Banner if not loaded */}
            {!graph && !isLoading && (
              <div className="py-14 px-6 text-center max-w-xl mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-900">
                    Simulate Your Website&apos;s Next 100 Moves
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instead of ranking keywords, this engine connects your GSC ranking footprint directly to Google autocomplete clusters and ranks the <strong>highest-leverage actions</strong> to take next.
                  </p>
                </div>
                <button
                  onClick={handleFetchGraph}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find My Next 100 Wins</span>
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Synthesizing Search Opportunity Graph &amp; Evidence Chains...
                </p>
              </div>
            )}

            {/* Opportunity Graph Results */}
            {graph && (
              <div className="space-y-6 animate-fadeIn">
                {/* Stats Top Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Actions Discovered</span>
                      <span className="text-lg font-black text-slate-900">{graph.totalWinsDiscovered} High-Impact Moves</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Topical Clusters</span>
                      <span className="text-lg font-black text-slate-900">{graph.topicalClustersCount} Parent Topics</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">GSC Impression Potential</span>
                      <span className="text-lg font-black text-slate-900">{graph.totalSearchVolumePotential.toLocaleString()} Impressions</span>
                    </div>
                  </div>
                </div>

                {/* Actions Table / List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Prioritized Execution Plan (Top 100 Wins)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click <strong className="text-blue-600 font-bold">&quot;Why?&quot;</strong> to inspect full evidence chain
                    </span>
                  </div>

                  <div className="space-y-2">
                    {graph.actions.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                      >
                        {/* Action Details */}
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
                            </p>
                          </div>
                        </div>

                        {/* Right Actions & Impact */}
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
                            title="Generate 1-Click Content Brief"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Brief</span>
                          </button>

                          <button
                            onClick={() => handleCopyAction(act)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Copy Action Details"
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
            )}
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

              {/* Confidence Badge */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900">Algorithm Confidence:</span>
                <span className="font-mono font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                  {selectedActionForWhy.evidence.confidence}
                </span>
              </div>

              {/* Evidence Points */}
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

              {/* Recommendation */}
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

      {/* Sub-modals for 1-Click Brief and Grader */}
      {briefSeed && (
        <ContentBriefModal
          seed={briefSeed}
          keywords={[createDummyKeywordItem(briefSeed)]}
          isOpen={!!briefSeed}
          onClose={() => setBriefSeed(null)}
        />
      )}

      {graderKeyword && (
        <PageGraderDrawer
          targetKeyword={graderKeyword}
          isOpen={!!graderKeyword}
          onClose={() => setGraderKeyword(null)}
        />
      )}
    </>
  );
};
