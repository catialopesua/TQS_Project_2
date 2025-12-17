/* ========================
   ADD VIDEOGAME JS
   ======================== */

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize shared functionality (particles + navigation)
    BitSwapUtils.init();

    // Initialize form functionality
    initFormHandlers();
    initValidation();
    initPhotoUpload();
    initAvailabilityToggle();
    initDateValidation();
    initTagsInput();

    // Set minimum date to today
    setMinDate();
});

/* ========================
   FORM HANDLERS
   ======================== */

function initFormHandlers() {
    const form = document.getElementById('add-game-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const descriptionTextarea = document.getElementById('game-description');
    const descriptionCount = document.getElementById('description-count');

    // Form submission
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
    }

    // Character count for description
    if (descriptionTextarea && descriptionCount) {
        descriptionTextarea.addEventListener('input', function () {
            const count = this.value.length;
            descriptionCount.textContent = count;

            // Color coding for character limit
            if (count > 450) {
                descriptionCount.style.color = 'var(--color-danger)';
            } else if (count > 400) {
                descriptionCount.style.color = 'var(--color-warning)';
            } else {
                descriptionCount.style.color = 'var(--color-text-muted)';
            }
        });
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const publishBtn = document.getElementById('publish-btn');
    const btnText = publishBtn.querySelector('.btn-text');
    const btnLoader = publishBtn.querySelector('.btn-loader');

    // Show loading state
    publishBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        // Get logged-in user from localStorage
        const storedData = localStorage.getItem('bitswap_demo_user');
        const currentUser = JSON.parse(storedData || '{}');
        const ownerUsername = currentUser.username || "null";

        // Upload images first and get paths
        console.log('Starting image upload...');
        let photoPaths = [];
        try {
            photoPaths = await uploadImages();
            console.log('Images uploaded successfully:', photoPaths);
        } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            // Continue without images rather than failing completely
            photoPaths = [];
        }

        // Get tags
        const tags = document.getElementById('game-tags').value;

        // Collect form data
        const formData = {
            title: document.getElementById('game-title').value.trim(),
            description: document.getElementById('game-description').value.trim(),
            condition: document.getElementById('game-condition').value,
            photos: photoPaths.join(','), // Store comma-separated paths
            tags: tags, // Store comma-separated tags
            price: parseFloat(document.getElementById('rental-price').value),
            active: document.getElementById('availability-toggle').checked,
            startDate: document.getElementById('start-date').value || null,
            endDate: document.getElementById('end-date').value || null,
            ownerUsername: ownerUsername
        };

        console.log('Submitting game data:', formData);

        // Send to backend
        const response = await fetch('/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error('Failed to create listing: ' + response.status);
        }

        const result = await response.json();
        console.log('Game added successfully:', result);

        // Show success modal
        showSuccessModal();

    } catch (error) {
        console.error('Error publishing listing:', error);
        // Show error message with more detail
        showErrorMessage('Failed to publish listing: ' + error.message);

    } finally {
        // Reset button state
        publishBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

function collectPhotoUrls() {
    // Collect image paths from the photo preview (now storing file paths from backend)
    const photoPreview = document.getElementById('photo-preview');
    if (!photoPreview) return '';

    const images = photoPreview.querySelectorAll('img');
    const paths = Array.from(images).map(img => img.dataset.imagePath || '');
    return paths.filter(path => path).join(',');
}

async function uploadImages() {
    // Upload images to backend and get paths
    const photoPreview = document.getElementById('photo-preview');
    if (!photoPreview) return [];

    const images = photoPreview.querySelectorAll('img');
    const imagePaths = [];

    for (const img of images) {
        // Skip if already has a path (shouldn't happen on first upload)
        if (img.dataset.imagePath) {
            imagePaths.push(img.dataset.imagePath);
            continue;
        }

        // Convert data URL to blob
        const response = await fetch(img.src);
        const blob = await response.blob();

        // Create FormData and upload
        const formData = new FormData();
        formData.append('file', blob, `game_image_${Date.now()}.png`);

        try {
            const uploadResponse = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                imagePaths.push(result.imagePath);
                img.dataset.imagePath = result.imagePath;
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload one or more images');
        }
    }

    return imagePaths;
}

function handleCancel() {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        // Navigate back or clear form
        window.history.back();
    }
}

