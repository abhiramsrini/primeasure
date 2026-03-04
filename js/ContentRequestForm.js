class ContentRequestForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.submitLabel = 'Request Content';
        this.init();
    }

    init() {
        if (!this.form) {
            return;
        }

        this.addEventListeners();
    }

    addEventListeners() {
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        ['name', 'email', 'company'].forEach((fieldName) => {
            const field = this.form.querySelector(`#${fieldName}`);
            if (!field) {
                return;
            }
            field.addEventListener('blur', () => this.validateField(fieldName));
            field.addEventListener('input', () => this.clearFieldError(fieldName));
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        const fields = ['name', 'email', 'company'];
        const allValid = fields.every((fieldName) => this.validateField(fieldName));

        if (!allValid) {
            const firstError = this.form.querySelector('.field-invalid');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        this.submitForm();
    }

    validateField(fieldName) {
        const field = this.form.querySelector(`#${fieldName}`);
        if (!field) {
            return true;
        }

        const value = field.value.trim();
        let valid = true;
        let errorMessage = '';

        if (fieldName === 'name') {
            if (value.length < 2 || !/^[a-zA-Z\s]+$/.test(value)) {
                valid = false;
                errorMessage = 'Please enter a valid full name (letters and spaces only).';
            }
        }

        if (fieldName === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                valid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        if (fieldName === 'company') {
            if (value.length < 2) {
                valid = false;
                errorMessage = 'Company name is required (minimum 2 characters).';
            }
        }

        this.updateFieldUI(field, valid, errorMessage);
        return valid;
    }

    updateFieldUI(field, isValid, errorMessage) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) {
            return;
        }

        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.remove('field-valid', 'field-invalid');
        formGroup.classList.remove('has-success', 'has-error');

        if (isValid) {
            field.classList.add('field-valid');
            formGroup.classList.add('has-success');
            return;
        }

        field.classList.add('field-invalid');
        formGroup.classList.add('has-error');

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = errorMessage;
        formGroup.appendChild(errorElement);
    }

    clearFieldError(fieldName) {
        const field = this.form.querySelector(`#${fieldName}`);
        if (!field) {
            return;
        }

        const formGroup = field.closest('.form-group');
        if (!formGroup) {
            return;
        }

        if (field.classList.contains('field-invalid')) {
            field.classList.remove('field-invalid');
            formGroup.classList.remove('has-error');
            const existingError = formGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        }
    }

    async submitForm() {
        const payload = new FormData(this.form);
        this.setLoadingState(true);

        try {
            const response = await fetch('../api/content-request-submit.php', {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: payload
            });

            const responseText = await response.text();
            let result = {};

            try {
                result = JSON.parse(responseText);
            } catch (error) {
                result = {};
            }

            const isSuccess = response.ok && (result.success === true || result.success === 'true');
            if (!isSuccess) {
                throw new Error(result.message || 'Unable to submit your request right now.');
            }

            this.showSuccessMessage();
        } catch (error) {
            console.error('Content request submission error:', error);
            this.showErrorMessage(error.message || 'Unable to submit your request right now.');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        const submitBtn = this.form.querySelector('.submit-button');
        if (!submitBtn) {
            return;
        }

        Array.from(this.form.elements).forEach((element) => {
            element.disabled = isLoading;
        });

        if (isLoading) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.classList.add('loading');
            return;
        }

        submitBtn.textContent = this.submitLabel;
        submitBtn.classList.remove('loading');
    }

    showSuccessMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Request Submitted</h3>
                <p>Thanks for your request. Our team will share available content shortly.</p>
                <button class="success-button">Back to Events</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('.success-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.remove();
                window.location.href = '../events';
            });
        }

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                window.location.href = '../events';
            }
        }, 5000);
    }

    showErrorMessage(message) {
        const existingError = this.form.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        this.form.insertBefore(errorDiv, this.form.firstChild);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('content-request-form');
    if (form) {
        window.contentRequestForm = new ContentRequestForm('content-request-form');
    }
});
