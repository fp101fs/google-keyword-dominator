# Google Keyword Dominator (GKD) - Pro SEO Suite

A modern Keyword Research, Google Search Console (GSC) Intelligence, and SERP Analysis suite built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and DeepSeek AI via OpenRouter.

GKD extracts 100% genuine autocomplete queries across multiple search engines, connects to your Google Search Console to identify high-impact Page-2 striking distance opportunities, and pairs them with live SERP analysis and real-time LLM web search without any fake or hallucinated metrics.

Live URL: https://google-keyword-dominator.vercel.app  
Quick Guide: https://google-keyword-dominator.vercel.app/guide

---

## 🚀 Main Tools and Features

### 1. Keywords Explorer
* **Multi-Platform Autocomplete**: Google, YouTube, Amazon, and Bing.
* **Country & Language**: 20+ Countries (with flag indicators) and 14+ Languages.
* **Deep Modifiers**: Alphabet (A-Z), Questions (How, What, Why, Can), and Prepositions (For, With, Near).
* **8 Visualizations**: Table View, 2D Scatter Plot, Treemap, Canvas Network Graph, Bubble Map, SERP Matrix, Hierarchy Tree, and Radial Graph.

### 2. Autonomous Search Intelligence Suite
* **GSC Gap Finder**: Expands your top GSC queries with autocomplete and categorizes gaps into Striking Distance, New Content, and Low CTR tiers with DeepSeek AI recommendations.
* **Page Expansion Engine**: Analyzes any existing URL to prescribe exact missing H2 sub-sections and write high-CTR title & meta description tags via DeepSeek AI.
* **Rankings Rescue**: Detects underperforming Page-2 queries and provides authoritative editorial prescriptions to improve rankings and CTR.
* **SEO Content Factory**: Prioritizes opportunities into a queue with Copilot, Autopilot, and Research modes.

### 3. Google Search Console Integration
* **1-Click Google OAuth**: Standard read-only access (webmasters.readonly).
* **Multi-Property Switcher**: Switch between verified domains.
* **Striking Distance (Positions 11 to 25)**: Find Page-2 queries and click "Expand in GKD" to see all sub-clusters.
* **Live GSC Table Overlay**: Real ranking position and impressions overlaid in the autocomplete table.
* **Demo Mode**: Test immediately with demo data (trailgearhub.com).

### 4. Competitive SERP Tools & AI Engine
* **Content Gap Explorer**: Compare your seed topic with up to 3 competitors in real time with DeepSeek strategic differentiation analysis.
* **SERP Overlap Matrix**: Check URL overlap to prevent keyword cannibalization.
* **1-Click SERP Inspector**: Inspect live top 10 Google search results via Jina Search.
* **1-Click AI Content Brief**: Real-time Google web search extracting live People Also Ask (PAA) questions and direct answer snippets.
* **Live Page Grader**: Crawls live URLs with on-page SEO checklist and DeepSeek editorial audit.

---

## 📦 API Routes (All Usable via HTTP API)

All core platform features are accessible programmatically via JSON HTTP endpoints:

| Endpoint | Method | Payload / Params | Description |
| :--- | :---: | :--- | :--- |
| `/api/keywords` | `GET` | `?seed=notion&country=US&language=en` | Multi-platform autocomplete discovery with AP rank, intent, and popularity score |
| `/api/auth/google` | `GET` | — | Initiates Google OAuth 2.0 flow for Search Console read-only access |
| `/api/auth/google/callback` | `GET` | `?code=...` | Exchanges OAuth code for tokens and issues httpOnly session cookies |
| `/api/auth/logout` | `POST` | — | Clears Google Search Console session cookies |
| `/api/gsc/properties` | `GET` | — | Returns list of verified Google Search Console properties |
| `/api/gsc/snapshot` | `GET` | `?siteUrl=sc-domain:example.com` | Pulls real GSC queries, impressions, positions, and striking distance targets |
| `/api/gsc/demo` | `GET` | — | Returns static demo dataset (trailgearhub.com) |
| `/api/intelligence/gsc-gap` | `POST` | `{"siteUrl": "...", "isDemo": false}` | GSC queries expanded through autocomplete matrix + DeepSeek recommendations |
| `/api/intelligence/page-expansion` | `POST` | `{"targetPageUrl": "...", "isDemo": false}` | Prescribed missing H2 headings, FAQs, and DeepSeek title/meta tags |
| `/api/intelligence/rankings-rescue` | `POST` | `{"siteUrl": "...", "isDemo": false}` | Automated rankings rescue tasks and DeepSeek editorial prescriptions |
| `/api/content-gap` | `POST` | `{"targetSeed": "...", "competitorSeeds": ["..."]}` | Competitor keyword gap analysis + DeepSeek differentiation strategy |
| `/api/serp-overlap` | `POST` | `{"keywords": ["...", "..."]}` | Google search result overlap & cannibalization matrix |
| `/api/page-grader` | `POST` | `{"url": "...", "targetKeyword": "..."}` | Live URL crawler, on-page SEO checks, and DeepSeek AI audit |
| `/api/content-brief` | `POST` | `{"seed": "...", "keywords": [...]}` | DeepSeek AI content brief with live Google PAA search |

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16.3 (App Router with Turbopack)
* **Frontend**: React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React icons
* **LLM Engine**: DeepSeek V4 Flash (`deepseek/deepseek-v4-flash-0731`) via OpenRouter with `openrouter:web_search` and `openrouter:web_fetch` server tools
* **Authentication & GSC**: Google OAuth 2.0 + Google Search Console v3 API (read-only)
* **SERP Engine**: Jina Search API (s.jina.ai)
* **Deployment**: Vercel
