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
### Blog Images

### Blog Images

- Store all blog imagery under `images/blog/<slug>/` where `<slug>` matches the entry in `data/blog.json` and the directory for the article (`blog/<slug>/`).
- Recommended file names:
  - `hero.*` for the primary hero image (used for cards, metadata, and top banners).
  - `figure-01.*`, `diagram-02.*`, etc., for inline illustrations.
  - `thumb.*` if you need a dedicated smaller preview.
- Optimize images for web (generally <= 500 KB for hero graphics, <= 200 KB for inline figures).
- Reference them in JSON and HTML using relative paths like `../images/blog/<slug>/hero.png`.
- Always provide descriptive `alt` text when embedding images in the article HTML.



1. **Author the content**: Draft in Markdown and convert to HTML. Store any hero or inline images under `images/blog/<slug>/` and optimize them for web delivery.
2. **Create the article page**: Copy an existing template in `blog/<slug>/index.html`, update metadata (title, description, canonical URL, JSON-LD), and paste the converted HTML content.
3. **Register the post**: Add an entry to `data/blog.json` with the slug, publish date, reading time, topics, excerpt, and image path. The blog listing pulls cards and filters from this file.
4. **Wire internal links**: Update related-article links within the new post and, if relevant, add cross-links from solution pages or events.
5. **Test locally**: Run a local server (`http-server` recommended), open `/blog`, verify filters, navigation, and analytics events (filters, CTA clicks) fire in the GA debug view.
6. **Update sitemap**: Ensure `sitemap.xml` includes the listing and new article URLs with accurate `lastmod` dates before deploying.
