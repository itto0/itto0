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
