# Google Keyword Dominator (GKD) - Pro SEO Suite

A modern, production-ready Keyword Research, Google Search Console (GSC) Intelligence, and SERP Analysis suite built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

Inspired by Keyword Tool Dominator, Ahrefs Keywords Explorer, and SerpDo, GKD extracts **100% genuine autocomplete queries** across multiple search engines, connects to your **Google Search Console** to identify high-impact Page-2 striking distance opportunities, and pairs them with live SERP analysis without any fake or hallucinated metrics.

**Live:** [https://google-keyword-dominator.vercel.app](https://google-keyword-dominator.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![Google OAuth](https://img.shields.io/badge/Google_GSC-OAuth_2.0-4285F4?style=flat-square&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 Key Features & Capabilities

### 1. 📈 Google Search Console (GSC) Integration & Striking Distance
* **1-Click Google OAuth (Read-Only)**: Connect your Google account with standard read-only Search Console scopes (`webmasters.readonly`). Tokens are securely managed via httpOnly session cookies.
* **Multi-Property Switcher**: Seamlessly switch between all verified domains in your Google Search Console account.
* **Page 2 &rarr; Page 1 Striking Distance Optimizer**: Identifies high-impression queries ranking between **Positions 11 and 25**.
* **1-Click GKD Expansion**: Click *"Expand in GKD"* on any striking distance query to immediately uncover the exact question clusters, prepositions, and modifiers needed to push that query to Page 1.
* **Live GSC Table Performance Overlay**: Automatically injects your site's actual **Average Position** (e.g. `#11.4`, `#4.2`) and **Total Impressions** (`24.1k imp`) directly into the Autocomplete Keyword Table.
* **Explore with Demo Data**: Instant demo mode (`trailgearhub.com`) allows full feature testing without logging into Google.

### 2. 🔍 Multi-Platform Autocomplete Engine
* **Platforms**: Google Search, YouTube, Amazon, and Bing.
* **Localization**: 20+ Countries (with `gl` localization and flags 🇺🇸 🇬🇧 🇨🇦 🇩🇪) and 14+ Interface Languages (with `hl` localization).
* **Deep Discovery Query Expansion**:
  * **Alphabet Modifiers**: Scans `seed + [a-z]` and `[a-z] + seed` (52 query branches).
  * **Questions**: Scans `how, what, why, where, when, who, which, can, is`.
  * **Prepositions & Context**: Scans `for, with, without, near, to, in, on, like`.
  * **Bulk Multi-Seed Search**: Concurrently aggregates up to 5 seed keywords simultaneously.

### 3. 🎯 Ahrefs-Grade Competitive Features
* 🎯 **Ahrefs Content Gap Explorer**: Compare your seed topic against up to 3 competitors to uncover **Missed Gaps**, **Shared Terms**, **Unique Strengths**, and **Topic Coverage %**.
* 🔍 **1-Click Live SERP Inspector**: Inspect top 10 Google search results via Jina Search (`s.jina.ai`) with page titles, full URLs, and root domains.
* 📊 **Ahrefs KD Ranking Guidance**: Actionable advice for *Easy (Low KD)*, *Medium (Moderate KD)*, and *Hard (High KD)* terms.
* 📑 **Ahrefs Sub-Navigation Tabs**: 1-click filtering by *All Terms*, *Matching Terms*, *Questions*, *Vs & Comparisons*, and *Prepositions*.

### 4. 8 Comprehensive Visualization Modes
1. 📋 **Keyword Table View**: Fixed-width, sortable, filterable table with expanded keyword space, shortened Hot/Intent badges (`Info`, `Comm`, `Buy`, `Nav`), single/bulk clipboard copy, and RFC 4180 CSV export.
2. 🌌 **SERP-Intent Galaxy (Radial Gravity Map)**: Force-directed radial map where *Distance = SERP Similarity*, *Angle = Intent Arm*, and *Edges = Selective SERP Overlap*.
3. 📈 **2D Opportunity Scatter Plot**: Quadrant matrix isolating low-hanging fruit (*High Score + Low AP Rank*).
4. 🔲 **Topical Treemap**: Market share volume blocks by intent and query modification.
5. 🕸️ **60fps Canvas Network Graph**: Hardware-accelerated force-directed graph with zero idle CPU overhead.
6. 📊 **SERP Overlap Matrix**: $N \times N$ heatmap grid calculating shared ranking URLs and keyword cannibalization risks.
7. 🫧 **Cluster Bubble Map**: Dynamic scalable semantic bubbles with 1-click drilldown inspection.
8. 🌳 **Hierarchical Cluster Tree**: 3-tier collapsible parent-child tree (*Seed &rarr; Intent &rarr; Modifier &rarr; Keywords*).

### 5. 📝 1-Click SEO Content Briefs & Live Page Grader
* **Programmatic SEO Briefs**: Generates structured H1 titles, H2 outlines, keyword checklists, and Google FAQ Schema (`FAQPage`) markup.
* **1-Click Page Grader (SerpDo Heuristic Engine)**: Audit any live URL against your target seed keyword for a **0–100 SEO & GEO Readiness Score** with actionable on-page recommendations.

---

## 📦 API Routes

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/keywords` | `GET` | Multi-platform autocomplete discovery with AP rank, intent, and popularity score |
| `/api/auth/google` | `GET` | Initiates Google OAuth 2.0 flow for Search Console read-only access |
| `/api/auth/google/callback` | `GET` | Exchanges OAuth code for tokens and issues httpOnly session cookies |
| `/api/auth/logout` | `POST` | Clears Google Search Console session cookies |
| `/api/gsc/properties` | `GET` | Returns list of verified Google Search Console properties for authenticated user |
| `/api/gsc/snapshot` | `GET` | Pulls last 28 days of real GSC queries, impressions, positions, and striking distance targets |
| `/api/gsc/demo` | `GET` | Returns static demo dataset (`trailgearhub.com`) for unauthenticated testing |
| `/api/content-gap` | `POST` | Competitor keyword gap analysis (Target seed vs up to 3 competitors) |
| `/api/serp-overlap` | `POST` | $N \times N$ Google search result overlap & cannibalization matrix |
| `/api/page-grader` | `POST` | Live URL crawler and 0-100 SEO readiness audit against target keyword |
| `/api/content-brief` | `POST` | Programmatic SEO content outline & FAQ schema generator |

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16.3 (App Router with Turbopack)
* **Frontend**: React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React icons
* **Authentication & GSC**: Google OAuth 2.0 + Google Search Console v3 API (read-only)
* **SERP Engine**: Jina Search API (`s.jina.ai`)
* **Deployment**: Vercel (Edge & Node.js Serverless API routes)

---

## 💻 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/fp101fs/google-keyword-dominator.git
cd google-keyword-dominator
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# Google OAuth (Search Console Integration)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional Jina API Key for SERP inspection rate limits
JINA_API_KEY=
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or [http://localhost:3089](http://localhost:3089)).

---

## 🚀 Deployment to Vercel

```bash
# Link project
vercel link --project google-keyword-dominator

# Add environment variables
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Deploy to production
vercel --prod
```

---

## 📄 License
MIT License. Free to use for personal and commercial keyword research and SEO applications.
