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
    
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                const dropdown = link.parentElement.querySelector('.dropdown-menu');
                const isExpanded = dropdown.style.maxHeight;

                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    if (menu !== dropdown) {
                        menu.style.maxHeight = null;
                        menu.style.opacity = null;
                        menu.style.visibility = null;
                    }
                });

                // Toggle current dropdown
                if (!isExpanded) {
                    dropdown.style.maxHeight = dropdown.scrollHeight + "px";
                    dropdown.style.opacity = "1";
                    dropdown.style.visibility = "visible";
                } else {
                    dropdown.style.maxHeight = null;
                    dropdown.style.opacity = null;
                    dropdown.style.visibility = null;
                }
            }
        });
    });
});
