# Google Keyword Dominator (GKD) - Pro SEO Suite

A modern, production-ready Keyword Research and SERP Intelligence application built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

Inspired by Keyword Tool Dominator and Ahrefs Keywords Explorer, GKD extracts **100% genuine autocomplete queries** across multiple search engines and pairs them with live SERP analysis without any fake or hallucinated metrics.

![Keyword Dominator](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 Key Features & Capabilities

### 1. Multi-Platform Autocomplete Engine
* **Platforms**: Google Search, YouTube, Amazon, and Bing.
* **Localization**: 20+ Countries (with `gl` localization) and 14+ Interface Languages (with `hl` localization).
* **Deep Discovery Query Expansion**:
  * **Alphabet Modifiers**: Scans `seed + [a-z]` and `[a-z] + seed` (52 query branches).
  * **Questions**: Scans `how, what, why, where, when, who, which, can, is`.
  * **Prepositions & Context**: Scans `for, with, without, near, to, in, on, like`.
  * **Bulk Multi-Seed Search**: Concurrently aggregates up to 5 seed keywords simultaneously.

### 2. Strict Real-Time Data Model
* **Autocomplete Placement (AP Rank)**: Exact numerical position in autocomplete (`1st`, `2nd`, `3rd`, etc.).
* **Relative Popularity Score (0-100)**: Derived from recurrence frequency across alphabet expansions and top placement ranks.
* **Difficulty (Diff)**: Computed mathematically from AP rank, score prominence, and word count.
* **Intent Categorization**: Automatic classification into *Informational*, *Commercial*, *Transactional*, or *Navigational*.

### 3. Ahrefs-Grade Competitive Features
* 🎯 **Ahrefs Content Gap Explorer**: Compare your seed against up to 3 competitors to uncover **Missed Gaps**, **Shared Terms**, **Unique Strengths**, and **Topic Coverage %**.
* 🔍 **1-Click Live SERP Inspector**: Inspect top 10 Google search results via Jina Search (`s.jina.ai`) with page titles, full URLs, and root domains.
* 📊 **Ahrefs KD Ranking Guidance**: Actionable advice for *Easy (Low KD)*, *Medium (Moderate KD)*, and *Hard (High KD)* terms.
* 📑 **Ahrefs Sub-Navigation Tabs**: 1-click filtering by *All Terms*, *Matching Terms*, *Questions*, *Vs & Comparisons*, and *Prepositions*.

### 4. 8 Comprehensive Visualization Modes
1. 📋 **Keyword Table View**: 8-column sortable, filterable table with single/bulk clipboard copy and RFC 4180 CSV export.
2. 📈 **2D Opportunity Scatter Plot**: Quadrant matrix isolating low-hanging fruit (*High Score + Low AP Rank*).
3. 🔲 **Topical Treemap**: Market share volume blocks by intent and query modification.
4. 🌌 **SERP-Intent Galaxy (Radial Gravity Map)**: Force-directed radial map where *Distance = SERP Similarity*, *Angle = Intent Arm*, and *Edges = Selective SERP Overlap*.
5. 🕸️ **60fps Canvas Network Graph**: Hardware-accelerated force-directed graph with zero idle CPU overhead.
6. 📊 **SERP Overlap Matrix**: $N \times N$ heatmap grid calculating shared ranking URLs and keyword cannibalization risks.
7. 🫧 **Cluster Bubble Map**: Dynamic scalable semantic bubbles with 1-click drilldown inspection.
8. 🌳 **Hierarchical Cluster Tree**: 3-tier collapsible parent-child tree (*Seed &rarr; Intent &rarr; Modifier &rarr; Keywords*).

### 5. 1-Click SEO Content Brief Generator
* Generates an instant SEO Content Outline with target H1, H2s, keyword checklist, and Google FAQ Schema (`FAQPage`) questions.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router with Turbopack)
* **Frontend**: React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React icons
* **SERP Engine**: Jina Search API (`s.jina.ai`)
* **Deployment**: Zero-configuration Vercel deployment with Node.js Serverless API routes

---

## 📦 API Routes

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/keywords` | `GET` | Multi-platform autocomplete discovery with AP rank and metrics |
| `/api/content-gap` | `POST` | Competitor keyword gap analysis (Target vs Competitors) |
| `/api/serp-overlap` | `POST` | $N \times N$ Google search result overlap & cannibalization matrix |
| `/api/content-brief` | `POST` | Programmatic SEO content outline & FAQ schema generator |

---

## 💻 Getting Started Locally

### Prerequisites
* Node.js 18+ or 20+
* npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/fp101fs/google-keyword-dominator.git

# Navigate to directory
cd google-keyword-dominator

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
# Lint checks
npm run lint

# Compile optimized production build
npm run build

# Start production server
npm start
```

---

## 🚀 Deployment to Vercel

Deploy directly to Vercel with one click or via the Vercel CLI:

```bash
npm i -g vercel
vercel
```

**Environment Variables (Optional)**:
* `JINA_API_KEY`: *(Optional)* Your Jina Search API key for custom SERP rate limits.

---

## 📄 License
MIT License. Free to use for personal and commercial keyword research applications.
