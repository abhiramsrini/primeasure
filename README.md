# Primeasure Technologies Website

Static marketing site for Primeasure Technologies (test & measurement, broadcast, software solutions) built with vanilla HTML/CSS/JS plus small Python generators for blog and events.

## Quick Start
- Serve with clean URLs: `npx http-server -p 8000 --proxy http://127.0.0.1:8000?`
- Basic serve (needs `/page/index.html` URLs): `python3 -m http.server 8000`
- Generate blog pages after editing `data/blog.json` or `blog/<slug>/content.html`: `python3 scripts/generate_blog_pages.py`
- Generate events page after editing `data/events.json`: `python3 scripts/generate_events_page.py`

## Key Docs (all under `docs/`)
- Local development (clean URLs, workflows): `docs/development-setup.md`
- Claude/AI guidance: `docs/ai/claude.md`
- AI project context: `docs/ai/ai-context.md`
- Analytics status and GA4 details: `docs/analytics/analytics-status.md`

## Notes
- `AGENTS.md` in repo root contains rules for AI agents working here.
- Do not hand-edit generated outputs (`blog/index.html`, `blog/<slug>/index.html`, `events/index.html`); use the scripts above.
