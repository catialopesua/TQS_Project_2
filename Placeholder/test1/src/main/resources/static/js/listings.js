/**
 * Game Listings Manager
 * Handles filtering, searching, and sorting of game listings
 */

class GameListings {
    constructor() {
        this.currentGames = [];
        this.allGames = [];
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            searchInput: document.getElementById('search-input'),
            categoryFilter: document.getElementById('category-filter'),
            platformFilter: document.getElementById('platform-filter'),
            minPriceDisplay: document.getElementById('min-price-display'),
            maxPriceDisplay: document.getElementById('max-price-display'),
            minHandle: document.getElementById('min-handle'),
            maxHandle: document.getElementById('max-handle'),
            sliderRange: document.getElementById('slider-range'),
            priceSliderContainer: document.querySelector('.price-slider-container'),
            ratingFilter: document.getElementById('rating-filter'),
            sortFilter: document.getElementById('sort-filter'),
            listingsGrid: document.getElementById('listings-grid'),
            noResults: document.getElementById('no-results'),
            signOutBtn: document.getElementById('sign-out-btn')
        };
    }

    async init() {
        this.initPriceSlider();
        this.bindEvents();
        BitSwapUtils.init();
        await this.loadGamesFromDatabase();
        this.renderGames();
    }

    initPriceSlider() {
        this.minPrice = 0;
        this.maxPrice = 15;
        this.updateSliderDisplay();
        this.updateSliderVisual();
    }

    async loadGamesFromDatabase() {
        try {
            const response = await fetch('/games');
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            const games = await response.json();

            // Transform backend Game model to frontend format
            this.allGames = games.map(game => ({
                id: game.gameId,
                title: game.title,
                platform: 'pc', // Default platform since backend doesn't have this field
                category: 'other', // Default category since backend doesn't have this field
                description: game.description,
                status: game.active ? 'available' : 'rented',
                dateAdded: game.createdAt,
                price: game.pricePerDay,
                photos: game.photos, // Include photos from backend
                owner: {
                    name: game.ownerUsername || 'Unknown',
                    rating: 4.5 // Default rating since backend doesn't have this field
                }
            }));

            this.currentGames = [...this.allGames];
        } catch (error) {
            console.error('Error loading games:', error);
            // Show empty state if fetch fails
            this.allGames = [];
            this.currentGames = [];
        }
    }

    createSampleGames() {
        this.allGames = [
            {
                id: 1,
                title: "Cyberpunk 2077",
                platform: "pc",
                category: "rpg",
                description: "Open-world action-adventure story set in Night City.",
                status: "available",
                dateAdded: "2024-11-25",
                price: 4.99,
                owner: {
                    name: "TechGamer92",
                    rating: 4.8
                }
            },
            {
                id: 2,
                title: "The Last of Us Part II",
                platform: "playstation",
                category: "action",
                description: "Post-apocalyptic survival adventure.",
                status: "rented",
                dateAdded: "2024-11-20",
                price: 4.49,
                owner: {
                    name: "ZombieSlayer",
                    rating: 5.0
                }
            },
            {
                id: 3,
                title: "Halo Infinite",
                platform: "xbox",
                category: "shooter",
                description: "Master Chief's latest adventure.",
                status: "available",
                dateAdded: "2024-11-28",
                price: 3.99,
                owner: {
                    name: "SpartanHero",
                    rating: 4.5
                }
            },
            {
                id: 4,
                title: "Super Mario Odyssey",
                platform: "nintendo",
                category: "platformer",
                description: "Globe-trotting 3D adventure with Mario.",
                status: "available",
                dateAdded: "2024-11-15",
                price: 5.49,
                owner: {
                    name: "PrincessPeach",
                    rating: 4.9
                }
            },
            {
                id: 5,
                title: "FIFA 24",
                platform: "playstation",
                category: "sports",
                description: "Ultimate football simulation.",
                status: "available",
                dateAdded: "2024-11-29",
                price: 5.99,
                owner: {
                    name: "FootballKing",
                    rating: 3.8
                }
            },
            {
                id: 6,
                title: "Portal 2",
                platform: "pc",
                category: "puzzle",
                description: "Mind-bending puzzle adventure.",
                status: "rented",
                dateAdded: "2024-11-10",
                price: 3.99,
                owner: {
                    name: "CakeIsALie",
                    rating: 4.7
                }
            },
            {
                id: 7,
                title: "Resident Evil 4",
                platform: "playstation",
                category: "horror",
                description: "Survival horror masterpiece.",
                status: "available",
                dateAdded: "2024-11-22",
                price: 4.79,
                owner: {
                    name: "HorrorFan666",
                    rating: 4.2
                }
            },
            {
                id: 8,
                title: "The Witcher 3: Wild Hunt",
                platform: "xbox",
                category: "rpg",
                description: "Epic fantasy adventure.",
                status: "available",
                dateAdded: "2024-11-18",
                price: 6.49,
                owner: {
                    name: "WhiteWolf",
                    rating: 4.9
                }
            },
            {
                id: 9,
                title: "GoldenEye 007",
                platform: "retro",
                category: "shooter",
                description: "Classic N64 shooter.",
                status: "available",
                dateAdded: "2024-11-05",
                price: 4.49,
                owner: {
                    name: "RetroGamer",
                    rating: 4.3
                }
            },
            {
                id: 10,
                title: "Zelda: Breath of the Wild",
                platform: "nintendo",
                category: "adventure",
                description: "Open-world Zelda adventure.",
                status: "rented",
                dateAdded: "2024-11-12",
                price: 6.99,
                owner: {
                    name: "LinkHero",
                    rating: 5.0
                }
            },
            {
                id: 11,
                title: "Call of Duty: Modern Warfare",
                platform: "pc",
                category: "shooter",
                description: "Online multiplayer shooter.",
                status: "available",
                dateAdded: "2024-11-08",
                price: 5.99,
                owner: {
                    name: "CODMaster",
                    rating: 4.1
                }
            },
            {
                id: 12,
                title: "Animal Crossing",
                platform: "nintendo",
                category: "simulation",
                description: "Relaxing island life simulation.",
                status: "available",
                dateAdded: "2024-11-14",
                price: 2.49,
                owner: {
                    name: "IslandLife",
                    rating: 4.6
                }
            },
            {
                id: 13,
                title: "Spider-Man: Miles Morales",
                platform: "playstation",
                category: "action",
                description: "Web-slinging superhero adventure.",
                status: "available",
                dateAdded: "2024-11-17",
                price: 2.99,
                owner: {
                    name: "SpiderFan",
                    rating: 4.7
                }
            },
            {
                id: 14,
                title: "Forza Horizon 5",
                platform: "xbox",
                category: "racing",
                description: "Open world racing in Mexico.",
                status: "available",
                dateAdded: "2024-11-21",
                price: 2.79,
                owner: {
                    name: "SpeedDemon",
                    rating: 4.4
                }
            },
            {
                id: 15,
                title: "Minecraft",
                platform: "pc",
                category: "sandbox",
                description: "Build and explore infinite worlds.",
                status: "available",
                dateAdded: "2024-11-03",
                price: 1.99,
                owner: {
                    name: "BlockBuilder",
                    rating: 4.8
                }
            }
        ];

        this.currentGames = [...this.allGames];
    }

    bindEvents() {
        // Search input
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Filter dropdowns
        this.elements.categoryFilter?.addEventListener('change', (e) => {
            this.handleCategoryFilter(e.target.value);
        });

        this.elements.platformFilter?.addEventListener('change', (e) => {
            this.handlePlatformFilter(e.target.value);
        });

        // Price range custom slider
        this.initSliderEvents();

        this.elements.ratingFilter?.addEventListener('change', (e) => {
            this.handleRatingFilter(e.target.value);
        });

        this.elements.sortFilter?.addEventListener('change', (e) => {
            this.handleSort(e.target.value);
        });

        // Sign out button
        this.elements.signOutBtn?.addEventListener('click', () => {
            this.handleSignOut();
        });

        // Navigation links
        this.bindNavigationEvents();

        // View details buttons
        this.bindViewDetailsEvents();
    }

    bindNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '') {
                    e.preventDefault();
                    this.showComingSoon(link.textContent.trim());
                }
            });
        });
    }

    bindViewDetailsEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-details-btn')) {
                const gameId = e.target.getAttribute('data-game-id');
                if (gameId) {
                    window.location.href = `/gamedetails?id=${gameId}`;
                }
            }
        });
    }

    showComingSoon(featureName) {
        alert(`${featureName} feature is coming soon! Stay tuned for updates.`);
    }

    showGameDetails(gameId) {
        const game = this.allGames.find(g => g.id === parseInt(gameId));
        if (!game) return;

        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${game.title}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="game-details-grid">
            <div class="detail-item">
              <strong>Platform:</strong> ${this.getPlatformName(game.platform)}
            </div>
            <div class="detail-item">
              <strong>Category:</strong> ${game.category.charAt(0).toUpperCase() + game.category.slice(1)}
            </div>
            <div class="detail-item">
              <strong>Price:</strong> $${game.price.toFixed(2)}/day
            </div>
            <div class="detail-item">
              <strong>Status:</strong> ${game.status.charAt(0).toUpperCase() + game.status.slice(1)}
            </div>
            <div class="detail-item">
              <strong>Owner:</strong> ${game.owner.name}
            </div>
            <div class="detail-item">
              <strong>Owner Rating:</strong> ${game.owner.rating.toFixed(1)} ⭐
            </div>
          </div>
          <div class="game-description-full">
            <strong>Description:</strong>
            <p>${game.description}</p>
          </div>
        </div>
        <div class="modal-footer">
          ${game.status === 'available' ?
                '<button class="rent-btn">Rent Game</button>' :
                '<button class="rent-btn" disabled>Currently Rented</button>'
            }
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Add modal styles
        this.addModalStyles();

        // Close modal events
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Rent button event
        const rentBtn = modal.querySelector('.rent-btn');
        if (rentBtn && !rentBtn.disabled) {
            rentBtn.addEventListener('click', () => {
                this.rentGame(game.id);
                modal.remove();
            });
        }
    }

    getPlatformName(platform) {
        const platformNames = {
            playstation: 'PlayStation',
            xbox: 'Xbox',
            nintendo: 'Nintendo Switch',
            pc: 'PC',
            retro: 'Retro (N64/PS1)'
        };
        return platformNames[platform] || platform;
    }

    rentGame(gameId) {
        const game = this.allGames.find(g => g.id === gameId);
        if (game && game.status === 'available') {
            game.status = 'rented';
            this.applyFilters(); // Re-render with updated status
            alert(`Successfully rented "${game.title}"! Enjoy your game.`);
        }
    }

    handleSearch(searchTerm) {
        this.applyFilters();
    }

    handleCategoryFilter(category) {
        this.applyFilters();
    }

    handlePlatformFilter(platform) {
        this.applyFilters();
    }

    initSliderEvents() {
        let isDragging = false;
        let currentHandle = null;

        const startDrag = (e, handle) => {
            isDragging = true;
            currentHandle = handle;
            handle.classList.add('dragging');
            e.preventDefault();
        };

        const drag = (e) => {
            if (!isDragging || !currentHandle) return;

            const container = this.elements.priceSliderContainer;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - 15; // Subtract padding
            const width = rect.width - 30; // Subtract both side paddings
            const percentage = Math.max(0, Math.min(1, x / width));
            const value = Math.round(percentage * 15 * 2) / 2; // Step of 0.5

            if (currentHandle === this.elements.minHandle) {
                this.minPrice = Math.min(value, this.maxPrice);
            } else {
                this.maxPrice = Math.max(value, this.minPrice);
            }

            this.updateSliderDisplay();
            this.updateSliderVisual();
            this.applyFilters();
        };

        const endDrag = () => {
            if (currentHandle) {
                currentHandle.classList.remove('dragging');
            }
            isDragging = false;
            currentHandle = null;
        };

        // Mouse events
        this.elements.minHandle?.addEventListener('mousedown', (e) => startDrag(e, this.elements.minHandle));
        this.elements.maxHandle?.addEventListener('mousedown', (e) => startDrag(e, this.elements.maxHandle));
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        // Touch events
        this.elements.minHandle?.addEventListener('touchstart', (e) => startDrag(e.touches[0], this.elements.minHandle));
        this.elements.maxHandle?.addEventListener('touchstart', (e) => startDrag(e.touches[0], this.elements.maxHandle));
        document.addEventListener('touchmove', (e) => drag(e.touches[0]));
        document.addEventListener('touchend', endDrag);
    }

    updateSliderDisplay() {
        if (this.elements.minPriceDisplay) {
            this.elements.minPriceDisplay.textContent = this.minPrice.toFixed(1);
        }
        if (this.elements.maxPriceDisplay) {
            this.elements.maxPriceDisplay.textContent = this.maxPrice.toFixed(1);
        }
    }

    updateSliderVisual() {
        const minPercent = (this.minPrice / 15) * 100;
        const maxPercent = (this.maxPrice / 15) * 100;

        // Update handle positions
        if (this.elements.minHandle) {
            this.elements.minHandle.style.left = `${15 + (minPercent / 100) * (this.elements.priceSliderContainer.offsetWidth - 30)}px`;
        }
        if (this.elements.maxHandle) {
            this.elements.maxHandle.style.left = `${15 + (maxPercent / 100) * (this.elements.priceSliderContainer.offsetWidth - 30)}px`;
        }

        // Update range visualization
        if (this.elements.sliderRange) {
            const rangeWidth = maxPercent - minPercent;
            this.elements.sliderRange.style.left = `${15 + (minPercent / 100) * (this.elements.priceSliderContainer.offsetWidth - 30)}px`;
            this.elements.sliderRange.style.width = `${(rangeWidth / 100) * (this.elements.priceSliderContainer.offsetWidth - 30)}px`;
        }
    }

    handleRatingFilter(rating) {
        this.applyFilters();
    }

    handleSort(sortBy) {
        this.sortGames(sortBy);
        this.renderGames();
    }

    handleSignOut() {
        // Clear user data and redirect to login page
        localStorage.removeItem('bitswap_demo_user');
        window.location.href = '/login';
    }

    applyFilters() {
        const searchTerm = this.elements.searchInput?.value.toLowerCase() || '';
        const selectedCategory = this.elements.categoryFilter?.value || '';
        const selectedPlatform = this.elements.platformFilter?.value || '';
        const minPrice = this.minPrice;
        const maxPrice = this.maxPrice;
        const selectedRating = this.elements.ratingFilter?.value || '';

        this.currentGames = this.allGames.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm) ||
                game.owner.name.toLowerCase().includes(searchTerm);

            const matchesCategory = !selectedCategory || game.category === selectedCategory;
            const matchesPlatform = !selectedPlatform || game.platform === selectedPlatform;

            // Price range filtering with sliders
            const matchesPrice = game.price >= minPrice && game.price <= maxPrice;

            // Owner rating filtering
            let matchesRating = true;
            if (selectedRating) {
                const minRating = parseInt(selectedRating);
                matchesRating = game.owner.rating >= minRating;
            }

            return matchesSearch && matchesCategory && matchesPlatform && matchesPrice && matchesRating;
        });

        // Apply current sort
        const currentSort = this.elements.sortFilter?.value || 'newest';
        this.sortGames(currentSort);
        this.renderGames();
    }

    sortGames(sortBy) {
        switch (sortBy) {
            case 'newest':
                this.currentGames.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'oldest':
                this.currentGames.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
            case 'alphabetical':
                this.currentGames.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'price-low':
                this.currentGames.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.currentGames.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.currentGames.sort((a, b) => b.owner.rating - a.owner.rating);
                break;
            case 'platform':
                this.currentGames.sort((a, b) => a.platform.localeCompare(b.platform));
                break;
        }
    }

    renderGames() {
        if (!this.elements.listingsGrid || !this.elements.noResults) return;

        if (this.currentGames.length === 0) {
            this.elements.listingsGrid.innerHTML = '';
            this.elements.noResults.style.display = 'block';
            return;
        }

        this.elements.noResults.style.display = 'none';

        this.elements.listingsGrid.innerHTML = this.currentGames
            .map(game => this.createGameCard(game))
            .join('');
    }

    createGameCard(game) {
        const platformNames = {
            playstation: 'PlayStation',
            xbox: 'Xbox',
            nintendo: 'Nintendo Switch',
            pc: 'PC',
            retro: 'Retro'
        };

        // Create star rating display
        const rating = Math.floor(game.owner.rating);
        const hasHalfStar = game.owner.rating % 1 >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<span class="star">★</span>';
            } else if (i === rating + 1 && hasHalfStar) {
                starsHtml += '<span class="star">☆</span>';
            } else {
                starsHtml += '<span class="star empty">☆</span>';
            }
        }

        // Get first photo if available
        let imageHtml = '';
        if (game.photos && game.photos.trim() !== '') {
            const firstPhoto = game.photos.split(',')[0].trim();
            if (firstPhoto) {
                imageHtml = `<img src="${firstPhoto}" alt="${game.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
            }
        }

        return `
      <article class="game-card" data-game-id="${game.id}">
        <div class="game-image">
          ${imageHtml}
          <div class="placeholder-icon" style="${imageHtml ? 'display: none;' : ''}">🎮</div>
        </div>
        <div class="game-content">
          <div class="game-price">$${game.price.toFixed(2)}/day</div>
          
          <div class="game-owner">
            <div class="owner-info">
              <div class="owner-name">Owner: ${game.owner.name}</div>
              <div class="owner-rating">
                <div class="stars">${starsHtml}</div>
                <span class="rating-text">(${game.owner.rating.toFixed(1)})</span>
              </div>
            </div>
          </div>
          
          <div class="game-header">
            <h3 class="game-title">${game.title}</h3>
            <span class="platform-badge">${platformNames[game.platform] || game.platform}</span>
          </div>
          
          <div class="game-footer">
            <button class="view-details-btn" data-game-id="${game.id}">
              See Details
            </button>
          </div>
        </div>
      </article>
    `;
    }

    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
      .game-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
      }

      .modal-content {
        background: var(--panel);
        border: 2px solid var(--accent);
        border-radius: var(--radius-xl);
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease-out;
      }

      @keyframes modalSlideIn {
        from {
          transform: scale(0.9) translateY(-20px);
          opacity: 0;
        }
        to {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        padding: var(--space-lg);
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, rgba(74, 224, 255, 0.1) 0%, rgba(255, 77, 109, 0.1) 100%);
      }

      .modal-header h2 {
        color: var(--text-primary);
        font-family: var(--font-primary);
        margin: 0;
        font-size: var(--font-size-xl);
      }

      .close-modal {
        background: none;
        border: none;
        color: var(--text-muted);
        font-size: var(--font-size-xl);
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: var(--transition-base);
      }

      .close-modal:hover {
        color: var(--accent-secondary);
        background: rgba(255, 77, 109, 0.1);
      }

      .modal-body {
        padding: var(--space-lg);
        overflow-y: auto;
        max-height: 50vh;
      }

      .game-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
      }

      .detail-item {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        line-height: 1.4;
      }

      .detail-item strong {
        color: var(--text-primary);
        display: block;
        margin-bottom: var(--space-xs);
      }

      .game-description-full {
        border-top: 1px solid var(--border);
        padding-top: var(--space-lg);
      }

      .game-description-full strong {
        color: var(--text-primary);
        display: block;
        margin-bottom: var(--space-md);
      }

      .game-description-full p {
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .modal-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        text-align: center;
      }

      .rent-btn {
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
        color: white;
        border: none;
        padding: var(--space-md) var(--space-xl);
        border-radius: var(--radius-lg);
        font-family: var(--font-primary);
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-base);
        font-size: var(--font-size-md);
      }

      .rent-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg), var(--glow-accent);
      }

      .rent-btn:disabled {
        background: var(--text-muted);
        cursor: not-allowed;
        opacity: 0.6;
      }

      @media (max-width: 768px) {
        .game-details-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
        document.head.appendChild(styles);
    }
}

// Initialize the game listings when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameListings();
});