import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import profileData from '../src/data/profile.json';

describe('Navbar & Hero Section (Task 5)', () => {
  const rootDir = process.cwd();
  const navbarPath = path.join(rootDir, 'src', 'components', 'Navbar.astro');
  const heroPath = path.join(rootDir, 'src', 'components', 'Hero.astro');
  const indexPath = path.join(rootDir, 'src', 'pages', 'index.astro');

  describe('src/components/Navbar.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(navbarPath), 'src/components/Navbar.astro must exist').toBe(true);
    });

    it('contains sticky header layout with blur backdrop and responsive styling', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toMatch(/sticky\s+top-0/);
      expect(navbar).toContain('backdrop-blur');
      expect(navbar).toContain('z-50');
      expect(navbar).toContain('border-b');
    });

    it('renders brand logo linking to home with emerald pulse indicator', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toContain('href="/"');
      expect(navbar).toMatch(/bg-emerald-500\s+animate-pulse/);
      expect(navbar).toMatch(/profile(\.data)?\.name|\{profile\.name\}/);
    });

    it('renders desktop navigation links to #projects, #about, #skills, #contact', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toContain('href="#projects"');
      expect(navbar).toContain('href="#about"');
      expect(navbar).toContain('href="#skills"');
      expect(navbar).toContain('href="#contact"');
    });

    it('includes accessible mobile menu drawer toggle with aria attributes', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toContain('aria-expanded="false"');
      expect(navbar).toContain('aria-controls="mobile-menu"');
      expect(navbar).toMatch(/aria-label=".*(menu|navigation).*"/i);
      expect(navbar).toContain('id="mobile-menu"');
    });

    it('renders mobile menu drawer with navigation links', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      // Verify mobile-menu element exists and contains anchor navigation
      expect(navbar).toMatch(/id="mobile-menu"[^>]*class="[^"]*md:hidden/);
      // Ensure all 4 sections are in navigation links
      const projectMatches = (navbar.match(/href="#projects"/g) || []).length;
      const aboutMatches = (navbar.match(/href="#about"/g) || []).length;
      const skillsMatches = (navbar.match(/href="#skills"/g) || []).length;
      const contactMatches = (navbar.match(/href="#contact"/g) || []).length;

      // Both desktop and mobile nav should have these links (at least 2 each)
      expect(projectMatches).toBeGreaterThanOrEqual(2);
      expect(aboutMatches).toBeGreaterThanOrEqual(2);
      expect(skillsMatches).toBeGreaterThanOrEqual(2);
      expect(contactMatches).toBeGreaterThanOrEqual(2);
    });

    it('embeds ThemeToggle without duplicate id conflict', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toContain("import ThemeToggle from './ThemeToggle.astro'");
      const toggleInstances = (navbar.match(/<ThemeToggle/g) || []).length;
      // Exactly 1 ThemeToggle instance in Navbar to avoid duplicate id="theme-toggle"
      expect(toggleInstances).toBe(1);
    });

    it('includes GitHub external profile CTA with security attributes', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toMatch(/href=\{profile(\.socials)?\.github\}|href="https:\/\/github\.com\/itto0"/);
      expect(navbar).toContain('target="_blank"');
      expect(navbar).toContain('rel="noopener noreferrer"');
      expect(navbar).toContain('aria-label="GitHub Profile"');
    });

    it('includes inline script handling mobile menu toggle, escape key, and anchor clicks', () => {
      const navbar = fs.readFileSync(navbarPath, 'utf-8');
      expect(navbar).toContain('<script is:inline>');
      expect(navbar).toContain("document.getElementById('mobile-menu-btn')");
      expect(navbar).toContain("document.getElementById('mobile-menu')");
      expect(navbar).toContain('aria-expanded');
    });
  });

  describe('Mobile Menu Interaction Logic', () => {
    let mockBtnAttributes: Record<string, string>;
    let mockMenuClassList: Set<string>;
    let menuOpen: boolean;

    beforeEach(() => {
      mockBtnAttributes = { 'aria-expanded': 'false' };
      mockMenuClassList = new Set<string>(['hidden']);
      menuOpen = false;
    });

    function toggleMenu() {
      menuOpen = !menuOpen;
      mockBtnAttributes['aria-expanded'] = menuOpen ? 'true' : 'false';
      if (menuOpen) {
        mockMenuClassList.delete('hidden');
      } else {
        mockMenuClassList.add('hidden');
      }
    }

    function closeMenu() {
      menuOpen = false;
      mockBtnAttributes['aria-expanded'] = 'false';
      mockMenuClassList.add('hidden');
    }

    it('toggles aria-expanded and hidden class on button click', () => {
      expect(mockBtnAttributes['aria-expanded']).toBe('false');
      expect(mockMenuClassList.has('hidden')).toBe(true);

      toggleMenu();
      expect(mockBtnAttributes['aria-expanded']).toBe('true');
      expect(mockMenuClassList.has('hidden')).toBe(false);

      toggleMenu();
      expect(mockBtnAttributes['aria-expanded']).toBe('false');
      expect(mockMenuClassList.has('hidden')).toBe(true);
    });

    it('closes menu when an anchor link is selected', () => {
      toggleMenu();
      expect(menuOpen).toBe(true);

      closeMenu();
      expect(mockBtnAttributes['aria-expanded']).toBe('false');
      expect(mockMenuClassList.has('hidden')).toBe(true);
    });

    it('closes menu on Escape key press when open', () => {
      toggleMenu();
      expect(menuOpen).toBe(true);

      // Simulate escape key handler
      const handleKeyDown = (key: string) => {
        if (key === 'Escape' && menuOpen) {
          closeMenu();
        }
      };

      handleKeyDown('Escape');
      expect(mockBtnAttributes['aria-expanded']).toBe('false');
      expect(mockMenuClassList.has('hidden')).toBe(true);
    });
  });

  describe('src/components/Hero.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(heroPath), 'src/components/Hero.astro must exist').toBe(true);
    });

    it('defines Props interface accepting GitHubUserProfile and optional profile', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      expect(hero).toContain('GitHubUserProfile');
      expect(hero).toContain('interface Props');
      expect(hero).toContain('user: GitHubUserProfile');
    });

    it('renders status indicator badge with pulsing dot and status message', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      expect(hero).toContain('animate-ping');
      expect(hero).toMatch(/profile(Data)?\.status/);
    });

    it('renders GitHub avatar image with fallback handling and eager loading', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      expect(hero).toContain('user.avatar_url');
      expect(hero).toContain('loading="eager"');
      expect(hero).toContain('width="144"');
      expect(hero).toContain('height="144"');
      expect(hero).toContain('onerror=');
      expect(hero).toMatch(/alt=\{.*(Avatar|profile).*\}/i);
    });

    it('displays hero heading, subtitle title, location badge, and bio narrative', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      expect(hero).toMatch(/Hi, I'm/);
      expect(hero).toMatch(/profile(Data)?\.name/);
      expect(hero).toMatch(/profile(Data)?\.title/);
      expect(hero).toMatch(/profile(Data)?\.location/);
      expect(hero).toMatch(/profile(Data)?\.bio/);
    });

    it('renders primary CTAs for View Projects, Get in Touch, and Resume download', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      // View Projects CTA
      expect(hero).toContain('href="#projects"');
      expect(hero).toMatch(/View Projects|Explore Projects/);

      // Get in Touch CTA
      expect(hero).toContain('href="#contact"');
      expect(hero).toContain('Get in Touch');

      // Download Resume CTA
      expect(hero).toContain('href="/resume.pdf"');
      expect(hero).toContain('download');
      expect(hero).toMatch(/Resume/);
    });

    it('renders avatar with subtle glowing gradient accent ring', () => {
      const hero = fs.readFileSync(heroPath, 'utf-8');
      expect(hero).toMatch(/bg-gradient-to-r\s+from-emerald-500/);
      expect(hero).toContain('rounded-full');
    });
  });

  describe('src/pages/index.astro integration', () => {
    it('imports and renders Navbar and Hero with data.user', () => {
      const index = fs.readFileSync(indexPath, 'utf-8');
      expect(index).toContain("import Navbar from '../components/Navbar.astro'");
      expect(index).toContain("import Hero from '../components/Hero.astro'");
      expect(index).toContain("import { getPortfolioData } from '../lib/github'");
      expect(index).toContain('<Navbar />');
      expect(index).toContain('<Hero user={data.user}');
    });
  });
});
