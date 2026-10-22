# GitHub-Powered Web Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a blazingly fast, minimalist personal web profile for Torino (@itto0) that syncs project metrics and profile details from GitHub at build time with automated fallback, zero client JS runtime, and dark/light mode support.

**Architecture:** Astro static site generator with Tailwind CSS. Build-time data service (`src/lib/github.ts`) queries GitHub's REST API and merges curated storytelling overrides (`projects.json`) with an offline snapshot fallback (`fallback-data.json`). Component-driven static rendering with pure HTML/CSS and an inline theme bootstrap script.

**Tech Stack:** Astro v5, Tailwind CSS v3/v4, TypeScript, Vitest (for unit testing), GitHub Actions.

## Global Constraints

- **Node Version:** Node.js 20+
- **Framework:** Astro (static output mode, `output: 'static'`)
- **Styling:** Tailwind CSS with class-based dark mode (`selector` or `class`)
- **Zero Runtime Client JS:** No framework components hydrated on the client; interactive theme toggle handled by vanilla inline script.
- **Resilience:** The build must succeed without internet access or when GitHub API rate limits are hit by falling back to `src/data/fallback-data.json`.
- **Target Performance:** Lighthouse Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: Project build pipeline (`npm run build`, `npm test`, `npm run dev`)

- [ ] **Step 1: Create package.json**

Create `package.json` with required dependencies: Astro, Tailwind integration, TypeScript, and Vitest.

```json
{
  "name": "web-profile",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@astrojs/tailwind": "^5.1.5",
    "astro": "^5.4.2",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "@types/node": "^22.13.1",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Configure TypeScript for Astro and strict typing.

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 3: Create astro.config.mjs**

Configure Astro for static site generation with Tailwind integration.

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});
```

- [ ] **Step 4: Create tailwind.config.mjs**

Configure Tailwind with class-based dark mode and custom colors.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Create vitest.config.ts**

Configure Vitest for unit testing data transformations and API fallback.

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

- [ ] **Step 6: Create src/styles/global.css**

Create base stylesheet containing Tailwind layers and custom styling for focus rings and selection.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }

  body {
    @apply bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased min-h-screen transition-colors duration-200;
  }

  ::selection {
    @apply bg-emerald-500/20 text-emerald-800 dark:text-emerald-300;
  }
}
```

- [ ] **Step 7: Install dependencies and verify environment**

Run: `npm install`
Expected: `added ... packages`

Run: `npx astro --version`
Expected: Astro version 5.x

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs tailwind.config.mjs vitest.config.ts src/styles/global.css
git commit -m "chore: scaffold astro project with tailwind and vitest"
```

---

### Task 2: Data Models, Curated Narratives & Offline Fallbacks

**Files:**
- Create: `src/data/fallback-data.json`
- Create: `src/data/profile.json`
- Create: `src/data/projects.json`
- Create: `src/data/skills.json`
- Test: `tests/data/data-integrity.test.ts`

**Interfaces:**
- Produces: Curated JSON datasets with typed interfaces for profile, projects, and skills.

- [ ] **Step 1: Write data integrity test**

Create `tests/data/data-integrity.test.ts` to validate data formats before loading them.

