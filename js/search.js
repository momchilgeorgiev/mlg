// Search functionality
class SearchManager {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.init();
    }

    async init() {
        // Wait for blog manager to load posts
        if (window.blogManager) {
            this.posts = window.blogManager.getPosts();
        } else {
            // If blog manager isn't available, wait for it
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    if (window.blogManager) {
                        this.posts = window.blogManager.getPosts();
                        this.handleInitialSearch();
                    }
                }, 100);
            });
        }

        this.setupEventListeners();
        this.populateFilters();
        this.handleInitialSearch();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.performSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => this.performSearch());
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.performSearch());
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.performSearch());
        }
    }

    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter || this.posts.length === 0) return;

        const categories = [...new Set(this.posts.map(post => post.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    handleInitialSearch() {
        // Check for URL parameters to perform initial search
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || urlParams.get('query');
        const category = urlParams.get('category');
        const tag = urlParams.get('tag');

        if (query || category || tag) {
            if (query) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = query;
            }

            if (category) {
                const categoryFilter = document.getElementById('category-filter');
                if (categoryFilter) categoryFilter.value = category;
            }

            if (tag) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = tag;
            }

            this.performSearch();
        } else {
            // Show all posts by default
            this.filteredPosts = [...this.posts];
            this.renderResults();
        }
    }

    performSearch() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';

        this.filteredPosts = this.posts.filter(post => {
            // Text search in title, content, excerpt, and tags
            const matchesQuery = !query || 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query));

            // Category filter
            const matchesCategory = !selectedCategory || post.category === selectedCategory;

            return matchesQuery && matchesCategory;
        });

        this.sortResults();
        this.renderResults();
    }

    sortResults() {
        const sortFilter = document.getElementById('sort-filter');
        const sortBy = sortFilter ? sortFilter.value : 'date-desc';

        switch (sortBy) {
            case 'date-asc':
                this.filteredPosts.sort((a, b) => a.date - b.date);
                break;
            case 'date-desc':
                this.filteredPosts.sort((a, b) => b.date - a.date);
                break;
            case 'title':
                this.filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                this.filteredPosts.sort((a, b) => b.date - a.date);
        }
    }

    renderResults() {
        const resultsContainer = document.getElementById('results-container');
        const resultsCount = document.getElementById('results-count');

        if (!resultsContainer) return;

        // Update count
        if (resultsCount) {
            const count = this.filteredPosts.length;
            resultsCount.textContent = `${count} post${count !== 1 ? 's' : ''} found`;
        }

        // Render posts
        if (this.filteredPosts.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No posts found</h3>
                    <p>Try adjusting your search criteria or browse all posts.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.filteredPosts.map(post => `
            <article class="post-card">
                <div class="post-meta">
                    <span class="post-date">${this.formatDate(post.date)}</span>
                    <span class="post-category">${post.category}</span>
                </div>
                <h3 class="post-title">
                    <a href="post.html?slug=${post.slug}">${this.highlightSearchTerm(post.title)}</a>
                </h3>
                <p class="post-excerpt">${this.highlightSearchTerm(post.excerpt)}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<a href="search.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
                </div>
            </article>
        `).join('');
    }

    highlightSearchTerm(text) {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value.trim() : '';
        
        if (!query || query.length < 2) return text;

        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});

// Add CSS for highlighted search terms
const style = document.createElement('style');
style.textContent = `
    mark {
        background-color: var(--accent-color);
        color: white;
        padding: 0.1rem 0.2rem;
        border-radius: 3px;
    }

    .no-results {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-secondary);
    }

    .no-results h3 {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);