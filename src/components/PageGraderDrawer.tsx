'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2, Gauge, Globe, Sparkles } from 'lucide-react';
import { LlmPageAuditResponse } from '@/lib/llm';

interface PageGraderDrawerProps {
  targetKeyword: string;
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
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
  initialUrl = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGrade = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = url || initialUrl;
    if (!target.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/page-grader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target.trim(), targetKeyword: targetKeyword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to grade page');
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while grading the page';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 block">
                Live On-Page SEO Grader
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate max-w-xs sm:max-w-md">
                Keyword: &ldquo;{targetKeyword}&rdquo;
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* URL Input Form */}
          <form onSubmit={handleGrade} className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Enter Live URL to Audit
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Grading...' : 'Grade Page'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Overall SEO Score
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {result.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border ${
                    result.score >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : result.score >= 50
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {result.score >= 80 ? 'A' : result.score >= 50 ? 'C' : 'F'}
                </div>
              </div>

              {/* Checks Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Core SEO Health Checklist
                </span>
                <div className="space-y-2">
                  {result.checks.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      {c.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{c.label}</div>
                        <div className="text-slate-500 text-[11px] leading-relaxed">{c.tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DeepSeek AI Editorial Audit */}
              {result.llmAudit && (
                <div className="space-y-3 p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      DeepSeek Editorial &amp; Missing Subtopics
                    </span>
                  </div>

                  {result.llmAudit.missingSubtopics.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-slate-900 block">Missing Subtopics:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        {result.llmAudit.missingSubtopics.map((sub, idx) => (
                          <li key={idx}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.llmAudit.criticalIssues.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-rose-900 block">Critical Issues:</span>
                      <ul className="list-disc list-inside space-y-1 text-rose-700">
                        {result.llmAudit.criticalIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
