import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Base Layout, SEO & Theme Switcher (Task 4)', () => {
  const rootDir = process.cwd();
  const faviconPath = path.join(rootDir, 'public', 'favicon.svg');
  const robotsPath = path.join(rootDir, 'public', 'robots.txt');
  const resumePath = path.join(rootDir, 'public', 'resume.pdf');
  const layoutPath = path.join(rootDir, 'src', 'layouts', 'Layout.astro');
  const themeTogglePath = path.join(rootDir, 'src', 'components', 'ThemeToggle.astro');

  describe('Static Assets in public/', () => {
    it('creates public/favicon.svg with valid SVG monogram', () => {
      expect(fs.existsSync(faviconPath), 'public/favicon.svg must exist').toBe(true);
      const svg = fs.readFileSync(faviconPath, 'utf-8');
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 32 32"');
      expect(svg).toContain('#10b981');
      expect(svg).toContain('#ffffff');
      expect(svg).toContain('</svg>');
    });

    it('creates public/robots.txt with search crawler indexing rules', () => {
      expect(fs.existsSync(robotsPath), 'public/robots.txt must exist').toBe(true);
      const robots = fs.readFileSync(robotsPath, 'utf-8');
      expect(robots).toMatch(/User-agent:\s*\*/i);
      expect(robots).toMatch(/Allow:\s*\//i);
      expect(robots).toContain('Sitemap: https://itto0.github.io/sitemap-index.xml');
    });

    it('creates public/resume.pdf placeholder file', () => {
      expect(fs.existsSync(resumePath), 'public/resume.pdf must exist').toBe(true);
    });
  });

  describe('src/layouts/Layout.astro', () => {
    it('exists and imports global styling', () => {
      expect(fs.existsSync(layoutPath), 'src/layouts/Layout.astro must exist').toBe(true);
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain("import '../styles/global.css'");
    });

    it('defines Props interface with title, description, and image defaults', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('interface Props');
      expect(layout).toContain('title?: string');
      expect(layout).toContain('description?: string');
      expect(layout).toContain('image?: string');
      expect(layout).toContain('Torino — Software Engineer | Portfolio');
      expect(layout).toContain('itto0');
      expect(layout).toContain('/og-image.png');
    });

    it('contains canonical URL handling with fallback site', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('canonicalURL');
      expect(layout).toContain('https://itto0.github.io');
      expect(layout).toContain('<link rel="canonical"');
    });

    it('renders essential SEO and metadata tags', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('<html lang="en"');
      expect(layout).toContain('class="scroll-smooth"');
      expect(layout).toContain('<meta charset="UTF-8"');
      expect(layout).toContain('name="viewport"');
      expect(layout).toContain('content="width=device-width, initial-scale=1.0"');
      expect(layout).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg"');
      expect(layout).toContain('<meta name="generator"');
      expect(layout).toContain('<meta name="author" content="Torino"');
      expect(layout).toContain('<meta name="title"');
      expect(layout).toContain('<meta name="description"');
    });

    it('renders Open Graph and Twitter Card tags', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      // Open Graph
      expect(layout).toContain('property="og:type" content="website"');
      expect(layout).toContain('property="og:url"');
      expect(layout).toContain('property="og:title"');
      expect(layout).toContain('property="og:description"');
      expect(layout).toContain('property="og:image"');

      // Twitter
      expect(layout).toContain('property="twitter:card" content="summary_large_image"');
      expect(layout).toContain('property="twitter:url"');
      expect(layout).toContain('property="twitter:title"');
      expect(layout).toContain('property="twitter:description"');
      expect(layout).toContain('property="twitter:image"');
    });

    it('includes font loading and preconnect links', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('rel="preconnect"');
      expect(layout).toContain('fonts.googleapis.com');
      expect(layout).toContain('fonts.gstatic.com');
      expect(layout).toContain('Inter');
      expect(layout).toContain('JetBrains+Mono');
    });

    it('includes inline Zero-FOUC theme initialization script in <head>', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('<script is:inline>');
      expect(layout).toContain("localStorage.getItem('theme')");
      expect(layout).toContain("window.matchMedia('(prefers-color-scheme: dark)')");
      expect(layout).toContain("document.documentElement.classList.add('dark')");
      expect(layout).toContain("document.documentElement.classList.remove('dark')");
    });

    it('has accessible body styling and slot container', () => {
      const layout = fs.readFileSync(layoutPath, 'utf-8');
      expect(layout).toContain('<body class="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col min-h-screen">');
      expect(layout).toContain('<slot />');
    });
  });

  describe('src/components/ThemeToggle.astro', () => {
    it('exists and contains accessible button with aria-label', () => {
      expect(fs.existsSync(themeTogglePath), 'src/components/ThemeToggle.astro must exist').toBe(true);
      const toggle = fs.readFileSync(themeTogglePath, 'utf-8');
      expect(toggle).toContain('id="theme-toggle"');
      expect(toggle).toContain('type="button"');
      expect(toggle).toContain('aria-label="Toggle color theme"');
      expect(toggle).toContain('Toggle color theme');
    });

    it('renders both Sun and Moon SVG icons with theme-dependent display classes', () => {
      const toggle = fs.readFileSync(themeTogglePath, 'utf-8');
      // Sun icon (visible in dark mode)
      expect(toggle).toContain('hidden dark:block');
      // Moon icon (visible in light mode)
      expect(toggle).toContain('block dark:hidden');
      // SVG tag checks
      const svgOccurrences = (toggle.match(/<svg/g) || []).length;
      expect(svgOccurrences).toBe(2);
    });

    it('includes inline script to toggle theme on click and persist in localStorage', () => {
      const toggle = fs.readFileSync(themeTogglePath, 'utf-8');
      expect(toggle).toContain('<script is:inline>');
      expect(toggle).toContain("document.getElementById('theme-toggle')");
      expect(toggle).toContain("document.documentElement.classList.contains('dark')");
      expect(toggle).toContain("document.documentElement.classList.add('dark')");
      expect(toggle).toContain("document.documentElement.classList.remove('dark')");
      expect(toggle).toContain("localStorage.setItem('theme', nextTheme)");
    });
  });

  describe('Theme Logic Verification', () => {
    let mockClassList: Set<string>;
    let mockStorage: Record<string, string>;
    let prefersDark: boolean;

    beforeEach(() => {
      mockClassList = new Set<string>();
      mockStorage = {};
      prefersDark = false;

      // Mock document.documentElement
      (globalThis as any).document = {
        documentElement: {
          classList: {
            add: vi.fn((cls: string) => mockClassList.add(cls)),
            remove: vi.fn((cls: string) => mockClassList.delete(cls)),
            contains: vi.fn((cls: string) => mockClassList.has(cls)),
          },
        },
      };

      // Mock localStorage
      (globalThis as any).localStorage = {
        getItem: vi.fn((key: string) => mockStorage[key] || null),
        setItem: vi.fn((key: string, val: string) => {
          mockStorage[key] = val;
        }),
      };

      // Mock window.matchMedia
      (globalThis as any).window = {
        matchMedia: vi.fn((query: string) => ({
          matches: query.includes('dark') ? prefersDark : false,
        })),
      };
    });

    afterEach(() => {
      delete (globalThis as any).document;
      delete (globalThis as any).localStorage;
      delete (globalThis as any).window;
    });

    // Zero-FOUC initialization logic
    function runZeroFOUCScript() {
      const theme = (() => {
        if (typeof (globalThis as any).localStorage !== 'undefined' && (globalThis as any).localStorage.getItem('theme')) {
          return (globalThis as any).localStorage.getItem('theme');
        }
        if ((globalThis as any).window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      })();
      if (theme === 'dark') {
        (globalThis as any).document.documentElement.classList.add('dark');
      } else {
        (globalThis as any).document.documentElement.classList.remove('dark');
      }
      return theme;
    }

    // Toggle click handler logic
    function runToggleClick() {
      const isDark = (globalThis as any).document.documentElement.classList.contains('dark');
      const nextTheme = isDark ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        (globalThis as any).document.documentElement.classList.add('dark');
      } else {
        (globalThis as any).document.documentElement.classList.remove('dark');
      }
      (globalThis as any).localStorage.setItem('theme', nextTheme);
      return nextTheme;
    }

    it('initializes dark mode if localStorage has dark', () => {
      mockStorage['theme'] = 'dark';
      const resolved = runZeroFOUCScript();
      expect(resolved).toBe('dark');
      expect(mockClassList.has('dark')).toBe(true);
    });

    it('initializes light mode if localStorage has light', () => {
      mockStorage['theme'] = 'light';
      const resolved = runZeroFOUCScript();
      expect(resolved).toBe('light');
      expect(mockClassList.has('dark')).toBe(false);
    });

    it('falls back to system dark mode preference when no localStorage item exists', () => {
      prefersDark = true;
      const resolved = runZeroFOUCScript();
      expect(resolved).toBe('dark');
      expect(mockClassList.has('dark')).toBe(true);
    });

    it('falls back to light mode when no localStorage item and system is not dark', () => {
      prefersDark = false;
      const resolved = runZeroFOUCScript();
      expect(resolved).toBe('light');
      expect(mockClassList.has('dark')).toBe(false);
    });

    it('toggles from light to dark on click and updates localStorage', () => {
      expect(mockClassList.has('dark')).toBe(false);
      const nextTheme = runToggleClick();
      expect(nextTheme).toBe('dark');
      expect(mockClassList.has('dark')).toBe(true);
      expect(mockStorage['theme']).toBe('dark');
    });

    it('toggles from dark to light on click and updates localStorage', () => {
      mockClassList.add('dark');
      const nextTheme = runToggleClick();
      expect(nextTheme).toBe('light');
      expect(mockClassList.has('dark')).toBe(false);
      expect(mockStorage['theme']).toBe('light');
    });
  });
});
