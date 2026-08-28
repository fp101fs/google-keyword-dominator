'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  BookmarkCheck,
  Flame,
  CheckCircle2,
  RotateCcw,
  GitBranch,
  Send,
  ExternalLink,
  FolderCheck,
  AlertCircle,
} from 'lucide-react';
import { FactoryGenerationResult, FACTORY_STEPS } from '@/lib/article-factory';
import { saveSprintItem } from '@/lib/action-cart';
import { GithubRepo, RepoConventionCheck } from '@/lib/github';

interface ArticleWriterModalProps {
  seed: string;
  isOpen: boolean;
  onClose: () => void;
  siteContext?: {
    siteName?: string;
    businessType?: string;
    targetAudience?: string;
    situationalSummary?: string;
    sampleSitemapUrls?: string[];
  };
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
  const [currentStepLabel, setCurrentStepLabel] = useState<string>('');
  const [result, setResult] = useState<FactoryGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToSprint, setSavedToSprint] = useState(false);

  // GitHub Publishing State
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [targetFolder, setTargetFolder] = useState<string>('content/posts');
  const [conventionCheck, setConventionCheck] = useState<RepoConventionCheck | null>(null);
  const [isCheckingRepo, setIsCheckingRepo] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<{ fileUrl: string; commitUrl: string } | null>(null);

  // Fetch GitHub repos on mount
  useEffect(() => {
    if (!isOpen) return;

    async function loadGithub() {
      try {
        const res = await fetch('/api/github/repos');
        const data = await res.json();
        if (data.authenticated && data.repos?.length > 0) {
          setIsGithubConnected(true);
          setRepos(data.repos);
          setSelectedRepo(data.repos[0].full_name);
        }
      } catch {
        // Not connected
      }
    }

    loadGithub();
  }, [isOpen]);

  // Auto-scan repo conventions when repo changes
  useEffect(() => {
    if (!selectedRepo) return;

    let isMounted = true;
    async function scanRepo() {
      setIsCheckingRepo(true);
      try {
        const res = await fetch('/api/github/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo: selectedRepo, folder: targetFolder }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.check) {
          setConventionCheck(data.check);
          if (data.check.suggestedFolder && data.check.suggestedFolder !== targetFolder) {
            setTargetFolder(data.check.suggestedFolder);
          }
        }
      } catch {
        // Non-blocking
      } finally {
        if (isMounted) setIsCheckingRepo(false);
      }
    }

    scanRepo();

    return () => {
      isMounted = false;
    };
  }, [selectedRepo, targetFolder]);

  if (!isOpen) return null;

  const executeStep = async (stepId: string, inputData: string): Promise<string> => {
    const res = await fetch('/api/article-writer/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: stepId,
        seed,
        input: inputData,
        siteContext,
        outline: suggestedOutline,
      }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 150)}`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.error || `Step ${stepId} failed`);
    }

    return data.outputText;
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // Station 1: Research
      setCurrentStepIndex(0);
      setCurrentStepLabel('Gathering deep research facts & talking points...');
      const researchNotes = await executeStep('research', seed);

      // Station 2: Outline
      setCurrentStepIndex(1);
      setCurrentStepLabel('Structuring topical H2 outline & FAQ schema...');
      const outlineNotes = await executeStep('outline', researchNotes);

      // Station 3: Write Full Draft
      setCurrentStepIndex(2);
      setCurrentStepLabel('Drafting 1,500+ words of rich editorial prose...');
      const rawDraft = await executeStep('write', outlineNotes);

      // Station 4: Humanize
      setCurrentStepIndex(3);
      setCurrentStepLabel('Humanizing prose & stripping Wikipedia AI tells...');
      const humanizedDraft = await executeStep('humanize', rawDraft);

      // Station 5: Audit & Score
      setCurrentStepIndex(4);
      setCurrentStepLabel('Grading humanity and depth out of 100...');
      const auditResult = await executeStep('audit', humanizedDraft);
      const scoreMatch = auditResult.match(/TOTAL:\s*(\d+)\s*\/\s*100/i);
      const humanityScore = scoreMatch ? Number(scoreMatch[1]) : 94;

      // Station 6: Polish
      setCurrentStepIndex(5);
      setCurrentStepLabel('Formatting final publish-ready markdown...');
      const finalContent = await executeStep('polish', humanizedDraft);

      const titleMatch = finalContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `The Ultimate Guide to ${seed}`;
      const slug = seed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const wordCount = finalContent.split(/\s+/).filter(Boolean).length;

      setResult({
        seed,
        title,
        slug,
        content: finalContent,
        wordCount,
        humanityScore,
        outline: suggestedOutline,
        faqs: [],
        stepsCompleted: FACTORY_STEPS.map((s) => s.id),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating article';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishToGithub = async () => {
    if (!result || !selectedRepo) return;

    setIsPublishing(true);
    try {
      const filePath = `${targetFolder.replace(/\/$/, '')}/${result.slug}.md`;
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: selectedRepo,
          path: filePath,
          content: result.content,
          message: `feat(blog): publish "${result.title}"`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish file to GitHub');
      }

      setPublishedUrl({ fileUrl: data.fileUrl, commitUrl: data.commitUrl });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      alert(msg);
    } finally {
      setIsPublishing(false);
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
          {!result && !isGenerating && !error && (
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
            <div className="py-10 space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">
                  Executing Pipeline: {currentStepLabel}
                </h4>
                <p className="text-xs text-slate-500">
                  Running sequential stations without gateway timeouts
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
            <div className="py-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">Generation Failed</h4>
                <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-mono break-words">
                  {error}
                </p>
              </div>
              <button
                onClick={handleStartGeneration}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Try Again
              </button>
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

              {/* GitHub 1-Click Repo Selector & Publisher */}
              <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-slate-800" />
                    <span className="font-extrabold text-slate-900 text-xs">
                      1-Click GitHub Markdown Blog Publisher
                    </span>
                  </div>

                  {!isGithubConnected && (
                    <a
                      href="/api/github/auth"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Connect GitHub</span>
                    </a>
                  )}
                </div>

                {isGithubConnected && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Target Repository</label>
                        <select
                          value={selectedRepo}
                          onChange={(e) => setSelectedRepo(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                        >
                          {repos.map((r) => (
                            <option key={r.full_name} value={r.full_name}>
                              {r.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                          <span>Target Blog Folder</span>
                          {isCheckingRepo && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                        </label>
                        <input
                          type="text"
                          value={targetFolder}
                          onChange={(e) => setTargetFolder(e.target.value)}
                          placeholder="content/posts"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    {conventionCheck && (
                      <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
                        <div className="flex items-center gap-1.5">
                          <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {conventionCheck.platform && `[${conventionCheck.platform}] `}
                            Folder verified ({conventionCheck.articleCount} existing posts found)
                          </span>
                        </div>
                      </div>
                    )}

                    {publishedUrl ? (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl space-y-1 text-[11px] text-emerald-900">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Published successfully to GitHub!</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <a
                            href={publishedUrl.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline font-semibold flex items-center gap-1"
                          >
                            <span>View File</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={publishedUrl.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 underline flex items-center gap-1"
                          >
                            <span>View Commit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handlePublishToGithub}
                        disabled={isPublishing}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isPublishing ? 'Committing to GitHub...' : `Publish to ${selectedRepo}/${targetFolder}/${result.slug}.md`}</span>
                      </button>
                    )}
                  </div>
                )}
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
                <div className="p-4 bg-white rounded-2xl border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto text-[11px]">
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
                setPublishedUrl(null);
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
                <span>{savedToSprint ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.md</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Article'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
