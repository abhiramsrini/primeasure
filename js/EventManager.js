class EventManager {
    constructor() {
        this.events = [];
        this.loaded = false;
    }

    async loadEvents() {
        if (this.loaded) {
            return this.events;
        }

        const inlineEvents = this.loadInlineEvents();
        if (inlineEvents) {
            this.events = this.sortEventsByDate(inlineEvents);
            this.loaded = true;
            return this.events;
        }

        try {
            console.log('Attempting to load events from:', '../data/events.json');
            const response = await fetch('../data/events.json');
            console.log('Fetch response:', response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Loaded events data:', data);
            
            this.events = this.sortEventsByDate(data.events || []);
            this.loaded = true;
            return this.events;
        } catch (error) {
            console.error('Failed to load events:', error);
            console.error('Error details:', error.message);
            console.error('💡 TIP: Serve the website with: python3 -m http.server 8080');
            console.error('💡 Then access: http://localhost:8080/events');
            
            // Fallback to hardcoded data if fetch fails
            console.log('Using fallback event data');
            this.events = this.sortEventsByDate(this.getFallbackEvents());
            this.loaded = true;
            return this.events;
        }
    }

    loadInlineEvents() {
        if (typeof window !== 'undefined') {
            const globalEvents = window.__EVENTS__;
            if (Array.isArray(globalEvents)) {
                return globalEvents;
            }
            if (globalEvents && Array.isArray(globalEvents.events)) {
                return globalEvents.events;
            }
        }

        if (typeof document === 'undefined') {
            return null;
        }

        const inlineScript = document.getElementById('events-data');
        if (!inlineScript) {
            return null;
        }

        try {
            const parsed = JSON.parse(inlineScript.textContent);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            if (parsed && Array.isArray(parsed.events)) {
                return parsed.events;
            }
        } catch (error) {
            console.warn('EventManager: failed to parse inline events data', error);
        }

        return null;
    }

    sortEventsByDate(events = []) {
        return [...events].sort((a, b) => {
            const aDate = this.parseEventDate(a?.date);
            const bDate = this.parseEventDate(b?.date);
            return aDate - bDate;
        });
    }

    parseEventDate(dateString) {
        if (!dateString || dateString.toUpperCase() === 'TBD') {
            return Number.POSITIVE_INFINITY;
        }
        const parsed = Date.parse(dateString);
        if (Number.isNaN(parsed)) {
            return Number.POSITIVE_INFINITY;
        }
        return parsed;
    }

    getFallbackEvents() {
        return [
            {
                "id": "memory-solutions-2025-09-02",
                "slug": "memory-solutions-seminar",
                "type": "seminar",
                "title": "Discover Advanced Memory Solutions",
                "date": "2025-09-02",
                "time": "9:00 AM",
                "location": "Bengaluru, India",
                "description": "Learn about advanced memory solutions and best practices from our experts.",
                "fullDescription": "Join industry professionals for in-depth technical discussions and demonstrations.",
                "image": "../images/logo.png",
                "imageAlt": "Primeasure Logo",
                "registrationEnabled": true,
                "company": "Primeasure",
                "status": "upcoming"
            },
            {
                "id": "ibc-2025-09-12",
                "slug": "ibc-2025",
                "type": "expo",
                "title": "IBC 2025",
                "date": "2025-09-12",
                "dateEnd": "2025-09-15",
                "time": "9:00 AM",
                "location": "Amsterdam, Netherlands",
                "description": "Join us at the world's most influential media, entertainment & technology show. Visit us at the GrassValley Booth Hall 9, Booth 9.A01.",
                "fullDescription": "Experience the future of broadcasting at IBC 2025. Connect with our team at the GrassValley booth.",
                "image": "../images/events/ibc.png",
                "imageAlt": "IBC 2025 Logo",
                "registrationEnabled": false,
                "externalUrl": "https://www.ibc.org/",
                "company": "GrassValley",
                "status": "upcoming"
            },
            {
                "id": "broadcast-india-2025-10-14",
                "slug": "broadcast-india-2025",
                "type": "expo",
                "title": "Broadcast India 2025",
                "date": "2025-10-14",
                "dateEnd": "2025-10-16",
                "time": "9:00 AM",
                "location": "Mumbai, India",
                "description": "Join us at the GrassValley booth to explore our latest broadcast solutions and meet our experts.",
                "fullDescription": "India's premier event for the Media & Entertainment industry. Visit us at the GrassValley booth.",
                "image": "../images/events/bi2025.png",
                "imageAlt": "Broadcast India 2025 Logo",
                "registrationEnabled": false,
                "externalUrl": "https://www.broadcastindiashow.com/",
                "company": "GrassValley",
                "status": "upcoming"
            },
            {
                "id": "auto-ev-bharat-2025-11-19",
                "slug": "auto-ev-bharat-2025",
                "type": "expo",
                "title": "AUTO EV BHARAT 2025",
                "date": "2025-11-19",
                "dateEnd": "2025-11-21",
                "time": "9:00 AM",
                "location": "Bengaluru, India",
                "description": "Join us as we represent Teledyne Lecroy and explore our test and measuring solutions catered for the automobile industry.",
                "fullDescription": "Discover advanced automotive testing solutions and connect with industry experts at India's premier EV expo.",
                "image": "../images/events/auto-ev.png",
                "imageAlt": "AUTO EV BHARAT 2025 Logo",
                "registrationEnabled": false,
                "externalUrl": "https://www.autoevbharat.com/",
                "company": "Teledyne LeCroy",
                "status": "upcoming"
            },
            {
                "id": "oscilloscope-showcase-2025-12",
                "slug": "oscilloscope-technology-showcase",
                "type": "showcase",
                "title": "Advanced Oscilloscope Technology Showcase",
                "date": "TBD",
                "time": "TBD",
                "location": "Bengaluru, India",
                "description": "Experience hands-on demonstrations of cutting-edge oscilloscopes and explore revolutionary testing solutions across multiple industries.",
                "fullDescription": "Join us for an interactive showcase featuring next-generation oscilloscopes and advanced measurement technologies from Teledyne LeCroy.",
                "image": "../images/logo.png",
                "imageAlt": "Teledyne LeCroy Logo",
                "registrationEnabled": true,
                "company": "Teledyne LeCroy",
                "status": "upcoming"
            }
        ];
    }

    getAllEvents() {
        return this.events;
    }

    getEventBySlug(slug) {
        return this.events.find(event => event.slug === slug);
    }

    getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    getUpcomingEvents() {
        return this.events.filter(event => this.normalizeStatus(event.status) !== 'completed');
    }

    getCompletedEvents() {
        return [...this.events]
            .filter(event => this.normalizeStatus(event.status) === 'completed')
            .sort((a, b) => this.parseEventDate(b?.date) - this.parseEventDate(a?.date));
    }

    getRegistrableEvents() {
        return this.events.filter(event => event.registrationEnabled);
    }

    formatEventDate(event) {
        if (event.date === 'TBD') {
            return {
                weekday: 'TBD',
                month: 'TBD',
                day: 'TBD',
                year: '2025',
                displayDate: 'TBD'
            };
        }

        // Parse dates as local dates to avoid timezone issues
        const startDate = new Date(event.date + 'T12:00:00');
        const endDate = event.dateEnd ? new Date(event.dateEnd + 'T12:00:00') : null;

        const weekday = startDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const year = startDate.getFullYear().toString();

        let day, displayDate;
        
        if (endDate && event.dateEnd !== event.date) {
            // Multi-day event
            const startDay = startDate.getDate();
            const endDay = endDate.getDate();
            day = `${startDay}-${endDay}`;
            displayDate = `${month} ${startDay}-${endDay}, ${year}`;
        } else {
            // Single day event
            day = startDate.getDate().toString().padStart(2, '0');
            displayDate = startDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        return {
            weekday,
            month,
            day,
            year,
            displayDate,
            time: event.time || 'TBD'
        };
    }

    renderEventCard(event) {
        const dateInfo = this.formatEventDate(event);
        const actionButton = this.getActionButton(event);
        const statusTag = this.getStatusTag(event);

        return `
            <div class="event-card">
                <div class="event-date-badge">
                    <span class="weekday">${dateInfo.weekday}</span>
                    <span class="month">${dateInfo.month}</span>
                    <span class="day">${dateInfo.day}</span>
                    <span class="year">${dateInfo.year}</span>
                    <span class="time">${dateInfo.time}</span>
                </div>
                <div class="event-main">
                    <div class="event-main__header">
                        <h3>${event.title}</h3>
                        ${statusTag}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <p>${event.description}</p>
                    <div class="event-actions">
                        ${actionButton}
                    </div>
                </div>
                <div class="event-logo">
                    <img src="${event.image}" alt="${event.imageAlt}">
                </div>
            </div>
        `;
    }

    getActionButton(event) {
        const status = this.normalizeStatus(event.status);
        const recapUrl = event.recapUrl || event.recordingUrl || event.slidesUrl;
        const recapLabel = event.recapLabel || 'View Recap';

        if (status === 'completed') {
            if (recapUrl) {
                return `<a href="${recapUrl}" target="_blank" rel="noopener noreferrer" class="info-button recap-button">${recapLabel}</a>`;
            }
            return '<span class="event-status-note">Thanks for joining</span>';
        }

        if (event.registrationEnabled) {
            return `<a href="../register#${event.slug}" class="register-button">Register Now</a>`;
        } else if (event.externalUrl) {
            return `<a href="${event.externalUrl}" target="_blank" rel="noopener noreferrer" class="info-button">Learn More</a>`;
        } else {
            return '';
        }
    }

    getStatusTag(event) {
        const status = this.normalizeStatus(event.status);
        if (status === 'completed') {
            return '<span class="event-status-tag event-status-tag--completed">Event Completed</span>';
        }
        return '';
    }

    normalizeStatus(value) {
        if (!value) return 'upcoming';
        return String(value).trim().toLowerCase();
    }

    renderEventsGrid(events = null, emptyMessage = 'More events will be announced soon. Stay tuned!') {
        const eventsToRender = events || this.getAllEvents();
        if (!eventsToRender.length) {
            return `
                <div class="events-empty-state">
                    ${emptyMessage}
                </div>
            `;
        }
        return eventsToRender.map(event => this.renderEventCard(event)).join('');
    }

    renderSections({ upcomingContainer, completedContainer } = {}) {
        if (upcomingContainer) {
            upcomingContainer.innerHTML = this.renderEventsGrid(
                this.getUpcomingEvents(),
                'New events will be announced soon. Stay tuned!'
            );
        }

        if (completedContainer) {
            completedContainer.innerHTML = this.renderEventsGrid(
                this.getCompletedEvents(),
                'No completed events to show yet.'
            );
        }
    }
}

// Create global instance
window.eventManager = new EventManager();
