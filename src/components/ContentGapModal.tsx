'use client';

import React, { useState } from 'react';
import { KeywordGapResult } from '@/lib/content-gap';
import { Target, X, Loader2, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';

interface ContentGapModalProps {
  initialSeed: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContentGapModal: React.FC<ContentGapModalProps> = ({ initialSeed, isOpen, onClose }) => {
  const [targetSeed, setTargetSeed] = useState(initialSeed);
  const [competitorInput, setCompetitorInput] = useState('');
  const [gapData, setGapData] = useState<KeywordGapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gaps' | 'shared' | 'unique'>('gaps');
  const [copiedKw, setCopiedKw] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSeed.trim() || !competitorInput.trim()) return;

    const comps = competitorInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (comps.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/content-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSeed: targetSeed.trim(),
          competitorSeeds: comps,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to compute content gap');
      setGapData(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error analyzing content gap';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (kw: string) => {
    await navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 1500);
  };

  const handleCopyAll = async (list: { keyword: string }[]) => {
    const text = list.map((k) => k.keyword).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedKw('ALL');
    setTimeout(() => setCopiedKw(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Ahrefs Content Gap Explorer
                <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
                  Competitor Keyword Gap
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Discover keywords that your competitors rank for, but your target seed is missing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40">
          <form onSubmit={handleRunGap} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Your Target Seed / Topic
                </label>
                <input
                  type="text"
                  value={targetSeed}
                  onChange={(e) => setTargetSeed(e.target.value)}
                  placeholder="e.g. notion"
                  disabled={isLoading}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Competitor Seeds (comma separated, up to 3)
                </label>
                <input
                  type="text"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  placeholder="e.g. obsidian, coda, roam research"
                  disabled={isLoading}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !targetSeed.trim() || !competitorInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Find Keyword Gaps</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Body / Results */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!gapData && !isLoading && !error && (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <Target className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Enter competitors above to uncover untapped ranking opportunities.</p>
              <p className="text-xs">Example: Target = <code>air fryer</code> vs Competitors = <code>instant pot, toaster oven</code></p>
            </div>
          )}

          {gapData && (
            <div className="space-y-4 animate-fadeIn">
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
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('gaps')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'gaps' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Missed Gaps ({gapData.gapOpportunities.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('shared')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'shared' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Shared ({gapData.sharedKeywords.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('unique')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'unique' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Your Unique ({gapData.uniqueStrengths.length})
                  </button>
                </div>

                <button
                  onClick={() => {
                    const list =
                      activeTab === 'gaps'
                        ? gapData.gapOpportunities
                        : activeTab === 'shared'
                        ? gapData.sharedKeywords
                        : gapData.uniqueStrengths;
                    handleCopyAll(list);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1 rounded-lg cursor-pointer"
                >
                  {copiedKw === 'ALL' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy List</span>
                </button>
              </div>

              {/* Keyword List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {(activeTab === 'gaps'
                  ? gapData.gapOpportunities
                  : activeTab === 'shared'
                  ? gapData.sharedKeywords
                  : gapData.uniqueStrengths
                ).map((kw, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopy(kw.keyword)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 flex items-center justify-between text-xs transition-all cursor-pointer group shadow-2xs"
                  >
                    <span className="font-semibold text-slate-800 truncate mr-2">{kw.keyword}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                        {kw.seedKeyword}
                      </span>
                      {copiedKw === kw.keyword ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">Ahrefs-grade competitor content gap clustering</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