/* ========================
   FORM VALIDATION
   ======================== */

function initValidation() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');

    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', function () {
            validateField(this);
        });

        // Clear error on input
        input.addEventListener('input', function () {
            clearFieldError(this);
        });
    });
}

function validateForm() {
    let isValid = true;

    // Validate all required fields
    const requiredFields = [
        { id: 'game-title', name: 'title', message: 'Game title is required' },
        { id: 'game-description', name: 'description', message: 'Description is required' },
        { id: 'game-condition', name: 'condition', message: 'Please select a condition' },
        { id: 'rental-price', name: 'price', message: 'Rental price is required' }
    ];

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!validateField(element, field.message)) {
            isValid = false;
        }
    });

    // Validate price
    if (!validatePrice()) {
        isValid = false;
    }

    // Validate dates if availability is active
    if (isAvailabilityActive() && !validateDates()) {
        isValid = false;
    }

    return isValid;
}

function validateField(element, customMessage = null) {
    const fieldGroup = element.closest('.field-group');
    const errorElement = fieldGroup.querySelector('.error-message');

    if (!element.value.trim()) {
        if (element.hasAttribute('required')) {
            showFieldError(fieldGroup, errorElement, customMessage || 'This field is required');
            return false;
        }
    }

    // Specific validations
    if (element.id === 'game-title') {
        if (element.value.length < 3) {
            showFieldError(fieldGroup, errorElement, 'Title must be at least 3 characters long');
            return false;
        }
    }

    if (element.id === 'game-description') {
        if (element.value.length < 10) {
            showFieldError(fieldGroup, errorElement, 'Description must be at least 10 characters long');
            return false;
        }
        if (element.value.length > 500) {
            showFieldError(fieldGroup, errorElement, 'Description cannot exceed 500 characters');
            return false;
        }
    }

    clearFieldError(element);
    return true;
}

function validatePrice() {
    const priceInput = document.getElementById('rental-price');
    const fieldGroup = priceInput.closest('.field-group');
    const errorElement = fieldGroup.querySelector('.error-message');
    const price = parseFloat(priceInput.value);

    if (!priceInput.value) {
        showFieldError(fieldGroup, errorElement, 'Rental price is required');
        return false;
    }

    if (isNaN(price) || price <= 0) {
        showFieldError(fieldGroup, errorElement, 'Please enter a valid price greater than 0');
        return false;
    }

    if (price > 1000) {
        showFieldError(fieldGroup, errorElement, 'Price cannot exceed €1000 per day');
        return false;
    }

    clearFieldError(priceInput);
    return true;
}

function validateDates() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startFieldGroup = startDateInput.closest('.field-group');
    const endFieldGroup = endDateInput.closest('.field-group');
    const startErrorElement = startFieldGroup.querySelector('.error-message');
    const endErrorElement = endFieldGroup.querySelector('.error-message');

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isValid = true;

    // Check if start date is provided and valid
    if (startDateInput.value) {
        if (startDate < today) {
            showFieldError(startFieldGroup, startErrorElement, 'Start date cannot be in the past');
            isValid = false;
        } else {
            clearFieldError(startDateInput);
        }
    }

    // Check if end date is provided and valid
    if (endDateInput.value) {
        if (startDateInput.value && endDate <= startDate) {
            showFieldError(endFieldGroup, endErrorElement, 'End date must be after start date');
            isValid = false;
        } else {
            clearFieldError(endDateInput);
        }
    }

    return isValid;
}

