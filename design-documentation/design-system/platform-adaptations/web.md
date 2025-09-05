---
title: Web Design Guidelines
description: Web platform design specifications for responsive, accessible web experiences
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./ios.md
  - ./android.md
status: approved
---

# Web Design Guidelines

## Overview
Heurekka for web provides a responsive, performant, and accessible experience that works seamlessly across all browsers and devices, from mobile to desktop to large displays.

## Web Design Principles

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features layer on top
- Graceful degradation for older browsers
- Performance as a feature

### Responsive First
- Mobile-first approach
- Fluid layouts that adapt
- Content reflow for all viewports
- Touch and mouse optimized

### Accessible by Default
- Semantic HTML structure
- ARIA where needed
- Keyboard navigable
- Screen reader optimized

## Responsive Breakpoints

### Breakpoint System
```scss
// Mobile First Breakpoints
$breakpoints: (
  'sm': 640px,   // Small devices
  'md': 768px,   // Tablets
  'lg': 1024px,  // Laptops
  'xl': 1280px,  // Desktop
  '2xl': 1536px  // Large screens
);

// Usage
@media (min-width: map-get($breakpoints, 'md')) {
  // Tablet and up styles
}
```

### Container Widths
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

## Navigation Patterns

### Desktop Navigation
```html
<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a href="/" class="navbar-logo">
      <img src="logo.svg" alt="Heurekka" width="120" height="40">
    </a>
  </div>
  
  <ul class="navbar-menu">
    <li><a href="/search">Search</a></li>
    <li><a href="/saved">Saved</a></li>
    <li><a href="/alerts">Alerts</a></li>
    <li><a href="/profile">Profile</a></li>
  </ul>
  
  <button class="navbar-burger" aria-label="menu" aria-expanded="false">
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
  </button>
</nav>
```

### Mobile Navigation
```javascript
// Progressive enhancement for mobile menu
class MobileNav {
  constructor() {
    this.burger = document.querySelector('.navbar-burger');
    this.menu = document.querySelector('.navbar-menu');
    this.isOpen = false;
    
    if (this.burger) {
      this.init();
    }
  }
  
  init() {
    this.burger.addEventListener('click', () => this.toggle());
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  toggle() {
    this.isOpen = !this.isOpen;
    this.burger.setAttribute('aria-expanded', this.isOpen);
    this.menu.classList.toggle('is-active');
    
    // Trap focus when open
    if (this.isOpen) {
      this.trapFocus();
    }
  }
  
  trapFocus() {
    const focusableElements = this.menu.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];
    
    firstEl.focus();
    
    this.menu.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }
}
```

## Component Specifications

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary" type="button">
  View Details
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary" type="button">
  Save Search
</button>

<!-- Text Button -->
<button class="btn btn-text" type="button">
  Learn More
</button>

<!-- Icon Button -->
<button class="btn btn-icon" aria-label="Save property">
  <svg class="icon" aria-hidden="true">
    <use xlink:href="#icon-heart"></use>
  </svg>
</button>
```

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.5rem;
  transition: all 150ms ease-out;
  cursor: pointer;
  user-select: none;
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 102, 255, 0.25);
  }
}
```

### Form Controls
```html
<!-- Text Input -->
<div class="form-group">
  <label for="location" class="form-label">Location</label>
  <input 
    type="text" 
    id="location" 
    class="form-input" 
    placeholder="Enter city or zip code"
    aria-describedby="location-help"
  >
  <span id="location-help" class="form-help">
    Search by city, neighborhood, or ZIP code
  </span>
</div>

<!-- Select -->
<div class="form-group">
  <label for="property-type" class="form-label">Property Type</label>
  <select id="property-type" class="form-select">
    <option value="">All Types</option>
    <option value="house">House</option>
    <option value="apartment">Apartment</option>
    <option value="condo">Condo</option>
  </select>
</div>

<!-- Checkbox -->
<div class="form-check">
  <input type="checkbox" id="notifications" class="form-check-input">
  <label for="notifications" class="form-check-label">
    Send me email notifications
  </label>
</div>

<!-- Radio Group -->
<fieldset class="form-group">
  <legend class="form-label">Price Range</legend>
  <div class="form-radio-group">
    <div class="form-check">
      <input type="radio" id="price-any" name="price" value="any" class="form-check-input">
      <label for="price-any" class="form-check-label">Any Price</label>
    </div>
    <div class="form-check">
      <input type="radio" id="price-low" name="price" value="low" class="form-check-input">
      <label for="price-low" class="form-check-label">Under $500k</label>
    </div>
    <div class="form-check">
      <input type="radio" id="price-mid" name="price" value="mid" class="form-check-input">
      <label for="price-mid" class="form-check-label">$500k - $1M</label>
    </div>
  </div>
</fieldset>
```

## Grid System

### CSS Grid Layout
```css
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Flexbox Layout
```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .card-list {
    flex-direction: row;
    flex-wrap: wrap;
    
    .card {
      flex: 0 1 calc(50% - 0.5rem);
    }
  }
}

