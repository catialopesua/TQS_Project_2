/**
 * Admin Dashboard Manager
 */

class AdminDashboard {
    constructor() {
        this.allListings = [];
        this.allUsers = [];
        this.filteredListings = [];
        this.filteredUsers = [];
        this.selectedGameId = null;
        this.selectedUserId = null;
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            // Metrics
            totalListings: document.getElementById('total-listings'),
            availableGames: document.getElementById('available-games'),
            rentedGames: document.getElementById('rented-games'),
            totalUsers: document.getElementById('total-users'),
            avgPrice: document.getElementById('avg-price'),
            activityRate: document.getElementById('activity-rate'),

            // Listings
            searchInput: document.getElementById('search-listings'),
            loadingState: document.getElementById('loading-state'),
            emptyState: document.getElementById('empty-state'),
            tableContainer: document.getElementById('listings-table-container'),
            tableBody: document.getElementById('listings-table-body'),
            showingText: document.getElementById('showing-text'),

            // Modal
            deleteModal: document.getElementById('delete-modal'),
            deleteGameInfo: document.getElementById('delete-game-info'),
            confirmDelete: document.getElementById('confirm-delete'),
            cancelDelete: document.getElementById('cancel-delete'),
            closeModal: document.getElementById('close-modal'),

            // Users
            searchUsers: document.getElementById('search-users'),
            usersLoadingState: document.getElementById('users-loading-state'),
            usersEmptyState: document.getElementById('users-empty-state'),
            usersTableContainer: document.getElementById('users-table-container'),
            usersTableBody: document.getElementById('users-table-body'),
            usersShowingText: document.getElementById('users-showing-text'),

            // Ban Modal
            banUserModal: document.getElementById('ban-user-modal'),
            banUserInfo: document.getElementById('ban-user-info'),
            confirmBan: document.getElementById('confirm-ban'),
            cancelBan: document.getElementById('cancel-ban'),
            closeBanModal: document.getElementById('close-ban-modal'),

            // Other
            signOutBtn: document.getElementById('sign-out-btn')
        };
    }

    async init() {
        // Check if user is admin
        this.checkAdminAccess();

        // Initialize utilities
        BitSwapUtils.init();

        // Load data
        await this.loadAllData();

        // Bind events
        this.bindEvents();
    }

    checkAdminAccess() {
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);
        if (user.username !== 'Admin1') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/listings';
        }
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadMetrics(),
                this.loadListings(),
                this.loadUsers()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadMetrics() {
        try {
            // Fetch games and users
            const [gamesResponse, usersResponse] = await Promise.all([
                fetch('/games'),
                fetch('/users')
            ]);

            if (!gamesResponse.ok || !usersResponse.ok) {
                throw new Error('Failed to fetch metrics data');
            }

            const games = await gamesResponse.json();
            const users = await usersResponse.json();

            // Calculate metrics
            const totalListings = games.length;
            const availableGames = games.filter(g => g.active).length;
            const rentedGames = games.filter(g => !g.active).length;
            const totalUsers = users.length;

            // Calculate average price
            const avgPrice = games.length > 0
                ? games.reduce((sum, g) => sum + g.pricePerDay, 0) / games.length
                : 0;

            // Calculate activity rate (% of rented games)
            const activityRate = totalListings > 0
                ? ((rentedGames / totalListings) * 100).toFixed(1)
                : 0;

            // Update UI
            this.elements.totalListings.textContent = totalListings;
            this.elements.availableGames.textContent = availableGames;
            this.elements.rentedGames.textContent = rentedGames;
            this.elements.totalUsers.textContent = totalUsers;
            this.elements.avgPrice.textContent = `$${avgPrice.toFixed(2)}`;
            this.elements.activityRate.textContent = `${activityRate}%`;

        } catch (error) {
            console.error('Error loading metrics:', error);
            this.showMetricsError();
        }
    }

    showMetricsError() {
        const elements = [
            this.elements.totalListings,
            this.elements.availableGames,
            this.elements.rentedGames,
            this.elements.totalUsers,
            this.elements.avgPrice,
            this.elements.activityRate
        ];

        elements.forEach(el => {
            if (el) el.textContent = 'Error';
        });
    }

    async loadListings() {
        try {
            this.showLoading();

            const response = await fetch('/games');
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            this.allListings = await response.json();
            this.filteredListings = [...this.allListings];

            if (this.allListings.length === 0) {
                this.showEmpty();
            } else {
                this.renderListings();
            }

        } catch (error) {
            console.error('Error loading listings:', error);
            this.showEmpty();
        }
    }

    renderListings() {
        if (this.filteredListings.length === 0) {
            this.showEmpty();
            return;
        }

        this.hideLoading();
        this.hideEmpty();
        this.elements.tableContainer.style.display = 'block';

        // Clear existing rows
        this.elements.tableBody.innerHTML = '';

        // Render each listing
        this.filteredListings.forEach(game => {
            const row = this.createListingRow(game);
            this.elements.tableBody.appendChild(row);
        });

        // Update footer text
        this.elements.showingText.textContent =
            `Showing ${this.filteredListings.length} of ${this.allListings.length} listings`;
    }

    createListingRow(game) {
        const row = document.createElement('tr');

        const statusClass = game.active ? 'available' : 'rented';
        const statusText = game.active ? 'Available' : 'Rented';

        const createdDate = new Date(game.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        row.innerHTML = `
            <td>${game.gameId}</td>
            <td class="game-title-cell">${this.escapeHtml(game.title)}</td>
            <td>${this.escapeHtml(game.ownerUsername || 'Unknown')}</td>
            <td class="price-cell">$${game.pricePerDay.toFixed(2)}</td>
            <td><span class="condition-badge">${this.escapeHtml(game.condition)}</span></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${createdDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon danger delete-btn" data-id="${game.gameId}" title="Delete Listing">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;

        // Add event listeners
        const deleteBtn = row.querySelector('.delete-btn');

        deleteBtn.addEventListener('click', () => this.handleDeleteClick(game));

        return row;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleViewGame(gameId) {
        window.location.href = `/gamedetails?id=${gameId}`;
    }

    handleDeleteClick(game) {
        this.selectedGameId = game.gameId;

        // Update modal with game info
        this.elements.deleteGameInfo.innerHTML = `
            <strong>Game:</strong> ${this.escapeHtml(game.title)}<br>
            <strong>Owner:</strong> ${this.escapeHtml(game.ownerUsername || 'Unknown')}<br>
            <strong>Price:</strong> $${game.pricePerDay.toFixed(2)}/day
        `;

        // Show modal
        this.showModal();
    }

    showModal() {
        this.elements.deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.elements.deleteModal.style.display = 'none';
        document.body.style.overflow = '';
        this.selectedGameId = null;
    }

    async handleConfirmDelete() {
        if (!this.selectedGameId) return;

        try {
            const response = await fetch(`/games/${this.selectedGameId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete listing');
            }

            // Success - reload data
            this.hideModal();
            await this.loadAllData();

            // Show success message
            this.showNotification('Listing deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting listing:', error);
            this.showNotification('Failed to delete listing', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--accent-tertiary)' : 'var(--accent-secondary)'};
            color: var(--bg);
            border-radius: var(--radius-md);
            font-family: var(--font-primary);
            font-weight: 600;
            z-index: 2000;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            this.filteredListings = [...this.allListings];
        } else {
            this.filteredListings = this.allListings.filter(game => {
                const title = (game.title || '').toLowerCase();
                const owner = (game.ownerUsername || '').toLowerCase();
                return title.includes(searchTerm) || owner.includes(searchTerm);
            });
        }

        this.renderListings();
    }

    async loadUsers() {
        try {
            this.showUsersLoading();

            const response = await fetch('/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            this.allUsers = await response.json();
            this.filteredUsers = [...this.allUsers];

            if (this.allUsers.length === 0) {
                this.showUsersEmpty();
            } else {
                this.renderUsers();
            }

        } catch (error) {
            console.error('Error loading users:', error);
            this.showUsersEmpty();
        }
    }

    renderUsers() {
        if (this.filteredUsers.length === 0) {
            this.showUsersEmpty();
            return;
        }

        this.hideUsersLoading();
        this.hideUsersEmpty();
        this.elements.usersTableContainer.style.display = 'block';

        this.elements.usersTableBody.innerHTML = '';

        this.filteredUsers.forEach(user => {
            const row = this.createUserRow(user);
            this.elements.usersTableBody.appendChild(row);
        });

        this.elements.usersShowingText.textContent =
            `Showing ${this.filteredUsers.length} of ${this.allUsers.length} users`;
    }

    createUserRow(user) {
        const row = document.createElement('tr');

        const userId = user.userId || user.id || '';

        row.innerHTML = `
            <td>${userId}</td>
            <td class="game-title-cell">${this.escapeHtml(user.username || '')}</td>
            <td>${this.escapeHtml(user.role || 'renter')}</td>
            <td>${this.escapeHtml(user.bio || '')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon danger ban-user-btn" data-id="${userId}" title="Ban User">
                        🚫 Ban
                    </button>
                </div>
            </td>
        `;

        const banBtn = row.querySelector('.ban-user-btn');
        if (banBtn) {
            banBtn.addEventListener('click', () => this.handleBanUserClick(user));
        }

        return row;
    }

    handleBanUserClick(user) {
        const userId = user.userId || user.id || null;
        this.selectedUserId = userId;

        if (!this.elements.banUserInfo) {
            this.elements.banUserInfo = document.getElementById('ban-user-info');
        }
        if (!this.elements.banUserModal) {
            this.elements.banUserModal = document.getElementById('ban-user-modal');
        }

        if (this.elements.banUserInfo) {
            this.elements.banUserInfo.innerHTML = `
                <strong>Username:</strong> ${this.escapeHtml(user.username || 'Unknown')}<br>
                <strong>Role:</strong> ${this.escapeHtml(user.role || 'renter')}
            `;
        }

        this.showBanModal();
    }

    showBanModal() {
        if (!this.elements.banUserModal) {
            this.elements.banUserModal = document.getElementById('ban-user-modal');
        }
        if (!this.elements.banUserModal) return;
        this.elements.banUserModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideBanModal() {
        if (!this.elements.banUserModal) return;
        this.elements.banUserModal.style.display = 'none';
        document.body.style.overflow = '';
        this.selectedUserId = null;
    }

    async handleConfirmBan() {
        if (!this.selectedUserId) return;

        try {
            const response = await fetch(`/users/${this.selectedUserId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to ban user');
            }

            this.hideBanModal();
            await this.loadAllData();
            this.showNotification('User banned successfully', 'success');

        } catch (error) {
            console.error('Error banning user:', error);
            this.showNotification('Failed to ban user', 'error');
        }
    }

    handleUserSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            this.filteredUsers = [...this.allUsers];
        } else {
            this.filteredUsers = this.allUsers.filter(user => {
                const username = (user.username || '').toLowerCase();
                return username.includes(searchTerm);
            });
        }

        this.renderUsers();
    }

    showUsersLoading() {
        this.elements.usersLoadingState.style.display = 'flex';
        this.elements.usersEmptyState.style.display = 'none';
        this.elements.usersTableContainer.style.display = 'none';
    }

    hideUsersLoading() {
        this.elements.usersLoadingState.style.display = 'none';
    }

    showUsersEmpty() {
        this.elements.usersLoadingState.style.display = 'none';
        this.elements.usersEmptyState.style.display = 'flex';
        this.elements.usersTableContainer.style.display = 'none';
    }

    hideUsersEmpty() {
        this.elements.usersEmptyState.style.display = 'none';
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.emptyState.style.display = 'none';
        this.elements.tableContainer.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    }

    showEmpty() {
        this.elements.loadingState.style.display = 'none';
        this.elements.emptyState.style.display = 'flex';
        this.elements.tableContainer.style.display = 'none';
    }

    hideEmpty() {
        this.elements.emptyState.style.display = 'none';
    }

    bindEvents() {
        // Search
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Modal controls
        this.elements.confirmDelete?.addEventListener('click', () => {
            this.handleConfirmDelete();
        });

        this.elements.cancelDelete?.addEventListener('click', () => {
            this.hideModal();
        });

        this.elements.closeModal?.addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal on overlay click
        this.elements.deleteModal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.deleteModal.style.display === 'flex') {
                this.hideModal();
            }
        });

        // Sign out
        this.elements.signOutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bitswap_demo_user');
            window.location.href = '/login';
        });

        // Users search
        this.elements.searchUsers?.addEventListener('input', (e) => {
            this.handleUserSearch(e.target.value);
        });

        // Ban user modal controls
        this.elements.confirmBan?.addEventListener('click', () => {
            this.handleConfirmBan();
        });

        this.elements.cancelBan?.addEventListener('click', () => {
            this.hideBanModal();
        });

        this.elements.closeBanModal?.addEventListener('click', () => {
            this.hideBanModal();
        });

        this.elements.banUserModal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.hideBanModal();
        });
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
