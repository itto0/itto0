import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { EnrichedProject, LanguageStat } from '../src/types';
import curatedProjects from '../src/data/projects.json';
import fallbackData from '../src/data/fallback-data.json';

describe('Featured Projects & Language Breakdown (Task 6)', () => {
  const rootDir = process.cwd();
  const projectCardPath = path.join(rootDir, 'src', 'components', 'ProjectCard.astro');
  const languageStatsPath = path.join(rootDir, 'src', 'components', 'LanguageStats.astro');
  const projectsSectionPath = path.join(rootDir, 'src', 'components', 'ProjectsSection.astro');
  const indexPath = path.join(rootDir, 'src', 'pages', 'index.astro');

  describe('src/components/ProjectCard.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(projectCardPath), 'src/components/ProjectCard.astro must exist').toBe(true);
    });

    it('defines Props interface accepting EnrichedProject', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toMatch(/import\s+type\s+\{\s*EnrichedProject\s*\}\s+from/);
      expect(card).toContain('interface Props');
      expect(card).toContain('project: EnrichedProject');
    });

    it('renders project title and GitHub star / fork counters with accessible icons', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('{project.displayName}');
      expect(card).toContain('{project.stars}');
      expect(card).toContain('{project.forks}');
    });

    it('displays language badge with color indicator', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('{project.language}');
      expect(card).toMatch(/LANGUAGE_COLORS|background-color/);
    });

    it('renders engineering narrative with challenge (problem) and outcome', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('{project.problem}');
      expect(card).toContain('{project.outcome}');
      expect(card).toMatch(/Challenge|Problem/i);
      expect(card).toMatch(/Outcome|Solution/i);
    });

    it('renders technology tags list with mono styling', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('{project.tags.map');
      expect(card).toContain('{tag}');
      expect(card).toMatch(/font-mono/);
    });

    it('renders repository external link with secure attributes and accessible label', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('href={project.repoUrl}');
      expect(card).toContain('target="_blank"');
      expect(card).toContain('rel="noopener noreferrer"');
      expect(card).toMatch(/aria-label=".*(repo|repository|source).*"|<span>Repository<\/span>/i);
    });

    it('conditionally renders live demo link when demoUrl is provided', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('{project.demoUrl');
      expect(card).toContain('href={project.demoUrl}');
      expect(card).toContain('target="_blank"');
      expect(card).toContain('rel="noopener noreferrer"');
    });

    it('includes accessible focus-visible rings on interactive links', () => {
      const card = fs.readFileSync(projectCardPath, 'utf-8');
      expect(card).toContain('focus-visible:ring-2');
    });
  });

  describe('src/components/LanguageStats.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(languageStatsPath), 'src/components/LanguageStats.astro must exist').toBe(true);
    });

    it('defines Props interface accepting stats: LanguageStat[]', () => {
      const stats = fs.readFileSync(languageStatsPath, 'utf-8');
      expect(stats).toMatch(/import\s+type\s+\{\s*LanguageStat\s*\}\s+from/);
      expect(stats).toContain('interface Props');
      expect(stats).toContain('stats: LanguageStat[]');
    });

    it('renders section title and explanatory subtitle', () => {
      const stats = fs.readFileSync(languageStatsPath, 'utf-8');
      expect(stats).toMatch(/GitHub Language Ecosystem|Language Breakdown/i);
      expect(stats).toMatch(/Across public repositories/i);
    });

    it('renders stacked horizontal percentage bar with dynamic inline width and color, and accessible role="img"', () => {
      const stats = fs.readFileSync(languageStatsPath, 'utf-8');
      expect(stats).toContain('{stats.map');
      expect(stats).toMatch(/width:\s*\$\{stat\.percentage\}%/);
      expect(stats).toMatch(/background-color:\s*\$\{stat\.color\}/);
      expect(stats).toContain('role="img"');
      expect(stats).toContain('aria-label="GitHub language breakdown"');
    });

    it('renders legend with language name, color dot, and percentage share', () => {
      const stats = fs.readFileSync(languageStatsPath, 'utf-8');
      expect(stats).toContain('{stat.language}');
      expect(stats).toContain('{stat.percentage}%');
    });
  });

  describe('src/components/ProjectsSection.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(projectsSectionPath), 'src/components/ProjectsSection.astro must exist').toBe(true);
    });

    it('defines Props accepting projects: EnrichedProject[] and languageStats', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toContain('projects: EnrichedProject[]');
      expect(section).toContain('languageStats');
    });

    it('has id="projects" for navbar anchor navigation and scroll-mt offset', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toContain('id="projects"');
      expect(section).toContain('scroll-mt-');
    });

    it('renders section header with title and description narrative', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toContain('Featured Projects');
      expect(section).toMatch(/Curated production systems/i);
    });

    it('renders LanguageStats component when stats are available', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toContain("import LanguageStats from './LanguageStats.astro'");
      expect(section).toMatch(/<LanguageStats\s+stats=\{languageStats\}/);
    });

    it('renders responsive 2-column grid of ProjectCard components', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toContain("import ProjectCard from './ProjectCard.astro'");
      expect(section).toMatch(/grid-cols-1\s+md:grid-cols-2/);
      expect(section).toMatch(/<ProjectCard\s+project=\{project\}/);
    });

    it('includes a link to view all repositories on GitHub', () => {
      const section = fs.readFileSync(projectsSectionPath, 'utf-8');
      expect(section).toMatch(/href="https:\/\/github\.com\/itto0\?tab=repositories"|href=\{`https:\/\/github\.com\/\$\{.*\}\?tab=repositories`\}/);
      expect(section).toMatch(/View all repositories on GitHub/i);
      expect(section).toContain('target="_blank"');
      expect(section).toContain('rel="noopener noreferrer"');
    });
  });

  describe('src/pages/index.astro integration', () => {
    it('imports and renders ProjectsSection with data.featuredProjects and data.languageStats', () => {
      const index = fs.readFileSync(indexPath, 'utf-8');
      expect(index).toContain("import ProjectsSection from '../components/ProjectsSection.astro'");
      expect(index).toMatch(/<ProjectsSection\s+projects=\{data\.featuredProjects\}\s+languageStats=\{data\.languageStats\}\s*\/>/);
    });
  });

  describe('Curated Projects & Data Integrity', () => {
    it('includes required target curated projects', () => {
      const requiredRepos = [
        'counter-service',
        'cdc-chicken-counting',
        'cdc-pipeline',
        'ASP.NET-Core-MVC-6-Starter-Kit',
      ];
      const repoNames = curatedProjects.map((p: any) => p.repoName);
      for (const required of requiredRepos) {
        expect(repoNames).toContain(required);
      }
    });

    it('validates each curated project has problem, outcome, tags, and displayName', () => {
      for (const project of curatedProjects as any[]) {
        expect(project.displayName).toBeTruthy();
        expect(project.problem.length).toBeGreaterThan(10);
        expect(project.outcome.length).toBeGreaterThan(10);
        expect(Array.isArray(project.tags)).toBe(true);
        expect(project.tags.length).toBeGreaterThan(0);
      }
    });
  });
});
