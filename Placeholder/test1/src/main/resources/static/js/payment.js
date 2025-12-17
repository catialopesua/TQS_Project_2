/**
 * Payment Processing Module
 * Handles Stripe and PayPal payment flows with simulated processing
 */

class PaymentProcessor {
    constructor() {
        this.currentBookingData = null;
        this.isProcessing = false;
        this.elements = this.initializeElements();
    }

    initializeElements() {
        return {
            paymentModal: document.getElementById('payment-modal'),
            bookingModal: document.getElementById('booking-modal'),
            
            // Payment modal elements
            paymentGameTitle: document.getElementById('payment-game-title'),
            paymentDates: document.getElementById('payment-dates'),
            paymentAmount: document.getElementById('payment-amount'),
            paymentBtnText: document.getElementById('payment-btn-text'),
            paymentLoading: document.getElementById('payment-loading'),
            paymentConfirm: document.getElementById('payment-confirm'),
            paymentBackBtn: document.getElementById('payment-back-btn'),
            paymentCloseBtn: document.getElementById('payment-close-btn'),
            
            // Payment methods
            paymentMethodRadios: document.querySelectorAll('input[name="payment-method"]'),
            stripeForm: document.getElementById('stripe-form'),
            paypalForm: document.getElementById('paypal-form'),
            
            // Card inputs
            cardName: document.getElementById('card-name'),
            cardNumber: document.getElementById('card-number'),
            cardExpiry: document.getElementById('card-expiry'),
            cardCvc: document.getElementById('card-cvc'),
            
            // PayPal inputs
            paypalEmail: document.getElementById('paypal-email'),
            
            // Messages
            paymentError: document.getElementById('payment-error'),
            paymentSuccess: document.getElementById('payment-success')
        };
    }

    /**
     * Initialize payment modal with booking data
     */
    initializePayment(bookingData) {
        this.currentBookingData = {
            gameTitle: bookingData.gameTitle,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            totalPrice: bookingData.totalPrice,
            gameId: bookingData.gameId,
            userId: bookingData.userId,
            username: bookingData.username
        };

        this.updatePaymentSummary();
        this.bindPaymentEvents();
        this.showPaymentModal();
    }

    /**
     * Update payment summary display
     */
    updatePaymentSummary() {
        if (!this.currentBookingData) return;

        const { gameTitle, startDate, endDate, totalPrice } = this.currentBookingData;
        
        this.elements.paymentGameTitle.textContent = gameTitle;
        this.elements.paymentDates.textContent = `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`;
        this.elements.paymentAmount.textContent = `$${totalPrice.toFixed(2)}`;
    }

