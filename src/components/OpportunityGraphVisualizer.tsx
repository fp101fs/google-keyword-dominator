'use client';

import React, { useState } from 'react';
import { OpportunityAction } from '@/lib/intelligence/opportunity-graph';
import { Sparkles, HelpCircle, FileText, CheckCircle2, ChevronRight, BookmarkCheck, Check } from 'lucide-react';
import { saveSprintItem } from '@/lib/action-cart';

interface OpportunityGraphVisualizerProps {
  actions: OpportunityAction[];
  siteUrl: string;
  onSelectAction: (action: OpportunityAction) => void;
  onGenerateBrief: (query: string) => void;
}

export const OpportunityGraphVisualizer: React.FC<OpportunityGraphVisualizerProps> = ({
  actions,
  siteUrl,
  onSelectAction,
  onGenerateBrief,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [savedId, setSavedId] = useState<string | null>(null);

  // Group actions by actionType (Cluster Pillars)
  const clusters = [
    {
      id: 'all',
      label: 'All Moves',
      count: actions.length,
      color: 'bg-slate-900 text-white',
      border: 'border-slate-800',
    },
    {
      id: 'create_pillar',
      label: 'Pillar Hubs',
      count: actions.filter((a) => a.actionType === 'create_pillar').length,
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-500',
    },
    {
      id: 'optimize_page',
      label: 'Page Refreshes',
      count: actions.filter((a) => a.actionType === 'optimize_page').length,
      color: 'bg-teal-600 text-white',
      border: 'border-teal-500',
    },
    {
      id: 'rescue_ctr',
      label: 'CTR Boosters',
      count: actions.filter((a) => a.actionType === 'rescue_ctr').length,
      color: 'bg-rose-600 text-white',
      border: 'border-rose-500',
    },
    {
      id: 'add_faq_section',
      label: 'FAQ Blocks',
      count: actions.filter((a) => a.actionType === 'add_faq_section').length,
      color: 'bg-indigo-600 text-white',
      border: 'border-indigo-500',
    },
  ].filter((c) => c.id === 'all' || c.count > 0);

  const filteredActions = selectedCluster === 'all'
    ? actions
    : actions.filter((a) => a.actionType === selectedCluster);

  const handleSaveAction = (act: OpportunityAction) => {
    saveSprintItem({
      type: 'opportunity_action',
      title: `#${act.rank} ${act.title}`,
      subtitle: `${act.actionLabel} &bull; Query: "${act.targetQuery}" &bull; Impact: ${act.estimatedTrafficImpact}`,
      content: `Target Query: ${act.targetQuery}
Action Type: ${act.actionLabel}
Impact Potential: ${act.estimatedTrafficImpact}
Confidence: ${act.evidence.confidence}
Recommendation: ${act.evidence.recommendation}

Evidence Points:
- ${act.evidence.evidencePoints.join('\n- ')}`,
      metadata: {
        rank: act.rank,
        targetQuery: act.targetQuery,
      },
    });

    setSavedId(act.id);
    setTimeout(() => setSavedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Visual Cluster Navigation Header */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-sm text-slate-900">
              Interactive Topical Graph Matrix for <code className="text-blue-600 font-mono">{siteUrl || 'Domain'}</code>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredActions.length} prioritized branch moves
          </span>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {clusters.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCluster(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedCluster === c.id
                  ? `${c.color} shadow-xs`
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{c.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20">
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActions.map((act) => (
          <div
            key={act.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-2xs hover:shadow-md space-y-3 flex flex-col justify-between group"
          >
            {/* Top Node Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    #{act.rank}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${act.actionBadgeClass}`}>
                    {act.actionLabel}
                  </span>
                </div>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {act.estimatedTrafficImpact}
                </span>
              </div>

              <div className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                {act.title}
              </div>

              <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
                <div className="truncate">
                  Query: <strong className="text-slate-900">{act.targetQuery}</strong>
                </div>
                {act.suggestedSlug && (
                  <div className="truncate text-[11px] text-blue-600">
                    Slug: {act.suggestedSlug}
                  </div>
                )}
                {act.targetPageUrl && (
                  <div className="truncate text-[11px] text-teal-600">
                    Target URL: {act.targetPageUrl}
                  </div>
                )}
              </div>

              {/* Evidence Points Preview */}
              <div className="space-y-1 pt-1">
                {act.evidence.evidencePoints.slice(0, 2).map((pt, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions with Pin to Sprint (#5) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectAction(act)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Why?</span>
                </button>

                <button
                  onClick={() => handleSaveAction(act)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Save Action to Sprint Drawer"
                >
                  {savedId === act.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <BookmarkCheck className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                onClick={() => onGenerateBrief(act.targetQuery)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1-Click Brief</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
