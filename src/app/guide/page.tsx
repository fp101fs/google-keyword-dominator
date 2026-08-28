import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Sparkles, TrendingUp, Target, Grid, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'How to Use Google Keyword Dominator (Simple Guide)',
  description: 'A simple, step-by-step guide to using all keyword research, Google Search Console, and SERP tools in GKD.',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Quick User Guide
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How to Use Google Keyword Dominator
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            A simple, no-fluff guide to finding high-ranking keywords, connecting your Google Search Console, and optimizing your pages.
          </p>
        </div>

        {/* Tools Section Grid */}
        <div className="space-y-8">
          {/* Tool 1: Keywords Explorer */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. Keywords Explorer</h2>
                <p className="text-xs text-slate-500">Real autocomplete search discovery across Google, YouTube, Amazon, and Bing.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">Step 1:</span>
                <span>Type any seed query into the search bar (example: <code>running shoes</code>).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">Step 2:</span>
                <span>Select your target country and interface language to get localized results.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">Step 3:</span>
                <span>Check the Alphabet, Questions, or Prepositions boxes to scan all variations.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600">Step 4:</span>
                <span>View results in the table or switch between 8 visual layouts (Bubble Map, Treemap, Scatter Plot, Radial Graph).</span>
              </div>
            </div>
          </section>

          {/* Tool 2: Search Intelligence AI Hub */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Search Intelligence Hub</h2>
                <p className="text-xs text-slate-500">Combines your real Google Search Console data with autocomplete demand.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">GSC Gap Finder:</strong>
                <p>Takes queries your site already ranks for, finds related autocomplete searches, and shows what subtopics you are missing.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">Page Expansion Engine:</strong>
                <p>Pick any existing URL on your site. The system tells you the exact H2 headers and FAQs you should add to rank higher.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">Rankings Rescue:</strong>
                <p>Finds queries stuck on Page 2 (Positions 11 to 20) or with low CTR, and gives you copyable prompts to fix them.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 block font-bold">SEO Content Factory:</strong>
                <p>Prioritizes high-value opportunities into a queue and helps you generate ready-to-publish content briefs.</p>
              </div>
            </div>
          </section>

          {/* Tool 3: GSC Striking Distance */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">3. GSC Striking Distance (Page 2 to Page 1)</h2>
                <p className="text-xs text-slate-500">Fastest way to get more search traffic from pages Google already likes.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">What it is:</span>
                <span>Google already ranks your page in positions 11 to 25. Adding a few paragraphs can move it to position 1 to 5.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">How to use:</span>
                <span>Click &quot;GSC Striking Distance&quot; in the top bar. Look at the list of queries, then click &quot;Expand in GKD&quot; to see all long-tail terms to include in your article.</span>
              </div>
            </div>
          </section>

          {/* Tool 4: Content Gap Explorer */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Content Gap Explorer</h2>
                <p className="text-xs text-slate-500">Compare your topic with up to 3 competitors in real time.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-rose-600">How to use:</span>
                <span>Click &quot;Content Gap&quot; in the navigation. Enter your main seed topic, then enter competitor topics. GKD scans both in real time and highlights missed terms they rank for that you do not cover.</span>
              </div>
            </div>
          </section>

          {/* Tool 5: SERP Overlap Matrix */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">5. SERP Overlap &amp; Cannibalization Matrix</h2>
                <p className="text-xs text-slate-500">Check if two keywords share the same Google search results.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600">Why it matters:</span>
                <span>If two keywords share 40% or more of the same URLs, write 1 single page for both. If they share 0%, create 2 separate articles.</span>
              </div>
            </div>
          </section>

          {/* Tool 6: Content Briefs & Page Grader */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">6. Content Briefs &amp; Live Page Grader</h2>
                <p className="text-xs text-slate-500">Turn keywords into article outlines and audit existing pages.</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">Briefs:</span>
                <span>Click &quot;Briefs&quot; or &quot;Generate Brief&quot; on any keyword to get structured H1, H2 headers, primary keywords checklist, and FAQ Schema code.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-purple-600">Page Grader:</span>
                <span>Inside the brief modal, enter any live webpage URL to get a 0 to 100 SEO score with recommended fixes.</span>
              </div>
            </div>
          </section>
        </div>

        {/* Quick Tips Box */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Summary: The Best Daily Workflow</span>
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-300">
            <li>Connect your Google Search Console account.</li>
            <li>Check <strong>GSC Striking Distance</strong> to see what queries are close to Page 1.</li>
            <li>Open <strong>Search Intelligence &rarr; Page Expansion</strong> to get the exact headings to add to that page.</li>
            <li>Use <strong>Keywords Explorer</strong> to find new related long-tail keywords.</li>
            <li>Export your <strong>Content Brief</strong> and update or publish your content.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