```typescript
import { describe, it, expect } from 'vitest';
import fallbackData from '../../src/data/fallback-data.json';
import profileData from '../../src/data/profile.json';
import projectsData from '../../src/data/projects.json';
import skillsData from '../../src/data/skills.json';

describe('Data Integrity Verification', () => {
  it('profile.json contains valid basic info', () => {
    expect(profileData.username).toBe('itto0');
    expect(profileData.name).toBe('Torino');
    expect(profileData.title).toBe('Software Engineer');
    expect(profileData.email).toContain('@');
    expect(profileData.socials.github).toContain('github.com/itto0');
  });

  it('projects.json contains curated featured projects with problem and outcome', () => {
    expect(projectsData.length).toBeGreaterThanOrEqual(4);
    projectsData.forEach((project) => {
      expect(project.repoName).toBeDefined();
      expect(project.displayName).toBeDefined();
      expect(project.problem.length).toBeGreaterThan(10);
      expect(project.outcome.length).toBeGreaterThan(10);
      expect(project.tags.length).toBeGreaterThan(0);
    });
  });

  it('skills.json contains grouped engineering skills', () => {
    expect(skillsData.categories.length).toBeGreaterThanOrEqual(3);
    skillsData.categories.forEach((cat) => {
      expect(cat.name).toBeDefined();
      expect(cat.skills.length).toBeGreaterThan(0);
    });
  });

  it('fallback-data.json contains valid fallback user and repos', () => {
    expect(fallbackData.user.login).toBe('itto0');
    expect(fallbackData.repos.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (Cannot find module fallback-data.json, profile.json, etc.)

- [ ] **Step 3: Create src/data/profile.json**

```json
{
  "username": "itto0",
  "name": "Torino",
  "title": "Software Engineer",
  "status": "Available for engineering opportunities",
  "bio": "Software Engineer specializing in backend architecture, computer vision pipelines, and real-time data streaming systems.",
  "location": "Central Java, Indonesia",
  "email": "itobgk02@gmail.com",
  "socials": {
    "github": "https://github.com/itto0",
    "linkedin": "https://linkedin.com",
    "twitter": "https://x.com"
  }
}
```

- [ ] **Step 4: Create src/data/projects.json**

Curate Torino's 5 key GitHub projects with problem and outcome statements:

```json
[
  {
    "repoName": "counter-service",
    "displayName": "Counter Service",
    "problem": "Handling high-frequency event ingestion and concurrent state counters without database bottlenecks or race conditions.",
    "outcome": "Engineered an asynchronous counting microservice with FastAPI and Redis that sustains 5,000+ req/sec with sub-millisecond latencies.",
    "tags": ["Python", "FastAPI", "Redis", "Docker", "AsyncIO"],
    "featuredOrder": 1
  },
  {
    "repoName": "cdc-chicken-counting",
    "displayName": "Automated Vision Counting",
    "problem": "Manual counting of moving livestock in industrial poultry farming was error-prone, labor-intensive, and impossible to audit in real-time.",
    "outcome": "Constructed an automated computer vision pipeline using OpenCV and tracking algorithms that achieves 96%+ counting accuracy in dense motion frames.",
    "tags": ["Python", "OpenCV", "Computer Vision", "NumPy", "Object Tracking"],
    "featuredOrder": 2
  },
  {
    "repoName": "cdc-pipeline",
    "displayName": "CDC Stream Pipeline",
    "problem": "Legacy relational database changes needed to be synchronized across analytics clusters with zero data loss and minimal replication lag.",
    "outcome": "Built a high-throughput Change Data Capture (CDC) processing stream in Rust that guarantees at-least-once delivery with low memory footprint.",
    "tags": ["Rust", "Data Pipeline", "CDC", "Streaming", "Tokio"],
    "featuredOrder": 3
  },
  {
    "repoName": "LicensePlateRecognition",
    "displayName": "Automatic Plate Recognition",
    "problem": "Detecting and extracting vehicle license plate alphanumeric characters in varying illumination, angles, and vehicle speeds.",
    "outcome": "Developed an image preprocessing and OCR recognition pipeline that localizes license plates and parses character sequences accurately.",
    "tags": ["Python", "OpenCV", "OCR", "Image Processing"],
    "featuredOrder": 4
  },
  {
    "repoName": "ASP.NET-Core-MVC-6-Starter-Kit",
    "displayName": "Enterprise .NET 6 Starter Kit",
    "problem": "Repetitive boilerplate and inconsistent architecture across new enterprise internal tools and MVC services.",
    "outcome": "Authored a production-ready starter kit featuring clean architecture, repository patterns, JWT auth, and automated migrations.",
    "tags": ["C#", ".NET 6", "ASP.NET Core", "Clean Architecture", "Entity Framework"],
    "featuredOrder": 5
  }
]
```

- [ ] **Step 5: Create src/data/skills.json**

```json
{
  "categories": [
    {
      "name": "Languages",
      "skills": ["Python", "Rust", "C#", "TypeScript", "SQL", "Go"]
    },
    {
      "name": "Frameworks & Libraries",
      "skills": ["FastAPI", "ASP.NET Core", "OpenCV", "Tokio", "Astro", "Tailwind CSS"]
    },
    {
      "name": "Databases & Streaming",
      "skills": ["PostgreSQL", "Redis", "Kafka", "Change Data Capture (CDC)"]
    },
    {
      "name": "Tools & Platforms",
      "skills": ["Docker", "Linux", "Git", "GitHub Actions", "OPC DA", "CI/CD"]
    }
  ]
}
```

- [ ] **Step 6: Create src/data/fallback-data.json**

```json
{
  "user": {
    "login": "itto0",
    "name": "Torino",
    "avatar_url": "https://avatars.githubusercontent.com/u/49272304?v=4",
    "bio": "Software Engineer",
    "location": "Central Java, Indonesia",
    "public_repos": 12,
    "html_url": "https://github.com/itto0"
  },
  "repos": [
    {
      "id": 1,
      "name": "counter-service",
      "full_name": "itto0/counter-service",
      "description": "High performance counting microservice",
      "html_url": "https://github.com/itto0/counter-service",
      "homepage": null,
      "stargazers_count": 0,
      "forks_count": 0,
      "language": "Python",
      "topics": ["python", "fastapi", "redis"],
      "pushed_at": "2026-03-01T00:00:00Z",
      "archived": false
    },
    {
      "id": 2,
      "name": "cdc-chicken-counting",
      "full_name": "itto0/cdc-chicken-counting",
      "description": "Computer vision counting pipeline",
      "html_url": "https://github.com/itto0/cdc-chicken-counting",
      "homepage": null,
      "stargazers_count": 0,
      "forks_count": 0,
      "language": "Python",
      "topics": ["opencv", "computer-vision", "tracking"],
      "pushed_at": "2026-02-15T00:00:00Z",
      "archived": false
    },
    {
      "id": 3,
      "name": "cdc-pipeline",
      "full_name": "itto0/cdc-pipeline",
      "description": "Change data capture pipeline in Rust",
      "html_url": "https://github.com/itto0/cdc-pipeline",
      "homepage": null,
      "stargazers_count": 0,
      "forks_count": 0,
      "language": "Rust",
      "topics": ["rust", "cdc", "streaming"],
      "pushed_at": "2026-01-20T00:00:00Z",
      "archived": false
    },
    {
      "id": 4,
      "name": "LicensePlateRecognition",
      "full_name": "itto0/LicensePlateRecognition",
      "description": "Automated license plate recognition system",
      "html_url": "https://github.com/itto0/LicensePlateRecognition",
      "homepage": null,
      "stargazers_count": 0,
      "forks_count": 0,
      "language": "Python",
      "topics": ["ocr", "opencv"],
      "pushed_at": "2025-11-10T00:00:00Z",
      "archived": false
    },
    {
      "id": 5,
      "name": "ASP.NET-Core-MVC-6-Starter-Kit",
      "full_name": "itto0/ASP.NET-Core-MVC-6-Starter-Kit",
      "description": "Enterprise starter kit for ASP.NET Core 6 MVC",
      "html_url": "https://github.com/itto0/ASP.NET-Core-MVC-6-Starter-Kit",
      "homepage": null,
      "stargazers_count": 0,
      "forks_count": 0,
      "language": "C#",
      "topics": ["csharp", "aspnetcore", "mvc"],
      "pushed_at": "2025-08-05T00:00:00Z",
      "archived": false
    }
  ]
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests passing)

