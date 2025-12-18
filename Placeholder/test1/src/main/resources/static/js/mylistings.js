/* ========================
   MY LISTINGS JS
   ======================== */

let allListings = [];
let filteredListings = [];
let currentFilter = 'all';
let editingTags = [];
let gameToDelete = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize shared functionality
    BitSwapUtils.init();

    // Load user's listings
    loadListings();

    // Initialize filter tabs
    initFilterTabs();

    // Initialize search
    initSearch();
});

/* ========================
   LOAD LISTINGS
   ======================== */

async function loadListings() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const listingsGrid = document.getElementById('listings-grid');

    try {
        // Get logged-in user from localStorage
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');
        const username = currentUser.username;

        if (!username) {
            console.error('No user logged in');
            showEmptyState();
            return;
        }

        // Fetch user's listings
        const response = await fetch(`/games/owner/${username}`);

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        allListings = await response.json();
        filteredListings = [...allListings];

        // Hide loading, show content
        loadingState.style.display = 'none';

        if (allListings.length === 0) {
            showEmptyState();
        } else {
            emptyState.style.display = 'none';
            updateStats();
            renderListings();
        }

    } catch (error) {
        console.error('Error loading listings:', error);
        loadingState.style.display = 'none';
        showEmptyState();
    }
}

function showEmptyState() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('listings-grid').innerHTML = '';
}

/* ========================
   UPDATE STATS
   ======================== */

function updateStats() {
    const total = allListings.length;
    const active = allListings.filter(g => g.active).length;
    const inactive = total - active;

    document.getElementById('total-listings').textContent = total;
    document.getElementById('active-listings').textContent = active;
    document.getElementById('inactive-listings').textContent = inactive;
}

/* ========================
   RENDER LISTINGS
   ======================== */

function renderListings() {
    const listingsGrid = document.getElementById('listings-grid');

    if (filteredListings.length === 0) {
        listingsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🔍</div>
                <h3>No listings found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }

    listingsGrid.innerHTML = filteredListings.map(game => createListingCard(game)).join('');
}

