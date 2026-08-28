'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Gauge, Globe, Sparkles } from 'lucide-react';
import { LlmPageAuditResponse } from '@/lib/llm';

interface PageGraderDrawerProps {
  targetKeyword: string;
  isOpen: boolean;
  onClose: () => void;
}

interface GradeResult {
  url: string;
  score: number;
  checks: { label: string; passed: boolean; tip: string }[];
  extracted: {
    title: string;
    metaDescription: string;
    h1Count: number;
    h1s: string[];
    h2Count: number;
    h2s: string[];
    wordCount: number;
  };
  llmAudit?: LlmPageAuditResponse | null;
}

export const PageGraderDrawer: React.FC<PageGraderDrawerProps> = ({
  targetKeyword,
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/page-grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), targetKeyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grade page');
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Audit failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                1-Click Page Grader &bull; DeepSeek AI
              </h3>
              <p className="text-xs text-slate-500">
                Audit URL against target keyword: <strong className="text-slate-800">&quot;{targetKeyword}&quot;</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Audit URL Form */}
          <form onSubmit={handleGrade} className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Enter Live URL to Audit
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/blog/my-post"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Grade Page</span>}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Audit Results */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Overall Score Circle */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                    SEO Readiness Score
                  </span>
                  <div className="text-2xl font-black mt-1">
                    {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Moderate' : 'Needs Optimization'}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Word count: ~{result.extracted.wordCount} words &bull; H2 tags: {result.extracted.h2Count}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 ${
                  result.score >= 80 ? 'border-emerald-400 text-emerald-400 bg-emerald-950/50' : 'border-amber-400 text-amber-400 bg-amber-950/50'
                }`}>
                  {result.score}
                </div>
              </div>

              {/* LLM Strategic Audit */}
              {result.llmAudit && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black text-purple-900 uppercase tracking-wider">
                      DeepSeek Editorial Audit
                    </span>
                  </div>

                  {result.llmAudit.intentAlignment && (
                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">Intent Match:</strong> {result.llmAudit.intentAlignment}
                    </div>
                  )}

                  {result.llmAudit.missingSubtopics && result.llmAudit.missingSubtopics.length > 0 && (
                    <div className="space-y-1">
                      <strong className="text-xs text-slate-900 block">Missing Key Subtopics:</strong>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {result.llmAudit.missingSubtopics.map((sub, i) => (
                          <span key={i} className="text-[11px] bg-white border border-purple-300 text-purple-900 px-2 py-0.5 rounded-lg font-medium">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.llmAudit.recommendedImprovements && result.llmAudit.recommendedImprovements.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <strong className="text-xs text-slate-900 block">Recommended Optimizations:</strong>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {result.llmAudit.recommendedImprovements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actionable Checks List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  On-Page SEO Checklist
                </h4>
                <div className="space-y-2">
                  {result.checks.map((c, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                        c.passed
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                          : 'bg-rose-50/60 border-rose-200 text-slate-800'
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{c.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${c.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {c.passed ? 'Passed' : 'Action Required'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{c.tip}</p>
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
  );
};
