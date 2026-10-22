# Design Specification: GitHub-Powered Web Profile

**Date:** 2026-10-22  
**Owner:** Torino (@itto0)  
**Status:** Approved  

---

## 1. Overview & Goals

A fast, minimalist personal web profile for software engineer Torino (@itto0) that syncs project metrics and profile details directly from GitHub at build time while allowing local overrides for storytelling (problem, stack, outcome).

### Key Goals
- **Instant First Impression:** Clear, professional hero with bio, avatar, primary action CTAs, and downloadable resume.
- **Contextual Projects:** Showcase curated real-world projects (`counter-service`, `cdc-chicken-counting`, `cdc-pipeline`, `LicensePlateRecognition`, `ASP.NET-Core-MVC-6-Starter-Kit`) highlighting engineering problem-solving.
- **Build-Time Resilience:** Fetch live GitHub metadata (stars, languages, commit timestamps) at build time with an automated fallback to cached local JSON to guarantee builds never fail.
- **Top-Tier Performance:** 100% pre-rendered static HTML via Astro with zero client JavaScript runtime (except a tiny zero-FOUC theme toggle script). Target Lighthouse Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- **Minimal & Modern Aesthetic:** High-contrast zinc/slate theme with subtle emerald accents, full dark and light mode support with system preference detection.

---

## 2. System Architecture

```text
+-------------------------------------------------------------------------+
|                              Build Phase                                |
|                                                                         |
|  +--------------------+       +---------------------------------------+  |
|  | GitHub REST API    |       | Local Overrides & Fallback            |  |
|  | - /users/itto0     |       | - src/data/profile.json               |  |
|  | - /users/itto0/    |       | - src/data/projects.json              |  |
|  |   repos            |       | - src/data/fallback-data.json         |  |
|  +---------+----------+       +-------------------+-------------------+  |
|            |                                      |                     |
|            v                                      v                     |
|  +-----------------------------------------------------------------+    |
|  |                     src/lib/github.ts                           |    |
|  |  - Fetches GitHub data with guarded timeout                     |    |
|  |  - Falls back gracefully to fallback-data.json if error/offline |    |
|  |  - Merges human narratives (problem/outcome/demo) with stats    |    |
|  |  - Computes top language breakdown percentages                  |    |
|  +---------------------------------+-------------------------------+    |
|                                    |                                    |
+------------------------------------|------------------------------------+
                                     v
+-------------------------------------------------------------------------+
|                           Astro Static Build                            |
|  - Layout.astro (SEO, OpenGraph, Zero-FOUC Theme Script)                |
|  - Components: Navbar, Hero, ProjectCard, LanguageStats, About, Contact |
|  - Tailwind CSS (Utility styling + dark mode class)                     |
+------------------------------------+------------------------------------+
                                     v
+-------------------------------------------------------------------------+
|                             Output Artifact                             |
|  - Pure static HTML/CSS in dist/                                        |
|  - Deployed to GitHub Pages via .github/workflows/deploy.yml            |
+-------------------------------------------------------------------------+
```

---

## 3. Directory Structure

```text
web-profile/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Build & deploy to GitHub Pages (push + daily cron)
├── public/
│   ├── favicon.svg               # Minimal monogram favicon
│   ├── og-image.png              # OpenGraph social share card
│   ├── resume.pdf                # Downloadable resume file
│   └── robots.txt                # Crawler directives
├── src/
│   ├── components/
│   │   ├── Navbar.astro          # Sticky top bar with links & ThemeToggle
│   │   ├── Hero.astro            # Profile introduction, status pill & primary CTAs
│   │   ├── ProjectsSection.astro # Featured project grid container
│   │   ├── ProjectCard.astro     # Project card with problem, outcome & GitHub stats
│   │   ├── LanguageStats.astro   # Stacked bar showing language distribution
│   │   ├── AboutSection.astro    # Expanded bio, engineering values & skills
│   │   ├── ContactSection.astro  # Email CTA, social links, location indicator
│   │   ├── Footer.astro          # Minimal footer with sync status indicator
│   │   └── ThemeToggle.astro     # Zero-dependency dark/light toggle button
│   ├── data/
│   │   ├── fallback-data.json    # Offline snapshot of GitHub profile & repos
│   │   ├── profile.json          # Bio, tagline, location, and social links
│   │   ├── projects.json         # Curated project narratives (problem/solution)
│   │   └── skills.json           # Categorized engineering skills
│   ├── layouts/
│   │   └── Layout.astro          # HTML shell, SEO meta, font link, inline theme script
│   ├── lib/
│   │   └── github.ts             # Build-time fetcher, merger, and language calculator
│   ├── styles/
│   │   └── global.css            # Tailwind directives and custom scrollbar/focus styles
│   └── pages/
│       ├── index.astro           # Single-page portfolio entry
│       └── 404.astro             # Clean fallback page
├── astro.config.mjs              # Astro configuration with Tailwind integration
├── package.json                  # Dependencies and build scripts
├── tailwind.config.mjs           # Tailwind theme and dark-mode configuration
└── tsconfig.json                 # TypeScript strict setup
```

