import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioData, calculateLanguageStats } from '../src/lib/github';
import type { GitHubRepo } from '../src/lib/github';

describe('GitHub Ingestion & Fallback Engine', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  describe('calculateLanguageStats', () => {
    it('computes correct percentages and colors', () => {
      const mockRepos: Partial<GitHubRepo>[] = [
        { language: 'Python' },
        { language: 'Python' },
        { language: 'Rust' },
        { language: 'C#' },
      ];

      const stats = calculateLanguageStats(mockRepos as GitHubRepo[]);
      expect(stats.length).toBe(3);
      expect(stats[0].language).toBe('Python');
      expect(stats[0].count).toBe(2);
      expect(stats[0].percentage).toBe(50);
      expect(stats[1].percentage).toBe(25);
      expect(stats[2].percentage).toBe(25);
      expect(stats[0].color).toBe('#3572A5');
    });

    it('handles empty repositories gracefully', () => {
      const stats = calculateLanguageStats([]);
      expect(stats).toEqual([]);
    });

    it('ignores repositories without language or with null language', () => {
      const mockRepos: Partial<GitHubRepo>[] = [
        { language: null },
        { language: undefined as unknown as string },
        { language: 'TypeScript' },
      ];

      const stats = calculateLanguageStats(mockRepos as GitHubRepo[]);
      expect(stats.length).toBe(1);
      expect(stats[0].language).toBe('TypeScript');
      expect(stats[0].percentage).toBe(100);
      expect(stats[0].color).toBe('#3178c6');
    });

    it('assigns fallback color for uncommon/unlisted languages', () => {
      const mockRepos: Partial<GitHubRepo>[] = [
        { language: 'Brainfuck' },
      ];

      const stats = calculateLanguageStats(mockRepos as GitHubRepo[]);
      expect(stats.length).toBe(1);
      expect(stats[0].language).toBe('Brainfuck');
      expect(stats[0].color).toBe('#71717a');
    });

    it('sorts language stats descending by repository count', () => {
      const mockRepos: Partial<GitHubRepo>[] = [
        { language: 'Rust' },
        { language: 'Go' },
        { language: 'Go' },
        { language: 'Go' },
        { language: 'Python' },
        { language: 'Python' },
      ];

      const stats = calculateLanguageStats(mockRepos as GitHubRepo[]);
      expect(stats.map((s) => s.language)).toEqual(['Go', 'Python', 'Rust']);
      expect(stats[0].count).toBe(3);
      expect(stats[1].count).toBe(2);
      expect(stats[2].count).toBe(1);
    });
  });

  describe('getPortfolioData', () => {
    it('returns fallback data when fetch fails with network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const data = await getPortfolioData();
      expect(data.isFallback).toBe(true);
      expect(data.user.login).toBe('itto0');
      expect(data.featuredProjects.length).toBeGreaterThanOrEqual(4);
      expect(data.featuredProjects[0].problem).toBeDefined();
      expect(data.featuredProjects[0].outcome).toBeDefined();
      expect(data.languageStats.length).toBeGreaterThan(0);
      expect(data.lastSyncedAt).toBeDefined();
    });

    it('returns fallback data when GitHub API returns non-200 responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'rate limit exceeded',
      } as Response);

      const data = await getPortfolioData();
      expect(data.isFallback).toBe(true);
      expect(data.user.login).toBe('itto0');
      expect(data.featuredProjects.length).toBeGreaterThanOrEqual(4);
    });

    it('enriches live GitHub repos with curated overrides', async () => {
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

      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes('/repos')) {
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
      expect(counterProject?.forks).toBe(5);
      expect(counterProject?.description).toBe('Live description from GitHub');
      // Problem and outcome should come from curated projects.json
      expect(counterProject?.problem).toContain('high-frequency event ingestion');
      expect(counterProject?.outcome).toContain('FastAPI and Redis');
      expect(counterProject?.tags).toEqual(['Python', 'FastAPI', 'Redis', 'Docker', 'AsyncIO']);
    });

    it('maintains curated featuredOrder for enriched projects', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Offline'));

      const data = await getPortfolioData();
      const orders = data.featuredProjects.map((p) => p.featuredOrder);
      for (let i = 0; i < orders.length - 1; i++) {
        expect(orders[i]).toBeLessThanOrEqual(orders[i + 1]);
      }
    });

    it('attaches authorization header when GITHUB_TOKEN is set', async () => {
      const prevToken = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'test-token-12345';

      let capturedHeaders: Record<string, string> | undefined;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        capturedHeaders = init?.headers;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      try {
        await getPortfolioData();
        expect(capturedHeaders?.Authorization).toBe('Bearer test-token-12345');
      } finally {
        if (prevToken === undefined) {
          delete process.env.GITHUB_TOKEN;
        } else {
          process.env.GITHUB_TOKEN = prevToken;
        }
      }
    });
  });
});