function showFieldError(fieldGroup, errorElement, message) {
    fieldGroup.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearFieldError(element) {
    const fieldGroup = element.closest('.field-group');
    const errorElement = fieldGroup.querySelector('.error-message');

    fieldGroup.classList.remove('error');
    errorElement.classList.remove('show');
    errorElement.textContent = '';
}

/* ========================
   PHOTO UPLOAD
   ======================== */

function initPhotoUpload() {
    const fileInput = document.getElementById('game-photos');
    const photoPreview = document.getElementById('photo-preview');
    const uploadLabel = document.querySelector('.file-upload-label');

    if (!fileInput || !photoPreview) return;

    // Handle file selection
    fileInput.addEventListener('change', handleFileSelection);

    // Handle drag and drop
    uploadLabel.addEventListener('dragover', handleDragOver);
    uploadLabel.addEventListener('dragenter', handleDragEnter);
    uploadLabel.addEventListener('dragleave', handleDragLeave);
    uploadLabel.addEventListener('drop', handleDrop);
}

function handleFileSelection(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('dragover');
}

function handleDragLeave(e) {
    e.target.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
        processFiles(imageFiles);
    }
}

function processFiles(files) {
    const photoPreview = document.getElementById('photo-preview');
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Limit number of files
    if (files.length > maxFiles) {
        showErrorMessage(`You can only upload up to ${maxFiles} photos`);
        return;
    }

    // Clear previous preview
    photoPreview.innerHTML = '';

    files.forEach((file, index) => {
        // Check file size
        if (file.size > maxSize) {
            showErrorMessage(`File "${file.name}" is too large. Maximum size is 5MB.`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoItem = createPhotoPreview(e.target.result, file.name, index);
            photoPreview.appendChild(photoItem);
        };
        reader.readAsDataURL(file);
    });
}

function createPhotoPreview(src, filename, index) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${src}" alt="${filename}">
        <button type="button" class="photo-remove" onclick="removePhoto(this)" title="Remove photo">
            ✕
        </button>
    `;
    return photoItem;
}

function removePhoto(button) {
    const photoItem = button.closest('.photo-item');
    if (photoItem) {
        photoItem.remove();
    }

    // If no photos left, clear file input
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview.children.length === 0) {
        const fileInput = document.getElementById('game-photos');
        fileInput.value = '';
    }
}

/* ========================
   AVAILABILITY TOGGLE
   ======================== */

function initAvailabilityToggle() {
    const toggle = document.getElementById('availability-toggle');
    const toggleText = document.getElementById('toggle-text');
    const availabilityDates = document.getElementById('availability-dates');

    if (!toggle || !toggleText || !availabilityDates) return;

    toggle.addEventListener('change', function () {
        if (this.checked) {
            toggleText.textContent = 'Active';
            availabilityDates.classList.remove('hidden');
        } else {
            toggleText.textContent = 'Inactive';
            availabilityDates.classList.add('hidden');

            // Clear date fields when inactive
            document.getElementById('start-date').value = '';
            document.getElementById('end-date').value = '';
        }
    });

    // Initial state
    if (toggle.checked) {
        availabilityDates.classList.remove('hidden');
    } else {
        availabilityDates.classList.add('hidden');
    }
}

function isAvailabilityActive() {
    const toggle = document.getElementById('availability-toggle');
    return toggle && toggle.checked;
}

/* ========================
   DATE VALIDATION
   ======================== */

function initDateValidation() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (!startDateInput || !endDateInput) return;

    startDateInput.addEventListener('change', function () {
        // Update end date minimum when start date changes
        if (this.value) {
            const startDate = new Date(this.value);
            const nextDay = new Date(startDate);
            nextDay.setDate(startDate.getDate() + 1);
            endDateInput.min = BitSwapUtils.formatDate(nextDay);
        }

        // Validate dates
        BitSwapUtils.debounce(validateDates, 300)();
    });

    endDateInput.addEventListener('change', function () {
        // Validate dates
        BitSwapUtils.debounce(validateDates, 300)();
    });
}

function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startDateInput = document.getElementById('start-date');
    if (startDateInput) {
        startDateInput.min = BitSwapUtils.formatDate(today);
        startDateInput.value = BitSwapUtils.formatDate(tomorrow);
    }

    const endDateInput = document.getElementById('end-date');
    if (endDateInput) {
        const weekLater = new Date(tomorrow);
        weekLater.setDate(tomorrow.getDate() + 7);
        endDateInput.min = BitSwapUtils.formatDate(tomorrow);
        endDateInput.value = BitSwapUtils.formatDate(weekLater);
    }
}

/* ========================
   MODAL FUNCTIONS
   ======================== */

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Navigate to listings page
    window.location.href = 'listings.html';
}

function addAnother() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Reset form
    resetForm();
}

function resetForm() {
    const form = document.getElementById('add-game-form');
    if (form) {
        form.reset();
    }

    // Clear photo preview
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) {
        photoPreview.innerHTML = '';
    }

    // Reset toggle state
    const toggle = document.getElementById('availability-toggle');
    const toggleText = document.getElementById('toggle-text');
    const availabilityDates = document.getElementById('availability-dates');

    if (toggle && toggleText && availabilityDates) {
        toggle.checked = true;
        toggleText.textContent = 'Active';
        availabilityDates.classList.remove('hidden');
    }

    // Reset dates
    setMinDate();

    // Clear all errors
    const errorElements = document.querySelectorAll('.error-message.show');
    errorElements.forEach(error => {
        error.classList.remove('show');
        error.textContent = '';
    });

    const fieldGroups = document.querySelectorAll('.field-group.error');
    fieldGroups.forEach(group => {
        group.classList.remove('error');
    });

    // Reset character count
    const descriptionCount = document.getElementById('description-count');
    if (descriptionCount) {
        descriptionCount.textContent = '0';
        descriptionCount.style.color = 'var(--color-text-muted)';
    }
}

function showErrorMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-danger);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

/* ========================
   UTILITY EXTENSIONS
   ======================== */

// Tags functionality
let selectedTags = [];

function initTagsInput() {
    const tagsInput = document.getElementById('game-tags-input');
    const tagsContainer = document.getElementById('tags-container');
    const tagsHidden = document.getElementById('game-tags');
    const tagSuggestions = document.querySelectorAll('.tag-suggestion');

    if (!tagsInput || !tagsContainer) return;

    // Handle Enter key to add tags
    tagsInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = this.value.trim();
            if (tag && !selectedTags.includes(tag)) {
                addTag(tag);
                this.value = '';
            }
        }
    });

    // Handle suggestion clicks
    tagSuggestions.forEach(suggestion => {
        suggestion.addEventListener('click', function () {
            const tag = this.dataset.tag;
            if (!selectedTags.includes(tag)) {
                addTag(tag);
                this.classList.add('added');
            }
        });
    });

    function addTag(tag) {
        selectedTags.push(tag);
        updateTagsDisplay();
        updateTagsHidden();
    }

    function removeTag(tag) {
        selectedTags = selectedTags.filter(t => t !== tag);
        updateTagsDisplay();
        updateTagsHidden();

        // Re-enable suggestion if it exists
        tagSuggestions.forEach(suggestion => {
            if (suggestion.dataset.tag === tag) {
                suggestion.classList.remove('added');
            }
        });
    }

    function updateTagsDisplay() {
        tagsContainer.innerHTML = selectedTags.map(tag => `
            <span class="tag-item">
                ${tag}
                <span class="tag-remove" onclick="removeTagByName('${tag}')">×</span>
            </span>
        `).join('');
    }

    function updateTagsHidden() {
        tagsHidden.value = selectedTags.join(',');
    }

    // Make removeTag available globally
    window.removeTagByName = function (tag) {
        removeTag(tag);
    };
}

// Extend BitSwapUtils with additional functions for this page
if (typeof BitSwapUtils !== 'undefined') {
    BitSwapUtils.formatDate = function (date) {
        return date.toISOString().split('T')[0];
    };
}