# PRD: GitHub-Powered Web Profile

**Version:** 0.1 (Draft) · **Date:** October 22, 2026 · **Owner:** Site owner (you)

## 1. Overview

A personal web profile that pulls from my GitHub account and presents my projects, skills, and activity as a clean, fast, shareable site. It acts as a portfolio and landing page that recruiters, collaborators, and clients can understand in under a minute, without needing to browse GitHub itself.

## 2. Problem Statement

GitHub profiles are great for developers but weak as a personal brand: repositories are listed without context, READMEs vary in quality, there is little room for storytelling, and non-technical visitors struggle to judge the work. I need one polished URL that tells my story and keeps itself up to date from GitHub.

## 3. Goals

- Present a professional first impression within 5 seconds of landing.
- Showcase 4–6 curated projects with context (problem, stack, outcome, links).
- Sync automatically with GitHub so content never goes stale.
- Load fast (Lighthouse Performance ≥ 90) and work well on mobile.
- Be easy to maintain: updating content should take minutes, not hours.

## 4. Non-Goals (v1)

- No user accounts, comments, or CMS backend.
- No full blog platform (a simple posts section is a v2 candidate).
- No analytics dashboard beyond a privacy-friendly traffic counter.
- No support for non-GitHub sources (GitLab, Bitbucket) in v1.

## 5. Target Audience

| Persona | Need |
| --- | --- |
| Recruiter / hiring manager | Quickly assess skills, seniority, and best work |
| Potential client / collaborator | See relevant projects and how to contact me |
| Fellow developer | Browse code, stack choices, and open-source contributions |

## 6. User Stories

- As a recruiter, I want a short bio and highlighted projects so I can judge fit quickly.
- As a developer, I want links to repos, live demos, and tech stacks so I can evaluate quality.
- As a collaborator, I want an obvious contact option so I can reach out.
- As the owner, I want the site to update from GitHub so I don't maintain things twice.

## 7. Features & Requirements

### P0 — Must Have (MVP)

1. **Hero section:** name, title/tagline, avatar (from GitHub), short bio, primary CTAs (View Projects, Contact, GitHub).
2. **Featured projects:** cards for pinned/selected repos showing name, description, language/tech tags, stars, and links to repo and live demo.
3. **About section:** longer bio, skills grouped by category (languages, frameworks, tools).
4. **Contact section:** email link and social links (GitHub, LinkedIn, X).
5. **GitHub data sync:** profile info and repository metadata fetched at build time via the GitHub API.
6. **Responsive layout:** mobile-first, tested down to 360px width.
7. **SEO basics:** title, meta description, Open Graph image, sitemap, semantic HTML.

### P1 — Should Have

- **Activity snapshot:** contribution graph or recent activity (commits, PRs, issues).
- **Language breakdown:** chart of top languages across public repos.
- **Dark/light theme** with system preference detection.
- **Project detail pages** generated from each repo's README.
- **Resume/CV download** (PDF).
- **Scheduled rebuild** (daily) so GitHub changes appear automatically.

### P2 — Nice to Have

- Blog/notes section (Markdown-based).
- Open-source contributions list (merged PRs to external repos).
- Testimonials section.
- Multi-language support (e.g., English and Bahasa Indonesia).
- Custom 404 page and subtle animations.

## 8. Content & Data Sources

| Content | Source |
| --- | --- |
| Name, avatar, bio, location, links | GitHub profile (REST/GraphQL API) |
| Featured repos | Pinned repos or a manually curated list in a config file |
| Stars, forks, languages, topics | GitHub API |
| Project narrative (problem, outcome) | Repo README or a hand-written `projects.json` |
| Skills, resume, contact details | Local config / Markdown files |

Manual config always overrides GitHub data so I control the final wording.

## 9. Design & UX

- Single-page layout with sticky navigation: Home, Projects, About, Contact.
- Minimal, high-contrast typography; one accent color; generous whitespace.
- Project cards are scannable: title, one-line summary, tech tags, two buttons.
- Accessibility: WCAG 2.1 AA contrast, keyboard navigation, alt text, visible focus states.
- Wireframes to be produced before development begins.

## 10. Technical Approach

- **Framework:** Static site generator (Astro or Next.js static export recommended; plain HTML/CSS/JS acceptable for minimal scope).
- **Styling:** Tailwind CSS or CSS modules.
- **Data:** GitHub GraphQL/REST API called at build time, with a personal access token stored as a secret (read-only, public data).
- **Hosting:** GitHub Pages, Vercel, or Netlify; custom domain with HTTPS.
- **CI/CD:** GitHub Actions to build and deploy on push and on a daily schedule.
- **Repo structure:** `/src`, `/content` (projects, skills, bio), `/public`, `/.github/workflows`.
- **Caching:** API responses cached at build time; no client-side calls that risk rate limits.

## 11. Non-Functional Requirements

- **Performance:** LCP < 2.5s on 4G; Lighthouse Performance ≥ 90.
- **Accessibility:** Lighthouse Accessibility ≥ 95.
- **SEO:** Lighthouse SEO ≥ 95; indexed by Google within two weeks of launch.
- **Reliability:** Site stays up even if the GitHub API fails (build uses last cached data).
- **Security & privacy:** No secrets in client code; only public repo data shown; no invasive tracking.

## 12. Success Metrics

- Launch with all P0 features live on a custom domain.
- Lighthouse scores meet the targets above.
- Profile link added to GitHub bio, LinkedIn, and resume.
- Within 3 months: measurable referral traffic, and at least a few inbound messages or interview invitations attributed to the site.

## 13. Milestones

| Phase | Deliverables | Estimate |
| --- | --- | --- |
| 1. Discovery | Finalize content, choose stack, pick featured projects | 1–2 days |
| 2. Design | Wireframes, color/typography, component list | 2–3 days |
| 3. Build MVP | Hero, projects, about, contact, GitHub sync | 4–6 days |
| 4. Polish | SEO, accessibility, performance, responsive QA | 2–3 days |
| 5. Launch | Domain, HTTPS, deploy pipeline, announce | 1 day |
| 6. Iterate | P1 features based on feedback | Ongoing |

## 14. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| GitHub API rate limits or downtime | Fetch at build time with a token; fall back to cached data |
| Weak or missing READMEs on key repos | Write project summaries manually in config |
| Scope creep (blog, animations, etc.) | Freeze P0 scope; defer extras to P1/P2 |
| Stale content | Scheduled daily rebuild; quarterly content review |
| Private or unfinished repos exposed | Whitelist featured repos explicitly |

## 15. Open Questions

- What is my GitHub username and preferred domain name?
- Which 4–6 repositories should be featured first?
- Do I want a blog or resume download in v1?
- Which hosting platform and framework do I prefer?
- What visual style fits me best (minimal, playful, terminal-inspired)?
