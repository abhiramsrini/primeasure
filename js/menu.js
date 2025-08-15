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
        
        // Mobile dropdown toggle behavior
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = parentDropdown.classList.contains('active');

                // Close all other dropdowns
                document.querySelectorAll('.has-dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== parentDropdown) {
                        otherDropdown.classList.remove('active');
                        const otherLink = otherDropdown.querySelector('a');
                        otherLink.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current dropdown
                if (!isActive) {
                    parentDropdown.classList.add('active');
                    link.setAttribute('aria-expanded', 'true');
                } else {
                    parentDropdown.classList.remove('active');
                    link.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Keyboard support for mobile dropdown
        link.addEventListener('keydown', (e) => {
            if (window.innerWidth <= 900) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                } else if (e.key === 'Escape') {
                    if (parentDropdown.classList.contains('active')) {
                        parentDropdown.classList.remove('active');
                        link.setAttribute('aria-expanded', 'false');
                        link.focus();
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
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
            const openDropdowns = document.querySelectorAll('.has-dropdown.active');
            openDropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                    const link = dropdown.querySelector('a');
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
});
