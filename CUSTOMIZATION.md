# Blog Customization Guide

This guide will help you customize your Jekyll blog to match your personal style and preferences.

## Quick Start Customization

### 1. Update Your Information

Edit `_config.yml` to update:

```yaml
# Site Information
title: "Your Blog Title"
email: your.email@example.com
description: "Your blog description"

# Author Information
author:
  name: "Your Name"
  email: "your.email@example.com"
  bio: "Your bio description"
  avatar: "/assets/images/profile.svg"
  linkedin: your-linkedin-username
  github: your-github-username
  twitter: your-twitter-username
```

### 2. Replace Profile Image

Replace `/assets/images/profile.svg` with your own image:
- Supported formats: PNG, JPG, SVG
- Recommended size: 240x240 pixels
- Keep the filename as `profile.svg`, `profile.png`, or `profile.jpg`
- Update the `avatar` path in `_config.yml`

### 3. Customize Colors

In `_config.yml`, update the theme colors:

```yaml
theme_config:
  primary_color: "#2c3e50"      # Main text and headers
  accent_color: "#3498db"       # Links and highlights
  text_color: "#2c3e50"         # Body text
  background_color: "#ffffff"   # Page background
  sidebar_color: "#ecf0f1"      # Sidebar background
```

### 4. Update Navigation

Modify the navigation menu in `_config.yml`:

```yaml
navigation:
  - title: Home
    url: /
  - title: Blog
    url: /blog/
  - title: About
    url: /about/
  - title: Projects
    url: /projects/
  - title: Contact
    url: /contact/
  # Add more pages as needed
```

## Advanced Customization

### Styling (CSS)

The main stylesheet is located at `/assets/css/style.scss`. Key sections include:

- **Variables**: CSS custom properties at the top
- **Typography**: Font styles and sizes
- **Layout**: Grid and responsive design
- **Components**: Individual element styles

#### Adding Custom Styles

Add your custom CSS at the end of `style.scss`:

```scss
// Your custom styles
.my-custom-class {
  color: var(--accent-color);
  font-weight: bold;
}
```

### Adding New Pages

1. Create a new `.md` file in the root directory
2. Add frontmatter:
```yaml
---
layout: page
title: "Page Title"
description: "Page description"
permalink: /page-url/
---
```
3. Add to navigation in `_config.yml`

### Blog Post Templates

Create post templates in `_drafts/` folder:

```yaml
---
layout: post
title: "Template Title"
date: YYYY-MM-DD HH:MM:SS +0000
categories: [category1, category2]
tags: [tag1, tag2, tag3]
excerpt: "Brief description of the post"
---

Your content here...
```

### Custom Layouts

Create new layouts in `_layouts/` folder:

```html
---
layout: default
---

<div class="custom-layout">
  <h1>{{ page.title }}</h1>
  {{ content }}
</div>
```

### Adding Plugins

Add plugins to `Gemfile`:

```ruby
gem "plugin-name"
```

Then add to `_config.yml`:

```yaml
plugins:
  - plugin-name
```

## Customization Examples

### Change to Dark Theme

Add to `style.scss`:

```scss
// Dark theme
:root {
  --primary-color: #ecf0f1;
  --accent-color: #3498db;
  --text-color: #ecf0f1;
  --background-color: #2c3e50;
  --sidebar-color: #34495e;
  --border-color: #4a6e7a;
}
```

### Add Code Syntax Highlighting

Install rouge theme:

```bash
rougify style github > assets/css/syntax.css
```

Include in `_includes/head.html`:

```html
<link rel="stylesheet" href="{{ "/assets/css/syntax.css" | relative_url }}">
```

### Custom Fonts

Add Google Fonts to `_includes/head.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
```

Update `style.scss`:

```scss
body {
  font-family: 'Roboto', sans-serif;
}
```

### Add Comments System

Choose from:
- **Disqus**: Easy setup, hosted solution
- **Staticman**: Git-based, privacy-friendly
- **Utterances**: GitHub-based comments

### Add Analytics

For Google Analytics, add to `_config.yml`:

```yaml
google_analytics: "GA_TRACKING_ID"
```

Create `_includes/google-analytics.html`:

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.google_analytics }}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{ site.google_analytics }}');
</script>
```

## File Structure Reference

```
├── _config.yml           # Main configuration
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _posts/              # Blog posts
├── _sass/               # Sass partials
├── assets/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── images/          # Images
├── about.md             # About page
├── blog.html            # Blog listing page
├── contact.md           # Contact page
├── projects.md          # Projects page
└── index.html           # Home page
```

## Best Practices

1. **Test Locally**: Always test changes locally before deploying
2. **Backup**: Keep backups of your customizations
3. **Version Control**: Use Git to track changes
4. **Performance**: Optimize images and minimize CSS/JS
5. **Mobile-First**: Ensure responsive design
6. **Accessibility**: Use proper heading structure and alt text

## Troubleshooting

### Common Issues

1. **Site not building**: Check `_config.yml` syntax
2. **Styles not loading**: Clear browser cache, check file paths
3. **Posts not showing**: Check frontmatter format and dates
4. **Navigation broken**: Verify URLs in `_config.yml`

### Getting Help

- Check Jekyll documentation: https://jekyllrb.com/docs/
- Review error messages in terminal
- Test with minimal configuration first
- Use browser developer tools for debugging

## Development Workflow

1. **Local Development**:
   ```bash
   bundle exec jekyll serve --livereload
   ```

2. **Building for Production**:
   ```bash
   bundle exec jekyll build
   ```

3. **Deployment**: 
   - GitHub Pages (automatic)
   - Netlify
   - Vercel
   - Custom server

Remember: Small changes first, test frequently, and keep it simple!