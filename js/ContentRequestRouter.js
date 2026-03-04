class ContentRequestRouter {
    constructor() {
        this.currentEventSlug = null;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1);

        if (!hash) {
            this.showEventNotFound('Please select a completed event from the events page.');
            return;
        }

        this.currentEventSlug = hash;
        this.loadEventData(hash);
    }

    async loadEventData(slug) {
        try {
            await window.eventManager.loadEvents();
            const event = window.eventManager.getEventBySlug(slug);

            if (
                !event ||
                window.eventManager.normalizeStatus(event.status) !== 'completed' ||
                !window.eventManager.isContentRequestEnabled(event)
            ) {
                this.showEventNotFound('Content requests are available only for events with recap assets.');
                return;
            }

            this.populateRequestForm(event);
        } catch (error) {
            console.error('Failed to load event data:', error);
            this.showEventNotFound('Unable to load this event right now. Please try again.');
        }
    }

    populateRequestForm(event) {
        document.title = `Request Content for ${event.title} - Primeasure`;

        const requestTitle = document.getElementById('request-title');
        if (requestTitle) {
            requestTitle.textContent = `Request Content for ${event.title}`;
        }

        const eventTitleField = document.getElementById('event-title-field');
        if (eventTitleField) {
            eventTitleField.value = event.title;
        }

        const eventTypeField = document.getElementById('event-type');
        const eventIdField = document.getElementById('event-id');
        if (eventTypeField) eventTypeField.value = event.type || '';
        if (eventIdField) eventIdField.value = event.id || '';

        this.updateEventCard(event);
    }

    updateEventCard(event) {
        const dateInfo = window.eventManager.formatEventDate(event);

        const elements = {
            'event-weekday': dateInfo.weekday,
            'event-month': dateInfo.month,
            'event-day': dateInfo.day,
            'event-year': dateInfo.year,
            'event-time': dateInfo.time,
            'event-name': event.title,
            'event-location': event.location,
            'event-description': event.fullDescription || event.description
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '';
            }
        });

        const logoImg = document.querySelector('.event-logo img');
        if (logoImg) {
            logoImg.src = event.image || '../images/logo.png';
            logoImg.alt = event.imageAlt || 'Event Logo';
        }
    }

    showEventNotFound(message) {
        const eventCard = document.getElementById('request-event-card');
        if (eventCard) {
            eventCard.style.display = 'none';
        }
        const requestForm = document.getElementById('content-request-form');
        if (requestForm) {
            requestForm.style.display = 'none';
        }

        const requestTitle = document.getElementById('request-title');
        if (requestTitle) {
            requestTitle.textContent = 'Event Not Found';
        }

        const eventTitleField = document.getElementById('event-title-field');
        if (eventTitleField) {
            eventTitleField.value = '';
        }

        const container = document.querySelector('.contact-section .container');
        if (!container || container.querySelector('.error-message')) {
            return;
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Unable to Load Event</h3>
            <p>${message}</p>
            <a href="../events" class="register-button">Back to Events</a>
        `;
        errorDiv.style.cssText = 'text-align: center; padding: 2rem; background: #f5f5f5; border-radius: 8px; margin: 0 0 2rem;';
        container.insertBefore(errorDiv, container.firstChild);
    }
}

window.contentRequestRouter = new ContentRequestRouter();
