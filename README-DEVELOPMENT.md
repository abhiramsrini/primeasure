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

1. **Test with .html extensions**: Access `http://localhost:8000/pages/about.html` directly
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
- `http://localhost:8000/pages/about.html` ✅ (old URLs still work)
- `http://localhost:8000/about` ❌ (404 - needs server rewrites)

## Production Deployment
On production servers with Apache or Nginx, the `.htaccess` or `nginx.conf` will handle URL rewrites properly.

## Quick Fix for Immediate Local Testing
If you need to test right now with Python server:
1. Use the old URLs: `http://localhost:8000/pages/about.html`
2. Navigation links will redirect to clean URLs
3. Upload to production server to test clean URLs fully