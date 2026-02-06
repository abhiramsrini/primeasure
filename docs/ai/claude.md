# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Primeasure Technologies, a company providing test & measurement, broadcast, and software solutions across India. The website is built with vanilla HTML, CSS, and JavaScript without any build tools or frameworks. It features comprehensive analytics tracking, dynamic event management, and modern UI components.

## Project Structure

```
primeasure/
├── index.html                          # Main homepage
├── about/
│   └── index.html                      # Company overview
├── contact/
│   └── index.html                      # Contact details & form
├── events/
│   └── index.html                      # Dynamic events listing
├── register/
│   └── index.html                      # Event registration workflow
├── blog/
│   ├── index.html                      # Blog listing with topic filters
│   ├── rsh2-oscilloscope-compatibility/
│   │   └── index.html
│   ├── cloud-production-sports-broadcasting/
│   │   └── index.html
│   ├── probing-ddr-lpddr-signals/
│   │   └── index.html
│   ├── debugging-edp-power-saving/
│   │   └── index.html
│   ├── pcie-6-transmitter-testing/
│   │   └── index.html
│   ├── ampp-platform-updates/
│   │   └── index.html
│   └── evolution-in-vehicle-network/
        └── index.html
├── solutions/
│   ├── broadcast/
│   │   └── index.html
│   ├── software/
│   │   └── index.html
│   └── test-measurement/
│       └── index.html
├── privacy-policy/
│   └── index.html
├── css/
│   ├── style.css                       # Main stylesheet with CSS variables & Ant Design-inspired system
│   └── responsive.css                  # Mobile/responsive styles
├── js/
│   ├── analytics.js                    # Google Analytics enhanced tracking system
│   ├── BlogManager.js                  # Blog data loading and filtering
│   ├── EventManager.js                 # Dynamic events data management
│   ├── EventRouter.js                  # Event registration URL routing
│   ├── FormValidator.js                # Advanced form validation and submission
│   ├── carousel.js                     # Advanced carousel component system
│   ├── main.js                         # Scroll animations and navbar behavior
│   ├── menu.js                         # Mobile navigation and dropdown handling
│   └── SmoothInfiniteScroll.js         # Customer logos infinite scroll animation
├── data/
│   ├── events.json                     # Centralized events database
│   └── blog.json                       # Blog metadata powering the listing page
├── images/                             # Static assets organized by category
│   ├── home/
│   ├── customers/
│   ├── events/
│   ├── partners/
│   └── solutions/
├── sitemap.xml                         # SEO sitemap
└── robots.txt                          # Search engine directives
```

## Development Commands

This is a static website - no build tools are required. For development:

```bash
# Recommended: http-server with proxy support (enables clean URLs)
npx http-server -p 8000 --proxy http://127.0.0.1:8000?

# Alternative: Python server (use for basic development)
python3 -m http.server 8000

# Alternative: PHP server
php -S localhost:8000
```

**Important Notes:**
- Use a local server for development to avoid CORS issues with `events.json` loading
- For testing clean URLs (like `/about` instead of `/about/index.html`), use http-server with proxy
- Python server will require .html extensions for direct access: `/about/index.html`
- See `../development-setup.md` for detailed local development setup with clean URLs

## Architecture and Code Organization

### CSS Architecture
- **CSS Custom Properties**: Extensive use of CSS variables in `:root` for colors, shadows, transitions
- **Component-based Styling**: Styles organized by component (navbar, carousel, cards, etc.)
- **Responsive Design**: Separate responsive.css file for mobile adaptations
- **Design System**: Ant Design-inspired variables and shadow system
- **Modern Layout**: Flexbox and Grid layouts for responsive design

### JavaScript Architecture
- **Modular Components**: Each JS file handles specific functionality with ES6+ classes
- **carousel.js**: Advanced carousel system with multiple classes:
  - `BaseCarousel`: Core carousel functionality with accessibility features
  - `HeroCarousel`: Extends BaseCarousel for hero sections with content slides
  - `SectionCarousel`: For regular section carousels
  - Error handling with `CarouselInitError` class
