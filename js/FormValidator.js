class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.validators = new Map();
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }

        // Set up default validators
        this.setupDefaultValidators();
        
        // Add event listeners
        this.addEventListeners();
    }

    setupDefaultValidators() {
        // Name validation
        this.addValidator('name', {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Please enter a valid name (letters and spaces only)'
        });

        // Email validation
        this.addValidator('email', {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        });

        // Phone validation
        this.addValidator('phone', {
            required: true,
            pattern: /^[\+]?[\d\s\-\(\)]{10,}$/,
            message: 'Please enter a valid phone number (minimum 10 digits)'
        });

        // Company validation (optional)
        this.addValidator('company', {
            required: false,
            minLength: 2,
            message: 'Company name must be at least 2 characters'
        });

        // Designation validation (optional)
        this.addValidator('designation', {
            required: false,
            minLength: 2,
            message: 'Designation must be at least 2 characters'
        });
    }

    addValidator(fieldName, rules) {
        this.validators.set(fieldName, rules);
    }

    addEventListeners() {
        // Add blur event listeners for real-time validation
        this.validators.forEach((rules, fieldName) => {
            const field = this.form.querySelector(`#${fieldName}`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });

        // Add form submit listener
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(fieldName) {
        const field = this.form.querySelector(`#${fieldName}`);
        const rules = this.validators.get(fieldName);
        
        if (!field || !rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field check
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
        }
        // Minimum length check
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`;
        }
        // Pattern check
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message || `${this.getFieldLabel(fieldName)} format is invalid`;
        }

        // Update field UI
        this.updateFieldUI(field, isValid, errorMessage);
        
        return isValid;
    }

    validateForm() {
        let isFormValid = true;
        
        this.validators.forEach((rules, fieldName) => {
            const fieldValid = this.validateField(fieldName);
            if (!fieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    updateFieldUI(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        
        if (!formGroup) return;

        // Remove existing error elements
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Remove validation classes
        field.classList.remove('field-valid', 'field-invalid');
        formGroup.classList.remove('has-error', 'has-success');

        if (isValid && field.value.trim()) {
            // Valid field
            field.classList.add('field-valid');
            formGroup.classList.add('has-success');
        } else if (!isValid) {
            // Invalid field
            field.classList.add('field-invalid');
            formGroup.classList.add('has-error');

            // Add error message
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            formGroup.appendChild(errorElement);
        }
    }

    clearFieldError(fieldName) {
        const field = this.form.querySelector(`#${fieldName}`);
        if (!field) return;

        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove error styling if user is typing
        if (field.classList.contains('field-invalid')) {
            field.classList.remove('field-invalid');
            formGroup.classList.remove('has-error');
            
            const errorElement = formGroup.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    getFieldLabel(fieldName) {
        const field = this.form.querySelector(`#${fieldName}`);
        if (!field) return fieldName;

        const label = this.form.querySelector(`label[for="${fieldName}"]`);
        if (label) {
            return label.textContent.replace('*', '').trim();
        }

        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    }

    handleSubmit(e) {
        e.preventDefault();

        const isFormValid = this.validateForm();
        
        if (!isFormValid) {
            // Scroll to first error
            const firstError = this.form.querySelector('.field-invalid');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        // If form is valid, proceed with submission
        this.submitForm();
        return true;
    }

    async submitForm() {
        const submitBtn = this.form.querySelector('.submit-button');
        const originalBtnText = submitBtn.textContent;
        
        // Show loading state
        this.setLoadingState(true);

        try {
            // Get form data
            const formData = this.getFormData();

            // Submit to Google Form
            const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe7rtOOYIsrEH-iEJJHrBCqjktH58z5af_7MJ1OEcEVGfYttA/formResponse';
            
            await fetch(formUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData)
            });

            this.showSuccessMessage();

        } catch (error) {
            console.error('Submission error:', error);
            this.showErrorMessage('There was an error submitting the form. Please try again.');
            this.setLoadingState(false);
        }
    }

    getFormData() {
        return {
            'entry.1287541098': document.getElementById('event-title-field').value,
            'entry.908367769': document.getElementById('name').value,
            'entry.446693609': document.getElementById('email').value,
            'entry.1619260382': document.getElementById('phone').value,
            'entry.1308701333': document.getElementById('company').value || '',
            'entry.119358989': document.getElementById('designation').value || '',
            'entry.80917227': document.getElementById('message').value || ''
        };
    }

    setLoadingState(isLoading) {
        const submitBtn = this.form.querySelector('.submit-button');
        const formElements = this.form.elements;

        if (isLoading) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            
            Array.from(formElements).forEach(element => {
                element.disabled = true;
            });
        } else {
            submitBtn.textContent = 'Register Now';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            
            Array.from(formElements).forEach(element => {
                element.disabled = false;
            });
        }
    }

    showSuccessMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Registration Successful!</h3>
                <p>Thank you for registering! We will contact you with further details about the event.</p>
                <button class="success-button">Back to Events</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Handle close button
        const closeBtn = overlay.querySelector('.success-button');
        closeBtn.addEventListener('click', () => {
            overlay.remove();
            window.location.href = '../events';
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                window.location.href = '../events';
            }
        }, 5000);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        
        const existingError = this.form.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        this.form.insertBefore(errorDiv, this.form.firstChild);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Initialize form validator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        window.formValidator = new FormValidator('registration-form');
    }
});