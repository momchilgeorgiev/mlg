// Markdown file loader and parser
class MarkdownLoader {
    constructor() {
        this.posts = [];
        this.postsIndex = [];
        this.baseUrl = this.getBaseUrl();
    }

    getBaseUrl() {
        // Determine if we're running locally or on GitHub Pages
        const { hostname, pathname } = window.location;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return './posts/';
        } else if (hostname.includes('github.io')) {
            // Extract repository name from pathname for GitHub Pages
            const pathParts = pathname.split('/').filter(part => part);
            const repoName = pathParts[0] || '';
            return repoName ? `/${repoName}/posts/` : './posts/';
        } else {
            return './posts/';
        }
    }

    async loadPostsIndex() {
        try {
            const response = await fetch(`${this.baseUrl}index.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.postsIndex = await response.json();
            return this.postsIndex;
        } catch (error) {
            console.warn('Could not load posts index, falling back to hardcoded posts:', error);
            // Fallback to hardcoded posts if index.json is not available
            return this.getFallbackPosts();
        }
    }

    getFallbackPosts() {
        // Fallback posts in case index.json is not available
        return [
            {
                filename: "getting-started-with-my-blog.md",
                slug: "getting-started-with-my-blog",
                title: "Getting Started with My Blog",
                date: "2024-01-15",
                category: "Personal",
                tags: ["introduction", "blogging", "web"],
                excerpt: "Welcome to my blog! This is my first post where I introduce myself and share what I plan to write about in the future.",
                featured: true
            },
            {
                filename: "thoughts-on-modern-web-development.md",
                slug: "thoughts-on-modern-web-development",
                title: "Thoughts on Modern Web Development",
                date: "2024-01-20",
                category: "Technology",
                tags: ["web development", "javascript", "css", "html"],
                excerpt: "Exploring the current state of web development and where I think it's heading in the next few years.",
                featured: false
            },
            {
                filename: "my-journey-learning-to-code.md",
                slug: "my-journey-learning-to-code",
                title: "My Journey Learning to Code",
                date: "2024-01-25",
                category: "Personal",
                tags: ["learning", "coding", "career", "journey"],
                excerpt: "A reflection on my coding journey, the challenges I faced, and the lessons I learned along the way.",
                featured: false
            }
        ];
    }

    async loadMarkdownFile(filename) {
        try {
            const response = await fetch(`${this.baseUrl}${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error loading markdown file ${filename}:`, error);
            return null;
        }
    }

    parseMarkdownMetadata(content) {
        // Look for metadata in the first few lines of the markdown file
        const lines = content.split('\n');
        const metadata = {};
        
        // Look for title (first # heading)
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const line = lines[i].trim();
            if (line.startsWith('# ')) {
                metadata.title = line.substring(2).trim();
                break;
            }
        }

        // Look for metadata in italic text (second line usually)
        for (let i = 1; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line.startsWith('*') && line.endsWith('*') && line.includes('|')) {
                const metaText = line.slice(1, -1); // Remove asterisks
                const parts = metaText.split('|').map(part => part.trim());
                
                parts.forEach(part => {
                    if (part.toLowerCase().startsWith('published:')) {
                        metadata.date = part.substring(10).trim();
                    } else if (part.toLowerCase().startsWith('category:')) {
                        metadata.category = part.substring(9).trim();
                    } else if (part.toLowerCase().startsWith('tags:')) {
                        const tagsStr = part.substring(5).trim();
                        metadata.tags = tagsStr.split(',').map(tag => tag.trim());
                    }
                });
                break;
            }
        }

        return metadata;
    }

    generateExcerpt(content, maxLength = 200) {
        // Remove markdown syntax and get plain text
        let plainText = content
            .replace(/^#.*$/gm, '') // Remove headers
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]+)\*/g, '$1') // Remove italic
            .replace(/`([^`]+)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
            .replace(/\n\s*\n/g, ' ') // Replace multiple newlines with space
            .replace(/\n/g, ' ') // Replace single newlines with space
            .trim();

        // Take first paragraph or first maxLength characters
        const firstParagraph = plainText.split('\n')[0];
        if (firstParagraph.length <= maxLength) {
            return firstParagraph;
        }

        return plainText.length > maxLength 
            ? plainText.substring(0, maxLength).trim() + '...'
            : plainText;
    }

    async loadAllPosts() {
        const postsIndex = await this.loadPostsIndex();
        const posts = [];

        for (const postMeta of postsIndex) {
            const content = await this.loadMarkdownFile(postMeta.filename);
            if (content) {
                // Parse additional metadata from the markdown file
                const parsedMeta = this.parseMarkdownMetadata(content);
                
                const post = {
                    id: posts.length + 1,
                    title: postMeta.title || parsedMeta.title || 'Untitled',
                    slug: postMeta.slug,
                    date: new Date(postMeta.date || parsedMeta.date || Date.now()),
                    category: postMeta.category || parsedMeta.category || 'Uncategorized',
                    tags: postMeta.tags || parsedMeta.tags || [],
                    excerpt: postMeta.excerpt || this.generateExcerpt(content),
                    content: content,
                    featured: postMeta.featured || false,
                    filename: postMeta.filename
                };

                posts.push(post);
            } else {
                console.warn(`Could not load content for ${postMeta.filename}`);
            }
        }

        this.posts = posts;
        return posts;
    }

    getPostBySlug(slug) {
        return this.posts.find(post => post.slug === slug);
    }

    getPosts() {
        return this.posts;
    }

    // Method to add a new post programmatically
    async addPostFromMarkdown(filename, metadata = {}) {
        const content = await this.loadMarkdownFile(filename);
        if (!content) return null;

        const parsedMeta = this.parseMarkdownMetadata(content);
        const slug = metadata.slug || filename.replace('.md', '').toLowerCase().replace(/\s+/g, '-');
        
        const post = {
            id: this.posts.length + 1,
            title: metadata.title || parsedMeta.title || filename.replace('.md', ''),
            slug: slug,
            date: new Date(metadata.date || parsedMeta.date || Date.now()),
            category: metadata.category || parsedMeta.category || 'Uncategorized',
            tags: metadata.tags || parsedMeta.tags || [],
            excerpt: metadata.excerpt || this.generateExcerpt(content),
            content: content,
            featured: metadata.featured || false,
            filename: filename
        };

        this.posts.push(post);
        return post;
    }
}