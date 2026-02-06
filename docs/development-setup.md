# Local Development Setup for Clean URLs

## Problem
After implementing clean URLs, local development with simple HTTP servers won't work because they don't support URL rewrites.

## Solutions for Local Development

### Option 1: Use http-server (Node.js) - Recommended
```bash
# Install globally
npm install -g http-server

# Run with proxy fallback (enables clean URLs)
http-server -p 8000 --proxy http://127.0.0.1:8000?
```

### Option 2: Use Python with Apache Module
If you have Apache with mod_rewrite available locally:
```bash
# Start Python server normally
python3 -m http.server 8000

# Access via: http://localhost:8000
# Clean URLs will work if .htaccess is processed
```

### Option 3: Use Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Configure Live Server settings to handle URL rewrites

### Option 4: Temporary Development Mode
For quick local testing, you can temporarily revert to .html URLs:

1. **Test with .html extensions**: Access `http://localhost:8000/about/index.html` directly
2. **Navigation will still work** because the old .html URLs redirect to clean URLs
3. **Before deployment**: Ensure clean URLs are working on your production server

## Testing Clean URLs Locally

### With http-server:
```bash
npx http-server -p 8000 --proxy http://127.0.0.1:8000?
```

Then test:
- `http://localhost:8000/` ✅
- `http://localhost:8000/about` ✅
- `http://localhost:8000/solutions/broadcast` ✅

### With Python server (limited):
```bash
python3 -m http.server 8000
```

Then test:
- `http://localhost:8000/` ✅
- `http://localhost:8000/about/index.html` ✅ (old URLs still work)
- `http://localhost:8000/about` ❌ (404 - needs server rewrites)

## Production Deployment
On production servers with Apache or Nginx, the `.htaccess` or `nginx.conf` will handle URL rewrites properly.

## Quick Fix for Immediate Local Testing
If you need to test right now with Python server:
1. Use the old URLs: `http://localhost:8000/about/index.html`
2. Navigation links will redirect to clean URLs
3. Upload to production server to test clean URLs fully

## Recent Updates

### Form Validation Fix
- **Issue**: Phone number field was incorrectly marked as required in event registration
- **Fix**: Updated `js/FormValidator.js` to make phone field optional while maintaining format validation
- **Impact**: Users can now submit registration forms without providing a phone number

## Adding Blog Posts

### Source of Truth
- `data/blog.json` holds every card’s metadata (title, slug, topics, hero image, etc.).
- `blog/<slug>/content.html` stores the actual article body (starting with `<div class="container article-content">`).
- `blog/<slug>/index.html` **and** `blog/index.html` are generated files—don’t edit them manually.

Generate everything from those inputs with:

```bash
python3 scripts/generate_blog_pages.py
```

### Workflow
1. **Prepare assets**: Save hero/inline graphics under `images/blog/<slug>/`.
2. **Update `data/blog.json`**: Add or edit the post entry (slug, excerpt, topics, hero image path, publish date, reading time, author, etc.).
3. **Author `content.html`**: Convert your article to HTML and drop it inside `blog/<slug>/content.html` (keep the surrounding container + related links block).
4. **Generate pages**: Run `python3 scripts/generate_blog_pages.py` to rebuild every `blog/<slug>/index.html` plus the blog landing page. Commit the regenerated files.
5. **Smoke test**: Serve the site locally (see options above), open `/blog` to confirm the cards, filters, and individual article pages render as expected.
6. **Update sitemap**: When new slugs are added, refresh `sitemap.xml` and deploy.

### Blog Images
- Store all blog imagery under `images/blog/<slug>/` where `<slug>` matches both `data/blog.json` and `blog/<slug>/`.
- Recommended file names:
  - `hero.*` for the primary hero image (used for cards, metadata, and hero banners).
  - `figure-01.*`, `diagram-02.*`, etc., for inline illustrations.
  - `thumb.*` if you ever need smaller previews.
- Optimize images for web (≤500 KB for hero graphics, ≤200 KB for inline figures).
- Reference images in JSON as `../images/blog/<slug>/hero.png`; the generator adjusts paths automatically for article pages.
- Always provide descriptive `alt` text in both JSON and inline `<img>` tags for accessibility/SEO.

## Managing Events
- `data/events.json` remains the single source for event metadata (title, dates, locations, CTAs).
- The listing page (`events/index.html`) is generated from `templates/events/index.template.html` via:

```bash
python3 scripts/generate_events_page.py
```

- The generator pre-renders event cards for SEO and injects the JSON payload in a `<script id="events-data">` block. `js/EventManager.js` hydrates from that inline data before falling back to `fetch`, so you only need to edit the JSON file and rerun the script when events change.
- Set each event’s `status` to `upcoming` or `completed`. Completed events automatically drop the “Register Now” CTA; add `recapUrl`/`recapLabel` (or `recordingUrl`/`slidesUrl`) to surface a recap link instead.
- Typical lifecycle: once an event finishes, change its `status` to `completed`, remove/ignore `registrationEnabled`, add any recap links, rerun the generator, and deploy.
- The generator and `EventManager` automatically split the listing into “Upcoming Events” and “Completed Events”; only items marked `completed` show in the latter block.
- Metadata (page title, meta/OG/Twitter descriptions, preview image) is derived from the next upcoming event when available, so keep hero images/locations accurate in `data/events.json`.
