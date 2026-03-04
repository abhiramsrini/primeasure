# Primeasure Technologies Website

Static marketing site for Primeasure Technologies (test & measurement, broadcast, software solutions) built with vanilla HTML/CSS/JS plus small Python generators for blog and events.

## Quick Start
- Serve with clean URLs: `npx http-server -p 8000 --proxy http://127.0.0.1:8000?`
- Basic serve (needs `/page/index.html` URLs): `python3 -m http.server 8000`
- Generate blog pages after editing `data/blog.json` or `blog/<slug>/content.html`: `python3 scripts/generate_blog_pages.py`
- Generate events page after editing `data/events.json`: `python3 scripts/generate_events_page.py`

## Events Content Request Flow
- Completed-event CTA visibility is controlled from `data/events.json` using `contentRequestEnabled`:
  - `true`: show `Request Content` button and route to `/request-content#<event-slug>`
  - `false`: hide CTA and show `Thanks for joining`
- Event status still controls section placement:
  - `status: "completed"` appears under Completed Events
  - non-completed statuses appear under Upcoming Events
- The request form at `/request-content` auto-populates event title from hash slug and submits to `api/content-request-submit.php`.
- Request emails are routed via Zoho config in `api/contact-config.php` (content-request keys with event/contact fallbacks).

## Key Docs (all under `docs/`)
- Local development (clean URLs, workflows): `docs/development-setup.md`
- Claude/AI guidance: `docs/ai/claude.md`
- AI project context: `docs/ai/ai-context.md`
- Analytics status and GA4 details: `docs/analytics/analytics-status.md`

## Notes
- `AGENTS.md` in repo root contains rules for AI agents working here.
- Do not hand-edit generated outputs (`blog/index.html`, `blog/<slug>/index.html`, `events/index.html`); use the scripts above.
