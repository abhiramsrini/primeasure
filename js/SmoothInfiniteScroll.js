class SmoothInfiniteScroll {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.track = this.container?.querySelector('.customers-track');
        
        if (!this.track) {
            console.warn('SmoothInfiniteScroll: track element not found');
            return;
        }

        // Configuration
        this.options = {
            speed: options.speed || 1, // pixels per frame
            pauseOnHover: options.pauseOnHover !== false,
            ...options
        };

        this.position = 0;
        this.isAnimating = false;
        this.isPaused = false;
        this.logoWidth = 0;
        this.animationId = null;

        this.init();
    }

    init() {
        // Remove any existing CSS animation
        this.track.style.animation = 'none';
        
        // Clone logos for seamless infinite scroll
        this.cloneLogos();
        
        // Calculate dimensions
        this.calculateDimensions();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start animation
        this.start();
    }

    cloneLogos() {
        // Get original logos
        const originalLogos = Array.from(this.track.children);
        this.originalLogoCount = originalLogos.length;
        
        // Clone each logo and append
        originalLogos.forEach(logo => {
            const clone = logo.cloneNode(true);
            this.track.appendChild(clone);
        });
        
        console.log(`Cloned ${this.originalLogoCount} logos for infinite scroll`);
    }

    calculateDimensions() {
        // Get all logos in the track (now includes clones)
        const logos = Array.from(this.track.children);
        
        // Calculate total width of original set only
        this.logoWidth = 0;
        for (let i = 0; i < this.originalLogoCount; i++) {
            const logo = logos[i];
            const logoStyle = window.getComputedStyle(logo);
            const width = logo.offsetWidth;
            const marginRight = parseFloat(logoStyle.marginRight) || 0;
            const marginLeft = parseFloat(logoStyle.marginLeft) || 0;
            this.logoWidth += width + marginRight + marginLeft;
        }
        
        // Add gap between logos
        const trackStyle = window.getComputedStyle(this.track);
        const gap = parseFloat(trackStyle.gap) || 0;
        this.logoWidth += gap * (this.originalLogoCount - 1);
        
        console.log('Original logo set width calculated:', this.logoWidth);
    }

    setupEventListeners() {
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pause());
            this.container.addEventListener('mouseleave', () => this.resume());
        }

        // Recalculate on window resize
        window.addEventListener('resize', () => {
            this.calculateDimensions();
        });
    }

    animate() {
        if (this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        // Move position
        this.position -= this.options.speed;
        
        // Reset position when we've moved one full logo set width
        if (this.position <= -this.logoWidth) {
            this.position = 0;
        }
        
        // Apply transform
        this.track.style.transform = `translateX(${this.position}px)`;
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    setSpeed(newSpeed) {
        this.options.speed = newSpeed;
    }

    destroy() {
        this.stop();
        
        // Remove event listeners
        if (this.options.pauseOnHover) {
            this.container.removeEventListener('mouseenter', () => this.pause());
            this.container.removeEventListener('mouseleave', () => this.resume());
        }
        
        // Remove cloned logos (keep only original ones)
        const allLogos = Array.from(this.track.children);
        for (let i = this.originalLogoCount; i < allLogos.length; i++) {
            allLogos[i].remove();
        }
        
        // Reset transform
        this.track.style.transform = '';
        this.track.style.animation = '';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const customerSlider = document.querySelector('.customers-slider');
    if (customerSlider) {
        // Destroy any existing instance
        if (window.smoothInfiniteScroll) {
            window.smoothInfiniteScroll.destroy();
        }
        
        // Create new instance
        window.smoothInfiniteScroll = new SmoothInfiniteScroll('.customers-slider', {
            speed: 0.5, // Slow, smooth movement
            pauseOnHover: true
        });
        
        console.log('SmoothInfiniteScroll initialized');
    }
});