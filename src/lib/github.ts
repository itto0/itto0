import fallbackData from '../data/fallback-data.json';
import profileConfig from '../data/profile.json';
import curatedProjectsData from '../data/projects.json';
import type {
  CuratedProjectOverride,
  GitHubUserProfile,
  GitHubRepo,
  EnrichedProject,
  LanguageStat,
  PortfolioData,
} from '../types';

export type {
  GitHubUserProfile,
  GitHubRepo,
  EnrichedProject,
  LanguageStat,
  PortfolioData,
};

const curatedProjects = curatedProjectsData as CuratedProjectOverride[];

export const LANGUAGE_COLORS: Record<string, string> = {
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
    if (repo && repo.language) {
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
  const token = typeof process !== 'undefined' ? (process.env?.PROFILE_TOKEN || process.env?.GITHUB_TOKEN) : undefined;
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
    timeoutId.unref?.();

    try {
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

      if (userRes.ok && reposRes.ok) {
        const parsedUser = await userRes.json();
        const parsedRepos = await reposRes.json();
        if (parsedUser && Array.isArray(parsedRepos)) {
          user = parsedUser;
          repos = parsedRepos;
          isFallback = false;
        } else {
          console.warn(`[github-sync] Non-array repos received from GitHub API. Falling back to local cache.`);
        }
      } else {
        console.warn(`[github-sync] Non-200 response from GitHub API. Falling back to local cache.`);
      }
    } finally {
      clearTimeout(timeoutId);
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