---

## 4. Data Specification & Types

### TypeScript Interfaces (`src/lib/github.ts`)

```typescript
export interface GitHubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  pushed_at: string;
  archived: boolean;
}

export interface CuratedProjectOverride {
  repoName: string;
  displayName: string;
  problem: string;
  outcome: string;
  demoUrl?: string;
  tags: string[];
  featuredOrder: number;
}

export interface EnrichedProject {
  name: string;
  displayName: string;
  description: string;
  problem: string;
  outcome: string;
  repoUrl: string;
  demoUrl?: string;
  stars: number;
  forks: number;
  language: string;
  tags: string[];
  updatedAt: string;
}

export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PortfolioData {
  user: GitHubUserProfile;
  featuredProjects: EnrichedProject[];
  languageStats: LanguageStat[];
  lastSyncedAt: string;
  isFallback: boolean;
}
```

### GitHub API Ingestion & Fallback Logic

1. Query `https://api.github.com/users/itto0` and `https://api.github.com/users/itto0/repos?sort=pushed&per_page=100`.
2. Authenticate with `process.env.GITHUB_TOKEN` if available to increase rate limit from 60 to 5,000 req/hr.
3. If fetch times out (5 seconds) or returns non-200 HTTP status, log warning and deserialize `src/data/fallback-data.json`.
4. Join curated entries from `src/data/projects.json` with fetched repository metadata. If a curated repo is not found in the live API response, use its fallback representation.
5. Compute language frequency across all repositories to derive top language proportions.

---

## 5. User Interface & Components

### 5.1 Navbar (`Navbar.astro`)
- **Sticky Layout:** Fixed header at the top with backdrop blur (`backdrop-blur-md bg-zinc-950/80 dark:bg-zinc-950/80 bg-white/80 border-b border-zinc-200 dark:border-zinc-800`).
- **Brand:** "Torino" with an emerald active dot.
- **Navigation Links:** Smooth scroll anchors: `#projects`, `#about`, `#contact`.
- **Controls:** `ThemeToggle` button and external link to GitHub profile.
- **Mobile Support:** Clean mobile navigation drawer for screens < 640px.

### 5.2 Hero Section (`Hero.astro`)
- **Badge:** Status pill with pulsing emerald dot: `Available for engineering opportunities`.
- **Avatar:** Rounded-full GitHub avatar with border and subtle hover glow.
- **Heading:** "Hi, I'm Torino" with subtitle "Software Engineer".
- **Summary:** Concise description emphasizing backend architecture, computer vision, and real-time data pipelines.
- **Action Buttons:**
  - "View Featured Projects" (primary button, emerald highlight)
  - "Download Resume" (secondary outlined button, downloads `/resume.pdf`)
  - Social quick links: GitHub (`@itto0`), Email (`itobgk02@gmail.com`).

### 5.3 Featured Projects (`ProjectsSection.astro` & `ProjectCard.astro`)
- **Grid Layout:** 1 column on mobile, 2 columns on `md:` breakpoints.
- **Curated Projects:**
  1. **counter-service:** High-performance counting & tracking microservice built with Python and FastAPI.
  2. **cdc-chicken-counting:** Computer vision pipeline utilizing OpenCV for real-time object detection and density counting.
  3. **cdc-pipeline:** High-throughput change data capture stream processing pipeline written in Rust.
  4. **LicensePlateRecognition:** Automated number plate recognition (ANPR) system with image preprocessing and OCR.
  5. **ASP.NET-Core-MVC-6-Starter-Kit:** Modular, production-ready enterprise starter kit built with .NET 6 and C#.