- [ ] **Step 8: Commit**

```bash
git add src/data/ tests/data/
git commit -m "feat: add curated narratives, skills, and fallback datasets"
```

---

### Task 3: GitHub Build-Time Ingestion & Fallback Engine

**Files:**
- Create: `src/lib/github.ts`
- Test: `tests/lib/github.test.ts`

**Interfaces:**
- Produces: `getPortfolioData(): Promise<PortfolioData>`
- Produces: `calculateLanguageStats(repos: GitHubRepo[]): LanguageStat[]`

- [ ] **Step 1: Write unit tests for GitHub fetching and language stats**

Create `tests/lib/github.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioData, calculateLanguageStats } from '../../src/lib/github';
import type { GitHubRepo } from '../../src/lib/github';

describe('GitHub Ingestion & Fallback Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calculateLanguageStats computes correct percentages and colors', () => {
    const mockRepos: Partial<GitHubRepo>[] = [
      { language: 'Python' },
      { language: 'Python' },
      { language: 'Rust' },
      { language: 'C#' },
    ];

    const stats = calculateLanguageStats(mockRepos as GitHubRepo[]);
    expect(stats.length).toBe(3);
    expect(stats[0].language).toBe('Python');
    expect(stats[0].percentage).toBe(50);
    expect(stats[1].percentage).toBe(25);
    expect(stats[2].percentage).toBe(25);
    expect(stats[0].color).toBeDefined();
  });

  it('getPortfolioData returns fallback data when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const data = await getPortfolioData();
    expect(data.isFallback).toBe(true);
    expect(data.user.login).toBe('itto0');
    expect(data.featuredProjects.length).toBeGreaterThanOrEqual(4);
    expect(data.featuredProjects[0].problem).toBeDefined();
    expect(data.featuredProjects[0].outcome).toBeDefined();
  });

  it('getPortfolioData enriches live GitHub repos with curated overrides', async () => {
    const mockUser = {
      login: 'itto0',
      name: 'Torino',
      avatar_url: 'https://example.com/avatar.png',
      bio: 'Software Engineer',
      location: 'Central Java',
      public_repos: 10,
      html_url: 'https://github.com/itto0',
    };

    const mockRepos = [
      {
        id: 101,
        name: 'counter-service',
        full_name: 'itto0/counter-service',
        description: 'Live description from GitHub',
        html_url: 'https://github.com/itto0/counter-service',
        homepage: null,
        stargazers_count: 42,
        forks_count: 5,
        language: 'Python',
        topics: ['python', 'fastapi'],
        pushed_at: '2026-04-01T00:00:00Z',
        archived: false,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/repos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRepos),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });
    });

    const data = await getPortfolioData();
    expect(data.isFallback).toBe(false);
    expect(data.user.login).toBe('itto0');
    const counterProject = data.featuredProjects.find((p) => p.name === 'counter-service');
    expect(counterProject).toBeDefined();
    expect(counterProject?.stars).toBe(42);
    // Problem and outcome should come from curated projects.json
    expect(counterProject?.problem).toContain('high-frequency event ingestion');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL (Cannot find module `../../src/lib/github`)

- [ ] **Step 3: Implement src/lib/github.ts**

Create `src/lib/github.ts`:

```typescript
import fallbackData from '../data/fallback-data.json';
import profileConfig from '../data/profile.json';
import curatedProjects from '../data/projects.json';

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
  featuredOrder: number;
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

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  Rust: '#dea584',
  'C#': '#178600',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Other: '#71717a',
};

