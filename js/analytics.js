// Google Analytics Enhanced Tracking for Primeasure
// This file contains custom event tracking and analytics enhancements

// Configuration - Replace with actual tracking IDs
const ANALYTICS_CONFIG = {
    GA4_ID: 'G-SFKRS4SNFV', // Actual GA4 ID
    GTM_ID: 'GTM-XXXXXXX',  // Replace with actual GTM ID when available
    enableDebug: false       // Set to true for testing
};

// Enhanced tracking functions
class PrimeasureAnalytics {
    constructor() {
        this.init();
    }

    init() {
        // Wait for gtag to be available
        if (typeof gtag !== 'undefined') {
            this.setupEventTracking();
            this.trackPageView();
        } else {
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    // Track page views with enhanced data
    trackPageView() {
        const pageTitle = document.title;
        const pageLocation = window.location.href;
        const pagePath = window.location.pathname;
        
        if (typeof gtag !== 'undefined') {
            gtag('config', ANALYTICS_CONFIG.GA4_ID, {
                page_title: pageTitle,
                page_location: pageLocation,
                page_path: pagePath,
                send_page_view: true
            });
        }

        this.log('Page view tracked:', pageTitle);
    }

    // Track contact form submissions
    trackContactForm(formType = 'contact') {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: formType,
                form_type: formType,
                page_location: window.location.href
            });
        }
        this.log('Contact form submission tracked:', formType);
    }

    // Track event registrations
    trackEventRegistration(eventName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'event_registration', {
                event_category: 'Events',
                event_label: eventName,
                event_name: eventName,
                page_location: window.location.href
            });
        }
        this.log('Event registration tracked:', eventName);
    }

    // Track phone number clicks
    trackPhoneClick(phoneNumber) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'phone_click', {
                event_category: 'Contact',
                event_label: phoneNumber,
                phone_number: phoneNumber,
                page_location: window.location.href
            });
        }
        this.log('Phone click tracked:', phoneNumber);
    }

    // Track email clicks
    trackEmailClick(emailAddress) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'email_click', {
                event_category: 'Contact',
                event_label: emailAddress,
                email_address: emailAddress,
                page_location: window.location.href
            });
        }
        this.log('Email click tracked:', emailAddress);
    }

    // Track external link clicks (partner websites)
    trackExternalLink(url, linkText) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'external_link_click', {
                event_category: 'External Links',
                event_label: linkText || url,
                link_url: url,
                page_location: window.location.href
            });
        }
        this.log('External link tracked:', url);
    }

    // Track solution page visits
    trackSolutionView(solutionType) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'solution_view', {
                event_category: 'Solutions',
                event_label: solutionType,
                solution_type: solutionType,
                page_location: window.location.href
            });
        }
        this.log('Solution view tracked:', solutionType);
    }

    // Track blog topic filters
    trackBlogFilter(topics) {
        const topicArray = Array.isArray(topics)
            ? topics
            : (typeof topics === 'string' && topics ? [topics] : []);

        const eventLabel = topicArray.length ? topicArray.join(', ') : 'all topics';

        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_filter', {
                event_category: 'Blog',
                event_label: eventLabel,
                blog_topics: topicArray,
                topic_count: topicArray.length,
                page_location: window.location.href
            });
        }
        this.log('Blog filter tracked:', topicArray);
    }

    // Track blog article views
    trackBlogArticleView(articleTitle, topics = []) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_article_view', {
                event_category: 'Blog',
                event_label: articleTitle,
                article_title: articleTitle,
                article_topics: topics.join(', '),
                page_location: window.location.href
            });
        }
        this.log('Blog article view tracked:', articleTitle, topics);
    }

    // Track blog CTA interactions
    trackBlogCta(ctaText, articleTitle) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_cta_click', {
                event_category: 'Blog',
                event_label: ctaText,
                article_title: articleTitle,
                cta_text: ctaText,
                page_location: window.location.href
            });
        }
        this.log('Blog CTA click tracked:', ctaText, articleTitle);
    }

    // Track related article navigation
    trackBlogRelatedClick(articleTitle, targetTitle) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_related_click', {
                event_category: 'Blog',
                event_label: targetTitle,
                article_title: articleTitle,
                related_article_title: targetTitle,
                page_location: window.location.href
            });
        }
        this.log('Blog related article click tracked:', articleTitle, targetTitle);
    }

    // Track carousel interactions
    trackCarouselInteraction(action, slideIndex) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'carousel_interaction', {
                event_category: 'User Engagement',
                event_label: action,
                carousel_action: action,
                slide_index: slideIndex,
                page_location: window.location.href
            });
        }
        this.log('Carousel interaction tracked:', action, slideIndex);
    }

    // Track scroll depth
    trackScrollDepth(percentage) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
                event_category: 'User Engagement',
                event_label: `${percentage}%`,
                scroll_percentage: percentage,
                page_location: window.location.href
            });
        }
        this.log('Scroll depth tracked:', percentage + '%');
    }

    // Setup automatic event tracking
    setupEventTracking() {
        // Track phone number clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const phoneNumber = e.target.href.replace('tel:', '');
                this.trackPhoneClick(phoneNumber);
            });
        });

        // Track email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const emailAddress = e.target.href.replace('mailto:', '');
                this.trackEmailClick(emailAddress);
            });
        });

        // Track external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const url = e.target.href;
                const linkText = e.target.textContent.trim();
                this.trackExternalLink(url, linkText);
            });
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const formId = form.id || 'unknown_form';
                this.trackContactForm(formId);
            });
        });

        // Track scroll depth
        this.setupScrollTracking();

        // Track solution page views
        this.trackSolutionPageView();

        // Track blog interactions
        this.setupBlogTracking();
    }

    // Setup scroll depth tracking
    setupScrollTracking() {
        let scrollDepthTracked = [];
        const thresholds = [25, 50, 75, 90];

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !scrollDepthTracked.includes(threshold)) {
                    scrollDepthTracked.push(threshold);
                    this.trackScrollDepth(threshold);
                }
            });
        });
    }

    // Detect and track solution page views
    trackSolutionPageView() {
        const path = window.location.pathname;
        if (path.includes('/solutions/')) {
            let solutionType = 'unknown';
            if (path.includes('test-measurement')) solutionType = 'Test & Measurement';
            else if (path.includes('broadcast')) solutionType = 'Broadcast';
            else if (path.includes('software')) solutionType = 'Software';
            
            if (solutionType !== 'unknown') {
                this.trackSolutionView(solutionType);
            }
        }
    }

    // Detect and track blog-specific interactions
    setupBlogTracking() {
        const articleContainer = document.querySelector('.blog-article');
        if (articleContainer) {
            const titleElement = articleContainer.querySelector('.article-hero h1');
            const topicChips = Array.from(articleContainer.querySelectorAll('.article-topic-chip'))
                .map(chip => chip.textContent.trim());
            
            if (titleElement) {
                this.trackBlogArticleView(titleElement.textContent.trim(), topicChips);
            }

            const ctaButton = articleContainer.querySelector('.article-cta .cta-button');
            if (ctaButton) {
                ctaButton.addEventListener('click', () => {
                    const articleTitle = titleElement ? titleElement.textContent.trim() : 'Unknown Article';
                    this.trackBlogCta(ctaButton.textContent.trim(), articleTitle);
                });
            }

            articleContainer.querySelectorAll('.related-grid a').forEach(link => {
                link.addEventListener('click', () => {
                    const articleTitle = titleElement ? titleElement.textContent.trim() : 'Unknown Article';
                    const targetTitle = link.textContent.trim();
                    this.trackBlogRelatedClick(articleTitle, targetTitle);
                });
            });
        }
    }

    // Debug logging
    log(...args) {
        if (ANALYTICS_CONFIG.enableDebug) {
            console.log('[Primeasure Analytics]', ...args);
        }
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom analytics tracking
    window.primeasureAnalytics = new PrimeasureAnalytics();
    window.PrimeasureAnalyticsInstance = window.primeasureAnalytics;
    
    // Track initial page load
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load', {
            event_category: 'Site Performance',
            event_label: document.title,
            page_location: window.location.href
        });
    }
});

// Export for global access
window.PrimeasureAnalytics = PrimeasureAnalytics;
