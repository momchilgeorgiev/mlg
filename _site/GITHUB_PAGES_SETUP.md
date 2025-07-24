# GitHub Pages Deployment Guide

This guide will help you deploy your Jekyll blog to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your blog files ready to deploy

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Choose one of these naming options:

   **Option A: User/Organization Site** (Recommended)
   - Repository name: `yourusername.github.io`
   - Your site will be available at: `https://yourusername.github.io`
   - Set `baseurl: ""` in `_config.yml`

   **Option B: Project Site**
   - Repository name: `my-blog` (or any name)
   - Your site will be available at: `https://yourusername.github.io/my-blog`
   - Set `baseurl: "/my-blog"` in `_config.yml`

5. Make sure the repository is **Public**
6. Don't initialize with README (we have our own files)
7. Click "Create repository"

## Step 2: Configure Your Blog for GitHub Pages

If you chose **Option B** (project site), update your `_config.yml`:

```yaml
baseurl: "/your-repository-name" # Replace with your actual repo name
url: "" # GitHub Pages will set this automatically
```

If you chose **Option A** (user site), your current configuration is already correct:

```yaml
baseurl: ""
url: ""
```

## Step 3: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Jekyll blog setup"
   ```

2. **Connect to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
5. Click "Save"

## Step 5: Wait for Deployment

- GitHub Pages will automatically build and deploy your site
- This usually takes 1-10 minutes
- You'll see a green checkmark next to your commit when it's ready
- Your site will be available at:
  - User site: `https://yourusername.github.io`
  - Project site: `https://yourusername.github.io/repository-name`

## Troubleshooting Common Issues

### 404 Error - "File not found"

**Cause**: Usually a configuration issue with baseurl or missing index.html

**Solutions**:
1. **Check your baseurl** in `_config.yml`:
   - User site (`username.github.io`): `baseurl: ""`
   - Project site: `baseurl: "/repository-name"`

2. **Verify index.html exists** in your root directory (✅ You have this)

3. **Check repository name**:
   - User site must be exactly `username.github.io`
   - Project site can be any name

4. **Wait for build to complete**:
   - Check the "Actions" tab for build status
   - Green checkmark = successful build
   - Red X = build failed (check logs)

### Build Failures

**Check build logs**:
1. Go to "Actions" tab in your repository
2. Click on the failed workflow
3. Check the error messages

**Common fixes**:
- Remove any `_site/` folder from your repository
- Ensure Gemfile uses `github-pages` gem
- Check for syntax errors in `_config.yml`

### Changes Not Showing

1. **Clear your browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Wait for build to complete** (check Actions tab)
3. **Verify your changes were pushed** to the main branch

## Testing Locally Before Deployment

Always test your changes locally first:

```bash
bundle exec jekyll serve
```

Then visit `http://localhost:4000` to preview your site.

## Custom Domain (Optional)

To use a custom domain like `yourblog.com`:

1. **Add CNAME file** to your repository root:
   ```
   yourdomain.com
   ```

2. **Configure DNS** with your domain provider:
   - Add a CNAME record pointing to `yourusername.github.io`

3. **Update _config.yml**:
   ```yaml
   url: "https://yourdomain.com"
   baseurl: ""
   ```

## Automated Deployment Workflow

Your current setup will automatically:
1. Build your site when you push changes
2. Deploy to GitHub Pages
3. Update your live site

## Making Updates

To update your blog:

1. **Make changes locally**
2. **Test locally**: `bundle exec jekyll serve`
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Wait for deployment** (1-10 minutes)

## Security Notes

- Never commit sensitive information (API keys, passwords)
- Your repository must be public for free GitHub Pages
- Use environment variables for sensitive config

## Next Steps

1. **Customize your profile**: Update `_config.yml` with your information
2. **Add your photo**: Replace `/assets/images/profile.svg`
3. **Write your first post**: Add files to `_posts/`
4. **Share your blog**: Your site is now live!

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review GitHub Pages documentation
3. Check the repository's Actions tab for build logs
4. Ensure your configuration matches the examples above

---

**Your blog is now ready for the world! 🚀**