# Google Keyword Dominator (GKD) - Pro SEO Suite

A modern Keyword Research, Google Search Console (GSC) Intelligence, and SERP Analysis suite built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.

GKD extracts 100% genuine autocomplete queries across multiple search engines, connects to your Google Search Console to identify high-impact Page-2 striking distance opportunities, and pairs them with live SERP analysis without any fake or hallucinated metrics.

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
* **GSC Gap Finder**: Expands your top GSC queries with autocomplete and categorizes gaps into Striking Distance, New Content, and Low CTR tiers.
* **Page Expansion Engine**: Analyzes any existing URL to prescribe exact missing H2 sub-sections and FAQs.
* **Rankings Rescue**: Detects underperforming Page-2 queries and provides 1-click prompts to improve rankings and CTR.
* **SEO Content Factory**: Prioritizes opportunities into a queue with Copilot, Autopilot, and Research modes.

### 3. Google Search Console Integration
* **1-Click Google OAuth**: Standard read-only access (webmasters.readonly).
* **Multi-Property Switcher**: Switch between verified domains.
* **Striking Distance (Positions 11 to 25)**: Find Page-2 queries and click "Expand in GKD" to see all sub-clusters.
* **Live GSC Table Overlay**: Real ranking position and impressions overlaid in the autocomplete table.
* **Demo Mode**: Test immediately with demo data (trailgearhub.com).

### 4. Competitive SERP Tools
* **Content Gap Explorer**: Compare your seed topic with up to 3 competitors in real time.
* **SERP Overlap Matrix**: Check URL overlap to prevent keyword cannibalization.
* **1-Click SERP Inspector**: Inspect live top 10 Google search results via Jina Search.
* **Content Briefs & Page Grader**: Generate structured H1/H2 outlines, FAQ Schema, and audit live pages with a 0 to 100 SEO score.

---

## 📦 API Routes

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/keywords` | `GET` | Multi-platform autocomplete discovery with AP rank, intent, and popularity score |
| `/api/auth/google` | `GET` | Initiates Google OAuth 2.0 flow for Search Console read-only access |
| `/api/auth/google/callback` | `GET` | Exchanges OAuth code for tokens and issues httpOnly session cookies |
| `/api/auth/logout` | `POST` | Clears Google Search Console session cookies |
| `/api/gsc/properties` | `GET` | Returns list of verified Google Search Console properties |
| `/api/gsc/snapshot` | `GET` | Pulls real GSC queries, impressions, positions, and striking distance targets |
| `/api/gsc/demo` | `GET` | Returns static demo dataset (trailgearhub.com) |
| `/api/intelligence/gsc-gap` | `POST` | GSC queries expanded through autocomplete matrix |
| `/api/intelligence/page-expansion` | `POST` | Prescribed missing H2 headings and FAQs for an existing URL |
| `/api/intelligence/rankings-rescue` | `POST` | Automated rankings rescue tasks and 1-click copywriting prompts |
| `/api/content-gap` | `POST` | Competitor keyword gap analysis |
| `/api/serp-overlap` | `POST` | Google search result overlap & cannibalization matrix |
| `/api/page-grader` | `POST` | Live URL crawler and 0-100 SEO readiness audit |
| `/api/content-brief` | `POST` | Programmatic SEO content outline & FAQ schema generator |

---

## 🛠️ Tech Stack

* Framework: Next.js 16.3 (App Router with Turbopack)
* Frontend: React 19, TypeScript
* Styling: Tailwind CSS v4, Lucide React icons
* Authentication & GSC: Google OAuth 2.0 + Google Search Console v3 API (read-only)
* SERP Engine: Jina Search API (s.jina.ai)
* Deployment: Vercel

---

## 💻 Local Development Setup

```bash
git clone https://github.com/fp101fs/google-keyword-dominator.git
cd google-keyword-dominator
npm install
npm run dev
```

Open http://localhost:3000 or http://localhost:3089.

---

## 📄 License
MIT License. Free to use for personal and commercial keyword research and SEO applications.
