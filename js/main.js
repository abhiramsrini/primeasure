// Carousel Functionality
class Carousel {
    constructor(element) {
        this.carousel = element;
        this.track = element.querySelector('.carousel-track');
        this.slides = element.querySelectorAll('.carousel-slide');
        this.dotsContainer = element.querySelector('.carousel-dots');
        this.currentSlide = 0;
        this.slideTimer = null;
        this.isVisible = true;


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
        
        // Position all slides
        this.slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${100 * (i - index)}%)`;
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

// Initialize all carousels
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => new Carousel(carousel));
});

// Intersection Observer for animate-on-scroll
// Animate cards on scroll
const animateOnScroll = () => {
    const cards = document.querySelectorAll('.product-card, .service-card, .value-card, .support-card');
    
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (cardTop < windowHeight * 0.85) {
            card.classList.add('animate');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.product-card, .service-card, .value-card, .support-card').forEach(el => {
    observer.observe(el);
});

// Navbar scroll behavior
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }

    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scrolling down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scrolling up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }

    lastScroll = currentScroll;
});
