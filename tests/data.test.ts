import { describe, it, expect } from 'vitest';
import profileData from '../src/data/profile.json';
import projectsData from '../src/data/projects.json';
import skillsData from '../src/data/skills.json';
import fallbackData from '../src/data/fallback-data.json';
import type {
  ProfileData,
  CuratedProject,
  CuratedProjectOverride,
  SkillsData,
  FallbackData,
  GitHubUserProfile,
  GitHubRepo,
} from '../src/types';

describe('Data Models & Integrity Verification', () => {
  describe('profile.json', () => {
    it('contains valid basic info adhering to ProfileData', () => {
      const profile: ProfileData = profileData;

      expect(profile.username).toBe('itto0');
      expect(profile.name).toBe('Torino');
      expect(profile.title).toBe('Software Engineer');
      expect(profile.status).toBeTruthy();
      expect(profile.bio.length).toBeGreaterThan(20);
      expect(profile.location).toBe('Central Java, Indonesia');
      expect(profile.email).toContain('@');
      expect(profile.socials.github).toContain('github.com/itto0');
    });
  });

  describe('projects.json', () => {
    it('contains curated featured projects with problem and outcome statements', () => {
      const projects: CuratedProject[] = projectsData;
      const projectsOverride: CuratedProjectOverride[] = projectsData;

      expect(projects.length).toBeGreaterThanOrEqual(4);
      expect(projectsOverride.length).toBe(projects.length);

      // Verify required curated projects exist
      const requiredProjects = [
        'counter-service',
        'cdc-chicken-counting',
        'cdc-pipeline',
        'ASP.NET-Core-MVC-6-Starter-Kit',
      ];

      const repoNames = projects.map((p) => p.repoName);
      for (const required of requiredProjects) {
        expect(repoNames).toContain(required);
      }

      projects.forEach((project) => {
        expect(project.repoName).toBeDefined();
        expect(project.displayName).toBeDefined();
        expect(project.problem.length).toBeGreaterThan(10);
        expect(project.outcome.length).toBeGreaterThan(10);
        expect(project.tags.length).toBeGreaterThan(0);
        expect(project.featuredOrder).toBeGreaterThan(0);
      });
    });

    it('has unique featuredOrder for all projects', () => {
      const orders = projectsData.map((p) => p.featuredOrder);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });
  });

  describe('skills.json', () => {
    it('contains grouped engineering skills adhering to SkillsData', () => {
      const skills: SkillsData = skillsData;

      expect(skills.categories.length).toBeGreaterThanOrEqual(3);
      skills.categories.forEach((cat) => {
        expect(cat.name).toBeDefined();
        expect(cat.skills.length).toBeGreaterThan(0);
      });

      const allSkillNames = skills.categories.flatMap((cat) => cat.skills);
      expect(allSkillNames).toContain('Python');
      expect(allSkillNames).toContain('Rust');
      expect(allSkillNames).toContain('C#');
    });
  });

  describe('fallback-data.json', () => {
    it('contains valid fallback user and repos adhering to FallbackData', () => {
      const fallback: FallbackData = fallbackData;
      const user: GitHubUserProfile = fallback.user;
      const repos: GitHubRepo[] = fallback.repos;

      expect(user.login).toBe('itto0');
      expect(user.name).toBe('Torino');
      expect(user.avatar_url).toContain('githubusercontent.com');
      expect(user.public_repos).toBeGreaterThan(0);

      expect(repos.length).toBeGreaterThanOrEqual(4);

      // Ensure fallback has repos matching all required curated projects
      const requiredProjects = [
        'counter-service',
        'cdc-chicken-counting',
        'cdc-pipeline',
        'ASP.NET-Core-MVC-6-Starter-Kit',
      ];

      const repoNames = repos.map((r) => r.name);
      for (const required of requiredProjects) {
        expect(repoNames).toContain(required);
      }

      repos.forEach((repo) => {
        expect(repo.id).toBeDefined();
        expect(repo.name).toBeDefined();
        expect(repo.full_name).toContain('itto0/');
        expect(repo.html_url).toContain('github.com/itto0/');
        expect(typeof repo.stargazers_count).toBe('number');
        expect(typeof repo.forks_count).toBe('number');
        expect(Array.isArray(repo.topics)).toBe(true);
        expect(repo.pushed_at).toBeDefined();
        expect(typeof repo.archived).toBe('boolean');
      });
    });
  });
});
