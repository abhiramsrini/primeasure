// Base carousel functionality
class BaseCarousel {
    constructor(element) {
        this.carousel = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = element.querySelectorAll('.carousel-slide');
        this.dotsContainer = element.querySelector('.carousel-dots, .carousel-nav');
        this.currentSlide = 0;
        this.slideTimer = null;
        this.isVisible = true;

        // Set initial slide positions
        this.slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${100 * index}%)`;
        });

        // Initialize the carousel
        this.createDots();
        this.goToSlide(0);
        this.startSlideTimer();
        this.setupVisibilityHandler();
    }

    createDots() {
        // Clear existing dots if any
        this.dotsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                this.clearTimer();
                this.goToSlide(index);
                this.startSlideTimer();
            });
            this.dotsContainer.appendChild(dot);
        });

        this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    goToSlide(index) {
        this.currentSlide = index;
        
        // Position all slides with proper z-indexing
        this.slides.forEach((slide, i) => {
            const offset = i - index;
            slide.style.transform = `translateX(${100 * offset}%)`;
            slide.style.zIndex = offset === 0 ? 1 : 0;
            slide.style.opacity = offset === 0 ? 1 : 0.8;
        });
        
        // Update dots
        this.updateDots();
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
        if (this.isVisible) {
            this.slideTimer = setInterval(() => this.nextSlide(), 5000);
        }
    }

    setupVisibilityHandler() {
        // Handle tab visibility changes
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.startSlideTimer();
            } else {
                this.clearTimer();
            }
        });
    }

    destroy() {
        this.clearTimer();
        // Remove event listeners if needed
    }
}

// Hero carousel with content slides
class HeroCarousel extends BaseCarousel {
    constructor(element) {
        super(element);
        this.contents = element.querySelectorAll('.carousel-content');
    }

    goToSlide(index) {
        super.goToSlide(index);
        
        // Additional content handling specific to hero carousel
        if (this.contents && this.contents.length > 0) {
            this.contents.forEach((content, i) => {
                content.classList.toggle('active', i === index);
            });
        }
    }
}

// Regular section carousel
class SectionCarousel extends BaseCarousel {
    // Add any section-specific functionality here
}

// Initialize carousels
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero carousel
    const heroCarousel = document.querySelector('.hero-carousel');
    if (heroCarousel) {
        new HeroCarousel(heroCarousel);
    }

    // Initialize section carousels
    const sectionCarousels = document.querySelectorAll('.carousel-section .carousel');
    sectionCarousels.forEach(carousel => new SectionCarousel(carousel));
});