- **main.js**: Intersection Observer for scroll animations, navbar scroll behavior
- **menu.js**: Mobile navigation, dropdown menus with accessibility features
- **analytics.js**: Google Analytics 4 enhanced tracking with custom events
- **EventManager.js**: Dynamic events loading with fallback data system
- **EventRouter.js**: Hash-based routing for event registration pages
- **FormValidator.js**: Real-time form validation with Google Forms integration
- **SmoothInfiniteScroll.js**: Performant infinite scroll for customer logos

### Accessibility Features
- ARIA attributes throughout carousel and navigation components
- Keyboard navigation support (arrows, space, escape, home/end keys)
- Screen reader announcements for carousel state changes
- Proper focus management and visual focus indicators
- Touch-friendly interactions for mobile devices
- Semantic HTML structure for screen readers

### Key Components
- **Hero Carousel**: Multi-slide carousel with synchronized content and images
- **Section Carousels**: Auto-rotating image carousels with navigation dots
- **Mobile Navigation**: Collapsible menu with animated dropdowns
- **Scroll Animations**: Intersection Observer-based animations for cards
- **Event Management System**: Dynamic event loading with JSON data source
- **Registration System**: Form validation and Google Forms integration
- **Customer Logos Slider**: Smooth infinite scroll animation
- **Analytics Tracking**: Comprehensive user interaction tracking

## Analytics & Tracking

### Google Analytics 4 Integration
- **Tracking ID**: G-SFKRS4SNFV (implemented across all pages)
- **Enhanced Events**: Contact forms, phone clicks, email clicks, external links
- **Custom Events**: Event registrations, solution page views, scroll depth
- **Business Metrics**: Partner link clicks, carousel interactions

### Google Tag Manager
- **Container Setup**: Ready for GTM-XXXXXXX (placeholder for future implementation)
- **No-script fallback**: Implemented for users without JavaScript

### Event Tracking Features
```javascript
// Custom events tracked automatically:
- Contact form submissions
- Phone number clicks
- Email link clicks
- External partner website visits
- Solution page visits
- Scroll depth (25%, 50%, 75%, 90%)
- Carousel interactions
```

## Event Management System

### Dynamic Events Loading
- **Data Source**: `data/events.json` with fallback to hardcoded data
- **Event Types**: Seminars, Expos, Showcases
- **Registration System**: Integrated with Google Forms
- **URL Routing**: Hash-based routing for direct event registration links

### Event Data Structure
```json
{
  "id": "unique-event-id",
  "slug": "url-friendly-slug",
  "type": "seminar|expo|showcase",
  "title": "Event Title",
  "date": "2025-MM-DD",
  "dateEnd": "2025-MM-DD", // Optional for multi-day events
  "time": "HH:MM AM/PM",
  "location": "City, Country",
  "description": "Brief description",
  "fullDescription": "Detailed description",
  "image": "path/to/image",
  "registrationEnabled": true|false,
  "externalUrl": "https://external-link.com", // Optional
  "company": "Partner Company",
  "status": "upcoming|past"
}
```

## Content Management

### Adding New Images
- Place images in appropriate subdirectories under `/images/`
- Use descriptive filenames and proper alt text
- Optimize images for web (recommended: WebP format when possible)
- Customer logos: 150x75px recommended for consistency

### Adding New Pages
- Follow existing HTML structure and navigation patterns
- Update navigation menus in all pages when adding new sections
- Maintain consistent CSS class naming conventions
- Include Google Analytics tracking code

### Adding New Events
1. **Update `data/events.json`** with new event data
2. **Add event images** to `images/events/` directory
3. **Test registration flow** if `registrationEnabled: true`
4. **Update fallback data** in `EventManager.js` if needed

### Carousel Configuration
Carousels can be configured with options:
```javascript
{
    autoRotate: true,           // Enable automatic rotation
    rotationInterval: 5000,     // Milliseconds between slides
    pauseOnHover: true,         // Pause on mouse hover
    transitionDuration: 300,    // Transition animation duration
    showDots: true,            // Show navigation dots
    keyboardNav: true,         // Enable keyboard navigation
    touchNav: true,            // Enable touch/swipe navigation
    focusable: true            // Make carousel focusable
}
```

## Form Integration

