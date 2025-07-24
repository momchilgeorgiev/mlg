// Main JavaScript file for the blog

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const navTrigger = document.querySelector('.nav-trigger');
  const trigger = document.querySelector('.trigger');
  
  if (navTrigger && trigger) {
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.site-nav')) {
        navTrigger.checked = false;
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add reading time to posts
  const postContent = document.querySelector('.post-content');
  if (postContent) {
    const text = postContent.textContent || postContent.innerText || '';
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    const postMeta = document.querySelector('.post-meta');
    if (postMeta) {
      const readingTimeElement = document.createElement('span');
      readingTimeElement.className = 'reading-time';
      readingTimeElement.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
      postMeta.appendChild(readingTimeElement);
    }
  }

  // Lazy loading for images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopButton.className = 'back-to-top';
  backToTopButton.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopButton);

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Add copy button to code blocks
  document.querySelectorAll('pre code').forEach((codeBlock) => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.setAttribute('aria-label', 'Copy code');
    
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          button.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      });
    });

    const pre = codeBlock.parentNode;
    pre.style.position = 'relative';
    pre.appendChild(button);
  });
});

// Add styles for JavaScript-added elements
const style = document.createElement('style');
style.textContent = `
  .back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }
  
  .back-to-top.show {
    opacity: 1;
    visibility: visible;
  }
  
  .back-to-top:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
  }
  
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--text-muted);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 8px;
    cursor: pointer;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  pre:hover .copy-button {
    opacity: 1;
  }
  
  .copy-button:hover {
    background-color: var(--accent-color);
  }
  
  .reading-time {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  
  .reading-time i {
    margin-right: 0.25rem;
  }
  
  img.lazy {
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  img.lazy.loaded {
    opacity: 1;
  }
`;
document.head.appendChild(style);