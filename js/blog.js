// Blog functionality
class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = new Set();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupThemeToggle();
        await this.loadPosts();
        this.renderPosts();
        this.renderCategories();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    setupThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'warm'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        
        localStorage.setItem('theme', this.currentTheme);
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const icons = {
            light: '🌙',
            dark: '☀️',
            warm: '🌕'
        };
        
        toggle.textContent = icons[this.currentTheme] || '🌙';
    }

    async loadPosts() {
        // In a real implementation, you'd fetch from an API or load from markdown files
        // For now, we'll use sample data that you can replace with your actual posts
        this.posts = [
            {
                id: 1,
                title: "Getting Started with My Blog",
                slug: "getting-started-with-my-blog",
                date: new Date('2024-01-15'),
                category: "Personal",
                tags: ["introduction", "blogging", "web"],
                excerpt: "Welcome to my blog! This is my first post where I introduce myself and share what I plan to write about in the future.",
                content: `# Getting Started with My Blog

Welcome to my personal blog! I'm excited to share my thoughts, experiences, and insights with you.

## What You Can Expect

I'll be writing about:
- Technology and programming
- Personal experiences and reflections
- Tips and tutorials
- And much more!

## Stay Connected

Feel free to reach out through the contact page if you have any questions or suggestions.`,
                featured: true
            },
            {
                id: 2,
                title: "Thoughts on Modern Web Development",
                slug: "thoughts-on-modern-web-development",
                date: new Date('2024-01-20'),
                category: "Technology",
                tags: ["web development", "javascript", "css", "html"],
                excerpt: "Exploring the current state of web development and where I think it's heading in the next few years.",
                content: `# Thoughts on Modern Web Development

The web development landscape has evolved dramatically over the past few years...

## The Good Parts

Modern web development has given us:
- Better tooling and frameworks
- Improved developer experience
- Enhanced performance capabilities

## The Challenges

However, we also face:
- Increased complexity
- Framework fatigue
- Performance concerns

## Looking Forward

I believe the future holds exciting possibilities for web developers.`
            },
            {
                id: 3,
                title: "My Journey Learning to Code",
                slug: "my-journey-learning-to-code",
                date: new Date('2024-01-25'),
                category: "Personal",
                tags: ["learning", "coding", "career", "journey"],
                excerpt: "A reflection on my coding journey, the challenges I faced, and the lessons I learned along the way.",
                content: `# My Journey Learning to Code

Learning to code has been one of the most rewarding experiences of my life.

## The Beginning

It all started when I wrote my first "Hello, World!" program...

## The Struggles

Like everyone, I faced challenges:
- Imposter syndrome
- Complex concepts
- Debugging nightmares

## The Breakthrough

Eventually, things started clicking...

## Advice for Beginners

If you're just starting out, remember:
1. Be patient with yourself
2. Practice consistently
3. Don't be afraid to ask for help
4. Build projects you're passionate about`
            }
        ];

        // Extract categories
        this.posts.forEach(post => {
            this.categories.add(post.category);
        });
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        const sortedPosts = this.posts.sort((a, b) => b.date - a.date);
        
        container.innerHTML = sortedPosts.map(post => `
            <article class="post-card">
                <div class="post-meta">
                    <span class="post-date">${this.formatDate(post.date)}</span>
                    <span class="post-category">${post.category}</span>
                </div>
                <h3 class="post-title">
                    <a href="post.html?slug=${post.slug}">${post.title}</a>
                </h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<a href="search.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}
                </div>
            </article>
        `).join('');
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        const categoryStats = {};
        this.posts.forEach(post => {
            categoryStats[post.category] = (categoryStats[post.category] || 0) + 1;
        });

        container.innerHTML = Array.from(this.categories).map(category => `
            <a href="search.html?category=${encodeURIComponent(category)}" class="category-link">
                <span>${category}</span>
                <span class="category-count">${categoryStats[category]}</span>
            </a>
        `).join('');
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Method to get posts (used by search functionality)
    getPosts() {
        return this.posts;
    }

    // Method to get a specific post by slug
    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }
}

// Initialize the blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}