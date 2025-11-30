/**
 * BitSwap - Clean Authentication Interface
 */

class AuthInterface {
    constructor() {
        this.currentTab = 'login';
        this.isSubmitting = false;
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            // Tabs
            loginTab: document.getElementById('login-tab'),
            registerTab: document.getElementById('register-tab'),
            tabIndicator: document.querySelector('.tab-indicator'),

            // Panels
            formContainer: document.querySelector('.form-container'),

            // Forms
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),

            // UI elements
            authCard: document.querySelector('.auth-card'),
            successOverlay: document.getElementById('success-overlay'),
            passwordToggles: document.querySelectorAll('.password-toggle'),
            bioCount: document.getElementById('bio-count')
        };
    }

    init() {
        this.bindEvents();
        this.setupInitialState();
        this.initFunBackground();
    } bindEvents() {
        // Tab switching
        this.elements.loginTab?.addEventListener('click', () => this.switchTab('login'));
        this.elements.registerTab?.addEventListener('click', () => this.switchTab('register'));

        // Form submissions
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.registerForm?.addEventListener('submit', (e) => this.handleRegister(e));

        // Password toggles
        this.elements.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.togglePassword(toggle));
        });

        // Character count for bio
        const bioTextarea = document.getElementById('register-bio');
        if (bioTextarea) {
            bioTextarea.addEventListener('input', () => this.updateCharCount(bioTextarea));
        }

        // Success overlay close
        if (this.elements.successOverlay) {
            this.elements.successOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.successOverlay) {
                    this.hideSuccess();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Input validation (debounced)
        this.setupInputValidation();
    }

    setupInitialState() {
        // Set initial tab state
        this.elements.loginTab?.classList.add('active');
        this.elements.registerTab?.classList.remove('active');

        // Set ARIA attributes
        this.elements.loginTab?.setAttribute('aria-selected', 'true');
        this.elements.registerTab?.setAttribute('aria-selected', 'false');
    }

    switchTab(tabName) {
        if (tabName === this.currentTab || this.isSubmitting) return;

        const isRegister = tabName === 'register';
        this.currentTab = tabName;

        // Update tab buttons
        this.elements.loginTab.classList.toggle('active', !isRegister);
        this.elements.registerTab.classList.toggle('active', isRegister);

        // Update ARIA
        this.elements.loginTab.setAttribute('aria-selected', !isRegister);
        this.elements.registerTab.setAttribute('aria-selected', isRegister);

        // Simple, stable slide animation
        if (this.elements.tabIndicator) {
            this.elements.tabIndicator.classList.toggle('move-right', isRegister);
        }

        if (this.elements.formContainer) {
            this.elements.formContainer.style.transform = isRegister ? 'translateX(-50%)' : 'translateX(0%)';
        }

        // Clear errors
        this.clearAllErrors(this.elements.loginForm);
        this.clearAllErrors(this.elements.registerForm);
    }

    // Validation
    validateField(input, rules) {
        const value = input.value.trim();

        for (const rule of rules) {
            if (!rule.test(value)) {
                this.showError(input, rule.message);
                return false;
            }
        }

        this.clearError(input);
        return true;
    }

    validateForm(form) {
        let isValid = true;
        const formType = form.id === 'login-form' ? 'login' : 'register';

        if (formType === 'login') {
            const username = form.querySelector('[name="username"]');
            const password = form.querySelector('[name="password"]');

            if (!this.validateField(username, [
                { test: (val) => val.length >= 3, message: 'Username must be at least 3 characters' }
            ])) isValid = false;

            if (!this.validateField(password, [
                { test: (val) => val.length > 0, message: 'Password is required' }
            ])) isValid = false;

        } else {
            const username = form.querySelector('[name="username"]');
            const password = form.querySelector('[name="password"]');
            const role = form.querySelector('[name="role"]:checked');

            if (!this.validateField(username, [
                { test: (val) => val.length >= 3 && val.length <= 20, message: 'Username must be 3-20 characters' },
                { test: (val) => /^[a-zA-Z0-9_-]+$/.test(val), message: 'Username can only contain letters, numbers, underscore, and hyphen' }
            ])) isValid = false;

            if (!this.validateField(password, [
                { test: (val) => val.length >= 8, message: 'Password must be at least 8 characters' },
                { test: (val) => /[a-z]/.test(val), message: 'Password must contain lowercase letter' },
                { test: (val) => /[A-Z]/.test(val), message: 'Password must contain uppercase letter' },
                { test: (val) => /[0-9]/.test(val), message: 'Password must contain number' }
            ])) isValid = false;

            if (!role) {
                const roleFieldset = form.querySelector('.role-selection');
                if (roleFieldset) {
                    this.showError(roleFieldset.querySelector('input'), 'Please select a role');
                    isValid = false;
                }
            }
        }

        return isValid;
    }

    showError(input, message) {
        const fieldGroup = input.closest('.field-group') || input.closest('fieldset');
        const errorElement = fieldGroup?.querySelector('.error-message');

        if (errorElement && fieldGroup) {
            fieldGroup.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearError(input) {
        const fieldGroup = input.closest('.field-group') || input.closest('fieldset');
        const errorElement = fieldGroup?.querySelector('.error-message');

        if (errorElement && fieldGroup) {
            fieldGroup.classList.remove('error');
            errorElement.classList.remove('show');
        }
    }

    clearAllErrors(form) {
        if (!form) return;
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => this.clearError(input));
    }

    // Simple shake without class manipulation
    shakeForm() {
        if (!this.elements.authCard) return;

        // Direct Web Animation API - no CSS class needed
        this.elements.authCard.animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-4px)' },
            { transform: 'translateX(4px)' },
            { transform: 'translateX(0px)' }
        ], {
            duration: 400,
            easing: 'ease-in-out'
        });
    }

    async handleLogin(event) {
        event.preventDefault();

        if (this.isSubmitting) return;

        const form = event.target;
        this.clearAllErrors(form);

        if (!this.validateForm(form)) {
            this.shakeForm();
            return;
        }

        this.setSubmitState(form, true);

        try {
            const formData = new FormData(form);
            await this.simulateLogin(formData);

            this.showSuccess(
                'Welcome back!',
                `Successfully logged in. Redirecting to dashboard...`
            );

        } catch (error) {
            this.showError(form.querySelector('[name="username"]'), 'Invalid username or password');
        } finally {
            this.setSubmitState(form, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();

        if (this.isSubmitting) return;

        const form = event.target;
        this.clearAllErrors(form);

        if (!this.validateForm(form)) {
            this.shakeForm();
            return;
        }

        this.setSubmitState(form, true);

        try {
            const formData = new FormData(form);
            const user = await this.simulateRegister(formData);

            this.showSuccess(
                'Account created!',
                `Welcome to BitSwap, ${user.username}! Your ${user.role} account is ready.`
            );

        } catch (error) {
            this.showError(form.querySelector('[name="username"]'), 'Registration failed. Please try again.');
        } finally {
            this.setSubmitState(form, false);
        }
    }

    setSubmitState(form, isSubmitting) {
        this.isSubmitting = isSubmitting;
        const submitBtn = form.querySelector('.submit-btn');

        if (submitBtn) {
            submitBtn.disabled = isSubmitting;
            submitBtn.textContent = isSubmitting ? 'Processing...' : (form.id === 'login-form' ? 'Sign In' : 'Create Account');
            submitBtn.classList.toggle('loading', isSubmitting);
        }
    }

    async simulateLogin(formData) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = {
            username: formData.get('username'),
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('bitswap_demo_user', JSON.stringify(user));
        return user;
    }

    async simulateRegister(formData) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const user = {
            username: formData.get('username'),
            role: formData.get('role'),
            bio: formData.get('bio') || '',
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('bitswap_demo_user', JSON.stringify(user));
        return user;
    }

    showSuccess(title, message) {
        const successTitle = this.elements.successOverlay?.querySelector('.success-title');
        const successMessage = this.elements.successOverlay?.querySelector('.success-message');

        if (successTitle) successTitle.textContent = title;
        if (successMessage) successMessage.textContent = message;

        if (this.elements.successOverlay) {
            this.elements.successOverlay.style.display = 'flex';
            this.elements.successOverlay.offsetHeight; // Force reflow
            this.elements.successOverlay.classList.add('show');
        }

        // Auto-hide after 3 seconds
        setTimeout(() => this.hideSuccess(), 3000);
    }

    hideSuccess() {
        if (this.elements.successOverlay) {
            this.elements.successOverlay.classList.remove('show');
            setTimeout(() => {
                this.elements.successOverlay.style.display = 'none';
            }, 300);
        }
    }

    togglePassword(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const icon = button.querySelector('.toggle-icon');

        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.add('eye-closed');
                button.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                icon.classList.remove('eye-closed');
                button.setAttribute('aria-label', 'Show password');
            }
        }
    }

    updateCharCount(textarea) {
        if (!this.elements.bioCount) return;

        const current = textarea.value.length;
        const max = parseInt(textarea.getAttribute('maxlength')) || 500;
        const currentSpan = this.elements.bioCount.querySelector('.count-current');

        if (currentSpan) {
            currentSpan.textContent = current;
            currentSpan.classList.remove('warning', 'danger');

            if (current > max * 0.9) {
                currentSpan.classList.add('danger');
            } else if (current > max * 0.75) {
                currentSpan.classList.add('warning');
            }
        }
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');

        inputs.forEach(input => {
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.clearError(input);
                }, 300);
            });
        });
    }

    handleKeyboard(event) {
        if (event.key === 'Escape' && this.elements.successOverlay?.classList.contains('show')) {
            this.hideSuccess();
        }
    }

    // Fun background effects
    initFunBackground() {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.createParticles();
    }

    createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        // Create 25 floating particles
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (8 + Math.random() * 7) + 's';

            particlesContainer.appendChild(particle);
        }

        // Add more particles periodically
        setInterval(() => {
            if (particlesContainer.children.length < 30) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = '0s';
                particle.style.animationDuration = (8 + Math.random() * 7) + 's';
                particlesContainer.appendChild(particle);

                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 15000);
            }
        }, 2000);
    }
}// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthInterface();
});