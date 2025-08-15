document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu-toggle') && 
            navLinks.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Close mobile menu when window is resized above mobile breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && navLinks.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Navbar scroll behavior
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.classList.add('scroll-down');
            navbar.classList.remove('scroll-up');
            
            // Close mobile menu when scrolling down
            if (navLinks.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        } else {
            // Scrolling up
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });

    // Handle dropdown menus on touch devices
    const dropdownLinks = document.querySelectorAll('.has-dropdown > a');
    
    dropdownLinks.forEach((link, index) => {
        // Add ARIA attributes for accessibility
        link.setAttribute('aria-haspopup', 'true');
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');
        
        const parentDropdown = link.parentElement;
        const dropdown = parentDropdown.querySelector('.dropdown-menu');
        
        // Add unique ID for accessibility
        const dropdownId = `dropdown-${index}`;
        dropdown.setAttribute('id', dropdownId);
        link.setAttribute('aria-controls', dropdownId);
        
        // Add index to dropdown items for staggered animation
        const dropdownItems = dropdown.querySelectorAll('li');
        dropdownItems.forEach((item, itemIndex) => {
            item.style.setProperty('--index', itemIndex);
            
            // Enhanced touch support for dropdown items
            const dropdownLink = item.querySelector('a');
            if (dropdownLink) {
                // Refined touch feedback for dropdown items
                dropdownLink.addEventListener('touchstart', (e) => {
                    if (window.innerWidth <= 900) {
                        dropdownLink.classList.add('touched');
                        dropdownLink.style.transform = 'scale(0.98)';
                        dropdownLink.style.background = '#f0f5ff';
                        dropdownLink.style.color = '#1890ff';
                        dropdownLink.style.borderColor = '#91d5ff';
                        dropdownLink.style.boxShadow = '0 4px 8px rgba(24, 144, 255, 0.15)';
                    }
                }, { passive: true });
                
                dropdownLink.addEventListener('touchend', (e) => {
                    if (window.innerWidth <= 900) {
                        setTimeout(() => {
                            dropdownLink.classList.remove('touched');
                            dropdownLink.style.transform = '';
                            dropdownLink.style.background = '';
                            dropdownLink.style.color = '';
                            dropdownLink.style.borderColor = '';
                            dropdownLink.style.boxShadow = '';
                        }, 150);
                    }
                }, { passive: true });
                
                dropdownLink.addEventListener('touchcancel', (e) => {
                    if (window.innerWidth <= 900) {
                        dropdownLink.classList.remove('touched');
                        dropdownLink.style.transform = '';
                        dropdownLink.style.background = '';
                        dropdownLink.style.color = '';
                        dropdownLink.style.borderColor = '';
                        dropdownLink.style.boxShadow = '';
                    }
                }, { passive: true });
            }
        });
        
        // Mobile flattened navigation - disable dropdown toggle behavior
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                // Do nothing - sub-items are always visible in flattened design
                // Solutions link acts as a visual section header only
            }
        });
        
        // Keyboard support for flattened navigation
        link.addEventListener('keydown', (e) => {
            if (window.innerWidth <= 900) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Solutions link is non-functional - focus moves to first sub-item
                    const firstSubItem = parentDropdown.querySelector('.dropdown-menu li:first-child a');
                    if (firstSubItem) {
                        firstSubItem.focus();
                    }
                }
            }
        });
        
        // Touch-friendly feedback
        link.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 900) {
                link.style.transform = 'scale(0.98)';
            }
        }, { passive: true });
        
        link.addEventListener('touchend', (e) => {
            if (window.innerWidth <= 900) {
                link.style.transform = '';
            }
        }, { passive: true });
    });
    
    // No need for click outside handler in flattened navigation design
});
