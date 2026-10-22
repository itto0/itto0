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

export type CuratedProject = CuratedProjectOverride;

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

export interface SocialLinks {
  github: string;
  linkedin: string;
  twitter?: string;
  [key: string]: string | undefined;
}

export interface ProfileData {
  username: string;
  name: string;
  title: string;
  status: string;
  bio: string;
  location: string;
  email: string;
  socials: SocialLinks;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface FallbackData {
  user: GitHubUserProfile;
  repos: GitHubRepo[];
}
