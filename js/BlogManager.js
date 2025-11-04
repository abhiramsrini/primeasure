class BlogManager {
    constructor() {
        this.posts = [];
        this.loaded = false;
        this.topics = new Map();
        this.selectedTopics = new Set();
        this.dropdownOpen = false;
    }

    async loadPosts() {
        if (this.loaded) {
            return this.posts;
        }

        const inlinePosts = this.loadInlinePosts();
        if (inlinePosts) {
            this.posts = this.sortPostsByDate(inlinePosts);
            this.buildTopicsIndex();
            this.loaded = true;
            return this.posts;
        }

        try {
            const response = await fetch('../data/blog.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.posts = this.sortPostsByDate(data.posts || []);
            this.buildTopicsIndex();
            this.loaded = true;
            return this.posts;
        } catch (error) {
            console.error('Failed to load blog posts:', error);
            this.posts = this.sortPostsByDate(this.getFallbackPosts());
            this.buildTopicsIndex();
            this.loaded = true;
            return this.posts;
        }
    }

    loadInlinePosts() {
        if (typeof window !== 'undefined') {
            const globalPosts = window.__BLOG_POSTS__;
            if (Array.isArray(globalPosts)) {
                return globalPosts;
            }
            if (globalPosts && Array.isArray(globalPosts.posts)) {
                return globalPosts.posts;
            }
        }

        if (typeof document === 'undefined') {
            return null;
        }

        const inlineScript = document.getElementById('blog-data');
        if (!inlineScript) {
            return null;
        }

        try {
            const parsed = JSON.parse(inlineScript.textContent);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            if (parsed && Array.isArray(parsed.posts)) {
                return parsed.posts;
            }
        } catch (error) {
            console.warn('BlogManager: failed to parse inline blog data', error);
        }

        return null;
    }

    sortPostsByDate(posts) {
        return [...posts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }

    buildTopicsIndex() {
        this.topics.clear();

        this.posts.forEach(post => {
            (post.topics || []).forEach(topic => {
                const normalizedTopic = topic.toLowerCase();
                const count = this.topics.get(normalizedTopic) || 0;
                this.topics.set(normalizedTopic, count + 1);
            });
        });
    }

    getAllPosts() {
        return this.posts;
    }

    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }

    getTopics() {
        return Array.from(this.topics.entries())
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => a.topic.localeCompare(b.topic));
    }

    renderPostsGrid(posts) {
        if (!posts.length) {
            return `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No articles found for this topic</h3>
                    <p>Try selecting a different topic or check back soon for new updates.</p>
                </div>
            `;
        }

        return posts.map(post => this.renderPostCard(post)).join('');
    }

    renderPostCard(post) {
        const postUrl = `${post.slug}`;
        const displayDate = this.formatDisplayDate(post.publishDate);
        const topicsChips = (post.topics || []).map(topic => `
            <span class="topic-chip" data-topic="${topic.toLowerCase()}" role="button" tabindex="0" aria-label="Filter by ${this.formatTopicLabel(topic)}">${this.formatTopicLabel(topic)}</span>
        `).join('');

        return `
            <article class="blog-card">
                <a href="${postUrl}" class="blog-card__image-link">
                    <img src="${post.heroImage}" alt="${post.heroAlt || post.title}">
                </a>
                <div class="blog-card__content">
                    <div class="blog-card__meta">
                        <span class="blog-card__date">${displayDate}</span>
                        <span class="blog-card__reading-time">${post.readingTime} min read</span>
                    </div>
                    <h3 class="blog-card__title">
                        <a href="${postUrl}">${post.title}</a>
                    </h3>
                    <p class="blog-card__excerpt">${post.excerpt}</p>
                    <div class="blog-card__topics">
                        ${topicsChips}
                    </div>
                    <a href="${postUrl}" class="blog-card__cta">
                        Read Article <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    initializeTopicControls({
        toggleId,
        dropdownId,
        listId,
        activeFiltersId,
        clearButtonId
    }) {
        this.toggleButton = document.getElementById(toggleId);
        this.dropdown = document.getElementById(dropdownId);
        this.checkboxList = document.getElementById(listId);
        this.activeFiltersContainer = document.getElementById(activeFiltersId);
        this.clearButton = document.getElementById(clearButtonId);

        if (!this.toggleButton || !this.dropdown || !this.checkboxList || !this.activeFiltersContainer) {
            console.warn('BlogManager: Topic controls not fully initialized');
            return false;
        }

        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.dropdown.hidden = true;
        this.dropdownOpen = false;

        this.renderTopicCheckboxes();
        this.syncCheckboxStates();
        this.updateActiveFiltersUI();

        this.toggleButton.addEventListener('click', () => {
            this.toggleDropdown();
        });

        this.toggleButton.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.openDropdown();
                this.focusFirstCheckbox();
            }
        });

        this.dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeDropdown();
                this.toggleButton.focus();
            }
        });

        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.selectedTopics.clear();
                this.syncCheckboxStates();
                this.applyTopicFilter();
                this.closeDropdown();
                this.toggleButton.focus();
            });
        }

        this.documentClickHandler = (event) => {
            if (!this.dropdownOpen) return;
            if (
                !this.dropdown.contains(event.target) &&
                !this.toggleButton.contains(event.target)
            ) {
                this.closeDropdown();
            }
        };

        document.addEventListener('click', this.documentClickHandler);

        this.applyTopicFilter();
        return true;
    }

    renderTopicCheckboxes() {
        const topics = this.getTopics();

        const checkboxesHTML = topics.map(({ topic, count }, index) => {
            const formatted = this.formatTopicLabel(topic);
            const checkboxId = `topic-filter-${index}`;
            return `
                <label class="topic-checkbox-item" for="${checkboxId}">
                    <input type="checkbox" id="${checkboxId}" value="${topic}">
                    <span class="topic-checkbox-label">${formatted}</span>
                    <span class="topic-checkbox-count">${count}</span>
                </label>
            `;
        }).join('');

        this.checkboxList.innerHTML = checkboxesHTML;

        this.checkboxList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const topic = event.target.value;
                const isChecked = event.target.checked;
                this.toggleTopicSelection(topic, isChecked);
            });
        });
    }

    toggleDropdown(forceState) {
        if (typeof forceState === 'boolean') {
            forceState ? this.openDropdown() : this.closeDropdown();
        } else {
            this.dropdownOpen ? this.closeDropdown() : this.openDropdown();
        }
    }

    openDropdown() {
        if (this.dropdownOpen) return;
        this.dropdown.hidden = false;
        this.dropdown.classList.add('open');
        this.toggleButton.setAttribute('aria-expanded', 'true');
        this.dropdownOpen = true;
    }

    closeDropdown() {
        if (!this.dropdownOpen) return;
        this.dropdown.hidden = true;
        this.dropdown.classList.remove('open');
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.dropdownOpen = false;
    }

    focusFirstCheckbox() {
        const firstCheckbox = this.checkboxList.querySelector('input[type="checkbox"]');
        if (firstCheckbox) {
            firstCheckbox.focus();
        }
    }

    toggleTopicSelection(topic, isSelected) {
        if (typeof topic !== 'string') return;

        const normalized = topic.toLowerCase();

        if (typeof isSelected === 'boolean') {
            if (isSelected) {
                this.selectedTopics.add(normalized);
            } else {
                this.selectedTopics.delete(normalized);
            }
        } else {
            if (this.selectedTopics.has(normalized)) {
                this.selectedTopics.delete(normalized);
            } else {
                this.selectedTopics.add(normalized);
            }
        }

        this.syncCheckboxStates();
        this.applyTopicFilter();
    }

    syncCheckboxStates() {
        if (!this.checkboxList) return;

        this.checkboxList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const topic = checkbox.value.toLowerCase();
            checkbox.checked = this.selectedTopics.has(topic);
        });
    }

    updateActiveFiltersUI() {
        if (!this.activeFiltersContainer) return;

        const topics = Array.from(this.selectedTopics);

        if (!topics.length) {
            this.activeFiltersContainer.innerHTML = `
                <span class="active-topic-chip active-topic-chip--neutral" aria-live="polite">
                    Showing all topics
                </span>
            `;
            return;
        }

        const chipsHTML = topics.map(topic => `
            <button type="button" class="active-topic-chip" data-topic="${topic}" aria-label="Remove filter ${this.formatTopicLabel(topic)}">
                ${this.formatTopicLabel(topic)}
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `).join('');

        this.activeFiltersContainer.innerHTML = chipsHTML;
        this.attachActiveFilterHandlers();
    }

    attachActiveFilterHandlers() {
        if (!this.activeFiltersContainer) return;

        this.activeFiltersContainer.querySelectorAll('.active-topic-chip').forEach(chip => {
            const topic = chip.getAttribute('data-topic');
            chip.addEventListener('click', () => {
                this.toggleTopicSelection(topic, false);
            });
        });
    }

    applyTopicFilter() {
        const filteredPosts = this.filterPostsByTopics(this.selectedTopics);
        const postsContainer = document.getElementById('blog-posts-container');

        if (postsContainer) {
            postsContainer.innerHTML = this.renderPostsGrid(filteredPosts);
            this.attachTopicChipHandlers();
        }

        this.syncCheckboxStates();
        this.updateActiveFiltersUI();

        const analytics = window.primeasureAnalytics || window.PrimeasureAnalyticsInstance;
        if (analytics && typeof analytics.trackBlogFilter === 'function') {
            analytics.trackBlogFilter(Array.from(this.selectedTopics));
        }
    }

    attachTopicChipHandlers() {
        const postsContainer = document.getElementById('blog-posts-container');
        if (!postsContainer) return;

        postsContainer.querySelectorAll('.topic-chip').forEach(chip => {
            const topic = chip.getAttribute('data-topic');

            chip.addEventListener('click', () => {
                this.toggleTopicSelection(topic);
            });

            chip.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggleTopicSelection(topic);
                }
            });
        });
    }

    filterPostsByTopics(topicsSet) {
        if (!topicsSet || topicsSet.size === 0) {
            return this.posts;
        }

        return this.posts.filter(post => {
            const postTopics = (post.topics || []).map(topic => topic.toLowerCase());
            return postTopics.some(topic => topicsSet.has(topic));
        });
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString + 'T12:00:00');
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTopicLabel(topic) {
        if (!topic) return '';
        return topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    getFallbackPosts() {
        return [
            {
                id: 'pcie-6-transmitter-testing-2025-03',
                slug: 'pcie-6-transmitter-testing',
                title: 'PCIe 6.0 Transmitter Testing Essentials',
                excerpt: 'Key takeaways from Teledyne LeCroy on preparing fixtures, calibrations, and measurements for next-generation PCIe 6.0 transmitters.',
                publishDate: '2025-03-21',
                readingTime: 7,
                topics: ['test-measurement'],
                heroImage: '../images/blog/pcie-6-transmitter-testing/hero.png',
                heroAlt: 'Oscilloscope verifying PCIe transmitter eye diagram',
                author: 'Primeasure High-Speed Team'
            },
            {
                id: 'cloud-production-sports-broadcasting-2025-03',
                slug: 'cloud-production-sports-broadcasting',
                title: 'Is Cloud Production the Sports Broadcasting Game Changer?',
                excerpt: 'Primeasure’s take on Grass Valley’s perspective for moving live sports production to cloud workflows, including the benefits and readiness checklist.',
                publishDate: '2025-03-23',
                readingTime: 6,
                topics: ['broadcast'],
                heroImage: '../images/blog/cloud-production-sports-broadcasting/hero.png',
                heroAlt: 'Sports production team monitoring cloud-based broadcast feeds',
                author: 'Primeasure Broadcast Practice'
            },
            {
                id: 'ampp-platform-updates-2025-03',
                slug: 'ampp-platform-updates',
                title: 'What’s New in Grass Valley AMPP',
                excerpt: 'Primeasure’s take on the latest AMPP platform updates from Grass Valley and what they mean for cloud-first broadcasters.',
                publishDate: '2025-03-23',
                readingTime: 5,
                topics: ['broadcast', 'software'],
                heroImage: '../images/blog/ampp-platform-updates/hero.png',
                heroAlt: 'Control room operators managing cloud production dashboards',
                author: 'Primeasure Broadcast Practice'
            },
            {
                id: 'debugging-edp-power-saving-2025-03',
                slug: 'debugging-edp-power-saving',
                title: 'Debugging eDP Power Saving Features with Introspect SV5C',
                excerpt: 'How we adapt Introspect Technology’s eDP power-management workflow to validate Panel Self Refresh, ALPM, and sleep states on modern displays.',
                publishDate: '2025-03-20',
                readingTime: 6,
                topics: ['software', 'test-measurement'],
                heroImage: '../images/blog/debugging-edp-power-saving/hero.png',
                heroAlt: 'Engineer analyzing embedded DisplayPort power management signals',
                author: 'Primeasure Display & Software Team'
            },
            {
                id: 'rsh2-oscilloscope-compatibility-2025-03',
                slug: 'rsh2-oscilloscope-compatibility',
                title: 'Connecting Introspect’s RSH2 Remote Sampling Head to Any Oscilloscope',
                excerpt: 'A practical walkthrough inspired by Introspect Technology on pairing the RSH2 remote sampling head with 50 Ω lab instruments for clean smartphone camera probing.',
                publishDate: '2025-03-18',
                readingTime: 5,
                topics: ['test-measurement'],
                heroImage: '../images/blog/rsh2-oscilloscope-compatibility/hero.png',
                heroAlt: 'Engineer preparing oscilloscopes and probes in a lab',
                author: 'Primeasure Test & Measurement Team'
            },
            {
                id: 'probing-ddr-lpddr-signals-2025-03',
                slug: 'probing-ddr-lpddr-signals',
                title: 'Probing DDR and LPDDR Signals with Confidence',
                excerpt: 'Key lessons from Introspect Technology on preparing probing plans, fixtures, and measurement strategies for next-generation DDR and LPDDR devices.',
                publishDate: '2025-03-20',
                readingTime: 6,
                topics: ['memory', 'test-measurement'],
                heroImage: '../images/blog/probing-ddr-lpddr-signals/hero.png',
                heroAlt: 'Oscilloscope probing DDR memory interfaces',
                author: 'Primeasure Memory Solutions Team'
            },
            {
                id: 'evolution-in-vehicle-network-2025-03',
                slug: 'evolution-in-vehicle-network',
                title: 'The Evolution of In-Vehicle Networking',
                excerpt: 'A Primeasure summary of Teledyne LeCroy’s perspective on the past, present, and future of automotive networking standards.',
                publishDate: '2025-03-22',
                readingTime: 6,
                topics: ['automotive', 'test-measurement'],
                heroImage: '../images/blog/evolution-in-vehicle-network/hero.png',
                heroAlt: 'Engineer monitoring automotive network analysis tools',
                author: 'Primeasure Automotive Solutions'
            }
        ];
    }
}

// Create global instance when page loads
window.blogManager = new BlogManager();
