// Base carousel functionality
// Default carousel configuration
const DEFAULT_CONFIG = {
    autoRotate: true,
    rotationInterval: 5000,
    swipeThreshold: 50,
    transitionDuration: 300,
    initialSlide: 0,
    pauseOnHover: true,
    showDots: true,
    keyboardNav: true,
    touchNav: true,
    focusable: true
};

class BaseCarousel {
    constructor(element, config = {}) {
        if (!element) {
            throw new CarouselInitError('Carousel element not found');
        }

        // Merge default config with provided options
        this.config = { ...DEFAULT_CONFIG, ...config };

        this.carousel = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = element.querySelectorAll('.carousel-slide');
        this.dotsContainer = element.querySelector('.carousel-dots, .carousel-nav');

        // Validate required elements
        if (!this.track) {
            throw new CarouselInitError('Carousel track element not found', element);
        }
        if (!this.slides || this.slides.length === 0) {
            throw new CarouselInitError('No slides found in carousel', element);
        }
        if (!this.dotsContainer && this.config.showDots) {
            throw new CarouselInitError('Navigation dots container not found', element);
        }

        // Apply transition duration to slides
        this.slides.forEach(slide => {
            slide.style.transition = `transform ${this.config.transitionDuration}ms ease-in-out, opacity ${this.config.transitionDuration}ms ease-in-out`;
        });

        this.currentSlide = this.config.initialSlide;
        this.slideTimer = null;
        this.isVisible = true;

        // Bind event handlers to preserve context
        this.visibilityHandler = this.handleVisibilityChange.bind(this);
        this.mouseEnterHandler = this.handleMouseEnter.bind(this);
        this.mouseLeaveHandler = this.handleMouseLeave.bind(this);
        this.keydownHandler = this.handleKeydown.bind(this);
        this.focusHandler = this.handleFocus.bind(this);
        this.blurHandler = this.handleBlur.bind(this);
        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);
        this.touchMoveHandler = this.handleTouchMove.bind(this);