### Google Forms Integration
- **Registration Form**: Connected to Google Forms backend
- **Real-time Validation**: Client-side validation with error messages
- **Success Handling**: Custom success overlay with redirect
- **Error Handling**: Graceful error handling with user feedback

### Form Field Configuration
**Required Fields:**
- Name (minimum 2 characters, letters and spaces only)
- Email (valid email format required)

**Optional Fields:**
- Phone (validates format if provided - minimum 10 digits)
- Company (minimum 2 characters if provided)
- Designation (minimum 2 characters if provided)
- Message (free text)

### Form Field Mapping
```javascript
// Google Forms entry IDs
'entry.1287541098': 'event-title-field',
'entry.908367769': 'name',          // Required
'entry.446693609': 'email',         // Required
'entry.1619260382': 'phone',        // Optional
'entry.1308701333': 'company',      // Optional
'entry.119358989': 'designation',   // Optional
'entry.80917227': 'message'         // Optional
```

## SEO & Performance

### Search Engine Optimization
- **Sitemap**: `sitemap.xml` with all pages listed
- **Robots.txt**: Configured for search engine crawling
- **Meta Tags**: Comprehensive meta descriptions and keywords
- **Structured Data**: Schema markup for business information
- **Privacy Policy**: GDPR-compliant privacy policy page

### Performance Features
- **Lazy Loading**: Implemented for carousel images
- **CSS Variables**: Efficient styling system
- **Minimal Dependencies**: Only Font Awesome and Google Analytics
- **Optimized Animations**: RequestAnimationFrame-based smooth scrolling

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used (classes, arrow functions, const/let, async/await)
- CSS Custom Properties required
- IntersectionObserver API required (polyfill needed for older browsers)
- Fetch API for dynamic data loading
- RequestAnimationFrame for smooth animations

## Performance Considerations

- No external dependencies except Font Awesome CDN and Google Analytics
- Optimized CSS with efficient selectors and CSS custom properties
- Lazy loading considerations for images in carousels
- Event listeners properly bound and cleaned up in carousel destroy methods
- RequestAnimationFrame for smooth scroll animations
- Efficient event delegation for dynamic content
- Fallback data systems for offline functionality

## Business Context

### Company Information
- **Name**: Primeasure Technologies Pvt Ltd
- **Locations**: 
  - Bangalore: #76, Amar Jyothi Lay Out, Sanjay Nagar, Bangalore 560094
  - Chennai: 12/15, 1st Floor, Ashok Bharathi Illam, Indira Nagar 4th Avenue, Adyar, Chennai 600020
- **Phone**: +91-9884900031
- **Business**: Test & Measurement, Broadcast, and Software Solutions distributor

### Key Partners
- **Test & Measurement**: Teledyne LeCroy (oscilloscopes, protocol analyzers)
- **Broadcast**: GrassValley (switchers, routers, production equipment)
- **Software**: Custom solutions and integrations

### Target Industries
- Electronics and semiconductor companies
- Broadcasting and media companies
- Automotive (EV testing)
- Research institutions and universities
- Government organizations (DRDO, BHEL)

## Maintenance Notes

### Regular Updates Needed
1. **Events Data**: Update `data/events.json` with new events
2. **Customer Logos**: Add new client logos to `images/customers/`
3. **Analytics Tracking**: Monitor and optimize tracking based on business needs
4. **Content Updates**: Keep solution pages current with latest offerings

### Recent Updates & Fixes
- **Form Validation (Latest)**: Phone number field corrected to be optional instead of required
- **Clean URL Structure**: Implemented across all pages with .htaccess rewrites
- **Analytics Implementation**: GA4 tracking (G-SFKRS4SNFV) implemented on key pages

### Monitoring & Analytics
- **Google Analytics**: Monitor traffic, conversions, and user behavior
- **Google Search Console**: Track search performance and indexing
- **Form Submissions**: Monitor registration and contact form submissions
- **Performance**: Monitor page load speeds and Core Web Vitals

### Security Considerations
- **Privacy Policy**: Keep updated with data handling practices
- **Analytics**: Ensure compliance with privacy regulations
- **Forms**: Validate all user inputs on both client and server side
- **External Links**: Use `rel="noopener noreferrer"` for security
