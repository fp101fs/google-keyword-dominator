'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  BookmarkCheck,
  FileText,
  Flame,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { FactoryGenerationResult, FACTORY_STEPS } from '@/lib/article-factory';
import { saveSprintItem } from '@/lib/action-cart';

interface ArticleWriterModalProps {
  seed: string;
  isOpen: boolean;
  onClose: () => void;
  siteContext?: { siteName?: string; businessType?: string; targetAudience?: string };
  suggestedOutline?: string[];
}

export const ArticleWriterModal: React.FC<ArticleWriterModalProps> = ({
  seed,
  isOpen,
  onClose,
  siteContext,
  suggestedOutline = [],
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<FactoryGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToSprint, setSavedToSprint] = useState(false);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentStepIndex(0);

    // Simulate progress animation across pipeline steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < FACTORY_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    try {
      const res = await fetch('/api/article-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed,
          siteContext,
          outline: suggestedOutline,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate article');
      }

      setResult(data.result);
      setCurrentStepIndex(FACTORY_STEPS.length - 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating article';
      setError(msg);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.slug || 'article'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToSprint = () => {
    if (!result) return;
    saveSprintItem({
      type: 'content_brief',
      title: `Full Article: ${result.title}`,
      subtitle: `${result.wordCount.toLocaleString()} words &bull; Humanity Score: ${result.humanityScore}/100`,
      content: result.content,
      metadata: {
        seed,
        slug: result.slug,
        wordCount: result.wordCount,
      },
    });
    setSavedToSprint(true);
    setTimeout(() => setSavedToSprint(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-2xl shadow-inner">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Autonomous Article Factory &amp; Humanizer
                <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Multi-Stage Pipeline
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Target Topic: <strong className="text-white font-bold">{seed}</strong>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 text-xs">
          {!result && !isGenerating && (
            <div className="py-10 text-center space-y-5 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-black text-slate-900">
                  Ready to Craft a Human-Grade 1,500+ Word Article
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our autonomous engine will research the topic, structure high-CTR headings, draft the complete piece, and strip AI cliches using the strict Wikipedia Anti-AI rubric.
                </p>
              </div>

              <button
                onClick={handleStartGeneration}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Launch Autonomous Factory</span>
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="py-12 space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">
                  Building Complete Article for &ldquo;{seed}&rdquo;...
                </h4>
                <p className="text-xs text-slate-500">
                  Running multi-stage reasoning and anti-AI humanization
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                {FACTORY_STEPS.map((st, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={st.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-blue-50/80 border border-blue-200'
                          : isDone
                          ? 'text-slate-700'
                          : 'text-slate-400 opacity-60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900">{st.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{st.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Score Banner */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Word Count</span>
                  <span className="text-base font-black text-slate-900">{result.wordCount.toLocaleString()} Words</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Humanity Score</span>
                  <span className="text-base font-black text-emerald-600 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {result.humanityScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="text-base font-black text-blue-600">Publish Ready</span>
                </div>
              </div>

              {/* Title & Slug Box */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Article Title</span>
                <div className="font-extrabold text-slate-900 text-sm">{result.title}</div>
                <div className="text-[11px] text-slate-500 font-mono">Slug: /{result.slug}</div>
              </div>

              {/* Article Preview */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Generated Article Content (Markdown)
                </span>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto text-[11px]">
                  {result.content}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {result && (
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setResult(null);
                handleStartGeneration();
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToSprint}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Pin article to Action Sprint"
              >
                {savedToSprint ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />}
                <span>{savedToSprint ? 'Saved to Sprint' : 'Save to Sprint'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Article'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
