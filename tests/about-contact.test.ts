import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import profileData from '../src/data/profile.json';
import skillsData from '../src/data/skills.json';

describe('About, Skills, Contact & Footer (Task 7)', () => {
  const rootDir = process.cwd();
  const aboutPath = path.join(rootDir, 'src', 'components', 'AboutSection.astro');
  const contactPath = path.join(rootDir, 'src', 'components', 'ContactSection.astro');
  const footerPath = path.join(rootDir, 'src', 'components', 'Footer.astro');
  const notFoundPath = path.join(rootDir, 'src', 'pages', '404.astro');
  const indexPath = path.join(rootDir, 'src', 'pages', 'index.astro');

  describe('src/components/AboutSection.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(aboutPath), 'src/components/AboutSection.astro must exist').toBe(true);
    });

    it('contains #about and #skills anchor targets with scroll margin offset', () => {
      const about = fs.readFileSync(aboutPath, 'utf-8');
      expect(about).toMatch(/id="about"[^>]*scroll-mt-/);
      expect(about).toContain('id="skills"');
    });

    it('imports profile and skills data', () => {
      const about = fs.readFileSync(aboutPath, 'utf-8');
      expect(about).toMatch(/import\s+skillsData\s+from\s+['"]\.\.\/data\/skills\.json['"]/);
      expect(about).toMatch(/import\s+profileData\s+from\s+['"]\.\.\/data\/profile\.json['"]/);
    });

    it('renders About Me heading and engineering narrative highlights', () => {
      const about = fs.readFileSync(aboutPath, 'utf-8');
      expect(about).toMatch(/About Me/i);
      expect(about).toMatch(/profileData\.location/);
      expect(about).toMatch(/backend/i);
      expect(about).toMatch(/clean architecture/i);
      expect(about).toMatch(/deterministic performance/i);
    });

    it('renders categorized skills grid iterating through skillsData categories', () => {
      const about = fs.readFileSync(aboutPath, 'utf-8');
      expect(about).toContain('skillsData.categories.map');
      expect(about).toContain('category.name');
      expect(about).toContain('category.skills.map');
      expect(about).toMatch(/font-mono/);
    });

    it('supports required curated categories in skillsData', () => {
      const categoryNames = skillsData.categories.map((c) => c.name);
      expect(categoryNames).toContain('Languages');
      expect(categoryNames).toContain('Frameworks & Libraries');
      expect(categoryNames).toContain('Databases & Storage');
      expect(categoryNames).toContain('Tools & Cloud');
    });
  });

  describe('src/components/ContactSection.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(contactPath), 'src/components/ContactSection.astro must exist').toBe(true);
    });

    it('has id="contact" anchor target with scroll margin offset', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toMatch(/id="contact"[^>]*scroll-mt-/);
    });

    it('renders contact card with heading and invitation text', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toMatch(/Let's Build Something Together|Get In Touch/i);
      expect(contact).toMatch(/collaborat(ing|ion)|reach out|email/i);
    });

    it('displays availability status and timezone info', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toMatch(/profileData\.status/);
      expect(contact).toMatch(/UTC\+7|WIB|timezone/i);
      expect(contact).toMatch(/profileData\.location/);
    });

    it('renders primary mailto email link', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toMatch(/href=\{`mailto:\$\{profileData\.email\}`\}|href="mailto:itobgk02@gmail.com"/);
      expect(contact).toMatch(/profileData\.email/);
    });

    it('provides copy email button with feedback tooltip/toast and accessible aria label', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toContain('id="copy-email-btn"');
      expect(contact).toContain('type="button"');
      expect(contact).toMatch(/aria-label=".*(copy|email).*"/i);
      expect(contact).toMatch(/id="copy-feedback"|id="copy-tooltip"|id="copy-toast"/);
      expect(contact).toMatch(/role="status"|aria-live="polite"/);
    });

    it('renders external social links with security attributes', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toMatch(/profileData\.socials\.github/);
      expect(contact).toMatch(/profileData\.socials\.linkedin/);
      expect(contact).toContain('target="_blank"');
      expect(contact).toContain('rel="noopener noreferrer"');
    });

    it('includes inline script handling clipboard copy and toast/tooltip state', () => {
      const contact = fs.readFileSync(contactPath, 'utf-8');
      expect(contact).toContain('<script is:inline>');
      expect(contact).toContain("navigator.clipboard.writeText");
      expect(contact).toContain("document.getElementById('copy-email-btn')");
    });
  });

  describe('Contact Email Copy Interactive Logic', () => {
    let mockClipboardText: string;
    let mockFeedbackVisible: boolean;

    beforeEach(() => {
      mockClipboardText = '';
      mockFeedbackVisible = false;
      if (!globalThis.navigator) {
        Object.defineProperty(globalThis, 'navigator', {
          value: {},
          configurable: true,
          writable: true,
        });
      }
      Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: {
          writeText: vi.fn(async (text: string) => {
            mockClipboardText = text;
          }),
        },
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('writes email to clipboard and triggers feedback visibility', async () => {
      vi.useFakeTimers();
      const email = profileData.email;

      // Simulate copy handler logic
      const handleCopy = async () => {
        await navigator.clipboard.writeText(email);
        mockFeedbackVisible = true;
        setTimeout(() => {
          mockFeedbackVisible = false;
        }, 2000);
      };

      await handleCopy();
      expect(mockClipboardText).toBe('itobgk02@gmail.com');
      expect(mockFeedbackVisible).toBe(true);

      vi.advanceTimersByTime(2000);
      expect(mockFeedbackVisible).toBe(false);
    });
  });

  describe('src/components/Footer.astro', () => {
    it('exists as an Astro component', () => {
      expect(fs.existsSync(footerPath), 'src/components/Footer.astro must exist').toBe(true);
    });

    it('defines Props interface accepting lastSyncedAt: string and isFallback: boolean', () => {
      const footer = fs.readFileSync(footerPath, 'utf-8');
      expect(footer).toContain('interface Props');
      expect(footer).toContain('lastSyncedAt: string');
      expect(footer).toContain('isFallback: boolean');
    });

    it('renders copyright with dynamic year and profile author', () => {
      const footer = fs.readFileSync(footerPath, 'utf-8');
      expect(footer).toContain('getFullYear()');
      expect(footer).toMatch(/profileData\.name/);
      expect(footer).toContain('All rights reserved');
    });

    it('renders build-time GitHub sync badge indicating sync or cache fallback', () => {
      const footer = fs.readFileSync(footerPath, 'utf-8');
      expect(footer).toContain('isFallback');
      expect(footer).toContain('Synced from cache');
      expect(footer).toMatch(/GitHub sync:\s*\$\{formattedSync\}|GitHub sync:/);
    });

    it('includes accessible back-to-top navigation link or button', () => {
      const footer = fs.readFileSync(footerPath, 'utf-8');
      expect(footer).toMatch(/href="#top"|href="#"|id="back-to-top"/);
      expect(footer).toMatch(/Back to top|aria-label="Back to top"/i);
    });

    it('displays Astro framework attribution', () => {
      const footer = fs.readFileSync(footerPath, 'utf-8');
      expect(footer).toContain('Built with Astro');
    });
  });

  describe('src/pages/404.astro', () => {
    it('exists as an Astro page', () => {
      expect(fs.existsSync(notFoundPath), 'src/pages/404.astro must exist').toBe(true);
    });

    it('uses Layout with 404 title and includes Navbar', () => {
      const notFound = fs.readFileSync(notFoundPath, 'utf-8');
      expect(notFound).toContain("import Layout from '../layouts/Layout.astro'");
      expect(notFound).toContain("import Navbar from '../components/Navbar.astro'");
      expect(notFound).toMatch(/<Layout\s+title=".*404.*"/);
      expect(notFound).toContain('<Navbar />');
    });

    it('renders 404 badge, Page Not Found headline, and home navigation CTA', () => {
      const notFound = fs.readFileSync(notFoundPath, 'utf-8');
      expect(notFound).toMatch(/404/);
      expect(notFound).toMatch(/Page Not Found/i);
      expect(notFound).toMatch(/href="\/"/);
      expect(notFound).toMatch(/Return Home|Back to Home/i);
    });
  });

  describe('src/pages/index.astro full assembly', () => {
    it('assembles all portfolio sections in correct semantic order', () => {
      const index = fs.readFileSync(indexPath, 'utf-8');
      expect(index).toContain("import Navbar from '../components/Navbar.astro'");
      expect(index).toContain("import Hero from '../components/Hero.astro'");
      expect(index).toContain("import ProjectsSection from '../components/ProjectsSection.astro'");
      expect(index).toContain("import AboutSection from '../components/AboutSection.astro'");
      expect(index).toContain("import ContactSection from '../components/ContactSection.astro'");
      expect(index).toContain("import Footer from '../components/Footer.astro'");

      expect(index).toContain('<Navbar />');
      expect(index).toContain('<Hero user={data.user}');
      expect(index).toContain('<ProjectsSection projects={data.featuredProjects} languageStats={data.languageStats}');
      expect(index).toContain('<AboutSection />');
      expect(index).toContain('<ContactSection />');
      expect(index).toContain('<Footer lastSyncedAt={data.lastSyncedAt} isFallback={data.isFallback} />');
    });
  });
});
