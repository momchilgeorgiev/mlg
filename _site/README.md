# My Personal Blog

A clean, modern, and responsive blog built for GitHub Pages with markdown support, dark mode, and search functionality.

## Features

- ✨ Clean, modern design with white background
- 🌙 Three theme options: Light, Dark, and Warm White
- 📱 Fully responsive design for all devices
- 🔍 Full-text search functionality with filtering
- 📝 Markdown support for blog posts
- 🏷️ Tags and categories system
- 👤 Profile section with contact information
- 📄 Individual blog post pages
- 💌 Contact form (requires backend integration)

## Getting Started

### 1. Local Development

Simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### 2. GitHub Pages Deployment

1. Fork or clone this repository
2. Go to your repository settings on GitHub
3. Scroll down to "Pages" section
4. Select "Deploy from a branch" as source
5. Choose "main" branch and "/ (root)" folder
6. Your blog will be available at `https://yourusername.github.io/repository-name`

## Adding New Blog Posts

### Method 1: Using Markdown Files (Recommended)

The blog now automatically loads posts from markdown files in the `posts/` directory!

#### Option A: Using the Helper Script (Node.js required)

```bash
# Create a new post with title only
node add-post.js "My New Blog Post"

# Create a post with category and tags
node add-post.js "JavaScript Tips" "Programming" "javascript,tips,tutorial"

# Create a post with excerpt
node add-post.js "Travel Blog" "Personal" "travel,adventure" "My recent trip to..."
```

This script will:
- Create a new markdown file in the `posts/` directory
- Generate a URL-friendly slug
- Update the `posts/index.json` file
- Provide a template with proper formatting

#### Option B: Manual Creation

1. **Create a markdown file** in the `posts/` directory (e.g., `my-new-post.md`)

2. **Use this format** for your post:

```markdown
# Your Post Title

*Published: 2024-02-01 | Category: Technology | Tags: tag1, tag2, tag3*

Brief excerpt of your post that will appear on the main page...

## Your Content Here

Write your blog post using standard markdown:

- **Bold text** and *italic text*
- [Links](https://example.com)
- `inline code`

### Code Blocks

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> Blockquotes for important notes

## Conclusion

Your concluding thoughts...
```

3. **Update `posts/index.json`** with your post metadata:

```json
{
  "filename": "my-new-post.md",
  "slug": "my-new-post",
  "title": "Your Post Title",
  "date": "2024-02-01",
  "category": "Technology",
  "tags": ["tag1", "tag2", "tag3"],
  "excerpt": "Brief description...",
  "featured": false
}
```

### Method 2: JavaScript Fallback

If you prefer or need to add posts directly in JavaScript (or if markdown loading fails), you can still edit `js/blog.js` and add posts to the `getFallbackPosts()` method.

### Current Sample Posts

The blog includes three sample posts to demonstrate the format:
- `posts/getting-started-with-my-blog.md`
- `posts/thoughts-on-modern-web-development.md`
- `posts/my-journey-learning-to-code.md`

## Customization

### Updating Personal Information

1. **Profile Picture**: Add your image to `assets/profile.jpg`
2. **About Section**: Edit the profile card text in `index.html`
3. **Contact Information**: Update the contact links in `pages/contacts.html`
4. **Blog Title**: Change "My Blog" in all HTML files

### Theme Customization

The CSS uses CSS custom properties (variables) for easy theming. You can modify the colors in `styles.css`:

```css
:root {
    --bg-primary: #ffffff;      /* Main background */
    --text-primary: #2c3e50;    /* Main text color */
    --accent-color: #3498db;    /* Links and buttons */
    /* ... more variables */
}
```

### Adding New Categories

Categories are automatically generated from your posts. Just use new category names in your post data.

## File Structure

```
mlg/
├── index.html              # Main blog page
├── search.html             # Search page
├── post.html              # Individual post template
├── styles.css             # Main stylesheet
├── js/
│   ├── blog.js           # Main blog functionality
│   ├── search.js         # Search functionality
│   └── post.js           # Individual post page logic
├── pages/
│   └── contacts.html     # Contact page
├── posts/               # Sample markdown files
│   ├── sample-post-1.md
│   ├── sample-post-2.md
│   └── sample-post-3.md
├── assets/              # Images and other assets
└── README.md           # This file
```

## Browser Support

This blog works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to submit issues and enhancement requests!

## Future Enhancements

- [ ] RSS feed generation
- [ ] Automatic markdown file parsing
- [ ] Comment system integration
- [ ] Analytics integration
- [ ] PWA (Progressive Web App) features
- [ ] Backend integration for contact form

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy blogging!** 🎉

For questions or support, please open an issue on GitHub or contact me through the blog's contact page.