        // Set initial slide positions
        this.slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${100 * index}%)`;
        });

        // Initialize the carousel
        this.createDots();
        this.goToSlide(0);
        this.startSlideTimer();
        this.setupVisibilityHandler();
        this.setupHoverHandler();
        this.setupTouchHandler();
        this.setupKeyboardHandler();

        // Touch tracking variables
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Make carousel focusable and accessible
        this.carousel.tabIndex = 0;
        this.carousel.setAttribute('role', 'region');
        this.carousel.setAttribute('aria-label', 'Image carousel');
        this.carousel.setAttribute('aria-roledescription', 'carousel');

        // Add accessibility attributes to slides
        this.slides.forEach((slide, index) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${this.slides.length}`);
            slide.setAttribute('aria-hidden', 'true');
        });
        this.slides[0].setAttribute('aria-hidden', 'false');
    }

    handleDotClick(index) {
        this.clearTimer();
        this.goToSlide(index);
        this.startSlideTimer();
    }

    handleDotKeydown(index, e) {
        let targetIndex = index;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                targetIndex = (index - 1 + this.slides.length) % this.slides.length;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                targetIndex = (index + 1) % this.slides.length;
                e.preventDefault();
                break;
            case 'Home':
                targetIndex = 0;
                e.preventDefault();
                break;
            case 'End':
                targetIndex = this.slides.length - 1;
                e.preventDefault();
                break;
        }

        if (targetIndex !== index) {
            this.clearTimer();
            this.goToSlide(targetIndex);
            this.startSlideTimer();
            this.dots[targetIndex].focus();
        }
    }

    createDots() {
        // Clear existing dots if any
        this.dotsContainer.innerHTML = '';
        this.dotsContainer.setAttribute('role', 'tablist');
        this.dotsContainer.setAttribute('aria-label', 'Carousel navigation');
        
        // Store dot handlers for cleanup
        this.dotHandlers = [];
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            dot.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            if (index === 0) dot.classList.add('active');
            
            // Create bound handlers for this dot
            const clickHandler = this.handleDotClick.bind(this, index);
            const keydownHandler = this.handleDotKeydown.bind(this, index);
            
            // Store handlers for cleanup
            this.dotHandlers.push({ dot, clickHandler, keydownHandler });
            
            // Add event listeners
            dot.addEventListener('click', clickHandler);
            dot.addEventListener('keydown', keydownHandler);
            
            this.dotsContainer.appendChild(dot);
        });

        this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            const isActive = index === this.currentSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
            dot.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    goToSlide(index) {
        this.currentSlide = index;
        
        // Position all slides with proper z-indexing and accessibility
        this.slides.forEach((slide, i) => {
            const offset = i - index;
            slide.style.transform = `translateX(${100 * offset}%)`;
            slide.style.zIndex = offset === 0 ? 1 : 0;
            slide.style.opacity = offset === 0 ? 1 : 0.8;
            
            // Update ARIA states
            slide.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
            if (offset === 0) {
                slide.removeAttribute('tabindex');
            } else {
                slide.setAttribute('tabindex', '-1');
            }
        });
        
        // Update dots with ARIA states
        this.updateDots();
        
        // Announce slide change to screen readers
        this.carousel.setAttribute('aria-live', 'polite');
        this.carousel.setAttribute('aria-atomic', 'true');
        
        // Update carousel label with current slide information
        const playState = this.slideTimer ? 'playing' : 'paused';
        this.carousel.setAttribute('aria-label', 
            `Image carousel - Slide ${index + 1} of ${this.slides.length} (${playState})`
        );
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(this.currentSlide);
    }

    clearTimer() {
        if (this.slideTimer) {
            clearInterval(this.slideTimer);
            this.slideTimer = null;
        }
    }

    startSlideTimer() {
        this.clearTimer();
        if (this.isVisible && this.config.autoRotate) {
            this.slideTimer = setInterval(() => this.nextSlide(), this.config.rotationInterval);
        }
    }

    // Event handler methods
    handleVisibilityChange() {
        this.isVisible = !document.hidden;
        if (this.isVisible) {
            this.startSlideTimer();
        } else {
            this.clearTimer();
        }
    }

    handleMouseEnter() {
        this.clearTimer();
    }

    handleMouseLeave() {
        if (this.isVisible) {
            this.startSlideTimer();
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.clearTimer();
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                const prevSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
                this.goToSlide(prevSlide);
            } else {
                const nextSlide = (this.currentSlide + 1) % this.slides.length;
                this.goToSlide(nextSlide);
            }
        }
        
        if (this.isVisible) {
            this.startSlideTimer();
        }
    }

    handleTouchMove(e) {
        if (Math.abs(e.touches[0].clientX - this.touchStartX) > 10) {
            e.preventDefault();
        }
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                const prevSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
                this.clearTimer();
                this.goToSlide(prevSlide);
                this.startSlideTimer();
                e.preventDefault();
                break;
            case 'ArrowRight':
                const nextSlide = (this.currentSlide + 1) % this.slides.length;
                this.clearTimer();
                this.goToSlide(nextSlide);
                this.startSlideTimer();
                e.preventDefault();
                break;
            case ' ':
                if (this.slideTimer) {
                    this.clearTimer();
                    this.carousel.setAttribute('aria-label', 'Image carousel (paused)');
                } else if (this.isVisible) {
                    this.startSlideTimer();
                    this.carousel.setAttribute('aria-label', 'Image carousel (playing)');
                }
                e.preventDefault();
                break;
        }
    }

    handleFocus() {
        this.carousel.style.outline = '2px solid var(--primary-blue)';
        this.carousel.style.outlineOffset = '2px';
    }

    handleBlur() {
        this.carousel.style.outline = 'none';
    }

    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    setupHoverHandler() {
        if (this.config.pauseOnHover) {
            this.carousel.addEventListener('mouseenter', this.mouseEnterHandler);
            this.carousel.addEventListener('mouseleave', this.mouseLeaveHandler);
        }
    }

    setupTouchHandler() {
        if (this.config.touchNav) {
            this.carousel.addEventListener('touchstart', this.touchStartHandler);
            this.carousel.addEventListener('touchend', this.touchEndHandler);
            this.carousel.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        }
    }

    setupKeyboardHandler() {
        if (this.config.keyboardNav) {
            this.carousel.addEventListener('keydown', this.keydownHandler);
        }
        if (this.config.focusable) {
            this.carousel.addEventListener('focus', this.focusHandler);
            this.carousel.addEventListener('blur', this.blurHandler);
        }
    }

    removeEventListeners() {
        // Remove document-level listeners
        document.removeEventListener('visibilitychange', this.visibilityHandler);

        // Remove carousel-level listeners
        this.carousel.removeEventListener('mouseenter', this.mouseEnterHandler);
        this.carousel.removeEventListener('mouseleave', this.mouseLeaveHandler);
        this.carousel.removeEventListener('keydown', this.keydownHandler);
        this.carousel.removeEventListener('focus', this.focusHandler);
        this.carousel.removeEventListener('blur', this.blurHandler);
        this.carousel.removeEventListener('touchstart', this.touchStartHandler);
        this.carousel.removeEventListener('touchend', this.touchEndHandler);
        this.carousel.removeEventListener('touchmove', this.touchMoveHandler);

        // Remove dot button listeners
        if (this.dotHandlers) {
            this.dotHandlers.forEach(({ dot, clickHandler, keydownHandler }) => {
                dot.removeEventListener('click', clickHandler);
                dot.removeEventListener('keydown', keydownHandler);
            });
            this.dotHandlers = null;
        }
    }

    destroy() {
        // Stop the timer
        this.clearTimer();

        // Remove all event listeners
        this.removeEventListeners();

        // Clear references
        this.carousel = null;
        this.track = null;
        this.slides = null;
        this.dotsContainer = null;
        this.dots = null;
        this.contents = null;
    }
}

