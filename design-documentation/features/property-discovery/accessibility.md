---
title: Property Discovery - Accessibility Requirements
description: Complete accessibility specifications and guidelines for property discovery
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./interactions.md
  - ../../accessibility/guidelines.md
status: approved
---

# Property Discovery - Accessibility Requirements

## Overview
Comprehensive accessibility requirements ensuring the property discovery feature meets WCAG 2.1 AA standards and provides an inclusive experience for all users.

## Table of Contents
1. [WCAG Compliance](#wcag-compliance)
2. [Screen Reader Support](#screen-reader-support)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Visual Accessibility](#visual-accessibility)
5. [Motor Accessibility](#motor-accessibility)
6. [Cognitive Accessibility](#cognitive-accessibility)
7. [Map Accessibility](#map-accessibility)
8. [Testing Requirements](#testing-requirements)

## WCAG Compliance

### Level AA Requirements Met

#### 1.1 Text Alternatives
```html
<!-- Property images -->
<img 
  src="property-exterior.jpg" 
  alt="3-bedroom house with red brick exterior, white trim windows, and landscaped front yard"
  loading="lazy"
/>

<!-- Decorative images -->
<img src="decorative-pattern.svg" alt="" role="presentation" />

<!-- Complex floor plans -->
<figure>
  <img src="floor-plan.jpg" alt="Floor plan for 3-bedroom house" />
  <figcaption>
    First floor: living room (20x15), kitchen (12x10), dining room (15x12).
    Second floor: master bedroom (15x12), two bedrooms (12x10 each), 2 bathrooms.
  </figcaption>
</figure>

<!-- Icon buttons -->
<button aria-label="Add to favorites">
  <svg aria-hidden="true"><!-- heart icon --></svg>
</button>
```

#### 1.3 Adaptable Content
```html
<!-- Semantic structure for property listings -->
<main role="main" aria-label="Property search results">
  <section aria-labelledby="results-heading">
    <h1 id="results-heading">
      <span class="results-count">247</span> Properties in San Francisco
    </h1>
    
    <div role="region" aria-label="Search filters">
      <!-- Filter controls -->
    </div>
    
    <div role="feed" aria-label="Property listings" aria-busy="false">
      <article aria-posinset="1" aria-setsize="247">
        <h2>123 Main Street</h2>
        <!-- Property details -->
      </article>
    </div>
  </section>
</main>

<!-- Data tables for comparison -->
<table role="table" aria-label="Property comparison">
  <caption>Comparing 3 selected properties</caption>
  <thead>
    <tr>
      <th scope="col">Feature</th>
      <th scope="col">Property A</th>
      <th scope="col">Property B</th>
      <th scope="col">Property C</th>
    </tr>
  </thead>
  <tbody>
    <!-- Comparison data -->
  </tbody>
</table>
```

#### 1.4 Distinguishable Content
```css
/* Color contrast compliance */
.primary-text {
  color: #1A1A1A; /* 12.6:1 on white */
}

.secondary-text {
  color: #4B5563; /* 7.1:1 on white */
}

.link-text {
  color: #6366F1; /* 4.5:1 on white */
  text-decoration: underline;
}

/* Focus indicators */
*:focus-visible {
  outline: 3px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Text sizing */
html {
  font-size: 100%; /* Respects user preferences */
}

body {
  font-size: 1rem; /* 16px default */
  line-height: 1.5;
}

/* Responsive text scaling */
@media screen and (min-width: 320px) {
  body {
    font-size: calc(16px + 4 * ((100vw - 320px) / 680));
  }
}
```

## Screen Reader Support

### Property Card Announcements
```html
<!-- Property card with comprehensive ARIA -->
<article 
  class="property-card"
  role="article"
  aria-label="Property listing"
>
  <div class="property-image-container">
    <img 
      src="property.jpg" 
      alt="Modern 2-bedroom apartment with city views"
    />
    <span class="sr-only">New listing</span>
  </div>
  
  <div class="property-details">
    <h3 id="property-title-123">Downtown Luxury Apartment</h3>
    <p aria-describedby="property-title-123">
      <span class="price" aria-label="Price">$850,000</span>
      <span class="sr-only">located at</span>
      <span class="address">123 Market Street, San Francisco</span>
    </p>
    
    <dl class="property-specs" aria-label="Property specifications">
      <div>
        <dt class="sr-only">Bedrooms</dt>
        <dd>
          <span aria-hidden="true">🛏️</span>
          <span>3 beds</span>
        </dd>
      </div>
      <div>
        <dt class="sr-only">Bathrooms</dt>
        <dd>
          <span aria-hidden="true">🚿</span>
          <span>2 baths</span>
        </dd>
      </div>
      <div>
        <dt class="sr-only">Square footage</dt>
        <dd>
          <span aria-hidden="true">📐</span>
          <span>1,500 sqft</span>
        </dd>
      </div>
    </dl>
  </div>
  
  <div class="property-actions">
    <button 
      aria-label="Add 123 Market Street to favorites"
      aria-pressed="false"
    >
      <svg aria-hidden="true"><!-- heart icon --></svg>
    </button>
    <button 
      aria-label="Compare 123 Market Street"
      aria-pressed="false"
    >
      <svg aria-hidden="true"><!-- compare icon --></svg>
    </button>
  </div>
</article>
```

### Live Region Updates
```html
<!-- Search results updates -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
>
  <p id="results-announcement">
    Showing 24 of 247 properties. Sorted by price, low to high.
  </p>
</div>

<!-- Filter changes -->
<div 
  role="status" 
  aria-live="polite"
  class="sr-only"
>
  <p>Filters updated. 152 properties match your criteria.</p>
</div>

<!-- Loading states -->
<div 
  role="status" 
  aria-live="assertive"
  aria-busy="true"
>
  <span class="sr-only">Loading more properties...</span>
</div>

<!-- Error messages -->
<div 
  role="alert" 
  aria-live="assertive"
>
  <p>Unable to load properties. Please try again.</p>
</div>
```

### Filter Controls
```html
<!-- Accessible filter panel -->
<div 
  role="region" 
  aria-label="Property filters"
  class="filter-panel"
>
  <h2 id="filter-heading">Refine Your Search</h2>
  
  <!-- Price range -->
  <fieldset>
    <legend>Price Range</legend>
    <div class="range-slider" role="group">
      <label for="price-min" class="sr-only">Minimum price</label>
      <input 
        type="range" 
        id="price-min"
        min="0" 
        max="5000000"
        value="500000"
        aria-valuenow="500000"
        aria-valuemin="0"
        aria-valuemax="5000000"
        aria-label="Minimum price: $500,000"
      />
      
      <label for="price-max" class="sr-only">Maximum price</label>
      <input 
        type="range" 
        id="price-max"
        min="0" 
        max="5000000"
        value="1500000"
        aria-valuenow="1500000"
        aria-valuemin="0"
        aria-valuemax="5000000"
        aria-label="Maximum price: $1,500,000"
      />
      
      <output aria-live="polite">
        $500,000 - $1,500,000
      </output>
    </div>
  </fieldset>
  
  <!-- Property type -->
  <fieldset>
    <legend>Property Type</legend>
    <div role="group" aria-describedby="type-description">
      <p id="type-description" class="sr-only">
        Select one or more property types
      </p>
      
      <label>
        <input type="checkbox" value="house" />
        <span>House</span>
      </label>
      <label>
        <input type="checkbox" value="apartment" />
        <span>Apartment</span>
      </label>
      <label>
        <input type="checkbox" value="condo" />
        <span>Condo</span>
      </label>
    </div>
  </fieldset>
</div>
```

## Keyboard Navigation

### Tab Order Management
```javascript
// Logical tab order for property grid
const tabOrder = [
  'search-input',
  'search-button',
  'view-toggle',
  'sort-dropdown',
  'filter-button',
  'property-card-1',
  'favorite-1',
  'compare-1',
  'property-card-2',
  // ... continue for visible properties
  'load-more-button',
  'pagination-controls'
];

// Skip to main content
<a href="#main-content" class="skip-link">
  Skip to search results
</a>

// Focus management for modal
function openPropertyModal(propertyId) {
  const modal = document.getElementById('property-modal');
  const firstFocusable = modal.querySelector('.modal-close');
  
  modal.showModal();
  firstFocusable.focus();
  
  // Trap focus within modal
  trapFocus(modal);
}
```

### Keyboard Shortcuts
```javascript
// Application keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Search focus
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
  
  // Toggle map view
  if (e.key === 'm' && !isInputFocused()) {
    toggleMapView();
  }
  
  // Navigate properties with arrow keys
  if (e.key.startsWith('Arrow') && !isInputFocused()) {
    navigateProperties(e.key);
  }
  
  // Open property details
  if (e.key === 'Enter' && ispropertyFocused()) {
    openPropertyDetails();
  }
  
  // Toggle favorite
  if (e.key === 'f' && isPropertyFocused()) {
    toggleFavorite();
  }
  
  // Close modals
  if (e.key === 'Escape') {
    closeActiveModal();
  }
});

// Grid navigation with arrow keys
function navigateProperties(direction) {
  const current = document.activeElement;
  const cards = Array.from(document.querySelectorAll('.property-card'));
  const index = cards.indexOf(current);
  const columns = getGridColumns();
  
  let nextIndex;
  switch(direction) {
    case 'ArrowRight':
      nextIndex = index + 1;
      break;
    case 'ArrowLeft':
      nextIndex = index - 1;
      break;
    case 'ArrowDown':
      nextIndex = index + columns;
      break;
    case 'ArrowUp':
      nextIndex = index - columns;
      break;
  }
  
  if (nextIndex >= 0 && nextIndex < cards.length) {
    cards[nextIndex].focus();
  }
}
```

## Visual Accessibility

### High Contrast Mode
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .property-card {
    border: 2px solid ButtonText;
    background: ButtonFace;
  }
  
  .property-price {
    color: ButtonText;
    font-weight: 700;
  }
  
  .filter-panel {
    background: Canvas;
    border: 2px solid ButtonText;
  }
  
  .button-primary {
    background: ButtonText;
    color: ButtonFace;
    border: 2px solid transparent;
  }
  
  .button-primary:hover {
    background: ButtonFace;
    color: ButtonText;
    border-color: ButtonText;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1A1A1A;
    --text-primary: #FFFFFF;
    --text-secondary: #A3A3A3;
    --border: #333333;
  }
  
  .property-card {
    background: var(--background);
    color: var(--text-primary);
    border: 1px solid var(--border);
  }
}
```

### Focus Indicators
```css
/* Enhanced focus indicators */
.interactive-element:focus-visible {
  outline: 3px solid #6366F1;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.2);
}

/* Focus within property cards */
.property-card:focus-within {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

/* Skip link visibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #6366F1;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Motor Accessibility

### Touch Targets
```css
/* Minimum touch target sizes */
.touchable {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Spacing between interactive elements */
.property-actions {
  display: flex;
  gap: 12px; /* Prevent accidental activation */
}

/* Larger hit areas for small buttons */
.small-button {
  position: relative;
  padding: 8px;
}

.small-button::after {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  bottom: -8px;
  left: -8px;
}

/* Swipe gesture areas */
.swipeable {
  padding: 16px 0; /* Larger swipe area */
  touch-action: pan-y; /* Prevent accidental zoom */
}
```

### Gesture Alternatives
```javascript
// Provide button alternatives to gestures
class AccessibleGallery {
  constructor(element) {
    this.element = element;
    this.addKeyboardSupport();
    this.addButtonControls();
  }
  
  addButtonControls() {
    // Previous/Next buttons for swipe alternatives
    const prevButton = this.createButton('Previous image', 'prev');
    const nextButton = this.createButton('Next image', 'next');
    
    this.element.appendChild(prevButton);
    this.element.appendChild(nextButton);
  }
  
  addKeyboardSupport() {
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousImage();
      if (e.key === 'ArrowRight') this.nextImage();
    });
  }
}
```

## Cognitive Accessibility

### Clear Instructions
```html
<!-- Simple, clear language -->
<div class="help-text">
  <h3>How to search for properties:</h3>
  <ol>
    <li>Enter a city or zip code</li>
    <li>Choose your price range</li>
    <li>Select property types you want</li>
    <li>Click "Search" to see results</li>
  </ol>
</div>

<!-- Progressive disclosure -->
<details>
  <summary>More search options</summary>
  <div class="advanced-filters">
    <!-- Additional filters -->
  </div>
</details>

<!-- Clear error messages -->
<div class="error-message" role="alert">
  <strong>We couldn't find any properties.</strong>
  <p>Try these suggestions:</p>
  <ul>
    <li>Check your spelling</li>
    <li>Use a broader search area</li>
    <li>Adjust your price range</li>
  </ul>
</div>
```

### Memory Aids
```javascript
// Save search state
class SearchStateManager {
  saveState() {
    const state = {
      filters: this.getFilters(),
      sort: this.getSort(),
      view: this.getView(),
      page: this.getPage()
    };
    
    localStorage.setItem('searchState', JSON.stringify(state));
    sessionStorage.setItem('lastSearch', Date.now());
  }
  
  restoreState() {
    const state = localStorage.getItem('searchState');
    if (state) {
      this.applyState(JSON.parse(state));
      this.showMessage('Restored your previous search');
    }
  }
}

// Recently viewed properties
class RecentlyViewed {
  add(property) {
    let recent = this.getRecent();
    recent = [property, ...recent.filter(p => p.id !== property.id)];
    recent = recent.slice(0, 10); // Limit to 10
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
  }
  
  display() {
    const recent = this.getRecent();
    if (recent.length > 0) {
      this.showSection('Recently Viewed Properties', recent);
    }
  }
}
```

## Map Accessibility

### Alternative Map Views
```html
<!-- Text alternative for map -->
<div class="map-alternative" role="region" aria-label="Property locations">
  <h3>Properties by Area</h3>
  <ul>
    <li>
      <h4>Downtown (15 properties)</h4>
      <ul>
        <li>123 Main St - $850,000</li>
        <li>456 Market St - $925,000</li>
        <!-- More properties -->
      </ul>
    </li>
    <li>
      <h4>Mission District (8 properties)</h4>
      <!-- Properties list -->
    </li>
  </ul>
</div>

<!-- Map controls -->
<div class="map-controls" role="toolbar" aria-label="Map controls">
  <button aria-label="Zoom in" aria-keyshortcuts="Plus">+</button>
  <button aria-label="Zoom out" aria-keyshortcuts="Minus">-</button>
  <button aria-label="Reset view" aria-keyshortcuts="0">⊙</button>
  <button aria-label="Toggle fullscreen" aria-keyshortcuts="F">⛶</button>
</div>
```

### Map Keyboard Navigation
```javascript
// Keyboard controls for map
class AccessibleMap {
  constructor(mapElement) {
    this.map = mapElement;
    this.setupKeyboardControls();
    this.setupScreenReaderAnnouncements();
  }
  
  setupKeyboardControls() {
    this.map.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 100 : 10;
      
      switch(e.key) {
        case 'ArrowUp':
          this.pan(0, -step);
          this.announce('Panned north');
          break;
        case 'ArrowDown':
          this.pan(0, step);
          this.announce('Panned south');
          break;
        case 'ArrowLeft':
          this.pan(-step, 0);
          this.announce('Panned west');
          break;
        case 'ArrowRight':
          this.pan(step, 0);
          this.announce('Panned east');
          break;
        case '+':
        case '=':
          this.zoomIn();
          this.announce(`Zoomed in to level ${this.getZoom()}`);
          break;
        case '-':
          this.zoomOut();
          this.announce(`Zoomed out to level ${this.getZoom()}`);
          break;
        case 'Enter':
          this.selectMarker();
          break;
        case 'Tab':
          this.cycleMarkers(e.shiftKey ? -1 : 1);
          break;
      }
    });
  }
  
  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 1000);
  }
}
```

## Testing Requirements

### Automated Testing
```javascript
// Accessibility testing with axe-core
describe('Property Discovery Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const results = await axe.run('.property-discovery');
    expect(results.violations).toHaveLength(0);
  });
  
  it('should announce search results to screen readers', () => {
    const announcement = document.querySelector('[role="status"]');
    expect(announcement).toHaveTextContent('247 properties found');
  });
  
  it('should support keyboard navigation', () => {
    const firstCard = document.querySelector('.property-card');
    firstCard.focus();
    
    // Simulate arrow key
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    const secondCard = document.querySelectorAll('.property-card')[1];
    expect(document.activeElement).toBe(secondCard);
  });
});
```

### Manual Testing Checklist

#### Screen Reader Testing
- [ ] All property information announced correctly
- [ ] Filter changes announced
- [ ] Sort order changes announced
- [ ] Map alternatives available
- [ ] Image descriptions meaningful
- [ ] Live regions working

#### Keyboard Testing
- [ ] All properties keyboard accessible
- [ ] Map controls keyboard accessible
- [ ] Modal focus trapped correctly
- [ ] Escape key closes modals
- [ ] Tab order logical
- [ ] Skip links functional

#### Visual Testing
- [ ] 200% zoom without horizontal scroll
- [ ] High contrast mode functional
- [ ] Dark mode support
- [ ] Focus indicators visible
- [ ] Color not sole indicator
- [ ] Text readable at all sizes

#### Motor Testing
- [ ] Touch targets 44×44px minimum
- [ ] Gesture alternatives provided
- [ ] No time limits on interactions
- [ ] Drag alternatives available
- [ ] Double-tap protection

## Related Documentation
- [Global Accessibility Guidelines](../../accessibility/guidelines.md)
- [Testing Procedures](../../accessibility/testing.md)
- [Component Accessibility](../../design-system/components/)
- [WCAG Compliance](../../accessibility/compliance.md)