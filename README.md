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

### Method 1: Edit the JavaScript File (Recommended for now)

1. Open `js/blog.js`
2. Find the `loadPosts()` method
3. Add your new post to the `this.posts` array:

```javascript
{
    id: 4, // Increment the ID
    title: "Your Post Title",
    slug: "your-post-slug", // URL-friendly version
    date: new Date('2024-02-01'), // Publication date
    category: "Technology", // Category name
    tags: ["tag1", "tag2", "tag3"], // Array of tags
    excerpt: "A brief description of your post...",
    content: `# Your Post Title

Your markdown content goes here...

## Subheading

More content with **bold** and *italic* text.

\`\`\`javascript
// Code blocks are supported
console.log("Hello, World!");
\`\`\`
`,
    featured: false // Set to true for featured posts
}
```

### Method 2: Markdown Files (For future implementation)

You can also create markdown files in the `posts/` directory. The sample files there show the expected format:

- `posts/sample-post-1.md`
- `posts/sample-post-2.md` 
- `posts/sample-post-3.md`

*Note: You'll need to implement a markdown file parser to use this method.*

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