#!/usr/bin/env node

// Node.js script to help add new blog posts
// Usage: node add-post.js "Post Title" "Category" "tag1,tag2,tag3"

const fs = require('fs');
const path = require('path');

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function formatDate(date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function createMarkdownPost(title, category = 'Uncategorized', tags = '', excerpt = '') {
    const slug = slugify(title);
    const filename = `${slug}.md`;
    const date = formatDate(new Date());
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    const content = `# ${title}

*Published: ${date} | Category: ${category} | Tags: ${tagsArray.join(', ')}*

${excerpt || 'Write your post excerpt here...'}

## Introduction

Write your blog post content here. You can use:

- **Bold text**
- *Italic text*
- [Links](https://example.com)
- \`inline code\`

### Code blocks

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

### Lists

1. Numbered lists
2. Like this one

- Bullet points
- Are also supported

> Blockquotes can be used for important notes or quotes.

## Conclusion

Wrap up your thoughts here.

---

*What do you think about this topic? Feel free to reach out!*
`;

    return { filename, content, slug, date, category, tags: tagsArray, excerpt };
}

function updatePostsIndex(newPost) {
    const indexPath = path.join(__dirname, 'posts', 'index.json');
    let postsIndex = [];
    
    // Read existing index if it exists
    if (fs.existsSync(indexPath)) {
        try {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            postsIndex = JSON.parse(indexContent);
        } catch (error) {
            console.warn('Could not parse existing index.json, creating new one');
        }
    }
    
    // Add new post to index
    const indexEntry = {
        filename: newPost.filename,
        slug: newPost.slug,
        title: newPost.title,
        date: newPost.date,
        category: newPost.category,
        tags: newPost.tags,
        excerpt: newPost.excerpt || 'Write your post excerpt here...',
        featured: false
    };
    
    postsIndex.push(indexEntry);
    
    // Sort by date (newest first)
    postsIndex.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Write updated index
    fs.writeFileSync(indexPath, JSON.stringify(postsIndex, null, 2));
    
    return indexEntry;
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log(`
Usage: node add-post.js "Post Title" [Category] [Tags] [Excerpt]

Examples:
  node add-post.js "My New Post"
  node add-post.js "JavaScript Tips" "Programming" "javascript,tips,tutorial"
  node add-post.js "Travel Blog" "Personal" "travel,adventure" "My recent trip to..."

Arguments:
  Post Title (required): The title of your blog post
  Category (optional): Post category (default: "Uncategorized")
  Tags (optional): Comma-separated list of tags
  Excerpt (optional): Brief description of the post
        `);
        process.exit(0);
    }
    
    const title = args[0];
    const category = args[1] || 'Uncategorized';
    const tags = args[2] || '';
    const excerpt = args[3] || '';
    
    if (!title) {
        console.error('Error: Post title is required');
        console.log('Use --help for usage information');
        process.exit(1);
    }
    
    try {
        // Create posts directory if it doesn't exist
        const postsDir = path.join(__dirname, 'posts');
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir, { recursive: true });
        }
        
        // Create the post
        const post = createMarkdownPost(title, category, tags, excerpt);
        post.title = title; // Store original title
        
        // Check if file already exists
        const filePath = path.join(postsDir, post.filename);
        if (fs.existsSync(filePath)) {
            console.error(`Error: Post file "${post.filename}" already exists`);
            process.exit(1);
        }
        
        // Write the markdown file
        fs.writeFileSync(filePath, post.content);
        
        // Update the posts index
        const indexEntry = updatePostsIndex(post);
        
        console.log('✅ New blog post created successfully!');
        console.log(`📄 File: posts/${post.filename}`);
        console.log(`🔗 Slug: ${post.slug}`);
        console.log(`📅 Date: ${post.date}`);
        console.log(`📂 Category: ${post.category}`);
        if (post.tags.length > 0) {
            console.log(`🏷️  Tags: ${post.tags.join(', ')}`);
        }
        console.log(`\\n🎉 Your post is ready to edit! Open posts/${post.filename} to start writing.`);
        console.log(`\\n📝 Don't forget to:`);
        console.log(`   - Replace the placeholder content with your actual post`);
        console.log(`   - Update the excerpt in posts/index.json if needed`);
        console.log(`   - Test your post locally before publishing`);
        
    } catch (error) {
        console.error('Error creating post:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createMarkdownPost, updatePostsIndex, slugify };