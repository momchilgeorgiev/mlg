# Jekyll Blog Setup Guide

🎉 **Your Jekyll blog is ready!** I've set up Jekyll alongside your existing files without removing anything.

## ✅ What's Been Set Up

- **Jekyll configuration** (`_config.yml`)
- **All your existing posts** converted to Jekyll format in `_posts/`
- **Pages** for About and Contact
- **GitHub Pages compatibility** with proper Gemfile
- **Local development** ready to go

## 🚀 How to Use Your New Jekyll Blog

### 1. Local Development

```bash
# Build the site
bundle exec jekyll build

# Serve locally (with auto-rebuild)
bundle exec jekyll serve

# Then visit: http://localhost:4000
```

### 2. Add New Posts

Create files in `_posts/` with this naming format:
```
_posts/YYYY-MM-DD-post-title.md
```

**Example:** `_posts/2024-02-01-my-new-post.md`

```markdown
---
layout: post
title: "My New Post"
date: 2024-02-01 10:00:00 +0000
categories: [Technology]
tags: [javascript, web development]
---

Your content here in markdown...
```

### 3. Deploy to GitHub Pages

1. **Commit everything to your repo**
2. **Go to Settings → Pages** in your GitHub repository
3. **Select source:** "Deploy from a branch"
4. **Choose branch:** main
5. **Choose folder:** / (root)
6. **GitHub will automatically build and deploy** your Jekyll site!

## 📁 Your New File Structure

```
mlg/
├── _config.yml          # Jekyll configuration
├── _posts/              # Your blog posts (Jekyll format)
│   ├── 2024-01-15-getting-started-with-my-blog.md
│   ├── 2024-01-20-thoughts-on-modern-web-development.md
│   └── 2024-01-25-my-journey-learning-to-code.md
├── index.md             # Home page
├── about.md             # About page
├── contact.md           # Contact page
├── Gemfile              # Ruby dependencies
└── vendor/              # Installed gems (ignore this)

# Your original files are still here:
├── index.html           # Original blog (still works)
├── js/                  # Your custom JavaScript
├── posts/               # Original markdown files
└── styles.css           # Original styles
```

## 🎨 Customization

### Update Site Info
Edit `_config.yml`:
```yaml
title: My Blog
email: your.email@example.com
description: Your blog description
```

### Update Personal Info
- Edit `about.md` for your about page
- Edit `contact.md` for your contact information

### Choose a Theme
Jekyll comes with the `minima` theme. You can:
1. **Customize minima** by editing `_config.yml`
2. **Use a different theme** - browse [Jekyll themes](https://jekyllthemes.org/)
3. **Keep your custom styles** - Jekyll can use your existing CSS

## 🔥 Benefits of Jekyll

- ✅ **No more JSON files** - posts are just markdown files
- ✅ **Automatic SEO** - built-in meta tags, sitemaps, RSS feeds
- ✅ **Fast builds** - GitHub Pages builds automatically
- ✅ **Plugin ecosystem** - add features easily
- ✅ **Liquid templates** - powerful templating system
- ✅ **Markdown processing** - advanced markdown features

## 🚚 Next Steps

1. **Test locally:** Run `bundle exec jekyll serve`
2. **Customize:** Update your info in `_config.yml`, `about.md`, `contact.md`
3. **Deploy:** Push to GitHub and enable Pages
4. **Write:** Add new posts in `_posts/`

## 💡 Pro Tips

**Writing posts:**
- Use front matter for metadata
- Categories and tags help organize content
- Dates in filenames determine post order

**Development:**
- Use `jekyll serve --drafts` to see draft posts
- Add `--livereload` for automatic browser refresh
- Check `_site/` folder to see generated HTML

**GitHub Pages:**
- Only uses approved plugins (your Gemfile is already configured)
- Builds automatically on every push
- Custom domains supported

---

Your blog is now much easier to maintain! 🎉

**Questions?** The original system still works if you need it, but Jekyll is the better long-term solution.