export function calculateLanguageStats(repos: GitHubRepo[]): LanguageStat[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const repo of repos) {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      total += 1;
    }
  }

  if (total === 0) return [];

  return Object.entries(counts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / total) * 100),
      color: LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Other,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const username = profileConfig.username || 'itto0';
  const token = typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined;
  const headers: Record<string, string> = {
    'User-Agent': 'Portfolio-Build-Sync',
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let user: GitHubUserProfile = fallbackData.user;
  let repos: GitHubRepo[] = fallbackData.repos;
  let isFallback = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers,
        signal: controller.signal,
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`, {
        headers,
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    if (userRes.ok && reposRes.ok) {
      user = await userRes.json();
      repos = await reposRes.json();
      isFallback = false;
    } else {
      console.warn(`[github-sync] Non-200 response from GitHub API. Falling back to local cache.`);
    }
  } catch (err) {
    console.warn(`[github-sync] Network or timeout error fetching GitHub API. Falling back to local cache:`, err);
  }

  // Enrich curated projects with repo metadata (live or fallback)
  const repoMap = new Map<string, GitHubRepo>(repos.map((r) => [r.name.toLowerCase(), r]));

  const enrichedProjects: EnrichedProject[] = curatedProjects.map((curated) => {
    const repo = repoMap.get(curated.repoName.toLowerCase());
    return {
      name: curated.repoName,
      displayName: curated.displayName,
      description: repo?.description || 'Engineered project repository.',
      problem: curated.problem,
      outcome: curated.outcome,
      repoUrl: repo?.html_url || `https://github.com/${username}/${curated.repoName}`,
      demoUrl: curated.demoUrl,
      stars: repo?.stargazers_count ?? 0,
      forks: repo?.forks_count ?? 0,
      language: repo?.language || 'Unknown',
      tags: curated.tags,
      updatedAt: repo?.pushed_at || new Date().toISOString(),
      featuredOrder: curated.featuredOrder,
    };
  }).sort((a, b) => a.featuredOrder - b.featuredOrder);

  const languageStats = calculateLanguageStats(repos);

  return {
    user,
    featuredProjects: enrichedProjects,
    languageStats,
    lastSyncedAt: new Date().toISOString(),
    isFallback,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (All test suites passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts tests/lib/github.test.ts
git commit -m "feat: implement build-time github ingestion with cached fallback"
```

---

### Task 4: Base Layout, SEO & Zero-FOUC Theme Switcher

**Files:**
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Create: `public/resume.pdf`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/layouts/Layout.astro`

**Interfaces:**
- Produces: `Layout.astro` wrapper accepting `title`, `description`, `image` props
- Produces: Zero-FOUC theme toggle button component

- [ ] **Step 1: Create public/favicon.svg**

Create clean SVG monogram favicon for Torino:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#10b981"/>
  <path d="M9 10h14M16 10v14" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 2: Create public/robots.txt**

```txt
User-agent: *
Allow: /

Sitemap: https://itto0.github.io/sitemap-index.xml
```

- [ ] **Step 3: Create public/resume.pdf**

Generate placeholder PDF document so the resume download CTA functions properly.

```bash
# Create empty placeholder resume if none exists
touch public/resume.pdf
```

- [ ] **Step 4: Create src/components/ThemeToggle.astro**

A zero-dependency client theme switcher that syncs with `localStorage` and system theme:

```astro
---
// ThemeToggle.astro
---

<button
  id="theme-toggle"
  type="button"
  class="relative inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
  aria-label="Toggle theme"
>
  <span class="sr-only">Toggle color theme</span>
  <!-- Sun Icon (shown in dark mode) -->
  <svg
    class="w-5 h-5 hidden dark:block transition-transform duration-200 hover:rotate-45"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
  <!-- Moon Icon (shown in light mode) -->
  <svg
    class="w-5 h-5 block dark:hidden transition-transform duration-200 hover:-rotate-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
</button>

<script is:inline>
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const nextTheme = isDark ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', nextTheme);
    });
  }
</script>
```

- [ ] **Step 5: Create src/layouts/Layout.astro**

Create base HTML layout with metadata, OpenGraph, zero-FOUC script, and global styles:

```astro
---
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

const {
  title = "Torino — Software Engineer | Portfolio",
  description = "Personal web profile and engineering portfolio of Torino (@itto0), Software Engineer specializing in backend systems, computer vision, and data pipelines.",
  image = "/og-image.png"
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site || 'https://itto0.github.io');
---

<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />

    <!-- Canonical URL -->
    <link rel="canonical" href={canonicalURL} />

    <!-- Primary Meta Tags -->
    <title>{title}</title>
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <meta name="author" content="Torino" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(image, canonicalURL)} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalURL} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={new URL(image, canonicalURL)} />

    <!-- Zero-FOUC Theme Script -->
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
  </head>
  <body class="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col min-h-screen">
    <slot />
  </body>
</html>
```

- [ ] **Step 6: Build test to verify Layout compiles**

Create a temporary check page `src/pages/index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout>
  <h1>Test Page</h1>
</Layout>
```
Run: `npm run build`
Expected: `[build] ... Completed in ...`

- [ ] **Step 7: Commit**

```bash
git add public/ src/layouts/ src/components/ThemeToggle.astro src/pages/index.astro
git commit -m "feat: add base layout, zero-FOUC theme toggle, and meta tags"
```

---

### Task 5: Navbar & Hero Section

**Files:**
- Create: `src/components/Navbar.astro`
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `Hero.astro` accepts `user: GitHubUserProfile`, `profile: typeof profileConfig`
- `Navbar.astro` accepts no props (self-contained responsive nav)

- [ ] **Step 1: Create src/components/Navbar.astro**

Sticky navbar with blurred backdrop, navigation links, theme toggle, and GitHub profile CTA:

```astro
---
import ThemeToggle from './ThemeToggle.astro';
import profile from '../data/profile.json';
---

<header class="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-mono font-semibold text-lg text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>{profile.name}</span>
    </a>

    <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
      <a href="#projects" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Projects</a>
      <a href="#about" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</a>
      <a href="#contact" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a>
    </nav>

    <div class="flex items-center gap-3">
      <ThemeToggle />
      <a
        href={profile.socials.github}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
        aria-label="GitHub Profile"
      >
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        <span class="hidden sm:inline">GitHub</span>
      </a>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Create src/components/Hero.astro**

Hero component with avatar, status badge, title, concise narrative, and download resume CTA:

```astro
---
import type { GitHubUserProfile } from '../lib/github';
import profileData from '../data/profile.json';

interface Props {
  user: GitHubUserProfile;
}

const { user } = Astro.props;
---

<section class="py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-8">
      <div class="flex-1 space-y-5">
        <!-- Status Pill -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{profileData.status}</span>
        </div>

        <!-- Heading -->
        <div class="space-y-2">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hi, I'm <span class="text-emerald-600 dark:text-emerald-400">{profileData.name}</span>
          </h1>
          <p class="text-xl sm:text-2xl font-medium text-zinc-600 dark:text-zinc-400">
            {profileData.title} <span class="text-zinc-400 dark:text-zinc-600">·</span> {profileData.location}
          </p>
        </div>

        <!-- Bio Narrative -->
        <p class="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {profileData.bio}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="#projects"
            class="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            Explore Projects
          </a>
          <a
            href="/resume.pdf"
            download
            class="px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 font-medium text-sm text-zinc-800 dark:text-zinc-200 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Download Resume</span>
          </a>
        </div>
      </div>

      <!-- Avatar with subtle gradient ring -->
      <div class="relative group">
        <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-30 group-hover:opacity-60 blur transition duration-300"></div>
        <img
          src={user.avatar_url}
          alt={`${profileData.name} Avatar`}
          width="144"
          height="144"
          class="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-lg"
          loading="eager"
        />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Update src/pages/index.astro to display Navbar & Hero**

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import { getPortfolioData } from '../lib/github';

const data = await getPortfolioData();
---

<Layout>
  <Navbar />
  <main class="flex-1">
    <Hero user={data.user} />
  </main>
</Layout>
```

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: `[build] ... Completed in ...`

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.astro src/components/Hero.astro src/pages/index.astro
git commit -m "feat: implement responsive navbar and hero section"
```

---

### Task 6: Featured Projects & Language Breakdown

**Files:**
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/ProjectsSection.astro`
- Create: `src/components/LanguageStats.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `ProjectCard.astro` accepts `project: EnrichedProject`
- `ProjectsSection.astro` accepts `projects: EnrichedProject[]`
- `LanguageStats.astro` accepts `stats: LanguageStat[]`

- [ ] **Step 1: Create src/components/ProjectCard.astro**

Card component structured around engineering problem and outcome:

```astro
---
import type { EnrichedProject } from '../lib/github';

interface Props {
  project: EnrichedProject;
}

const { project } = Astro.props;
---

<article class="flex flex-col justify-between p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 shadow-sm hover:shadow-md group">
  <div class="space-y-4">
    <!-- Header: Title & Stars -->
    <div class="flex items-start justify-between gap-4">
      <h3 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {project.displayName}
      </h3>
      <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
        <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <span>{project.stars}</span>
      </div>
    </div>

    <!-- Engineering Narrative: Problem & Outcome -->
    <div class="space-y-3 text-sm">
      <div>
        <span class="font-semibold text-zinc-700 dark:text-zinc-300">Challenge:</span>
        <p class="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
          {project.problem}
        </p>
      </div>
      <div>
        <span class="font-semibold text-emerald-700 dark:text-emerald-400">Outcome:</span>
        <p class="text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
          {project.outcome}
        </p>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-1.5 pt-2">
      {project.tags.map((tag) => (
        <span class="px-2 py-0.5 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
          {tag}
        </span>
      ))}
    </div>
  </div>

  <!-- Links -->
  <div class="flex items-center gap-4 pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-sm font-medium">
    <a
      href={project.repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
    >
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
      <span>Repository</span>
    </a>

    {project.demoUrl && (
      <a
        href={project.demoUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        <span>Live Demo</span>
      </a>
    )}
  </div>
</article>
```

- [ ] **Step 2: Create src/components/LanguageStats.astro**

Visual language distribution breakdown:

```astro
---
import type { LanguageStat } from '../lib/github';

interface Props {
  stats: LanguageStat[];
}

const { stats } = Astro.props;
---

<div class="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
      GitHub Language Ecosystem
    </h3>
    <span class="text-xs text-zinc-400 dark:text-zinc-500">Across public repositories</span>
  </div>

  <!-- Stacked Bar -->
  <div class="h-3 w-full rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
    {stats.map((stat) => (
      <div
        style={`width: ${stat.percentage}%; background-color: ${stat.color};`}
        class="h-full transition-all duration-300"
        title={`${stat.language}: ${stat.percentage}%`}
      />
    ))}
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs">
    {stats.map((stat) => (
      <div class="flex items-center gap-1.5 font-mono text-zinc-600 dark:text-zinc-400">
        <span class="w-2.5 h-2.5 rounded-full" style={`background-color: ${stat.color};`} />
        <span>{stat.language}</span>
        <span class="text-zinc-400 dark:text-zinc-500">{stat.percentage}%</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Create src/components/ProjectsSection.astro**

```astro
---
import type { EnrichedProject, LanguageStat } from '../lib/github';
import ProjectCard from './ProjectCard.astro';
import LanguageStats from './LanguageStats.astro';

interface Props {
  projects: EnrichedProject[];
  languageStats: LanguageStat[];
}

const { projects, languageStats } = Astro.props;
---

<section id="projects" class="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800/60 scroll-mt-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        Featured Projects
      </h2>
      <p class="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl">
        Curated production systems, computer vision models, and streaming pipelines with real-world context.
      </p>
    </div>

    <!-- Language Ecosystem Widget -->
    {languageStats.length > 0 && <LanguageStats stats={languageStats} />}

    <!-- Project Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Update src/pages/index.astro to include ProjectsSection**

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import ProjectsSection from '../components/ProjectsSection.astro';
import { getPortfolioData } from '../lib/github';

const data = await getPortfolioData();
---

<Layout>
  <Navbar />
  <main class="flex-1">
    <Hero user={data.user} />
    <ProjectsSection projects={data.featuredProjects} languageStats={data.languageStats} />
  </main>
</Layout>
```

- [ ] **Step 5: Verify build succeeds**

Run: `npm run build`
Expected: `[build] ... Completed in ...`

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectCard.astro src/components/LanguageStats.astro src/components/ProjectsSection.astro src/pages/index.astro
git commit -m "feat: implement project cards grid and language statistics breakdown"
```

---

### Task 7: About, Skills, Contact & Footer

**Files:**
- Create: `src/components/AboutSection.astro`
- Create: `src/components/ContactSection.astro`
- Create: `src/components/Footer.astro`
- Create: `src/pages/404.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- `AboutSection.astro` reads `src/data/skills.json` and renders categorized technical skills
- `ContactSection.astro` renders contact CTAs and location
- `Footer.astro` accepts `lastSyncedAt: string`, `isFallback: boolean`

- [ ] **Step 1: Create src/components/AboutSection.astro**

```astro
---
import skillsData from '../data/skills.json';
import profileData from '../data/profile.json';
---

<section id="about" class="py-16 sm:py-20 border-b border-zinc-200 dark:border-zinc-800/60 scroll-mt-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        About Me
      </h2>
      <p class="text-zinc-600 dark:text-zinc-400 text-base max-w-2xl">
        Engineering philosophy, core technical domains, and the tools I use daily.
      </p>
    </div>

    <!-- Two-column narrative & skills -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          I am a software engineer based in {profileData.location} focused on building robust backend systems, data pipelines, and practical computer vision applications.
        </p>
        <p>
          My work emphasizes clean architecture, deterministic performance, and maintainable software design. Whether optimizing concurrent state counters in Python and Rust or configuring change data capture pipelines, I enjoy tackling engineering problems that directly improve operational efficiency.
        </p>
        <p>
          When building software, I value minimal dependencies, comprehensive automated testing, and clear documentation.
        </p>
      </div>

      <!-- Skills Matrix -->
      <div class="space-y-6">
        {skillsData.categories.map((category) => (
          <div class="space-y-2">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {category.name}
            </h3>
            <div class="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span class="px-2.5 py-1 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Create src/components/ContactSection.astro**

```astro
---
import profileData from '../data/profile.json';
---

<section id="contact" class="py-16 sm:py-24 scroll-mt-16">
  <div class="max-w-5xl mx-auto px-4 sm:px-6">
    <div class="p-8 sm:p-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900/60 dark:to-zinc-950 text-center space-y-6 shadow-sm">
      <div class="space-y-2 max-w-xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Let's Build Something Together
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
          Interested in collaborating, hiring, or discussing backend systems? Reach out directly via email.
        </p>
      </div>

      <div class="pt-2">
        <a
          href={`mailto:${profileData.email}`}
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span>{profileData.email}</span>
        </a>
      </div>

      <div class="pt-4 flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
        <a href={profileData.socials.github} target="_blank" rel="noopener noreferrer" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          GitHub
        </a>
        <span>·</span>
        <a href={profileData.socials.linkedin} target="_blank" rel="noopener noreferrer" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          LinkedIn
        </a>
        <span>·</span>
        <span>{profileData.location}</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create src/components/Footer.astro**

```astro
---
import profileData from '../data/profile.json';

interface Props {
  lastSyncedAt: string;
  isFallback: boolean;
}

const { lastSyncedAt, isFallback } = Astro.props;
const currentYear = new Date().getFullYear();
const formattedSync = new Date(lastSyncedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
---

<footer class="border-t border-zinc-200 dark:border-zinc-800/80 py-8 text-xs text-zinc-500 dark:text-zinc-500">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span>© {currentYear} {profileData.name}. All rights reserved.</span>
    </div>

    <div class="flex items-center gap-3 font-mono text-[11px]">
      <span class="flex items-center gap-1.5">
        <span class={`w-2 h-2 rounded-full ${isFallback ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        <span>{isFallback ? 'Synced from cache' : `GitHub sync: ${formattedSync}`}</span>
      </span>
      <span>·</span>
      <span>Built with Astro</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Create src/pages/404.astro**

Clean 404 page consistent with the styling:

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
---

<Layout title="404 — Page Not Found">
  <Navbar />
  <main class="flex-1 flex items-center justify-center py-24 px-4 text-center">
    <div class="space-y-4 max-w-md">
      <span class="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
        404 Error
      </span>
      <h1 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        Page Not Found
      </h1>
      <p class="text-zinc-600 dark:text-zinc-400 text-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div class="pt-4">
        <a
          href="/"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  </main>
</Layout>
```

- [ ] **Step 5: Assemble full src/pages/index.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import ProjectsSection from '../components/ProjectsSection.astro';
import AboutSection from '../components/AboutSection.astro';
import ContactSection from '../components/ContactSection.astro';
import Footer from '../components/Footer.astro';
import { getPortfolioData } from '../lib/github';

const data = await getPortfolioData();
---

<Layout>
  <Navbar />
  <main class="flex-1">
    <Hero user={data.user} />
    <ProjectsSection projects={data.featuredProjects} languageStats={data.languageStats} />
    <AboutSection />
    <ContactSection />
  </main>
  <Footer lastSyncedAt={data.lastSyncedAt} isFallback={data.isFallback} />
</Layout>
```

- [ ] **Step 6: Build test to verify complete site generation**

Run: `npm run build`
Expected: `[build] ... Completed in ...` with pages `/` and `/404` generated into `dist/`.

- [ ] **Step 7: Commit**

```bash
git add src/components/AboutSection.astro src/components/ContactSection.astro src/components/Footer.astro src/pages/404.astro src/pages/index.astro
git commit -m "feat: complete about, skills, contact, and footer sections"
```

---

### Task 8: CI/CD GitHub Actions & Build Verification

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Automates deployment to GitHub Pages on `push` to `main` and scheduled daily rebuild `0 4 * * *`.

- [ ] **Step 1: Create .github/workflows/deploy.yml**

```yaml
name: Deploy Web Profile to GitHub Pages

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 4 * * *' # Daily sync at 04:00 UTC
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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build static site
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run build

      - name: Upload Pages artifact
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

- [ ] **Step 2: Run complete test suite and build verification**

Run: `npm test`
Expected: All tests PASS

Run: `npm run build`
Expected: Static build completes successfully without errors

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: configure automated github pages deployment workflow"
```
