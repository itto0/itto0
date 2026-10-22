import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { getPortfolioData } from '../src/lib/github';

describe('CI/CD GitHub Actions & Deployment Workflow (Task 8)', () => {
  const rootDir = process.cwd();
  const workflowPath = path.join(rootDir, '.github', 'workflows', 'deploy.yml');

  describe('Workflow File & YAML Validity', () => {
    it('exists at .github/workflows/deploy.yml', () => {
      expect(fs.existsSync(workflowPath), '.github/workflows/deploy.yml must exist').toBe(true);
    });

    it('is valid YAML syntax with a descriptive name', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      expect(doc.name).toMatch(/Deploy.*GitHub Pages/i);
    });
  });

  describe('Workflow Triggers (on)', () => {
    it('configures push triggers for main and master branches', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.on).toBeDefined();
      expect(doc.on.push).toBeDefined();
      const branches = doc.on.push.branches;
      expect(Array.isArray(branches)).toBe(true);
      expect(branches).toContain('main');
      expect(branches).toContain('master');
    });

    it('configures scheduled daily sync cron at midnight (0 0 * * *)', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.on).toBeDefined();
      expect(doc.on.schedule).toBeDefined();
      expect(Array.isArray(doc.on.schedule)).toBe(true);
      const cronEntries = doc.on.schedule.map((entry: { cron: string }) => entry.cron);
      expect(cronEntries).toContain('0 0 * * *');
    });

    it('configures workflow_dispatch for manual trigger', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.on).toBeDefined();
      expect(Object.prototype.hasOwnProperty.call(doc.on, 'workflow_dispatch')).toBe(true);
    });
  });

  describe('Workflow Security, Permissions & Concurrency', () => {
    it('configures minimum required permissions for GitHub Pages deployment', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.permissions).toBeDefined();
      expect(doc.permissions.contents).toBe('read');
      expect(doc.permissions.pages).toBe('write');
      expect(doc.permissions['id-token']).toBe('write');
    });

    it('configures concurrency group to avoid race conditions during pages deployment', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.concurrency).toBeDefined();
      expect(doc.concurrency.group).toBe('pages');
      expect(doc.concurrency['cancel-in-progress']).toBe(true);
    });
  });

  describe('Build Job Configuration (jobs.build)', () => {
    it('runs on ubuntu-latest and executes required pipeline steps', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.jobs).toBeDefined();
      expect(doc.jobs.build).toBeDefined();
      expect(doc.jobs.build['runs-on']).toBe('ubuntu-latest');

      const steps = doc.jobs.build.steps;
      expect(Array.isArray(steps)).toBe(true);

      // Checkout step
      const checkoutStep = steps.find((step: Record<string, unknown>) =>
        typeof step.uses === 'string' && step.uses.startsWith('actions/checkout@v4')
      );
      expect(checkoutStep).toBeDefined();

      // Node setup step
      const setupNodeStep = steps.find((step: Record<string, unknown>) =>
        typeof step.uses === 'string' && step.uses.startsWith('actions/setup-node@v4')
      );
      expect(setupNodeStep).toBeDefined();
      expect(String(setupNodeStep.with?.['node-version'])).toMatch(/20/);
      expect(setupNodeStep.with?.cache).toBe('npm');

      // Install dependencies step
      const installStep = steps.find((step: Record<string, unknown>) => step.run === 'npm ci');
      expect(installStep).toBeDefined();

      // Run tests step
      const testStep = steps.find((step: Record<string, unknown>) => step.run === 'npm test');
      expect(testStep).toBeDefined();

      // Build static site step
      const buildStep = steps.find((step: Record<string, unknown>) => step.run === 'npm run build');
      expect(buildStep).toBeDefined();

      // Upload Pages artifact step
      const uploadStep = steps.find((step: Record<string, unknown>) =>
        typeof step.uses === 'string' && step.uses.startsWith('actions/upload-pages-artifact@v3')
      );
      expect(uploadStep).toBeDefined();
      expect(uploadStep.with?.path).toBe('./dist');
    });

    it('passes secret token to the build step as PROFILE_TOKEN or GITHUB_TOKEN', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      expect(rawContent).toMatch(/PROFILE_TOKEN:\s*\${{\s*secrets\.PROFILE_TOKEN\s*\|\|\s*secrets\.GITHUB_TOKEN\s*}}/);
    });
  });

  describe('Deploy Job Configuration (jobs.deploy)', () => {
    it('depends on build job and deploys using actions/deploy-pages@v4', () => {
      const rawContent = fs.readFileSync(workflowPath, 'utf-8');
      const doc = parseYaml(rawContent);

      expect(doc.jobs).toBeDefined();
      expect(doc.jobs.deploy).toBeDefined();
      expect(doc.jobs.deploy.needs).toBe('build');
      expect(doc.jobs.deploy['runs-on']).toBe('ubuntu-latest');
      expect(doc.jobs.deploy.environment?.name).toBe('github-pages');

      const steps = doc.jobs.deploy.steps;
      expect(Array.isArray(steps)).toBe(true);
      const deployStep = steps.find((step: Record<string, unknown>) =>
        typeof step.uses === 'string' && step.uses.startsWith('actions/deploy-pages@v4')
      );
      expect(deployStep).toBeDefined();
    });
  });

  describe('Token Fallback & Integration in Build Pipeline', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('supports PROFILE_TOKEN environment variable in getPortfolioData', async () => {
      delete process.env.GITHUB_TOKEN;
      process.env.PROFILE_TOKEN = 'ghp_profile_mock_token';

      let capturedHeaders: Record<string, string> | undefined;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        capturedHeaders = init?.headers;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      await getPortfolioData();
      expect(capturedHeaders?.Authorization).toBe('Bearer ghp_profile_mock_token');
    });
  });
});