@media (min-width: 1024px) {
  .card-list {
    .card {
      flex: 0 1 calc(33.333% - 0.667rem);
    }
  }
}
```

## Performance Optimization

### Critical CSS
```html
<head>
  <!-- Critical CSS inline -->
  <style>
    /* Above-the-fold critical styles */
    .navbar { /* ... */ }
    .hero { /* ... */ }
    .container { /* ... */ }
  </style>
  
  <!-- Non-critical CSS lazy loaded -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
</head>
```

### Image Optimization
```html
<!-- Responsive images -->
<picture>
  <source 
    media="(max-width: 767px)" 
    srcset="property-mobile.webp 1x, property-mobile@2x.webp 2x"
    type="image/webp"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="property-desktop.webp 1x, property-desktop@2x.webp 2x"
    type="image/webp"
  >
  <img 
    src="property-fallback.jpg" 
    alt="3 bedroom house in downtown"
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  >
</picture>
```

### Web Fonts
```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap; /* Avoid FOIT */
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC;
}

/* Fallback for non-variable font browsers */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-regular.woff2') format('woff2');
}
```

## Progressive Web App

### Service Worker
```javascript
// sw.js
const CACHE_NAME = 'heurekka-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/js/app.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        return caches.match('/offline.html');
      })
  );
});
```

### Web App Manifest
```json
{
  "name": "Heurekka Property Search",
  "short_name": "Heurekka",
  "description": "Find your perfect property with AI-powered search",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066FF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Accessibility

### Semantic HTML
```html
<article class="property-card" itemscope itemtype="https://schema.org/Product">
  <header>
    <h2 itemprop="name">Modern Downtown Apartment</h2>
  </header>
  
  <figure>
    <img src="property.jpg" alt="Living room with city view" itemprop="image">
    <figcaption>Spacious living area with panoramic city views</figcaption>
  </figure>
  
  <dl class="property-details">
    <dt>Price</dt>
    <dd itemprop="price">$450,000</dd>
    
    <dt>Bedrooms</dt>
    <dd>3</dd>
    
    <dt>Bathrooms</dt>
    <dd>2</dd>
  </dl>
  
  <footer>
    <time datetime="2024-01-15" itemprop="datePublished">
      Listed 2 days ago
    </time>
  </footer>
</article>
```

### ARIA Landmarks
```html
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation -->
    </nav>
  </header>
  
  <main id="main" role="main" tabindex="-1">
    <section aria-labelledby="search-heading">
      <h1 id="search-heading">Property Search</h1>
      <!-- Search form -->
    </section>
    
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Search Results</h2>
      <div role="status" aria-live="polite" aria-atomic="true">
        Showing 24 properties
      </div>
      <!-- Results -->
    </section>
  </main>
  
  <aside role="complementary" aria-label="Filters">
    <!-- Filters -->
  </aside>
  
  <footer role="contentinfo">
    <!-- Footer -->
  </footer>
</body>
```

### Keyboard Navigation
```css
/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
  
  &:focus {
    top: 0;
  }
}

/* Tab order */
[tabindex="-1"]:focus {
  outline: none;
}
```

## SEO Optimization

### Meta Tags
```html
<head>
  <title>Find Your Dream Home | Heurekka Property Search</title>
  <meta name="description" content="Discover your perfect property with Heurekka's AI-powered search. Browse homes, apartments, and condos in your area.">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Find Your Dream Home | Heurekka">
  <meta property="og:description" content="Discover your perfect property with AI-powered search">
  <meta property="og:image" content="https://heurekka.com/og-image.jpg">
  <meta property="og:url" content="https://heurekka.com">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Find Your Dream Home | Heurekka">
  <meta name="twitter:description" content="Discover your perfect property with AI-powered search">
  <meta name="twitter:image" content="https://heurekka.com/twitter-image.jpg">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Heurekka",
    "url": "https://heurekka.com",
    "description": "AI-powered property search platform"
  }
  </script>
</head>
```

## Browser Support

### Target Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 14+
- Chrome Mobile 90+

### Progressive Enhancement
```css
/* Base styles that work everywhere */
.card {
  display: block;
  padding: 1rem;
  border: 1px solid #ccc;
}

/* Modern enhancement with feature detection */
@supports (display: grid) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Container queries when supported */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .card {
      display: flex;
    }
  }
}
```

## Testing Checklist
- [ ] Test on all major browsers
- [ ] Test responsive breakpoints
- [ ] Test with keyboard only
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Test offline functionality
- [ ] Test slow network conditions
- [ ] Run Lighthouse audit
- [ ] Validate HTML
- [ ] Check WCAG compliance
- [ ] Test print styles

## Related Documentation
- [Platform Adaptations Overview](./README.md)
- [Design System](../README.md)
- [Component Library](../components/README.md)
- [Accessibility Guidelines](../../accessibility/guidelines.md)

## Last Updated
2025-01-04 - Web platform guidelines