    /**
     * Format date string to readable format
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    /**
     * Bind all payment-related events
     */
    bindPaymentEvents() {
        // Payment method selection
        this.elements.paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePaymentMethodChange(e));
        });

        // Confirm payment button
        if (this.elements.paymentConfirm) {
            this.elements.paymentConfirm.addEventListener('click', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }

        // Back button - return to booking modal
        if (this.elements.paymentBackBtn) {
            this.elements.paymentBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closePaymentModal();
                this.showBookingModal();
            });
        }

        // Close button
        if (this.elements.paymentCloseBtn) {
            this.elements.paymentCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closePaymentModal();
            });
        }

        // Card number formatting
        if (this.elements.cardNumber) {
            this.elements.cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Card expiry formatting
        if (this.elements.cardExpiry) {
            this.elements.cardExpiry.addEventListener('input', (e) => this.formatExpiry(e));
        }

        // Only allow numbers in CVC
        if (this.elements.cardCvc) {
            this.elements.cardCvc.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    /**
     * Handle payment method change
     */
    handlePaymentMethodChange(e) {
        const method = e.target.value;
        
        if (method === 'stripe') {
            this.elements.stripeForm.style.display = 'block';
            this.elements.paypalForm.style.display = 'none';
        } else if (method === 'paypal') {
            this.elements.stripeForm.style.display = 'none';
            this.elements.paypalForm.style.display = 'block';
        }
    }

    /**
     * Format card number with spaces
     */
    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    }

    /**
     * Format expiry date MM/YY
     */
    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        
        e.target.value = value;
    }

    /**
     * Validate payment inputs
     */
    validatePaymentInputs(method) {
        this.clearPaymentError();

        if (method === 'stripe') {
            // Validate card details
            if (!this.elements.cardName.value.trim()) {
                this.showPaymentError('Please enter cardholder name');
                return false;
            }

            if (!this.elements.cardNumber.value.replace(/\s/g, '').trim()) {
                this.showPaymentError('Please enter card number');
                return false;
            }

            if (!this.validateCardNumber(this.elements.cardNumber.value)) {
                this.showPaymentError('Please enter a valid card number');
                return false;
            }

            if (!this.elements.cardExpiry.value.trim()) {
                this.showPaymentError('Please enter expiry date (MM/YY)');
                return false;
            }

            if (!this.validateExpiry(this.elements.cardExpiry.value)) {
                this.showPaymentError('Card has expired or invalid format');
                return false;
            }

            if (!this.elements.cardCvc.value.trim() || this.elements.cardCvc.value.length < 3) {
                this.showPaymentError('Please enter valid CVC (3-4 digits)');
                return false;
            }
        } else if (method === 'paypal') {
            if (!this.elements.paypalEmail.value.trim()) {
                this.showPaymentError('Please enter your PayPal email');
                return false;
            }

            if (!this.validateEmail(this.elements.paypalEmail.value)) {
                this.showPaymentError('Please enter a valid email address');
                return false;
            }
        }

        return true;
    }

    /**
     * Validate card number using Luhn algorithm
     */
    validateCardNumber(cardNumber) {
        const digits = cardNumber.replace(/\D/g, '');
        
        if (digits.length < 13 || digits.length > 19) {
            return false;
        }

        // Simple Luhn check
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate expiry date
     */
    validateExpiry(expiry) {
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(expiry)) {
            return false;
        }

        const [month, year] = expiry.split('/');
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (expiryYear < currentYear) {
            return false;
        }

        if (expiryYear === currentYear && expiryMonth < currentMonth) {
            return false;
        }

        return true;
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Process payment
     */
    async processPayment() {
        if (this.isProcessing) return;

        const method = document.querySelector('input[name="payment-method"]:checked')?.value || 'stripe';

        // Validate inputs
        if (!this.validatePaymentInputs(method)) {
            return;
        }

        this.isProcessing = true;
        this.setPaymentLoading(true);

        try {
            const paymentData = {
                method: method,
                amount: this.currentBookingData.totalPrice,
                currency: 'USD',
                bookingData: {
                    userId: this.currentBookingData.userId,
                    username: this.currentBookingData.username,
                    gameId: this.currentBookingData.gameId,
                    startDate: this.currentBookingData.startDate,
                    endDate: this.currentBookingData.endDate
                }
            };

            // Add method-specific data
            if (method === 'stripe') {
                paymentData.card = {
                    name: this.elements.cardName.value,
                    number: this.elements.cardNumber.value.replace(/\s/g, ''),
                    expiry: this.elements.cardExpiry.value,
                    cvc: this.elements.cardCvc.value
                };
            } else if (method === 'paypal') {
                paymentData.paypal = {
                    email: this.elements.paypalEmail.value
                };
            }

            // Process payment through backend
            const response = await fetch('/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Payment failed');
            }

            const result = await response.json();

            // Show success message
            this.showPaymentSuccess(`Payment of $${this.currentBookingData.totalPrice.toFixed(2)} processed successfully! Booking confirmed.`);

            // Clear form
            this.clearPaymentForm();

            // Redirect after a delay
            setTimeout(() => {
                window.location.href = `/bookings/confirmation?bookingId=${result.bookingId}`;
            }, 2000);

        } catch (error) {
            console.error('Payment error:', error);
            this.showPaymentError(error.message || 'Payment processing failed. Please try again.');
        } finally {
            this.isProcessing = false;
            this.setPaymentLoading(false);
        }
    }

    /**
     * Show payment loading state
     */
    setPaymentLoading(isLoading) {
        if (isLoading) {
            this.elements.paymentConfirm.disabled = true;
            this.elements.paymentBtnText.style.display = 'none';
            this.elements.paymentLoading.style.display = 'flex';
        } else {
            this.elements.paymentConfirm.disabled = false;
            this.elements.paymentBtnText.style.display = 'block';
            this.elements.paymentLoading.style.display = 'none';
        }
    }

    /**
     * Show payment error message
     */
    showPaymentError(message) {
        this.elements.paymentError.textContent = message;
        this.elements.paymentError.style.display = 'block';
        this.elements.paymentSuccess.style.display = 'none';
    }

    /**
     * Show payment success message
     */
    showPaymentSuccess(message) {
        this.elements.paymentSuccess.textContent = message;
        this.elements.paymentSuccess.style.display = 'block';
        this.elements.paymentError.style.display = 'none';
    }

    /**
     * Clear payment error messages
     */
    clearPaymentError() {
        this.elements.paymentError.style.display = 'none';
        this.elements.paymentSuccess.style.display = 'none';
    }

    /**
     * Clear payment form
     */
    clearPaymentForm() {
        this.elements.cardName.value = '';
        this.elements.cardNumber.value = '';
        this.elements.cardExpiry.value = '';
        this.elements.cardCvc.value = '';
        this.elements.paypalEmail.value = '';
    }

    /**
     * Show payment modal
     */
    showPaymentModal() {
        if (this.elements.paymentModal) {
            this.elements.paymentModal.style.display = 'flex';
            this.elements.paymentModal.style.position = 'fixed';
            this.elements.paymentModal.style.inset = '0';
            this.elements.paymentModal.style.alignItems = 'center';
            this.elements.paymentModal.style.justifyContent = 'center';
            this.elements.paymentModal.style.background = 'rgba(0, 0, 0, 0.7)';
            this.elements.paymentModal.style.zIndex = '1000';
        }
    }

    /**
     * Close payment modal
     */
    closePaymentModal() {
        if (this.elements.paymentModal) {
            this.elements.paymentModal.style.display = 'none';
        }
        this.clearPaymentForm();
        this.clearPaymentError();
    }

    /**
     * Show booking modal
     */
    showBookingModal() {
        if (this.elements.bookingModal) {
            this.elements.bookingModal.style.display = 'flex';
        }
    }

    /**
     * Close booking modal
     */
    closeBookingModal() {
        if (this.elements.bookingModal) {
            this.elements.bookingModal.style.display = 'none';
        }
    }
}

// Initialize payment processor globally
const PaymentManager = new PaymentProcessor();
