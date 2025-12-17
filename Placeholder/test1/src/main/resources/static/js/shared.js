/**
 * BitSwap - Shared Utilities
 * Common functions used across the application
 */

class BitSwapUtils {
    /**
     * Initialize particles background
     */
    static initParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        const particleCount = 25;

        // Create initial particles
        for (let i = 0; i < particleCount; i++) {
            this.createParticle(particlesContainer);
        }

        // Add new particles periodically
        setInterval(() => {
            if (particlesContainer.children.length < particleCount + 5) {
                this.createParticle(particlesContainer);
            }
        }, 3000);
    }

    /**
     * Create a single particle
     */
    static createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (8 + Math.random() * 7) + 's';

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 15000);
    }

    /**
     * Show loading state on button
     */
    static showButtonLoading(button) {
        const loader = button.querySelector('.button-loader');
        const text = button.querySelector('.button-text');

        if (loader && text) {
            button.disabled = true;
            text.style.opacity = '0';
            loader.style.display = 'block';
        }
    }

    /**
     * Hide loading state on button
     */
    static hideButtonLoading(button) {
        const loader = button.querySelector('.button-loader');
        const text = button.querySelector('.button-text');

        if (loader && text) {
            button.disabled = false;
            text.style.opacity = '1';
            loader.style.display = 'none';
        }
    }

    static formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static signOut() {
        localStorage.removeItem('bitswap_demo_user');
        window.location.href = '/login';
    }

    /**
     * Simple debounce function
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Format price for display
     */
    static formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }

    /**
     * Navigate to page (with history management)
     */
    static navigateTo(page) {
        window.location.href = page;
    }

    /**
     * Get element safely with error handling
     */
    static getElement(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn(`Element not found: ${selector}`);
            return null;
        }
    }

    /**
     * Get all elements safely with error handling
     */
    static getElements(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Elements not found: ${selector}`);
            return [];
        }
    }

    /**
     * Initialize header navigation functionality
     */
    static initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

        // Set active nav link based on current page
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // Simple path matching
            if (href && (currentPath.includes(href) ||
                (href === 'listings.html' && currentPath.includes('listings')) ||
                (href === 'addvideogame.html' && currentPath.includes('addvideogame')) ||
                (href === 'login.html' && currentPath.includes('login')) ||
                (href === 'gamedetails.html' && currentPath.includes('gamedetails')))) {
                link.classList.add('active');
            }
        });

        // Handle navigation clicks
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                // Handle placeholder links
                if (!href || href === '#') {
                    e.preventDefault();
                    console.log('Navigation to', this.textContent, 'not implemented yet');
                    return;
                }

                // Update active state
                navLinks.forEach(nl => nl.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Handle sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function () {
                // Navigate to login page
                window.location.href = 'login.html';
            });
        }
    }

    /**
     * Initialize all shared functionality
     */
    static init() {
        this.initParticles();
        this.initNavigation();
    }
}