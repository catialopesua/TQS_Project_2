/**
 * Payment Confirmation Page Handler
 */

class PaymentConfirmation {
    constructor() {
        this.bookingId = null;
        this.bookingData = null;
        this.init();
    }

    async init() {
        BitSwapUtils.init();
        this.getBookingIdFromUrl();

        if (this.bookingId) {
            await this.loadBookingDetails();
        } else {
            this.showError('No booking ID provided');
        }

        this.bindEvents();
    }

    getBookingIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.bookingId = urlParams.get('bookingId');
    }

    async loadBookingDetails() {
        try {
            // Fetch booking details
            const response = await fetch(`/bookings/${this.bookingId}`);

            if (!response.ok) {
                throw new Error('Booking not found');
            }

            this.bookingData = await response.json();
            this.displayBookingDetails();

        } catch (error) {
            console.error('Error loading booking:', error);
            this.showError('Unable to load booking details. Please try again later.');
        }
    }

    displayBookingDetails() {
        const detailsCard = document.getElementById('booking-details');
        if (!detailsCard) return;

        const startDate = new Date(this.bookingData.startDate);
        const endDate = new Date(this.bookingData.endDate);
        const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        const detailsHTML = `
            <div class="detail-row">
                <span class="detail-label">Booking ID</span>
                <span class="detail-value confirmation-code">#${this.bookingData.bookingId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="status-badge">CONFIRMED</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Game</span>
                <span class="detail-value">${this.escapeHtml(this.bookingData.game?.title || 'N/A')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Rental Period</span>
                <span class="detail-value">${this.formatDate(startDate)} to ${this.formatDate(endDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${daysCount} day${daysCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="detail-row total">
                <span class="detail-label">Total Paid</span>
                <span class="detail-value highlight">$${this.bookingData.totalPrice.toFixed(2)}</span>
            </div>
        `;

        detailsCard.innerHTML = detailsHTML;
        detailsCard.classList.add('loaded');
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const detailsCard = document.getElementById('booking-details');

        if (detailsCard) {
            detailsCard.style.display = 'none';
        }

        if (errorMessage) {
            errorMessage.textContent = message;
        }

        if (errorState) {
            errorState.style.display = 'block';
        }
    }

    bindEvents() {
        // View bookings button
        const viewBookingsBtn = document.getElementById('view-bookings-btn');
        if (viewBookingsBtn) {
            viewBookingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Navigate to bookings page (or profile page with bookings section)
                window.location.href = '/profile';
            });
        }

        // Sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                BitSwapUtils.signOut();
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PaymentConfirmation();
});
