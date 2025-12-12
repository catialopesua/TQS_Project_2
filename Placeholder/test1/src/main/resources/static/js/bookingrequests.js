/* ========================
   BOOKING REQUESTS JAVASCRIPT
   ======================== */

// Booking Requests Manager Class
class BookingRequestsManager {
    constructor() {
        this.requests = [];
        this.filteredRequests = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.isLoading = false;

        this.init();
    }

    async init() {
        console.log('Initializing BookingRequestsManager...');

        // Initialize BitSwap utilities
        if (window.BitSwapUtils) {
            window.BitSwapUtils.init();
        }

        // Set up event listeners
        this.setupEventListeners();

        // Update active nav item
        this.updateActiveNav();

        // Load initial data
        await this.loadBookingRequests();

        console.log('BookingRequestsManager initialized successfully');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchRequests');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterAndDisplayRequests();
            });
        }

        // Filter dropdown
        const filterSelect = document.getElementById('statusFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterAndDisplayRequests();
            });
        }



        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('bitswap_demo_user');
                window.location.href = '/login';
            });
        }
    }

    updateActiveNav() {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link if it exists
        const currentLink = document.querySelector('.nav-link[href="bookingrequests.html"]');
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    async loadBookingRequests() {
        try {
            // Mock data - in real app, this would come from your backend
            this.requests = this.generateMockRequests();
            this.filteredRequests = [...this.requests];

            this.updateStats();
            this.filterAndDisplayRequests();

        } catch (error) {
            console.error('Error loading booking requests:', error);
            this.showToast('Failed to load booking requests', 'error');
        }
    }

    generateMockRequests() {
        const games = [
            { title: 'Cyberpunk 2077', thumbnail: 'assets/game1.jpg' },
            { title: 'The Witcher 3', thumbnail: 'assets/game2.jpg' },
            { title: 'Call of Duty: MW3', thumbnail: 'assets/game3.jpg' },
            { title: 'FIFA 24', thumbnail: 'assets/game4.jpg' },
            { title: 'Grand Theft Auto V', thumbnail: 'assets/game5.jpg' },
            { title: 'Red Dead Redemption 2', thumbnail: 'assets/game6.jpg' }
        ];

        const renters = [
            { name: 'Alex Johnson', rating: 4.8, reviews: 15 },
            { name: 'Sarah Wilson', rating: 4.9, reviews: 23 },
            { name: 'Mike Chen', rating: 4.5, reviews: 8 },
            { name: 'Emma Davis', rating: 4.7, reviews: 12 },
            { name: 'David Brown', rating: 4.6, reviews: 19 },
            { name: 'Lisa Garcia', rating: 4.9, reviews: 31 }
        ];

        const statuses = ['pending', 'pending', 'pending', 'approved', 'declined'];

        return Array.from({ length: 12 }, (_, i) => {
            const game = games[i % games.length];
            const renter = renters[i % renters.length];
            const status = statuses[i % statuses.length];
            const requestDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const startDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
            const duration = Math.floor(Math.random() * 14) + 1;
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

            return {
                id: `req-${i + 1}`,
                gameTitle: game.title,
                gameThumbnail: game.thumbnail,
                renterName: renter.name,
                renterRating: renter.rating,
                renterReviews: renter.reviews,
                status: status,
                requestDate: requestDate,
                startDate: startDate,
                endDate: endDate,
                duration: duration,
                totalPrice: Math.floor(Math.random() * 50) + 15,
                message: 'Looking forward to playing this game! I take great care of borrowed items and will return on time.'
            };
        });
    }

    filterAndDisplayRequests() {
        // Apply filters
        this.filteredRequests = this.requests.filter(request => {
            // Status filter
            if (this.currentFilter !== 'all' && request.status !== this.currentFilter) {
                return false;
            }

            // Search filter
            if (this.searchQuery) {
                const searchableText = `${request.gameTitle} ${request.renterName}`.toLowerCase();
                if (!searchableText.includes(this.searchQuery)) {
                    return false;
                }
            }

            return true;
        });

        // Display results
        this.displayRequests();
        this.updateStats();
    }



    displayRequests() {
        const container = document.getElementById('requestsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Show empty state if no requests
        if (this.filteredRequests.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Create request cards
        this.filteredRequests.forEach((request, index) => {
            const card = this.createRequestCard(request, index);
            container.appendChild(card);
        });

        // Add fade-in animation
        container.querySelectorAll('.request-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    createRequestCard(request, index) {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="card-header">
                <img src="${request.gameThumbnail}" alt="${request.gameTitle}" class="game-thumbnail" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMWExYTFhIi8+Cjxwb2x5Z29uIHBvaW50cz0iMzIsMjQgNDgsMzIgNDgsNDggMzIsNTYgMjQsNDggMjQsMzIiIGZpbGw9IiM0YWUwZmYiLz4KPC9zdmc+'">
                <div class="card-info">
                    <h4 class="game-title">${request.gameTitle}</h4>
                    <span class="request-status ${request.status}">${request.status}</span>
                </div>
            </div>
            
            <div class="renter-info">
                <div class="renter-avatar">${request.renterName.charAt(0)}</div>
                <div class="renter-details">
                    <div class="renter-name">${request.renterName}</div>
                    <div class="renter-rating">
                        <span class="rating-stars">★</span>
                        ${request.renterRating} (${request.renterReviews} reviews)
                    </div>
                </div>
            </div>
            
            <div class="card-details">
                <div class="detail-row">
                    <span class="detail-label">Requested:</span>
                    <span class="detail-value">${this.formatDate(request.requestDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${request.duration} day${request.duration > 1 ? 's' : ''}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">€${request.totalPrice}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Rental Period:</span>
                    <div class="rental-dates">
                        ${this.formatDate(request.startDate)}
                        <span class="date-arrow">→</span>
                        ${this.formatDate(request.endDate)}
                    </div>
                </div>
            </div>
            
            ${request.status === 'pending' ? this.createActionButtons(request.id) : ''}
        `;

        return card;
    }

    createActionButtons(requestId) {
        return `
            <div class="card-actions">
                <button class="action-btn approve-btn" onclick="bookingManager.approveRequest('${requestId}')">
                    <span class="btn-loader"></span>
                    <span class="btn-text">Approve</span>
                </button>
                <button class="action-btn decline-btn" onclick="bookingManager.declineRequest('${requestId}')">
                    <span class="btn-loader"></span>
                    <span class="btn-text">Decline</span>
                </button>
            </div>
        `;
    }

    async approveRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;

        const success = await this.showConfirmationModal(
            'approve',
            `Approve rental request for "${request.gameTitle}"?`,
            `This will confirm the booking from ${this.formatDate(request.startDate)} to ${this.formatDate(request.endDate)}.`
        );

        if (success) {
            await this.updateRequestStatus(requestId, 'approved');
            this.showToast(`Rental request for "${request.gameTitle}" has been approved!`, 'success');
        }
    }

    async declineRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (!request) return;

        const success = await this.showConfirmationModal(
            'decline',
            `Decline rental request for "${request.gameTitle}"?`,
            'This action cannot be undone. The renter will be notified.'
        );

        if (success) {
            await this.updateRequestStatus(requestId, 'declined');
            this.showToast(`Rental request for "${request.gameTitle}" has been declined.`, 'error');
        }
    }

    async updateRequestStatus(requestId, newStatus) {
        // Find and update the request
        const requestIndex = this.requests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        // Show loading on the specific buttons
        const card = document.querySelector(`[onclick*="${requestId}"]`)?.closest('.request-card');
        if (card) {
            const buttons = card.querySelectorAll('.action-btn');
            buttons.forEach(btn => {
                btn.classList.add('loading');
                btn.disabled = true;
            });
        }

        try {
            // Simulate API call
            await this.delay(1000);

            // Update the request
            this.requests[requestIndex].status = newStatus;

            // Refresh display
            this.filterAndDisplayRequests();

        } catch (error) {
            console.error('Error updating request status:', error);
            this.showToast('Failed to update request status', 'error');
        }
    }

    showConfirmationModal(action, title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmationModal');
            const modalIcon = modal.querySelector('.modal-icon');
            const modalTitle = modal.querySelector('h3');
            const modalMessage = modal.querySelector('p');
            const confirmBtn = modal.querySelector('.btn-primary');
            const cancelBtn = modal.querySelector('.btn-secondary');

            // Set modal content
            modalIcon.textContent = action === 'approve' ? '✓' : '✕';
            modalIcon.style.color = action === 'approve' ? 'var(--success)' : 'var(--error)';
            modalTitle.textContent = title;
            modalMessage.textContent = message;

            confirmBtn.textContent = action === 'approve' ? 'Approve' : 'Decline';
            confirmBtn.className = `btn ${action === 'approve' ? 'btn-primary' : 'btn-danger'}`;

            // Show modal
            modal.style.display = 'flex';

            // Set up event handlers
            const handleConfirm = () => {
                this.closeModal();
                resolve(true);
            };

            const handleCancel = () => {
                this.closeModal();
                resolve(false);
            };

            // Remove existing listeners
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;

            // Add new listeners
            confirmBtn.onclick = handleConfirm;
            cancelBtn.onclick = handleCancel;
        });
    }

    closeModal() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateStats() {
        const totalCount = document.getElementById('totalRequests');
        const pendingCount = document.getElementById('pendingRequests');
        const approvedCount = document.getElementById('approvedRequests');

        if (totalCount) {
            totalCount.textContent = this.requests.length;
        }

        if (pendingCount) {
            const pending = this.requests.filter(r => r.status === 'pending').length;
            pendingCount.textContent = pending;
        }

        if (approvedCount) {
            const approved = this.requests.filter(r => r.status === 'approved').length;
            approvedCount.textContent = approved;
        }
    }

    showLoading() {
        this.isLoading = true;
        const loadingState = document.getElementById('loadingState');
        const requestsGrid = document.getElementById('requestsGrid');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.style.display = 'flex';
        if (requestsGrid) requestsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
    }

    hideLoading() {
        this.isLoading = false;
        const loadingState = document.getElementById('loadingState');
        const requestsGrid = document.getElementById('requestsGrid');

        if (loadingState) loadingState.style.display = 'none';
        if (requestsGrid) requestsGrid.style.display = 'grid';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span>${message}</span>
        `;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            // Show toast
            setTimeout(() => toast.classList.add('show'), 100);

            // Auto-remove after 4 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingRequestsManager();
});

// Export for global access
window.BookingRequestsManager = BookingRequestsManager;