# Data Science & Innovation Blog

A modern, responsive Jekyll blog theme designed specifically for data science and innovation content. Features a clean design, search functionality, and mobile-friendly layout.

## Features

- 🎨 **Modern Design**: Clean, professional layout with customizable colors
- 📱 **Responsive**: Mobile-first design that works on all devices  
- 🔍 **Search**: Built-in search functionality for blog posts
- 👤 **Profile Sidebar**: Showcase your profile, recent posts, and contact info
- 📊 **Code Highlighting**: Syntax highlighting for code blocks
- 🏷️ **Categories & Tags**: Organize your content effectively
- ⚡ **Fast Loading**: Optimized for performance
- 🛠️ **Easy Customization**: Simple configuration and theming

## Quick Start

### Prerequisites

- Ruby (version 2.7 or later)
- Bundler gem

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mlg
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Customize your site**:
   - Edit `_config.yml` with your information
   - Replace `/assets/images/profile.svg` with your profile picture
   - Update the About page (`about.md`)

4. **Run locally**:
   ```bash
   bundle exec jekyll serve
   ```

5. **Visit your site**: Open http://localhost:4000 in your browser

## Configuration

### Site Information

Edit `_config.yml` to customize:

```yaml
title: Your Blog Title
email: your.email@example.com
description: Your blog description

author:
  name: Your Name
  bio: Your bio
  avatar: /assets/images/profile.svg
  linkedin: your-linkedin
  github: your-github
  twitter: your-twitter
```

### Colors

Customize the color scheme:

```yaml
theme_config:
  primary_color: "#2c3e50"
  accent_color: "#3498db"
  text_color: "#2c3e50"
  background_color: "#ffffff"
  sidebar_color: "#ecf0f1"
```

### Navigation

Update the navigation menu:

```yaml
navigation:
  - title: Home
    url: /
  - title: Blog
    url: /blog/
  - title: About
    url: /about/
```

## Writing Posts

Create new posts in the `_posts` directory:

```yaml
---
layout: post
title: "Your Post Title"
date: 2024-07-24 10:00:00 +0000
categories: [data-science, tutorial]
tags: [python, machine-learning]
excerpt: "Brief description of your post"
---

Your content here...
```

### Post Categories

Suggested categories for data science content:
- `data-science`
- `machine-learning`
- `data-visualization`
- `tutorial`
- `projects`
- `innovation`

## Pages

The blog includes these pages by default:

- **Home** (`index.html`): Recent posts with profile sidebar
- **Blog** (`blog.html`): All posts with search functionality
- **About** (`about.md`): Your bio and background
- **Projects** (`projects.md`): Showcase your work
- **Contact** (`contact.md`): Contact information

## Customization

For detailed customization instructions, see [CUSTOMIZATION.md](CUSTOMIZATION.md).

### Quick Customizations

1. **Profile Image**: Replace `/assets/images/profile.svg`
2. **Colors**: Edit theme_config in `_config.yml`
3. **Fonts**: Modify `assets/css/style.scss`
4. **Layout**: Edit files in `_layouts/` and `_includes/`

## Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Other Platforms

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Similar to Netlify with GitHub integration
- **Custom Server**: Build with `bundle exec jekyll build` and upload `_site/`

## Structure

```
├── _config.yml          # Site configuration
├── _layouts/            # Page templates
│   ├── default.html     # Base layout
│   ├── home.html        # Homepage layout
│   ├── post.html        # Blog post layout
│   └── page.html        # Static page layout
├── _includes/           # Reusable components
│   ├── head.html        # HTML head
│   ├── header.html      # Site header
│   ├── sidebar.html     # Profile sidebar
│   └── footer.html      # Site footer
├── _posts/              # Blog posts
├── assets/
│   ├── css/style.scss   # Main stylesheet
│   ├── js/main.js       # JavaScript functionality
│   └── images/          # Images and media
├── about.md             # About page
├── blog.html            # Blog listing
├── contact.md           # Contact page
├── projects.md          # Projects showcase
└── index.html           # Homepage
```

## Features in Detail

### Search Functionality

The blog includes client-side search that works across:
- Post titles
- Post content
- Categories
- Tags

### Mobile Responsive

The design adapts to different screen sizes:
- Desktop: Two-column layout with sidebar
- Tablet: Adjusted spacing and typography
- Mobile: Single column, collapsible navigation

### Code Highlighting

Syntax highlighting for code blocks supports:
- Python, R, JavaScript, SQL
- Bash/Shell commands
- YAML, JSON, XML
- And many more languages

### Performance Optimizations

- Optimized images
- Minified CSS and JavaScript
- Lazy loading for images
- Fast font loading

## Support

For customization help and troubleshooting:

1. Check [CUSTOMIZATION.md](CUSTOMIZATION.md)
2. Review Jekyll documentation: https://jekyllrb.com/docs/
3. Check GitHub issues for common problems

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

Happy blogging! 🚀