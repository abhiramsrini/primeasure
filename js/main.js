// Intersection Observer for animate-on-scroll
// Product Scroll Functionality
const scrollContainer = document.querySelector('.products-scroll');
const scrollLeftBtn = document.querySelector('.scroll-left');
const scrollRightBtn = document.querySelector('.scroll-right');

if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    const scrollAmount = 300; // Width of one product card

    scrollLeftBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Show/hide scroll buttons based on scroll position
    const toggleScrollButtons = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        scrollLeftBtn.style.opacity = scrollLeft > 0 ? '1' : '0';
        scrollRightBtn.style.opacity = scrollLeft < scrollWidth - clientWidth ? '1' : '0';
    };

    scrollContainer.addEventListener('scroll', toggleScrollButtons);
    window.addEventListener('resize', toggleScrollButtons);
    toggleScrollButtons(); // Initial check
}

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