- **Card Elements:**
  - Title and GitHub star count badge.
  - "Problem" section: Clear definition of the engineering challenge.
  - "Solution & Outcome" section: Specific outcome or architectural choice.
  - Tech tags (e.g. Python, OpenCV, Rust, FastAPI, C#, .NET).
  - External links: GitHub Repository link and Live Demo link (when configured).

### 5.4 Language Distribution (`LanguageStats.astro`)
- **Visual Representation:** Stacked horizontal percentage bar representing the languages used across repositories (Python, Rust, C#, HTML/CSS).
- **Legend:** Color-coded language badges with percentage shares.

### 5.5 About & Skills (`AboutSection.astro`)
- **Narrative:** Background on Torino's engineering experience, focus on reliable systems, code quality, and automation.
- **Skills Categorized:**
  - *Languages:* Python, Rust, C#, TypeScript, SQL.
  - *Frameworks & Libraries:* FastAPI, ASP.NET Core, OpenCV, Astro, Tailwind CSS.
  - *Tools & Platforms:* Docker, Git, Linux, GitHub Actions, OPC DA.

### 5.6 Contact & Footer (`ContactSection.astro` & `Footer.astro`)
- **Contact Card:** Direct email CTA (`itobgk02@gmail.com`), GitHub link, and location pill ("Central Java, Indonesia").
- **Footer:** Minimal copyright note, technology acknowledgment ("Built with Astro & Tailwind CSS"), and build-time sync timestamp.

---

## 6. Theme & Styling Specification

### Color Tokens (Tailwind CSS)

| Token | Light Mode | Dark Mode |
|---|---|---|
| Background Canvas | `zinc-50` (`#fafafa`) | `zinc-950` (`#09090b`) |
| Surface / Cards | `white` (`#ffffff`) | `zinc-900/70` (`#18181b`) |
| Card Borders | `zinc-200` (`#e4e4e7`) | `zinc-800` (`#27272a`) |
| Text Primary | `zinc-900` (`#18181b`) | `zinc-100` (`#f4f4f5`) |
| Text Secondary | `zinc-600` (`#52525b`) | `zinc-400` (`#a1a1aa`) |
| Text Muted | `zinc-400` (`#a1a1aa`) | `zinc-500` (`#71717a`) |
| Accent Brand | `emerald-600` (`#059669`) | `emerald-500` (`#10b981`) |
| Accent Surface | `emerald-50` (`#ecfdf5`) | `emerald-950/40` |

### Zero-FOUC Theme Switcher

An inline script injected into `<head>` before any stylesheet or markup renders:

```html
<script is:inline>
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
</script>
```

---

## 7. Accessibility, Performance & SEO

### Accessibility (WCAG 2.1 AA)
- Semantic HTML tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Keyboard accessibility: Focus visible ring `focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none`.
- Interactive elements: Descriptive `aria-label` on theme toggle button, social icon links, and external links (`target="_blank" rel="noopener noreferrer"`).
- Color contrast: All text combinations meet or exceed 4.5:1 contrast against their background.

### SEO & Metadata
- Title: "Torino — Software Engineer | Portfolio"
- Meta description: "Personal web profile and portfolio of Torino (@itto0), Software Engineer specializing in backend systems, computer vision, and data pipelines."
- OpenGraph tags: `og:title`, `og:description`, `og:type="website"`, `og:image="/og-image.png"`, `og:url`.
- Static files: `robots.txt` allowing all indexing, `sitemap-index.xml` generated automatically.

---

## 8. CI/CD & Deployment Pipeline

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Web Profile to GitHub Pages

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *' # Rebuild daily at 04:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 9. Quality Verification & Acceptance Criteria

| Criteria | Target | Verification Method |
|---|---|---|
| Build Resilience | 100% build pass rate | Build with valid network, and build with network disabled |
| Static Generation | 0 client-side framework JS | Inspect `dist/` bundle output; verify pure HTML |
| Performance | Lighthouse Score ≥ 90 | Automated Lighthouse CLI or browser audit |
| Accessibility | Lighthouse Score ≥ 95 | WCAG 2.1 AA audit & screen reader navigation check |
| SEO | Lighthouse Score ≥ 95 | Verify meta tags, robots.txt, sitemap output |
| Theme Switcher | Instant toggle, 0 flicker | Hard refresh in dark & light modes across page loads |
| Responsive Layout | 360px to 4K displays | Verify on mobile (360px), tablet (768px), desktop (1280px) |
