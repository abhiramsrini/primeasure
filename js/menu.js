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
        
        // Click handler for mobile
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = parentDropdown.classList.contains('active');
                const isExpanded = link.getAttribute('aria-expanded') === 'true';

                // Close all other dropdowns
                document.querySelectorAll('.has-dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== parentDropdown) {
                        otherDropdown.classList.remove('active');
                        const otherLink = otherDropdown.querySelector('a');
                        otherLink.setAttribute('aria-expanded', 'false');
                        
                        const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                        otherMenu.style.maxHeight = '';
                        otherMenu.style.opacity = '';
                        otherMenu.style.visibility = '';
                    }
                });

                // Toggle current dropdown
                if (!isActive && !isExpanded) {
                    parentDropdown.classList.add('active');
                    link.setAttribute('aria-expanded', 'true');
                    
                    // Calculate proper height including padding
                    const dropdownHeight = dropdown.scrollHeight + 24; // 24px for padding
                    dropdown.style.maxHeight = dropdownHeight + "px";
                    dropdown.style.opacity = "1";
                    dropdown.style.visibility = "visible";
                    
                    // Add visual feedback
                    link.style.background = 'rgba(36, 31, 97, 0.1)';
                    
                    // Animate items
                    dropdownItems.forEach((item, itemIndex) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, itemIndex * 50);
                    });
                } else {
                    parentDropdown.classList.remove('active');
                    link.setAttribute('aria-expanded', 'false');
                    
                    dropdown.style.maxHeight = '';
                    dropdown.style.opacity = '';
                    dropdown.style.visibility = '';
                    
                    // Remove visual feedback
                    link.style.background = '';
                    
                    // Reset item animations
                    dropdownItems.forEach(item => {
                        item.style.opacity = '';
                        item.style.transform = '';
                    });
                }
            }
        });
        
        // Keyboard support
        link.addEventListener('keydown', (e) => {
            if (window.innerWidth <= 900) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                } else if (e.key === 'Escape') {
                    if (parentDropdown.classList.contains('active')) {
                        parentDropdown.classList.remove('active');
                        link.setAttribute('aria-expanded', 'false');
                        dropdown.style.maxHeight = '';
                        dropdown.style.opacity = '';
                        dropdown.style.visibility = '';
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
                    link.style.background = '';
                    
                    const menu = dropdown.querySelector('.dropdown-menu');
                    menu.style.maxHeight = '';
                    menu.style.opacity = '';
                    menu.style.visibility = '';
                }
            });
        }
    });
});
