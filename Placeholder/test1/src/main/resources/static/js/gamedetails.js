/**
 * Game Details Page Manager
 */

class GameDetails {
    constructor() {
        this.gameId = null;
        this.gameData = null;
        this.bookings = [];
        this.currentCalendarDate = new Date();
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            gameContent: document.getElementById('game-content'),
            gameTitle: document.getElementById('game-title'),
            gamePrice: document.getElementById('game-price'),
            gameCondition: document.getElementById('game-condition'),
            gameDate: document.getElementById('game-date'),
            gameDescription: document.getElementById('game-description'),
            statusBadge: document.getElementById('status-badge'),
            ownerName: document.getElementById('owner-name'),
            ownerInitial: document.getElementById('owner-initial'),
            startDate: document.getElementById('start-date'),
            endDate: document.getElementById('end-date'),
            availabilitySection: document.getElementById('availability-section'),
            mainImage: document.getElementById('game-main-image'),
            imagePlaceholder: document.getElementById('image-placeholder'),
            thumbnailStrip: document.getElementById('thumbnail-strip'),
            rentBtn: document.getElementById('rent-btn'),
            contactOwnerBtn: document.getElementById('contact-owner-btn'),
            signOutBtn: document.getElementById('sign-out-btn'),
            bookingModal: document.getElementById('booking-modal'),
            bookingStart: document.getElementById('booking-start'),
            bookingEnd: document.getElementById('booking-end'),
            bookingConfirm: document.getElementById('booking-confirm'),
            bookingCancel: document.getElementById('booking-cancel'),
            bookingError: document.getElementById('booking-error'),
            modalGameTitle: document.getElementById('modal-game-title'),
            calendarTitle: document.getElementById('calendar-title'),
            calendarDays: document.getElementById('calendar-days'),
            prevMonth: document.getElementById('prev-month'),
            nextMonth: document.getElementById('next-month'),
            historyLoading: document.getElementById('history-loading'),
            historyEmpty: document.getElementById('history-empty'),
            historyList: document.getElementById('history-list')
        };
    }

    async init() {
        BitSwapUtils.init();
        this.getGameIdFromUrl();

        if (this.gameId) {
            await this.loadGameDetails();
        } else {
            this.showError();
        }

        this.bindEvents();
    }

    getGameIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.gameId = urlParams.get('id');
    }

    async loadGameDetails() {
        try {
            this.showLoading();

            const response = await fetch(`/games/${this.gameId}`);
            if (!response.ok) {
                throw new Error('Game not found');
            }

            this.gameData = await response.json();
            this.displayGameDetails();

            // Load bookings for calendar
            await this.loadBookings();

            // Render calendar after bookings are loaded
            if (this.gameData.startDate && this.gameData.endDate) {
                this.renderCalendar();
            }

            // Load and display rental history
            await this.loadRentalHistory();

            this.showContent();
        } catch (error) {
            console.error('Error loading game details:', error);
            this.showError();
        }
    }

    async loadBookings() {
        try {
            const response = await fetch(`/bookings/game/${this.gameId}`);
            if (response.ok) {
                this.bookings = await response.json();
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = [];
        }
    }

    displayGameDetails() {
        // Title
        this.elements.gameTitle.textContent = this.gameData.title;

        // Price
        this.elements.gamePrice.textContent = `$${this.gameData.pricePerDay.toFixed(2)}/day`;

        // Condition
        this.elements.gameCondition.textContent = this.gameData.condition.charAt(0).toUpperCase() + this.gameData.condition.slice(1);

        // Date
        const dateAdded = new Date(this.gameData.createdAt);
        this.elements.gameDate.textContent = dateAdded.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Description
        this.elements.gameDescription.textContent = this.gameData.description || 'No description available.';

        // Delivery Instructions
        const deliverySection = document.getElementById('delivery-section');
        const deliveryInstructions = document.getElementById('delivery-instructions');
        if (this.gameData.deliveryInstructions && this.gameData.deliveryInstructions.trim() !== '') {
            deliveryInstructions.textContent = this.gameData.deliveryInstructions;
            deliverySection.style.display = 'block';
        } else {
            deliverySection.style.display = 'none';
        }

        // Status
        const statusClass = 'available';
        const statusText = 'Available for Booking';

        // Check if game has available dates
        if (!this.gameData.startDate || !this.gameData.endDate) {
            this.elements.statusBadge.className = 'status-badge unavailable';
            this.elements.statusBadge.textContent = 'Unavailable';
        } else {
            this.elements.statusBadge.className = `status-badge ${statusClass}`;
            this.elements.statusBadge.textContent = statusText;
        }

        // Owner
        const ownerUsername = this.gameData.ownerUsername || 'Unknown';
        this.elements.ownerName.textContent = ownerUsername;
        this.elements.ownerInitial.textContent = ownerUsername.charAt(0).toUpperCase();

        // Availability calendar
        if (this.gameData.startDate && this.gameData.endDate) {
            this.elements.availabilitySection.style.display = 'block';
            // Calendar will be rendered after bookings are loaded
        } else {
            this.elements.availabilitySection.style.display = 'none';
        }

        // Images
        this.displayImages();

        // Rent button is always enabled - users can book available date ranges
    }

    displayImages() {
        if (this.gameData.photos && this.gameData.photos.trim() !== '') {
            // Split photos by comma (assuming comma-separated base64 or URLs)
            const photos = this.gameData.photos.split(',').filter(p => p.trim() !== '');

            if (photos.length > 0) {
                // Display main image
                this.elements.mainImage.src = photos[0];
                this.elements.mainImage.style.display = 'block';
                this.elements.imagePlaceholder.style.display = 'none';

                // Display thumbnails if there are multiple images
                if (photos.length > 1) {
                    this.elements.thumbnailStrip.innerHTML = '';
                    photos.forEach((photo, index) => {
                        const thumbnail = document.createElement('div');
                        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                        thumbnail.innerHTML = `<img src="${photo}" alt="Game image ${index + 1}">`;
                        thumbnail.addEventListener('click', () => this.switchImage(photo, thumbnail));
                        this.elements.thumbnailStrip.appendChild(thumbnail);
                    });
                } else {
                    this.elements.thumbnailStrip.style.display = 'none';
                }
            } else {
                this.showPlaceholderImage();
            }
        } else {
            this.showPlaceholderImage();
        }
    }

    showPlaceholderImage() {
        this.elements.mainImage.style.display = 'none';
        this.elements.imagePlaceholder.style.display = 'flex';
        this.elements.thumbnailStrip.style.display = 'none';
    }

    switchImage(imageSrc, thumbnail) {
        // Update main image
        this.elements.mainImage.src = imageSrc;

        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }

    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.errorState.style.display = 'none';
        this.elements.gameContent.style.display = 'none';
    }

    showError() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'flex';
        this.elements.gameContent.style.display = 'none';
    }

    showContent() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.gameContent.style.display = 'grid';
    }

    bindEvents() {
        // Rent button
        if (this.elements.rentBtn) {
            this.elements.rentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRent();
            });
        }

        // Contact owner button
        if (this.elements.contactOwnerBtn) {
            this.elements.contactOwnerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleContactOwner();
            });
        }

        // Sign out button
        if (this.elements.signOutBtn) {
            this.elements.signOutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                BitSwapUtils.signOut();
            });
        }

        // Calendar navigation
        if (this.elements.prevMonth) {
            this.elements.prevMonth.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        if (this.elements.nextMonth) {
            this.elements.nextMonth.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Booking modal events
        if (this.elements.bookingConfirm) {
            this.elements.bookingConfirm.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitBooking();
            });
        }

        if (this.elements.bookingCancel) {
            this.elements.bookingCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeBookingModal();
            });
        }

        // Booking close button
        const bookingCloseBtn = document.getElementById('booking-close-btn');
        if (bookingCloseBtn) {
            bookingCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeBookingModal();
            });
        }

        // Price calculation on date change
        if (this.elements.bookingStart) {
            this.elements.bookingStart.addEventListener('change', () => this.calculateBookingPrice());
        }
        if (this.elements.bookingEnd) {
            this.elements.bookingEnd.addEventListener('change', () => this.calculateBookingPrice());
        }

        // Close modal when clicking backdrop
        if (this.elements.bookingModal) {
            this.elements.bookingModal.addEventListener('click', (e) => {
                if (e.target === this.elements.bookingModal) this.closeBookingModal();
            });
        }
    }

    handleRent() {
        // Get logged-in user
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            alert('Please log in to rent games.');
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);

        // Check if user is trying to rent their own game
        if (user.username === this.gameData.ownerUsername) {
            alert('You cannot rent your own game.');
            return;
        }

        // Open booking modal to select dates
        this.openBookingModal();
    }

    openBookingModal() {
        if (!this.elements.bookingModal) return;

        // Reset error messages
        this.clearBookingError();

        // Hide price summary initially
        const priceSummary = document.getElementById('booking-price-summary');
        if (priceSummary) {
            priceSummary.style.display = 'none';
        }

        // Show modal with proper positioning
        this.elements.bookingModal.style.display = 'flex';
        this.elements.bookingModal.style.position = 'fixed';
        this.elements.bookingModal.style.inset = '0';
        this.elements.bookingModal.style.alignItems = 'center';
        this.elements.bookingModal.style.justifyContent = 'center';
        this.elements.bookingModal.style.background = 'rgba(0, 0, 0, 0.7)';
        this.elements.bookingModal.style.zIndex = '999';
        this.elements.bookingModal.style.backdropFilter = 'blur(4px)';

        // Prefill modal title
        this.elements.modalGameTitle.textContent = `Rent ${this.gameData.title}`;

        // Prefill start/end with game's available dates or today
        const today = new Date();
        const minStart = this.gameData.startDate ? new Date(this.gameData.startDate) : today;
        const maxEnd = this.gameData.endDate ? new Date(this.gameData.endDate) : null;

        const startStr = BitSwapUtils.formatDate(minStart);
        this.elements.bookingStart.value = startStr;
        this.elements.bookingStart.min = startStr;

        if (maxEnd) {
            this.elements.bookingEnd.min = startStr;
            this.elements.bookingEnd.max = BitSwapUtils.formatDate(maxEnd);
            this.elements.bookingEnd.value = BitSwapUtils.formatDate(new Date(minStart.getTime() + 24 * 60 * 60 * 1000));
        } else {
            // default end date is next day
            const nextDay = new Date(minStart);
            nextDay.setDate(minStart.getDate() + 1);
            this.elements.bookingEnd.value = BitSwapUtils.formatDate(nextDay);
            this.elements.bookingEnd.min = startStr;
        }

        // Trigger price calculation on load
        this.calculateBookingPrice();
    }

    calculateBookingPrice() {
        const start = this.elements.bookingStart.value;
        const end = this.elements.bookingEnd.value;
        
        if (start && end) {
            if (!this.isDateRangeAvailable(start, end)) {
                const priceSummary = document.getElementById('booking-price-summary');
                if (priceSummary) priceSummary.style.display = 'none';
                return;
            }
            const startDate = new Date(start);
            const endDate = new Date(end);
            const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const dailyRate = this.gameData.pricePerDay || 9.99;
            const totalPrice = daysCount > 0 ? daysCount * dailyRate : 0;

            this.updateBookingPriceSummary(dailyRate, daysCount, totalPrice);
        }
    }

    closeBookingModal() {
        if (!this.elements.bookingModal) return;
        this.elements.bookingModal.style.display = 'none';
    }

    isDateRangeAvailable(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return !this.bookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);

            bookingStart.setHours(0, 0, 0, 0);
            bookingEnd.setHours(0, 0, 0, 0);

            // Overlap check
            return start <= bookingEnd && end >= bookingStart;
        });
    }

    async submitBooking() {
        // Clear previous errors
        this.clearBookingError();

        // Basic validation
        const start = this.elements.bookingStart.value;
        const end = this.elements.bookingEnd.value;
        if (!start || !end) {
            this.showBookingError('Please select both start and end dates.');
            return;
        }
        if (new Date(end) <= new Date(start)) {
            this.showBookingError('End date must be after start date.');
            return;
        }
        // Check for overlapping bookings
        if (!this.isDateRangeAvailable(start, end)) {
            this.showBookingError(
                'Some of the selected dates are already booked. Please choose different dates.'
            );
            return;
        }


        // Get logged-in user
        const stored = localStorage.getItem('bitswap_demo_user');
        if (!stored) {
            this.showBookingError('Please log in to submit a booking.');
            return;
        }
        const user = JSON.parse(stored);
        const username = user.username || user.name || user.userId ? user.username : null;
        if (!username) {
            this.showBookingError('Unable to determine logged-in user.');
            return;
        }

        // Calculate total price
        const startDate = new Date(start);
        const endDate = new Date(end);
        const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const dailyRate = this.gameData.pricePerDay || 9.99;
        const totalPrice = daysCount * dailyRate;

        // Update booking price summary
        this.updateBookingPriceSummary(dailyRate, daysCount, totalPrice);

        // Store booking data for payment processing
        this.currentBookingData = {
            gameTitle: this.gameData.title,
            startDate: start,
            endDate: end,
            totalPrice: totalPrice,
            gameId: parseInt(this.gameId),
            userId: user.userId,
            username: username,
            dailyRate: dailyRate,
            daysCount: daysCount
        };

        // Close booking modal and open payment modal
        this.closeBookingModal();

        // Initialize payment with booking data
        if (typeof PaymentManager !== 'undefined') {
            PaymentManager.initializePayment(this.currentBookingData);
        } else {
            this.showBookingError('Payment system not available. Please refresh and try again.');
        }
    }

    updateBookingPriceSummary(dailyRate, daysCount, totalPrice) {
        const priceSummary = document.getElementById('booking-price-summary');
        if (priceSummary) {
            document.getElementById('daily-rate').textContent = `$${dailyRate.toFixed(2)}`;
            document.getElementById('days-count').textContent = daysCount;
            document.getElementById('booking-total').textContent = `$${totalPrice.toFixed(2)}`;
            priceSummary.style.display = 'block';
        }
    }

    clearBookingError() {
        if (this.elements.bookingError) {
            this.elements.bookingError.style.display = 'none';
            this.elements.bookingError.textContent = '';
        }
    }

    showBookingError(msg) {
        if (!this.elements.bookingError) return;
        this.elements.bookingError.textContent = msg;
        this.elements.bookingError.style.display = 'block';
    }

    handleContactOwner() {
        // Get logged-in user
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            alert('Please log in to contact owners.');
            window.location.href = '/login';
            return;
        }

        const ownerUsername = this.gameData.ownerUsername || 'Unknown';
        alert(`Contact owner functionality coming soon!\n\nYou will be able to message ${ownerUsername} about "${this.gameData.title}".`);
    }

    renderCalendar() {
        if (!this.elements.calendarDays || !this.gameData) return;

        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();

        // Update calendar title
        this.elements.calendarTitle.textContent = this.currentCalendarDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parse availability dates
        const startDate = this.gameData.startDate ? new Date(this.gameData.startDate) : null;
        const endDate = this.gameData.endDate ? new Date(this.gameData.endDate) : null;

        // Clear existing days
        this.elements.calendarDays.innerHTML = '';

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.elements.calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);

            // Check if it's today
            if (currentDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            // Check if date is outside game's availability period
            const isOutsideAvailability = startDate && endDate &&
                (currentDate < startDate || currentDate > endDate);

            // Check if date is already rented
            const isRented = this.isDateRented(currentDate);

            if (isOutsideAvailability || isRented) {
                // Red for unavailable or rented days
                dayElement.classList.add('rented');
                dayElement.title = isOutsideAvailability ? 'Not available' : 'Already rented';
            } else if (startDate && endDate && currentDate >= startDate && currentDate <= endDate) {
                // Green for available days
                dayElement.classList.add('available');
                dayElement.title = 'Available for rent';
            } else {
                // Gray for days outside range
                dayElement.classList.add('unavailable');
                dayElement.title = 'Not in availability window';
            }

            this.elements.calendarDays.appendChild(dayElement);
        }
    }

    isDateRented(date) {
        return this.bookings.some(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });
    }

    /**
     * Load and display rental history for this game
     */
    async loadRentalHistory() {
        if (!this.elements.historyLoading || !this.elements.historyEmpty || !this.elements.historyList) {
            return;
        }

        try {
            // Show loading state
            this.elements.historyLoading.style.display = 'flex';
            this.elements.historyEmpty.style.display = 'none';
            this.elements.historyList.style.display = 'none';

            // Fetch rental history for this game
            const response = await fetch(`/bookings/game/${this.gameId}`);
            if (!response.ok) {
                throw new Error('Failed to load rental history');
            }

            const rentalHistory = await response.json();

            // Hide loading state
            this.elements.historyLoading.style.display = 'none';

            // Show empty state or rental items
            if (!rentalHistory || rentalHistory.length === 0) {
                this.elements.historyEmpty.style.display = 'block';
            } else {
                this.displayRentalHistory(rentalHistory);
                this.elements.historyList.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading rental history:', error);
            this.elements.historyLoading.style.display = 'none';
            this.elements.historyEmpty.style.display = 'block';
        }
    }

    /**
     * Display rental history items (compact format)
     */
    displayRentalHistory(rentalHistory) {
        this.elements.historyList.innerHTML = '';

        rentalHistory.forEach(booking => {
            const item = this.createRentalItem(booking);
            this.elements.historyList.appendChild(item);
        });
    }

    /**
     * Create a compact rental history item
     */
    createRentalItem(booking) {
        const item = document.createElement('div');
        item.className = 'rental-item';

        // Format dates
        const startDate = new Date(booking.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        const endDate = new Date(booking.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Get renter info
        const renterName = booking.user?.username || 'A user';

        // Get status
        const status = booking.status || 'pending';
        const statusClass = status.toLowerCase();

        item.innerHTML = `
            <div>
                <span class="renter">${renterName}</span> rented
                <span class="rental-status-badge ${statusClass}">${status}</span>
            </div>
            <span class="dates">${startDate} - ${endDate}</span>
        `;

        return item;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameDetails();
});
