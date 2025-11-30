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
}