// Hero carousel with content slides
class HeroCarousel extends BaseCarousel {
    constructor(element, config = {}) {
        // Set hero-specific defaults
        const heroDefaults = {
            autoRotate: true,
            rotationInterval: 6000,
            transitionDuration: 400,
            pauseOnHover: true,
            showDots: true,
            keyboardNav: true,
            touchNav: true,
            focusable: true
        };

        // Merge hero defaults with provided config
        const heroConfig = { ...heroDefaults, ...config };
        
        // Call parent constructor with merged config
        super(element, heroConfig);
        
        // Initialize content elements and enhance accessibility
        this.contents = element.querySelectorAll('.carousel-content');
        
        // Add hero-specific ARIA labels and associate content
        this.carousel.setAttribute('aria-roledescription', 'hero carousel');
        this.carousel.setAttribute('aria-label', 'Hero content carousel');
        
        // Enhance slide accessibility with content descriptions
        this.slides.forEach((slide, index) => {
            const content = this.contents[index];
            if (content) {
                const heading = content.querySelector('h2, h3, h4') || content;
                const description = heading.textContent || `Hero content ${index + 1}`;
                slide.setAttribute('aria-label', description);
                slide.setAttribute('aria-roledescription', 'hero slide');
            }
        });
    }

    goToSlide(index) {
        super.goToSlide(index);
        
        // Additional content handling specific to hero carousel
        if (this.contents && this.contents.length > 0) {
            this.contents.forEach((content, i) => {
                content.classList.toggle('active', i === index);
                // Update ARIA states for content
                content.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
            });

            // Update carousel label with content description
            const activeContent = this.contents[index];
            if (activeContent) {
                const heading = activeContent.querySelector('h2, h3, h4') || activeContent;
                const description = heading.textContent || `Hero content ${index + 1}`;
                this.carousel.setAttribute('aria-label', 
                    `Hero carousel - ${description} (${this.slideTimer ? 'playing' : 'paused'})`
                );
            }
        }
    }

    destroy() {
        // Clean up content references and states
        if (this.contents) {
            this.contents.forEach(content => {
                content.classList.remove('active');
                content.removeAttribute('aria-hidden');
            });
        }
        
        // Call parent destroy method
        super.destroy();
    }
}

// Regular section carousel
class SectionCarousel extends BaseCarousel {
    // Add any section-specific functionality here
}

// Carousel initialization error handler
class CarouselInitError extends Error {
    constructor(message, element) {
        super(message);
        this.name = 'CarouselInitError';
        this.element = element;
    }
}

// Initialize carousels with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize hero carousel with custom configuration
        const heroCarousel = document.querySelector('.hero-carousel');
        if (heroCarousel) {
            try {
                new HeroCarousel(heroCarousel, {
                    autoRotate: true,
                    rotationInterval: 6000,
                    pauseOnHover: false,
                    transitionDuration: 400
                });
            } catch (error) {
                console.error('Failed to initialize hero carousel:', error);
                heroCarousel.innerHTML = '<p class="carousel-error">Failed to load carousel</p>';
            }
        }

        // Initialize section carousels
        const sectionCarousels = document.querySelectorAll('.carousel-section .carousel');
        sectionCarousels.forEach(carousel => {
            try {
                new SectionCarousel(carousel, {
                    autoRotate: true,
                    rotationInterval: 5000,
                    transitionDuration: 300
                });
            } catch (error) {
                console.error('Failed to initialize section carousel:', error);
                carousel.innerHTML = '<p class="carousel-error">Failed to load carousel</p>';
            }
        });

        // Initialize solution carousels with different settings
        const solutionCarousels = document.querySelectorAll('.summary-section .carousel');
        solutionCarousels.forEach(carousel => {
            try {
                new SectionCarousel(carousel, {
                    autoRotate: true,
                    rotationInterval: 4000,
                    pauseOnHover: true,
                    transitionDuration: 300,
                    showDots: true,
                    keyboardNav: true,
                    touchNav: true
                });
            } catch (error) {
                console.error('Failed to initialize solution carousel:', error);
                carousel.innerHTML = '<p class="carousel-error">Failed to load carousel</p>';
            }
        });
    } catch (error) {
        console.error('Critical carousel initialization error:', error);
    }
});
