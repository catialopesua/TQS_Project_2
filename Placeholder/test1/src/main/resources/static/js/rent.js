/**
 * Rent Page Manager
 */

class RentManager {
    constructor() {
        this.gameId = null;
        this.gameData = null;
        this.bookings = [];
        this.currentCalendarDate = new Date();
        this.selectedDates = {
            start: null,
            end: null
        };
        this.elements = this.initializeElements();
        this.init();
    }

    initializeElements() {
        return {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            rentContent: document.getElementById('rent-content'),
            gameImage: document.getElementById('game-image'),
            imagePlaceholder: document.getElementById('image-placeholder'),
            gameTitle: document.getElementById('game-title'),
            gamePrice: document.getElementById('game-price'),
            gameCondition: document.getElementById('game-condition'),
            gameDescription: document.getElementById('game-description'),
            ownerInitial: document.getElementById('owner-initial'),
            ownerName: document.getElementById('owner-name'),
            startDateInput: document.getElementById('start-date'),
            endDateInput: document.getElementById('end-date'),
            startDateError: document.getElementById('start-date-error'),
            endDateError: document.getElementById('end-date-error'),
            numDays: document.getElementById('num-days'),
            pricePerDay: document.getElementById('price-per-day'),
            totalPrice: document.getElementById('total-price'),
            rentalForm: document.getElementById('rental-form'),
            cancelBtn: document.getElementById('cancel-btn'),
            payBtn: document.getElementById('pay-btn'),
            calendarTitle: document.getElementById('calendar-title'),
            calendarDays: document.getElementById('calendar-days'),
            prevMonth: document.getElementById('prev-month'),
            nextMonth: document.getElementById('next-month'),
            successModal: document.getElementById('success-modal'),
            successGameTitle: document.getElementById('success-game-title'),
            successDates: document.getElementById('success-dates'),
            successTotal: document.getElementById('success-total'),
            successOkBtn: document.getElementById('success-ok-btn'),
            signOutBtn: document.getElementById('sign-out-btn')
        };
    }

    async init() {
        BitSwapUtils.init();
        this.getGameIdFromUrl();

        if (this.gameId) {
            await this.loadGameDetails();
            await this.loadBookings();
        } else {
            this.showError();
        }

        this.bindEvents();
        this.setMinDate();
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
                this.renderCalendar();
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    }

    displayGameDetails() {
        // Title
        this.elements.gameTitle.textContent = this.gameData.title;

        // Price
        const price = this.gameData.pricePerDay.toFixed(2);
        this.elements.gamePrice.textContent = `$${price}/day`;
        this.elements.pricePerDay.textContent = `$${price}`;

        // Condition
        this.elements.gameCondition.textContent =
            this.gameData.condition.charAt(0).toUpperCase() + this.gameData.condition.slice(1);

        // Description
        this.elements.gameDescription.textContent = this.gameData.description || 'No description available.';

        // Owner (the person who created the listing)
        const ownerName = this.gameData.ownerUsername || 'Unknown';
        this.elements.ownerName.textContent = ownerName;
        this.elements.ownerInitial.textContent = ownerName.charAt(0).toUpperCase();

        // Images
        if (this.gameData.photos && this.gameData.photos.trim() !== '') {
            const photos = this.gameData.photos.split(',').map(p => p.trim()).filter(p => p);
            if (photos.length > 0) {
                this.elements.gameImage.src = photos[0];
                this.elements.gameImage.style.display = 'block';
                this.elements.imagePlaceholder.style.display = 'none';
            } else {
                this.showImagePlaceholder();
            }
        } else {
            this.showImagePlaceholder();
        }
    }

    showImagePlaceholder() {
        this.elements.gameImage.style.display = 'none';
        this.elements.imagePlaceholder.style.display = 'flex';
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.startDateInput.setAttribute('min', today);
        this.elements.endDateInput.setAttribute('min', today);
    }

