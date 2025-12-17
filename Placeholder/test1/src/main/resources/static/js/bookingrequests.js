/**
 * Booking Requests Page Manager
 */

class BookingRequestsManager {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentFilter = 'pending';
        this.currentUser = null;
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            requestsGrid: document.getElementById('requestsGrid'),
            emptyState: document.getElementById('emptyState'),
            loadingState: document.getElementById('loadingState'),
            searchInput: document.getElementById('searchRequests'),
            statusFilter: document.getElementById('statusFilter'),
            totalRequests: document.getElementById('totalRequests'),
            pendingRequests: document.getElementById('pendingRequests'),
            approvedRequests: document.getElementById('approvedRequests'),
            confirmModal: document.getElementById('confirmationModal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalIcon: document.getElementById('modal-icon'),
            modalConfirm: document.getElementById('modal-confirm'),
            modalCancel: document.getElementById('modal-cancel'),
            signOutBtn: document.getElementById('sign-out-btn')
        };
    }

    async init() {
        BitSwapUtils.init();
        this.getCurrentUser();

        // Set current filter from dropdown value
        if (this.elements.statusFilter) {
            this.currentFilter = this.elements.statusFilter.value;
        }

        await this.loadBookings();
        this.bindEvents();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            window.location.href = '/login';
            return;
        }
        this.currentUser = JSON.parse(userData);
    }

    async loadBookings() {
        try {
            this.showLoading();

            const response = await fetch(`/bookings/owner/${this.currentUser.username}`);
            if (!response.ok) {
                throw new Error('Failed to load bookings');
            }

            this.bookings = await response.json();
            console.log('Loaded bookings:', this.bookings);
            console.log('Booking statuses:', this.bookings.map(b => ({ id: b.bookingId, status: b.status })));
            this.filterBookings();
            this.updateStats();
            this.renderBookings();

        } catch (error) {
            console.error('Error loading bookings:', error);
            this.showError('Failed to load booking requests');
        }
    }

    filterBookings() {
        const searchTerm = this.elements.searchInput?.value?.toLowerCase() || '';
        const status = this.currentFilter;

        this.filteredBookings = this.bookings.filter(booking => {
            // Handle null/undefined status by defaulting to 'PENDING'
            const bookingStatus = booking.status || 'PENDING';

            const matchesSearch = !searchTerm ||
                booking.game.title.toLowerCase().includes(searchTerm) ||
                booking.user.username.toLowerCase().includes(searchTerm);

            const matchesStatus = status === 'all' || bookingStatus === status.toUpperCase();

            return matchesSearch && matchesStatus;
        });

        console.log('Filter status:', status);
        console.log('Filtered bookings:', this.filteredBookings.length, 'out of', this.bookings.length);
    }

    updateStats() {
        const total = this.bookings.length;
        // Handle null/undefined status by defaulting to 'PENDING'
        const pending = this.bookings.filter(b => (b.status || 'PENDING') === 'PENDING').length;
        const approved = this.bookings.filter(b => b.status === 'APPROVED').length;

        this.elements.totalRequests.textContent = total;
        this.elements.pendingRequests.textContent = pending;
        this.elements.approvedRequests.textContent = approved;
    }

    renderBookings() {
        this.hideLoading();

        if (this.filteredBookings.length === 0) {
            this.elements.requestsGrid.style.display = 'none';
            this.elements.emptyState.style.display = 'flex';
            return;
        }

        this.elements.emptyState.style.display = 'none';
        this.elements.requestsGrid.style.display = 'grid';
        this.elements.requestsGrid.innerHTML = '';

        this.filteredBookings.forEach(booking => {
            const card = this.createBookingCard(booking);
            this.elements.requestsGrid.appendChild(card);
        });
    }

    createBookingCard(booking) {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.dataset.bookingId = booking.bookingId;

        const startDate = new Date(booking.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const endDate = new Date(booking.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Get first photo if available
        const gamePhoto = booking.game.photos && booking.game.photos.trim() !== ''
            ? booking.game.photos.split(',')[0].trim()
            : '/images/placeholder.png';

        // Get first letter of username for avatar
        const avatarLetter = booking.user.username.charAt(0).toUpperCase();

        card.innerHTML = `
            <div class="card-header">
                <img src="${gamePhoto}" alt="${booking.game.title}" class="game-thumbnail" 
                     onerror="this.src='/images/placeholder.png'">
                <div class="card-info">
                    <h3 class="game-title">${booking.game.title}</h3>
                    <span class="request-status ${booking.status.toLowerCase()}">${this.getStatusText(booking.status)}</span>
                </div>
            </div>

            <div class="renter-info">
                <div class="renter-avatar">${avatarLetter}</div>
                <div class="renter-details">
                    <div class="renter-name">${booking.user.username}</div>
                </div>
            </div>

            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Dates:</span>
                    <div class="rental-dates">
                        <span>${startDate}</span>
                        <span class="date-arrow">→</span>
                        <span>${endDate}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Price:</span>
                    <span class="detail-value highlight">$${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Daily Rate:</span>
                    <span class="detail-value">$${booking.game.pricePerDay.toFixed(2)}/day</span>
                </div>
            </div>

            ${this.getActionButtons(booking)}
        `;

        return card;
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': 'Pending Review',
            'APPROVED': 'Approved',
            'DECLINED': 'Declined'
        };
        return statusMap[status] || status;
    }

    getActionButtons(booking) {
        if (booking.status === 'PENDING') {
            return `
                <div class="card-actions">
                    <button class="action-btn approve-btn" data-action="approve" data-booking-id="${booking.bookingId}">
                        <span class="btn-text">Approve</span>
                    </button>
                    <button class="action-btn decline-btn" data-action="decline" data-booking-id="${booking.bookingId}">
                        <span class="btn-text">Decline</span>
                    </button>
                </div>
            `;
        } else if (booking.status === 'APPROVED') {
            return `
                <div class="card-actions">
                    <div style="text-align: center; padding: var(--space-md); color: var(--accent-tertiary); font-weight: 600;">
                        This booking has been approved
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="card-actions">
                    <div style="text-align: center; padding: var(--space-md); color: var(--accent-secondary); font-weight: 600;">
                        This booking has been declined
                    </div>
                </div>
            `;
        }
    }

    bindEvents() {
        // Search
        this.elements.searchInput?.addEventListener('input', () => {
            this.filterBookings();
            this.renderBookings();
        });

        // Status filter
        this.elements.statusFilter?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterBookings();
            this.renderBookings();
        });

        // Action buttons (using event delegation)
        this.elements.requestsGrid?.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const bookingId = parseInt(button.dataset.bookingId);

            if (action === 'approve') {
                this.showConfirmModal('Approve Booking',
                    'Are you sure you want to approve this booking request?',
                    () => this.updateBookingStatus(bookingId, 'APPROVED'));
            } else if (action === 'decline') {
                this.showConfirmModal('Decline Booking',
                    'Are you sure you want to decline this booking request?',
                    () => this.updateBookingStatus(bookingId, 'DECLINED'));
            }
        });

        // Modal buttons
        this.elements.modalCancel?.addEventListener('click', () => {
            this.hideConfirmModal();
        });

        // Sign out
        this.elements.signOutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bitswap_demo_user');
            window.location.href = '/login';
        });
    }

    async updateBookingStatus(bookingId, status) {
        try {
            this.hideConfirmModal();

            console.log('Updating booking:', bookingId, 'to status:', status);

            const response = await fetch(`/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to update booking status');
            }

            const updatedBooking = await response.json();
            console.log('Updated booking:', updatedBooking);

            // Update local data
            const index = this.bookings.findIndex(b => b.bookingId === bookingId);
            if (index !== -1) {
                this.bookings[index] = updatedBooking;
            }

            this.filterBookings();
            this.updateStats();
            this.renderBookings();

            this.showToast(`Booking ${status.toLowerCase()} successfully!`, 'success');

        } catch (error) {
            console.error('Error updating booking status:', error);
            this.showToast(error.message || 'Failed to update booking status', 'error');
        }
    }

    showConfirmModal(title, message, onConfirm) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;
        this.elements.confirmModal.style.display = 'flex';

        // Remove previous listeners
        const newConfirmBtn = this.elements.modalConfirm.cloneNode(true);
        this.elements.modalConfirm.parentNode.replaceChild(newConfirmBtn, this.elements.modalConfirm);
        this.elements.modalConfirm = newConfirmBtn;

        this.elements.modalConfirm.addEventListener('click', () => {
            onConfirm();
        });
    }

    hideConfirmModal() {
        this.elements.confirmModal.style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.requestsGrid.style.display = 'none';
        this.elements.emptyState.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.showToast(message, 'error');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BookingRequestsManager();
});
