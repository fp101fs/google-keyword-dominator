'use client';

import React, { useState } from 'react';
import { KeywordItem } from '@/lib/autocomplete';
import { KeywordGapResult } from '@/lib/content-gap';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Copy,
  Check,
  TrendingDown,
  Loader2,
  FileText,
} from 'lucide-react';
import { LlmCompetitorGapResponse } from '@/lib/llm';
import { ContentBriefModal } from './ContentBriefModal';

interface ContentGapModalProps {
  initialSeed?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContentGapModal: React.FC<ContentGapModalProps> = ({
  initialSeed = '',
  isOpen,
  onClose,
}) => {
  const [targetSeed, setTargetSeed] = useState(initialSeed);
  const [competitors, setCompetitors] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState<KeywordGapResult | null>(null);
  const [llmStrategy, setLlmStrategy] = useState<LlmCompetitorGapResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'gaps' | 'shared' | 'unique'>('gaps');
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [briefSeed, setBriefSeed] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleCompetitorChange = (index: number, val: string) => {
    const updated = [...competitors];
    updated[index] = val;
    setCompetitors(updated);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSeed.trim()) return;

    const validCompetitors = competitors.map((c) => c.trim()).filter(Boolean);
    if (validCompetitors.length === 0) return;

    setLoading(true);
    setGapData(null);
    setLlmStrategy(null);

    try {
      const res = await fetch('/api/content-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSeed: targetSeed.trim(),
          competitorSeeds: validCompetitors,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGapData(data.data);
        if (data.llmStrategy) {
          setLlmStrategy(data.llmStrategy);
        }
      }
    } catch (err) {
      console.error('Failed to analyze content gap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKw(text);
    setTimeout(() => setCopiedKw(null), 1500);
  };

  const handleCopyAll = async (items: KeywordItem[]) => {
    const text = items.map((k) => k.keyword).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedKw('ALL');
    setTimeout(() => setCopiedKw(null), 1500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Ahrefs-Style Content Gap Explorer
                </h3>
                <p className="text-xs text-slate-500">
                  Find keywords your competitors rank for that you are missing.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Your Target Topic / Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. notion ai or wavreel.com"
                  value={targetSeed}
                  onChange={(e) => setTargetSeed(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Competitor Topics / Domains (Up to 3)</span>
                  {competitors.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddCompetitor}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Competitor</span>
                    </button>
                  )}
                </label>

                {competitors.map((comp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Competitor ${idx + 1} (e.g. clickup or descript.com)`}
                      value={comp}
                      onChange={(e) => handleCompetitorChange(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                      required
                    />
                    {competitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Competitor Matrices &amp; Sitemaps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Discover Content Gaps</span>
                  </>
                )}
              </button>
            </form>

            {/* Results */}
            {gapData && (
              <div className="space-y-4 animate-fadeIn">
                {/* DeepSeek AI Strategy Insight */}
                {llmStrategy && (
                  <div className="p-4 bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                        DeepSeek Differentiation Strategy
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {llmStrategy.differentiationStrategy}
                    </p>

                    {llmStrategy.highOpportunitySubtopics.length > 0 && (
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500">Uncovered Angles:</span>
                        {llmStrategy.highOpportunitySubtopics.map((sub, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-white text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coverage Metrics Card */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Gap Opportunities</span>
                    <span className="text-xl font-black text-rose-600">{gapData.gapOpportunities.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Shared Keywords</span>
                    <span className="text-xl font-black text-blue-600">{gapData.sharedKeywords.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Topic Coverage</span>
                    <span className="text-xl font-black text-emerald-600">{gapData.gapCoverageScore}%</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('gaps')}
                      className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        activeTab === 'gaps'
                          ? 'border-rose-600 text-rose-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Keyword Gaps ({gapData.gapOpportunities.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('shared')}
                      className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        activeTab === 'shared'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Shared ({gapData.sharedKeywords.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('unique')}
                      className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                        activeTab === 'unique'
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Your Unique ({gapData.uniqueStrengths.length})
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyAll(
                        activeTab === 'gaps'
                          ? gapData.gapOpportunities
                          : activeTab === 'shared'
                          ? gapData.sharedKeywords
                          : gapData.uniqueStrengths
                      )
                    }
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer pb-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKw === 'ALL' ? 'Copied All!' : 'Copy List'}</span>
                  </button>
                </div>

                {/* Keyword List with 1-Click Brief Cross-Link (#3) */}
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {(activeTab === 'gaps'
                    ? gapData.gapOpportunities
                    : activeTab === 'shared'
                    ? gapData.sharedKeywords
                    : gapData.uniqueStrengths
                  ).map((kw: KeywordItem, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-xs border border-slate-200/60 transition-colors group"
                    >
                      <span className="font-semibold text-slate-800 truncate pr-2">{kw.keyword}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setBriefSeed(kw.keyword)}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Generate 1-Click Content Brief for this gap"
                        >
                          <FileText className="w-3 h-3 text-rose-600" />
                          <span>Brief</span>
                        </button>
                        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {kw.intent}
                        </span>
                        <button
                          onClick={() => handleCopy(kw.keyword)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                        >
                          {copiedKw === kw.keyword ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1-Click Content Brief for any Gap Keyword */}
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
        />
      )}
    </>
  );
};
