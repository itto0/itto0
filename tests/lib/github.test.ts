import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioData, calculateLanguageStats } from '../../src/lib/github';
import type { GitHubRepo } from '../../src/lib/github';

describe('GitHub Ingestion & Fallback Engine (Brief Spec)', () => {
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