    bindEvents() {
        // Form submission
        this.elements.rentalForm?.addEventListener('submit', (e) => this.handleSubmit(e));

        // Date inputs
        this.elements.startDateInput?.addEventListener('change', () => this.handleDateChange());
        this.elements.endDateInput?.addEventListener('change', () => this.handleDateChange());

        // Cancel button
        this.elements.cancelBtn?.addEventListener('click', () => {
            window.location.href = `/gamedetails?id=${this.gameId}`;
        });

        // Calendar navigation
        this.elements.prevMonth?.addEventListener('click', () => this.navigateMonth(-1));
        this.elements.nextMonth?.addEventListener('click', () => this.navigateMonth(1));

        // Success modal
        this.elements.successOkBtn?.addEventListener('click', () => {
            window.location.href = '/profile'; // Or bookings page
        });

        // Sign out
        this.elements.signOutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('bitswap_demo_user');
            window.location.href = '/login';
        });
    }

    handleDateChange() {
        this.clearErrors();

        const startDate = this.elements.startDateInput.value;
        const endDate = this.elements.endDateInput.value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validation
            if (end < start) {
                this.showError(this.elements.endDateError, 'End date must be after start date');
                this.resetSummary();
                return;
            }

            // Check if dates are within game's availability period
            if (this.gameData.startDate && this.gameData.endDate) {
                const gameStart = new Date(this.gameData.startDate);
                const gameEnd = new Date(this.gameData.endDate);
                if (start < gameStart || end > gameEnd) {
                    const gameStartStr = gameStart.toLocaleDateString();
                    const gameEndStr = gameEnd.toLocaleDateString();
                    this.showError(this.elements.startDateError,
                        `Game only available from ${gameStartStr} to ${gameEndStr}`);
                    this.resetSummary();
                    return;
                }
            }

            // Check if dates overlap with existing bookings
            if (this.checkDateOverlap(start, end)) {
                this.showError(this.elements.startDateError, 'Selected dates overlap with existing booking');
                this.resetSummary();
                return;
            }

            // Calculate total
            this.calculateTotal(start, end);
            this.selectedDates = { start, end };
            this.renderCalendar();
        } else {
            this.resetSummary();
        }
    }

    checkDateOverlap(start, end) {
        return this.bookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return (start <= bookingEnd && end >= bookingStart);
        });
    }

    calculateTotal(start, end) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const total = days * this.gameData.pricePerDay;

        this.elements.numDays.textContent = days;
        this.elements.totalPrice.textContent = `$${total.toFixed(2)}`;
    }

    resetSummary() {
        this.elements.numDays.textContent = '0';
        this.elements.totalPrice.textContent = '$0.00';
        this.selectedDates = { start: null, end: null };
        this.renderCalendar();
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.clearErrors();

        const startDate = this.elements.startDateInput.value;
        const endDate = this.elements.endDateInput.value;

        if (!startDate || !endDate) {
            this.showError(this.elements.startDateError, 'Please select both dates');
            return;
        }

        // Get logged-in user
        const userData = localStorage.getItem('bitswap_demo_user');
        if (!userData) {
            alert('Please log in to make a booking');
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);

        // Prepare booking data
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const totalPrice = days * this.gameData.pricePerDay;

        const bookingData = {
            userId: user.id || user.userId,
            gameId: this.gameId,
            startDate: startDate,
            endDate: endDate,
            totalPrice: totalPrice
        };

        try {
            this.elements.payBtn.disabled = true;
            this.elements.payBtn.textContent = 'Processing...';

            const response = await fetch('/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to create booking');
            }

            const booking = await response.json();
            this.showSuccessModal(booking);

        } catch (error) {
            console.error('Error creating booking:', error);
            this.showError(this.elements.startDateError, error.message || 'Failed to create booking. Please try again.');
        } finally {
            this.elements.payBtn.disabled = false;
            this.elements.payBtn.innerHTML = '<span class="btn-icon">💳</span>Pay & Book';
        }
    }

    showSuccessModal(booking) {
        this.elements.successGameTitle.textContent = this.gameData.title;
        this.elements.successDates.textContent =
            `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`;
        this.elements.successTotal.textContent = `$${booking.totalPrice.toFixed(2)}`;

        this.elements.successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Calendar rendering
    renderCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();

        // Update title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        this.elements.calendarTitle.textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        this.elements.calendarDays.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            this.elements.calendarDays.appendChild(emptyDay);
        }

        // Add days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if today
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }

            // Check if outside game's availability period
            if (this.isDateUnavailable(dayDate)) {
                dayElement.classList.add('rented');
                dayElement.title = 'Not available for rent';
            }
            // Check if rented by another user
            else if (this.isDateRented(dayDate)) {
                dayElement.classList.add('rented');
                dayElement.title = 'Already rented';
            }
            // Check if selected by current user
            else if (this.isDateSelected(dayDate)) {
                dayElement.classList.add('selected');
            }

            this.elements.calendarDays.appendChild(dayElement);
        }
    }

    isDateUnavailable(date) {
        // Check if date is outside the game's availability period (startDate to endDate)
        if (!this.gameData.startDate || !this.gameData.endDate) {
            return false; // If no dates set, game is always available
        }
        const gameStart = new Date(this.gameData.startDate);
        const gameEnd = new Date(this.gameData.endDate);
        gameStart.setHours(0, 0, 0, 0);
        gameEnd.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < gameStart || date > gameEnd;
    }

    isDateRented(date) {
        return this.bookings.some(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });
    }

    isDateSelected(date) {
        if (!this.selectedDates.start || !this.selectedDates.end) return false;
        const start = new Date(this.selectedDates.start);
        const end = new Date(this.selectedDates.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date >= start && date <= end;
    }

    navigateMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.renderCalendar();
    }

    // UI State management
    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.errorState.style.display = 'none';
        this.elements.rentContent.style.display = 'none';
    }

    showError() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'flex';
        this.elements.rentContent.style.display = 'none';
    }

    showContent() {
        this.elements.loadingState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.rentContent.style.display = 'block';
        this.renderCalendar();
    }

    showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    clearErrors() {
        [this.elements.startDateError, this.elements.endDateError].forEach(el => {
            if (el) {
                el.textContent = '';
                el.classList.remove('show');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RentManager();
});
