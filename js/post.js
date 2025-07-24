// Individual post page functionality
class PostManager {
    constructor() {
        this.post = null;
        this.init();
    }

    async init() {
        const slug = this.getUrlParameter('slug');
        if (!slug) {
            this.showError('Post not found');
            return;
        }

        // Wait for blog manager to load
        await this.waitForBlogManager();
        
        this.post = window.blogManager.getPostBySlug(slug);
        if (!this.post) {
            this.showError('Post not found');
            return;
        }

        this.renderPost();
    }

    async waitForBlogManager() {
        return new Promise((resolve) => {
            if (window.blogManager) {
                resolve();
                return;
            }

            const checkBlogManager = () => {
                if (window.blogManager) {
                    resolve();
                } else {
                    setTimeout(checkBlogManager, 100);
                }
            };

            checkBlogManager();
        });
    }

    renderPost() {
        if (!this.post) return;

        // Update page title
        document.title = `${this.post.title} - My Blog`;
        document.getElementById('post-title').textContent = `${this.post.title} - My Blog`;

        // Update post header
        document.getElementById('post-title-header').textContent = this.post.title;
        document.getElementById('post-date').textContent = this.formatDate(this.post.date);
        document.getElementById('post-category').textContent = this.post.category;

        // Update tags
        const tagsContainer = document.getElementById('post-tags');
        if (tagsContainer && this.post.tags) {
            tagsContainer.innerHTML = this.post.tags.map(tag => 
                `<a href="search.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`
            ).join('');
        }

        // Render markdown content
        const postBody = document.getElementById('post-body');
        if (postBody) {
            // Configure marked for better rendering
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return code;
                },
                breaks: true,
                gfm: true
            });

            const htmlContent = marked.parse(this.post.content);
            postBody.innerHTML = htmlContent;

            // Highlight code blocks after rendering
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }

        // Add reading time estimation
        this.addReadingTime();
    }

    addReadingTime() {
        const wordCount = this.post.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Assume 200 words per minute
        
        const readingTimeElement = document.createElement('span');
        readingTimeElement.className = 'reading-time';
        readingTimeElement.textContent = `${readingTime} min read`;
        
        const postMeta = document.querySelector('.post-meta');
        if (postMeta) {
            postMeta.appendChild(readingTimeElement);
        }
    }

    showError(message) {
        const postBody = document.getElementById('post-body');
        const titleHeader = document.getElementById('post-title-header');
        
        if (titleHeader) {
            titleHeader.textContent = 'Error';
        }
        
        if (postBody) {
            postBody.innerHTML = `
                <div class="error-message">
                    <h2>Oops! ${message}</h2>
                    <p>The post you're looking for doesn't exist or has been moved.</p>
                    <a href="index.html" class="btn">Go back to home</a>
                </div>
            `;
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
});

// Add additional CSS for post page
const style = document.createElement('style');
style.textContent = `
    .reading-time {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .reading-time::before {
        content: "⏱ ";
    }

    .post-footer {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
    }

    .back-to-home {
        display: inline-flex;
        align-items: center;
        color: var(--accent-color);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
    }

    .back-to-home:hover {
        color: var(--accent-hover);
    }

    .error-message {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-secondary);
    }

    .error-message h2 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .error-message .btn {
        display: inline-block;
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background-color: var(--accent-color);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: background-color 0.3s ease;
    }

    .error-message .btn:hover {
        background-color: var(--accent-hover);
    }
`;
document.head.appendChild(style);