function createListingCard(game) {
    const photos = game.photos ? game.photos.split(',') : [];
    const firstPhoto = photos.length > 0 ? photos[0] : null;
    const tags = game.tags ? game.tags.split(',').filter(t => t.trim()) : [];

    const tagsHtml = tags.length > 0
        ? tags.slice(0, 3).map(tag => `<span class="listing-tag">${tag.trim()}</span>`).join('')
        : '<span class="listing-tag">No tags</span>';

    return `
        <div class="listing-card" data-game-id="${game.gameId}">
            <div class="listing-image">
                ${firstPhoto
            ? `<img src="${firstPhoto}" alt="${game.title}">`
            : `<div class="listing-placeholder">🎮</div>`
        }
                <span class="listing-status-badge ${game.active ? 'active' : 'inactive'}">
                    ${game.active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="listing-content">
                <h3 class="listing-title">${escapeHtml(game.title)}</h3>
                <p class="listing-description">${escapeHtml(game.description)}</p>
                <div class="listing-tags">
                    ${tagsHtml}
                </div>
                <div class="listing-info">
                    <div>
                        <div class="listing-price">€${game.pricePerDay.toFixed(2)}</div>
                        <div class="price-label">per day</div>
                    </div>
                    <span class="listing-condition">${game.condition}</span>
                </div>
                <div class="listing-actions">
                    <button class="action-btn edit" onclick="openEditModal(${game.gameId})">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete" onclick="openDeleteModal(${game.gameId})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ========================
   FILTER & SEARCH
   ======================== */

function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Apply filter
            currentFilter = this.dataset.filter;
            applyFilters();
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('listings-search');

    if (searchInput) {
        searchInput.addEventListener('input', BitSwapUtils.debounce(function () {
            applyFilters();
        }, 300));
    }
}

function applyFilters() {
    const searchQuery = document.getElementById('listings-search').value.toLowerCase();

    filteredListings = allListings.filter(game => {
        // Filter by status
        if (currentFilter === 'active' && !game.active) return false;
        if (currentFilter === 'inactive' && game.active) return false;

        // Filter by search query
        if (searchQuery) {
            const matchesTitle = game.title.toLowerCase().includes(searchQuery);
            const matchesDescription = game.description.toLowerCase().includes(searchQuery);
            const matchesTags = game.tags && game.tags.toLowerCase().includes(searchQuery);

            if (!matchesTitle && !matchesDescription && !matchesTags) {
                return false;
            }
        }

        return true;
    });

    renderListings();
}

/* ========================
   EDIT MODAL
   ======================== */

function openEditModal(gameId) {
    const game = allListings.find(g => g.gameId === gameId);
    if (!game) return;

    // Populate form
    document.getElementById('edit-game-id').value = game.gameId;
    document.getElementById('edit-title').value = game.title;
    document.getElementById('edit-description').value = game.description;
    document.getElementById('edit-delivery-instructions').value = game.deliveryInstructions || '';
    document.getElementById('edit-condition').value = game.condition;
    document.getElementById('edit-price').value = game.pricePerDay;
    document.getElementById('edit-active').checked = game.active;
    document.getElementById('edit-start-date').value = game.startDate || '';
    document.getElementById('edit-end-date').value = game.endDate || '';

    // Set up tags
    editingTags = game.tags ? game.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    updateEditTagsDisplay();
    initEditTagsInput();

    // Show modal
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingTags = [];
}

function initEditTagsInput() {
    const tagsInput = document.getElementById('edit-tags-input');
    const tagSuggestions = document.querySelectorAll('#edit-modal .tag-suggestion');

    // Remove old listeners by replacing element
    const newTagsInput = tagsInput.cloneNode(true);
    tagsInput.parentNode.replaceChild(newTagsInput, tagsInput);

    // Add Enter key handler
    newTagsInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = this.value.trim();
            if (tag && !editingTags.includes(tag)) {
                editingTags.push(tag);
                updateEditTagsDisplay();
                this.value = '';
            }
        }
    });

    // Handle suggestion clicks
    tagSuggestions.forEach(suggestion => {
        const newSuggestion = suggestion.cloneNode(true);
        suggestion.parentNode.replaceChild(newSuggestion, suggestion);

        newSuggestion.addEventListener('click', function () {
            const tag = this.dataset.tag;
            if (!editingTags.includes(tag)) {
                editingTags.push(tag);
                updateEditTagsDisplay();
                this.classList.add('added');
            }
        });

        // Update initial state
        if (editingTags.includes(newSuggestion.dataset.tag)) {
            newSuggestion.classList.add('added');
        }
    });
}

function updateEditTagsDisplay() {
    const container = document.getElementById('edit-tags-container');
    const hiddenInput = document.getElementById('edit-tags');

    container.innerHTML = editingTags.map(tag => `
        <span class="tag-item">
            ${tag}
            <span class="tag-remove" onclick="removeEditTag('${tag}')">×</span>
        </span>
    `).join('');

    hiddenInput.value = editingTags.join(',');

    // Update suggestions state
    const suggestions = document.querySelectorAll('#edit-modal .tag-suggestion');
    suggestions.forEach(suggestion => {
        if (editingTags.includes(suggestion.dataset.tag)) {
            suggestion.classList.add('added');
        } else {
            suggestion.classList.remove('added');
        }
    });
}

function removeEditTag(tag) {
    editingTags = editingTags.filter(t => t !== tag);
    updateEditTagsDisplay();
}

async function saveEditedGame() {
    const gameId = document.getElementById('edit-game-id').value;
    const btn = document.querySelector('#edit-modal .btn-primary');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    // Show loading
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');

        const gameData = {
            title: document.getElementById('edit-title').value.trim(),
            description: document.getElementById('edit-description').value.trim(),
            deliveryInstructions: document.getElementById('edit-delivery-instructions').value.trim() || null,
            condition: document.getElementById('edit-condition').value,
            price: parseFloat(document.getElementById('edit-price').value),
            tags: document.getElementById('edit-tags').value,
            active: document.getElementById('edit-active').checked,
            startDate: document.getElementById('edit-start-date').value,
            endDate: document.getElementById('edit-end-date').value,
            ownerUsername: currentUser.username
        };

        const response = await fetch(`/games/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        });

        if (!response.ok) {
            throw new Error('Failed to update listing');
        }

        // Reload listings
        closeEditModal();
        await loadListings();
        applyFilters();

        showNotification('Listing updated successfully!', 'success');

    } catch (error) {
        console.error('Error updating listing:', error);
        showNotification('Failed to update listing. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/* ========================
   DELETE MODAL
   ======================== */

function openDeleteModal(gameId) {
    const game = allListings.find(g => g.gameId === gameId);
    if (!game) return;

    gameToDelete = gameId;
    document.getElementById('delete-game-title').textContent = game.title;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    gameToDelete = null;
}

async function confirmDelete() {
    if (!gameToDelete) return;

    const btn = document.querySelector('#delete-modal .btn-danger');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    // Show loading
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        const response = await fetch(`/games/${gameToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete listing');
        }

        // Reload listings
        closeDeleteModal();
        await loadListings();
        applyFilters();

        showNotification('Listing deleted successfully!', 'success');

    } catch (error) {
        console.error('Error deleting listing:', error);
        showNotification('Failed to delete listing. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

/* ========================
   NOTIFICATIONS
   ======================== */

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--accent-tertiary)' : 'var(--accent-secondary)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/* ========================
   UTILITY FUNCTIONS
   ======================== */

// Make functions globally accessible
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEditedGame = saveEditedGame;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.removeEditTag = removeEditTag;
