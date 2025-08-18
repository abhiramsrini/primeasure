class EventRouter {
    constructor() {
        this.currentEventSlug = null;
        this.init();
    }

    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Handle initial route
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.substring(1); // Remove the #
        
        if (hash) {
            this.currentEventSlug = hash;
            this.loadEventData(hash);
        }
    }

    async loadEventData(slug) {
        try {
            // Ensure events are loaded
            await window.eventManager.loadEvents();
            
            const event = window.eventManager.getEventBySlug(slug);
            
            if (event) {
                this.populateRegistrationForm(event);
            } else {
                console.error('Event not found:', slug);
                this.showEventNotFound();
            }
        } catch (error) {
            console.error('Failed to load event data:', error);
            this.showEventNotFound();
        }
    }

    populateRegistrationForm(event) {
        // Update page title
        document.title = `Register for ${event.title} - Primeasure`;
        
        // Update form title
        const eventTitleElement = document.getElementById('event-title');
        if (eventTitleElement) {
            eventTitleElement.textContent = `Register for ${event.title}`;
        }

        // Update event title field
        const eventTitleField = document.getElementById('event-title-field');
        if (eventTitleField) {
            eventTitleField.value = event.title;
        }

        // Update event card display
        this.updateEventCard(event);

        // Set hidden form fields
        const eventTypeField = document.getElementById('event-type');
        const eventIdField = document.getElementById('event-id');
        
        if (eventTypeField) eventTypeField.value = event.type;
        if (eventIdField) eventIdField.value = event.id;
    }

    updateEventCard(event) {
        const dateInfo = window.eventManager.formatEventDate(event);

        // Update date badge
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
                element.textContent = value;
            }
        });

        // Update event logo
        const logoImg = document.querySelector('.event-logo img');
        if (logoImg) {
            logoImg.src = event.image;
            logoImg.alt = event.imageAlt;
        }
    }

    showEventNotFound() {
        // Show error message or redirect to events page
        const eventTitleElement = document.getElementById('event-title');
        if (eventTitleElement) {
            eventTitleElement.textContent = 'Event Not Found';
        }

        // Hide the event card
        const eventCard = document.querySelector('.event-card');
        if (eventCard) {
            eventCard.style.display = 'none';
        }

        // Show error message
        const container = document.querySelector('.contact-section .container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <h3>Event Not Found</h3>
                <p>The event you're looking for could not be found.</p>
                <a href="../events" class="register-button">Back to Events</a>
            `;
            errorDiv.style.cssText = `
                text-align: center;
                padding: 2rem;
                background: #f5f5f5;
                border-radius: 8px;
                margin: 2rem 0;
            `;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }

    navigateToEvent(slug) {
        window.location.hash = slug;
    }

    getCurrentEventSlug() {
        return this.currentEventSlug;
    }

    static createEventUrl(slug) {
        return `../register#${slug}`;
    }
}

// Create global instance
window.eventRouter = new EventRouter();