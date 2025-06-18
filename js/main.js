// Carousel Functionality
const carouselTrack = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-slide');
const dotsContainer = document.querySelector('.carousel-dots');
let currentSlide = 0;
let slideTimer;

// Create dot indicators
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        clearInterval(slideTimer);
        goToSlide(index);
        startSlideTimer();
    });
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.carousel-dot');

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

function startSlideTimer() {
    slideTimer = setInterval(nextSlide, 5000);
}

// Initialize carousel
goToSlide(0);
startSlideTimer();

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
