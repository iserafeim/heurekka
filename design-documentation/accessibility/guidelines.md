# HEUREKKA Accessibility Guidelines
## Inclusive Design Standards for the Honduran Market

---

## Overview

HEUREKKA is committed to creating an inclusive rental marketplace accessible to all users regardless of ability, device, or connection quality. These guidelines ensure our platform meets WCAG 2.1 Level AA standards while considering the unique constraints of the Honduran market.

## Core Principles

### 1. Perceivable
Information and UI components must be presentable in ways users can perceive.

### 2. Operable
Interface components and navigation must be operable by all users.

### 3. Understandable
Information and UI operation must be understandable.

### 4. Robust
Content must be robust enough to work with various assistive technologies.

---

## Visual Accessibility

### Color Contrast Requirements

#### Text Contrast Ratios
- **Normal Text**: Minimum 4.5:1
  - Body text (#374151 on #FFFFFF): 7.5:1 ✓
  - Secondary text (#6B7280 on #FFFFFF): 4.5:1 ✓
- **Large Text** (18px+ or 14px+ bold): Minimum 3:1
  - Headings (#111827 on #FFFFFF): 15.3:1 ✓
- **UI Components**: Minimum 3:1
  - Primary button (#2563EB): 5.4:1 ✓
  - Form borders (#D1D5DB): 3.2:1 ✓

#### Color Independence
Never rely solely on color to convey information:
```css
/* Bad - Color only */
.error { color: red; }

/* Good - Color + Icon + Text */
.error {
  color: #EF4444;
  &::before {
    content: "⚠️ Error: ";
  }
}
```

#### Colorblind Considerations
- Test with Deuteranopia (red-green)
- Test with Protanopia (red-green)
- Test with Tritanopia (blue-yellow)
- Use patterns/icons alongside colors

### Focus Indicators

#### Visible Focus
```css
/* Minimum focus indicator */
:focus {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :focus {
    outline: 3px solid currentColor;
  }
}
```

#### Focus Order
- Logical tab order following visual flow
- Skip links at page start
- Focus trap in modals
- Return focus after modal close

### Typography

#### Readable Fonts
- **Minimum Size**: 14px for body text
- **Line Height**: 1.5 minimum for body
- **Font Weight**: Avoid light weights (<400)
- **Letter Spacing**: Default or slightly increased

#### Responsive Text
```css
/* Allow user zoom up to 200% */
html {
  font-size: 100%; /* Respect user preferences */
}

/* Fluid typography */
.body-text {
  font-size: clamp(14px, 2vw, 18px);
}
```

---

## Keyboard Accessibility

### Navigation Requirements

#### Tab Navigation
- All interactive elements reachable via Tab
- Shift+Tab for reverse navigation
- Tab order matches visual order
- Hidden elements removed from tab order

#### Keyboard Shortcuts
```javascript
// Global shortcuts
'/' - Focus search
'Escape' - Close modal/dropdown
'Enter' - Activate button/link
'Space' - Toggle checkbox, activate button
'Arrow keys' - Navigate within components
```

### Interactive Components

#### Buttons
```html
<button 
  aria-label="Add to favorites"
  aria-pressed="false"
  onclick="toggleFavorite()"
>
  <HeartIcon />
</button>
```

#### Form Controls
```html
<div role="group" aria-labelledby="budget-label">
  <label id="budget-label">Monthly Budget *</label>
  <input 
    type="number" 
    aria-required="true"
    aria-describedby="budget-help budget-error"
    aria-invalid="false"
  />
  <span id="budget-help">Enter amount in Lempiras</span>
  <span id="budget-error" role="alert"></span>
</div>
```

#### Modals
```html
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Create Your Profile</h2>
  <!-- Focus trap implemented -->
</div>
```

---

## Screen Reader Support

### Semantic HTML

#### Proper Heading Hierarchy
```html
<h1>Properties in Tegucigalpa</h1>
  <h2>Search Results</h2>
    <h3>Modern 2BR Apartment</h3>
    <h3>Spacious House in Las Colinas</h3>
  <h2>Search Filters</h2>
    <h3>Price Range</h3>
    <h3>Property Type</h3>
```

#### Landmark Regions
```html
<header role="banner">
  <nav role="navigation" aria-label="Main">
</header>

<main role="main">
  <section aria-label="Property search">
  <section aria-label="Search results">
</main>

<footer role="contentinfo">
</footer>
```

### ARIA Implementation

#### Live Regions
```html
<!-- Search results updates -->
<div aria-live="polite" aria-atomic="true">
  <span>234 properties found</span>
</div>

<!-- Error messages -->
<div role="alert" aria-live="assertive">
  <span>Error: Invalid phone number format</span>
</div>
```

#### Descriptive Labels
```html
<!-- Icon buttons -->
<button aria-label="Filter search results">
  <FilterIcon />
</button>

<!-- Complex widgets -->
<div 
  role="slider"
  aria-label="Maximum price"
  aria-valuemin="0"
  aria-valuemax="100000"
  aria-valuenow="15000"
  aria-valuetext="15,000 Lempiras"
>
```

### Image Accessibility

#### Alt Text Guidelines
```html
<!-- Informative images -->
<img 
  src="apartment-exterior.jpg" 
  alt="Two-story apartment building with gated parking"
/>

<!-- Decorative images -->
<img src="decoration.svg" alt="" role="presentation" />

<!-- Complex images -->
<figure>
  <img src="neighborhood-map.png" alt="Map of Tegucigalpa neighborhoods">
  <figcaption>
    Interactive map showing rental properties. 
    <a href="#text-list">View as list</a>
  </figcaption>
</figure>
```

---

## Mobile Accessibility

### Touch Targets

#### Minimum Sizes
- **Buttons**: 48×48px minimum
- **Links**: 44×44px minimum
- **Form Controls**: 48px height
- **Spacing**: 8px between targets

```css
/* Touch-friendly buttons */
.button {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
}

/* Adequate spacing */
.button-group > * + * {
  margin-left: 8px;
}
```

### Gesture Alternatives
Always provide non-gesture alternatives:
- Swipe → Previous/Next buttons
- Pinch-to-zoom → Zoom controls
- Long-press → Explicit menu button
- Shake → Settings option

### Orientation Support
```css
/* Support both orientations */
@media (orientation: landscape) {
  .mobile-nav {
    /* Adjust for landscape */
  }
}

/* Don't lock orientation */
/* Allow natural device rotation */
```

---

## Performance & Low Bandwidth

### Progressive Enhancement

#### Core Functionality First
```html
<!-- Works without JavaScript -->
<form action="/search" method="GET">
  <input name="q" type="search">
  <button type="submit">Search</button>
</form>

<!-- Enhanced with JavaScript -->
<script>
  // Add autocomplete, instant search, etc.
</script>
```

#### Reduced Motion
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

### Low Bandwidth Optimization

#### Image Optimization
```html
<!-- Responsive images -->
<picture>
  <source 
    media="(max-width: 768px)" 
    srcset="property-small.webp"
  >
  <source 
    media="(min-width: 769px)" 
    srcset="property-large.webp"
  >
  <img 
    src="property-fallback.jpg" 
    alt="Property exterior"
    loading="lazy"
  >
</picture>
```

#### Content Priority
```html
<!-- Critical content first -->
<div class="property-essential">
  <h3>L.12,000/month</h3>
  <p>2BR in Los Próceres</p>
  <a href="tel:+50499999999">Call Now</a>
</div>

<!-- Enhanced content lazy loaded -->
<div class="property-enhanced" data-lazy>
  <!-- Gallery, map, etc. -->
</div>
```

---

## Form Accessibility

### Error Handling

#### Clear Error Messages
```html
<div class="form-field">
  <label for="phone">Phone Number *</label>
  <input 
    id="phone"
    type="tel"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="phone-error"
  />
  <span id="phone-error" role="alert">
    Please enter a valid Honduran phone number (9999-9999)
  </span>
</div>
```

#### Error Summary
```html
<div role="alert" aria-labelledby="error-summary">
  <h2 id="error-summary">Please fix the following errors:</h2>
  <ul>
    <li><a href="#phone">Invalid phone number format</a></li>
    <li><a href="#budget">Maximum budget must be higher than minimum</a></li>
  </ul>
</div>
```

### Field Labels

#### Required Fields
```html
<label for="name">
  Full Name
  <span aria-label="required">*</span>
</label>
<input id="name" aria-required="true" />
```

#### Helper Text
```html
<label for="move-date">Move-in Date</label>
<input 
  id="move-date"
  type="date"
  aria-describedby="move-date-help"
/>
<small id="move-date-help">
  Select a date within the next 6 months
</small>
```

---

## Testing Checklist

### Automated Testing
- [ ] WAVE accessibility checker
- [ ] axe DevTools scan
- [ ] Lighthouse audit
- [ ] Color contrast analyzer
- [ ] HTML validation

### Manual Testing
- [ ] Keyboard-only navigation
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Mobile screen reader (TalkBack/VoiceOver)
- [ ] 200% zoom functionality
- [ ] High contrast mode

### User Testing
- [ ] Test with users who have disabilities
- [ ] Test with older users
- [ ] Test on low-end devices
- [ ] Test on slow connections
- [ ] Test in bright sunlight

---

## Assistive Technology Support

### Screen Readers
- **NVDA**: Full support (Windows)
- **JAWS**: Full support (Windows)
- **VoiceOver**: Full support (macOS/iOS)
- **TalkBack**: Full support (Android)

### Browser Compatibility
- Chrome 90+ with accessibility features
- Firefox 88+ with accessibility features
- Safari 14+ with VoiceOver
- Edge 90+ with Narrator

### Mobile Assistive Features
- Voice Control
- Switch Control
- Magnification
- Color filters
- Font size adjustment

---

## Implementation Guidelines

### Development Workflow

#### Accessibility-First Development
1. Write semantic HTML
2. Add ARIA only when needed
3. Test with keyboard
4. Check with screen reader
5. Validate color contrast
6. Test on mobile

#### Code Review Checklist
```markdown
- [ ] All images have appropriate alt text
- [ ] Form fields have labels
- [ ] Error messages are clear and associated
- [ ] Focus indicators are visible
- [ ] Color contrast meets standards
- [ ] Keyboard navigation works
```

### Documentation Requirements
- Document all keyboard shortcuts
- Explain complex interactions
- Provide text alternatives for tutorials
- Include accessibility in user guides

---

## Compliance & Legal

### Standards Compliance
- **WCAG 2.1 Level AA**: Minimum requirement
- **Section 508**: For government users
- **EN 301 549**: European standard alignment

### Regular Audits
- Quarterly accessibility audits
- User feedback integration
- Continuous improvement process
- Third-party validation

---

## Resources

### Tools
- [WAVE](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/)
- [Stark (Figma)](https://www.getstark.co/)
- [NVDA Screen Reader](https://www.nvaccess.org/)

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [WebAIM](https://webaim.org/)

---

*Guidelines Version: 1.0.0 | Last Updated: September 4, 2025*