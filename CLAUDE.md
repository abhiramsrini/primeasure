# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Primeasure, a company providing test & measurement, broadcast, and software solutions. The website is built with vanilla HTML, CSS, and JavaScript without any build tools or frameworks.

## Project Structure

```
primeasure/
├── index.html                 # Main homepage
├── css/
│   ├── style.css             # Main stylesheet with CSS variables
│   └── responsive.css        # Mobile/responsive styles
├── js/
│   ├── main.js              # Scroll animations and navbar behavior
│   ├── carousel.js          # Advanced carousel component system
│   └── menu.js              # Mobile navigation and dropdown handling
├── images/                   # All static assets organized by category
│   ├── home/                # Homepage images
│   ├── customers/           # Customer/partner logos
│   ├── events/              # Event-related images
│   ├── partners/            # Partner logos
│   └── solutions/           # Solution page images
└── pages/
    ├── about.html
    ├── contact.html
    ├── events.html
    ├── register.html
    └── solutions/
        ├── broadcast.html
        ├── software.html
        └── test-measurement.html
```

## Development Commands

This is a static website - no build tools are required. For development:

```bash
# Serve locally using Python
python3 -m http.server 8000

# Or using Node.js http-server (if installed)
npx http-server

# Or using PHP
php -S localhost:8000
```

## Architecture and Code Organization

### CSS Architecture
- **CSS Custom Properties**: Extensive use of CSS variables in `:root` for colors, shadows, transitions
- **Component-based Styling**: Styles organized by component (navbar, carousel, cards, etc.)
- **Responsive Design**: Separate responsive.css file for mobile adaptations
- **Design System**: Ant Design-inspired variables and shadow system

### JavaScript Architecture
- **Modular Components**: Each JS file handles specific functionality
- **carousel.js**: Advanced carousel system with multiple classes:
  - `BaseCarousel`: Core carousel functionality with accessibility features
  - `HeroCarousel`: Extends BaseCarousel for hero sections with content slides
  - `SectionCarousel`: For regular section carousels
  - Error handling with `CarouselInitError` class
- **main.js**: Intersection Observer for scroll animations, navbar scroll behavior
- **menu.js**: Mobile navigation, dropdown menus with accessibility features

### Accessibility Features
- ARIA attributes throughout carousel and navigation components
- Keyboard navigation support (arrows, space, escape, home/end keys)
- Screen reader announcements for carousel state changes
- Proper focus management and visual focus indicators
- Touch-friendly interactions for mobile devices

### Key Components
- **Hero Carousel**: Multi-slide carousel with synchronized content and images
- **Section Carousels**: Auto-rotating image carousels with navigation dots
- **Mobile Navigation**: Collapsible menu with animated dropdowns
- **Scroll Animations**: Intersection Observer-based animations for cards

## Content Management

### Adding New Images
- Place images in appropriate subdirectories under `/images/`
- Use descriptive filenames and proper alt text
- Optimize images for web (recommended: WebP format when possible)

### Adding New Pages
- Follow existing HTML structure and navigation patterns
- Update navigation menus in all pages when adding new sections
- Maintain consistent CSS class naming conventions

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

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used (classes, arrow functions, const/let)
- CSS Custom Properties required
- IntersectionObserver API required (polyfill needed for older browsers)

## Performance Considerations

- No external dependencies except Font Awesome CDN
- Optimized CSS with efficient selectors
- Lazy loading considerations for images in carousels
- Event listeners properly bound and cleaned up in carousel destroy methods