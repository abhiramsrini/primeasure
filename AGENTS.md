# AGENTS.md

Guidance for AI coding agents working in this repository.

## A) Repository Overview
- Static marketing site for Primeasure Technologies (test & measurement, broadcast, software solutions) with dynamic events and blog content.
- Stack: vanilla HTML/CSS/JS, no bundler. Python 3 utilities for generating blog and events pages from JSON templates.
- Key assets: `index.html`, section pages under `about/`, `solutions/`, `contact/`, `events/`, `register/`, `request-content/`, `blog/`, shared styles in `css/`, scripts in `js/`, data in `data/`, templates in `templates/`, form APIs in `api/`, developer docs in `docs/`.
- Email delivery: Zoho Mail API via OAuth2 refresh-token flow. All three form APIs (`contact-submit.php`, `event-submit.php`, `content-request-submit.php`) share the same OAuth pattern and load credentials from `api/contact-config.php` (gitignored) with env-var fallbacks (see B).
- Analytics: Google Analytics 4 (ID `G-SFKRS4SNFV`) plus GTM placeholder; custom tracking in `js/analytics.js`.
- CI: GitHub Actions `claude-code-review.yml` (auto review on PRs) and `claude.yml` (comment-triggered assistant).

## B) How to Work in This Repo
- Setup: ensure Python 3 is available. Optional: install `http-server` (`npm install -g http-server`) for clean-URL local serving.
- API credentials: copy `api/contact-config.example.php` to `api/contact-config.php` and fill in Zoho OAuth values (`client_id`, `client_secret`, `refresh_token`, `account_id`, `zoho_dc`). Alternatively, set the equivalent env vars (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ACCOUNT_ID`, `ZOHO_DC`, plus per-form `*_FROM_ADDRESS`, `*_TO_ADDRESS`, `*_CC_ADDRESS`, `*_ACK_ENABLED`, `*_ACK_FROM_ADDRESS`, `*_ACK_SUBJECT`). The file is gitignored; never commit it.
- Run locally:
  - Preferred: `npx http-server -p 8000 --proxy http://127.0.0.1:8000?` (supports clean URLs).
  - Basic: `python3 -m http.server 8000` (access pages with `/path/index.html` if rewrites unavailable).
- Content generation:
  - Blog: edit `data/blog.json` + `blog/<slug>/content.html`, then `python3 scripts/generate_blog_pages.py` regenerates `blog/index.html` and each `blog/<slug>/index.html`.
  - Events: edit `data/events.json`, then `python3 scripts/generate_events_page.py` regenerates `events/index.html`.
  - Completed-event content requests: control CTA visibility with `contentRequestEnabled` in `data/events.json` and keep `slug` stable for `/request-content#<slug>` routing.
- Build: none required beyond generators; site is static files.
- Tests/Lint/Format: no configured tooling; manual review required (see F).

## C) Change Safety Rules (Hard Rules)
- Do NOT hand-edit generated files: `blog/index.html`, `blog/<slug>/index.html`, `events/index.html`; always use the scripts above.
- Preserve analytics: keep GA4 ID `G-SFKRS4SNFV`, GTM hooks, and `js/analytics.js` wiring; do not add console logging of user data.
- Respect clean URLs: avoid breaking `.htaccess`/rewrite expectations; keep relative link structure intact.
- Forms: maintain validation/submission flows in `js/FormValidator.js` and `js/ContentRequestForm.js`; do not expose or log submitted data. All three backend handlers (`contact-submit.php`, `event-submit.php`, `content-request-submit.php`) implement anti-spam keyword/link filtering and IP-based rate limiting (default: 3 requests per 15 min window); do not weaken these defaults.
- Assets: optimize images and keep paths consistent with JSON/template expectations.
- Security: never commit secrets; use `rel="noopener noreferrer"` on external links; sanitize any new user input handling.
- Accessibility/Performance/SEO: maintain semantic HTML, alt text, heading hierarchy, responsive breakpoints, and lightweight JS; avoid regressions to core web vitals.
- Dependencies: avoid adding new libs; if unavoidable, justify size/need and prefer CDN-free local copies.

## D) Code & Architecture Conventions
- Structure: content pages under folders with `index.html`; data in `data/*.json`; generated outputs in `blog/` and `events/`; templates under `templates/`; shared JS under `js/`; shared styles under `css/`.
- JS patterns: ES6 modules/classes; specialized files (`analytics.js`, `EventManager.js`, `EventRouter.js`, `ContentRequestRouter.js`, `BlogManager.js`, `FormValidator.js`, `ContentRequestForm.js`, `carousel.js`, `main.js`, `menu.js`, `SmoothInfiniteScroll.js`). Prefer extending existing helpers instead of duplicating logic.
- API layer: three PHP endpoints in `api/` — `contact-submit.php` (contact form), `event-submit.php` (event registration), `content-request-submit.php` (post-event content requests). All share the same Zoho OAuth email-dispatch pattern and spam/rate-limit middleware. Config is loaded from `api/contact-config.php` with env-var override support.
- Styling: CSS custom properties defined in `css/style.css`; responsive rules in `css/responsive.css`; BEM-like class naming; Ant Design–inspired shadows/radii.
- Data flow: `data/events.json` and `data/blog.json` are sources of truth; templates read them via generator scripts and inline JSON payloads for hydration.
- Events CTA rule: for completed events, `contentRequestEnabled: true` shows `Request Content`; `false` hides it. Omitted values currently fall back to recap-link presence, but prefer explicit booleans in JSON.
- Routing: clean URLs expected (`/about`, `/solutions/broadcast`, `/request-content`); ensure links work both with and without trailing slash when possible.
- Analytics: GA hooks loaded on every page; custom events implemented in `js/analytics.js`.

## E) Required Workflow for Agent Changes
- Before coding: restate the task; identify affected pages/data/templates/scripts; plan whether regeneration scripts are needed.
- During coding: keep diffs small; reuse existing components/styles/utilities; avoid sweeping refactors; edit sources (JSON, templates, content) not generated outputs.
- After coding: if blog/events data changed, rerun the relevant generator; serve locally and smoke-test clean URLs; ensure analytics snippet remains.
- After coding: if you changed completed-event CTA logic or `data/events.json`, verify both `/events` CTA visibility and `/request-content#<slug>` behavior.
- Deliverable summary: list changes and touched files; note commands run; mention risks or follow-ups (e.g., images to compress, sitemap updates).

## F) Testing Expectations
- No automated test suite. Manual checks are required:
  - Serve locally and verify navigation (clean URLs), forms (validation + submission UX), carousels, and event/blog renders.
  - For completed events, verify `Request Content` CTA appears only when `contentRequestEnabled` is true and that submission reaches `api/content-request-submit.php`.
  - For the contact form, verify submission reaches `api/contact-submit.php`; for event registration, verify it reaches `api/event-submit.php`. Check acknowledgment emails fire when `*_ack_enabled` is true.
  - Anti-spam/rate-limit sanity: submitting the same form more than 3 times within 15 minutes should return a rate-limit error; obvious spam content (excessive links, keyword hits) should be rejected.
  - Accessibility spot checks: headings, focus states, alt text, keyboard navigation for carousels/menus.
  - Performance: avoid heavy assets; confirm lazy loading/animations stay smooth.
- Snapshots: not applicable (static site); if adding templates, keep outputs deterministic.

## G) Pull Request / Commit Guidance
- Follow concise, descriptive commit messages; include affected area (e.g., `events: add March showcase data`).
- Reference related issues if available; include screenshots/GIFs for visible UI changes.
- CI will run Claude review on PRs; ensure generated files are up to date before opening a PR.

## H) Quick Reference
```
Serve (clean URLs): npx http-server -p 8000 --proxy http://127.0.0.1:8000?
Serve (basic)     : python3 -m http.server 8000
Generate blog     : python3 scripts/generate_blog_pages.py
Generate events   : python3 scripts/generate_events_page.py
Build             : (none; static)
Tests/Lint/Format : (none configured; manual QA)

API credentials   : copy api/contact-config.example.php → api/contact-config.php (gitignored)
API endpoints     : api/contact-submit.php | api/event-submit.php | api/content-request-submit.php
Docs              : docs/development-setup.md | docs/analytics/analytics-status.md | docs/ai/
```
