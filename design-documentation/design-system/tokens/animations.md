---
title: Animation Token Specifications
description: Motion design system extracted from homepage for consistent, purposeful interactions
last-updated: 2025-01-12
version: 2.0.0
related-files: 
  - ./README.md
  - ../style-guide.md
  - ../../assets/design-tokens.json
  - ../../features/homepage-landing/interactions.md
status: approved
---

# Animation Token Specifications

## Overview
The HEUREKKA animation system is extracted directly from the homepage interaction patterns, creating purposeful motion that guides users, provides feedback, and adds subtle delight while maintaining performance and accessibility standards.

## Table of Contents
1. [Motion Philosophy](#motion-philosophy)
2. [Duration Tokens](#duration-tokens)
3. [Easing Functions](#easing-functions)
4. [Homepage Animations](#homepage-animations)
5. [Component Animations](#component-animations)
6. [Performance Guidelines](#performance-guidelines)
7. [Accessibility Considerations](#accessibility-considerations)

## Motion Philosophy (Homepage Authority)

### Design Principles
- **Immediate Feedback**: All interactions respond within 100ms
- **Natural Motion**: Physics-based transitions that feel organic
- **Progressive Enhancement**: Core functionality works without animation
- **Subtle Delight**: Enhance without overwhelming
- **60fps Target**: Optimized for smooth performance

## Duration Tokens (Homepage Extracted)

### Core Duration Scale
```scss
// Homepage-verified durations
--duration-instant: 0ms;       // No animation
--duration-micro:   75ms;      // Micro interactions
--duration-fast:    100ms;     // State changes
--duration-quick:   150ms;     // Hover states
--duration-short:   200ms;     // Quick transitions
--duration-medium:  300ms;     // Standard transitions, search dropdown
--duration-normal:  400ms;     // Card animations
--duration-long:    500ms;     // Complex animations
--duration-slow:    600ms;     // Hero entrance, scroll reveals
--duration-slower:  700ms;     // Page transitions
--duration-loading: 1500ms;    // Skeleton shimmer cycle
```

### Homepage-Specific Durations
```scss
// Hero section stagger delays
--hero-headline-delay: 0ms;
--hero-subheadline-delay: 100ms;
--hero-search-delay: 200ms;
--hero-cta-delay: 300ms;

// Component-specific
--search-dropdown-duration: 300ms;
--card-hover-duration: 200ms;
--button-hover-duration: 150ms;
--focus-transition-duration: 150ms;
--shimmer-duration: 1500ms;
--scroll-reveal-duration: 600ms;
```

## Easing Functions (Homepage Patterns)

### Core Easings
```scss
// Homepage standard easings
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);      // Entrances, expansions
--ease-in: cubic-bezier(0.4, 0, 1, 1);         // Exits
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);   // Transitions, movements
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1); // Default for most animations

// Homepage special easings
--ease-power2-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);  // Hero animations
--ease-power3-out: cubic-bezier(0.215, 0.61, 0.355, 1);   // Search expansion
--ease-back-out: cubic-bezier(0.34, 1.56, 0.64, 1);       // Scale animations
--ease-elastic-out: cubic-bezier(0.68, -0.55, 0.265, 1.55); // Button magnetic effect
```

### Spring Physics
```scss
// Homepage spring animations
--spring-button: cubic-bezier(0.34, 1.56, 0.64, 1);    // Button interactions
--spring-card: cubic-bezier(0.175, 0.885, 0.32, 1.275); // Card hover
--spring-modal: cubic-bezier(0.68, -0.55, 0.265, 1.55); // Modal entrance
```

## Homepage Animations

### Hero Section Animation
```scss
// Fade in up sequence (Homepage pattern)
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Staggered application
.hero-headline {
  animation: fadeInUp 600ms var(--ease-power2-out) 0ms both;
}

.hero-subheadline {
  animation: fadeInUp 600ms var(--ease-power2-out) 100ms both;
}

.search-bar {
  animation: fadeInUp 600ms var(--ease-power2-out) 200ms both;
}

.cta-button {
  animation: fadeInUp 600ms var(--ease-power2-out) 300ms both;
}
```

### Search Bar Interactions
```scss
// Search focus expansion (Mobile fullscreen)
@keyframes searchExpand {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

// Search suggestions dropdown
.search-suggestions {
  animation: slideDown 300ms var(--ease-power3-out);
  transform-origin: top center;
}

// Focus state transition
.search-input:focus {
  transition: all 150ms var(--ease-out);
  border-color: #1D4ED8;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### Button Animations (Homepage Standard)
```scss
// Primary button hover (Homepage pattern)
.btn-primary {
  transition: all 150ms ease-out;
  
  &:hover {
    background: #1D4ED8;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transition-duration: 50ms;
    background: #1E40AF;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }
}

// Magnetic hover effect (CTAs)
.cta-magnetic {
  &:hover {
    animation: magneticPull 300ms var(--ease-elastic-out);
  }
}

@keyframes magneticPull {
  0% { transform: translate(0, 0); }
  50% { transform: translate(var(--mouse-x), var(--mouse-y)); }
  100% { transform: translate(0, -1px); }
}
```

### Quick Search Pills
```scss
// Pill hover animation (Homepage)
.quick-search-pill {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    transition-duration: 50ms;
  }
}

// Ripple effect on click
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple::after {
  animation: ripple 600ms ease-out;
}
```

### Property Card Animations
```scss
// Card hover lift (Homepage pattern)
.property-card {
  transition: all 200ms ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Card 3D tilt on hover
@keyframes cardTilt {
  from {
    transform: perspective(1000px) rotateX(0) rotateY(0);
  }
  to {
    transform: perspective(1000px) 
              rotateX(var(--tilt-x)) 
              rotateY(var(--tilt-y));
  }
}
```

### Loading States (Homepage Patterns)
```scss
// Skeleton shimmer (Homepage standard)
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 25%,
    #E5E7EB 50%,
    #F3F4F6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

// Button loading dots
@keyframes dotPulse {
  0%, 80%, 100% { 
    opacity: 0.4; 
  }
  40% { 
    opacity: 1; 
  }
}

.loading-dot {
  animation: dotPulse 1.4s infinite;
  
  &:nth-child(2) { animation-delay: 200ms; }
  &:nth-child(3) { animation-delay: 400ms; }
  &:nth-child(4) { animation-delay: 600ms; }
}
```

### Scroll-Triggered Animations
```scss
// Fade up on scroll (Homepage sections)
@keyframes scrollFadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Scale in on scroll (Value cards)
@keyframes scrollScaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Slide in from side
@keyframes scrollSlideIn {
  from {
    opacity: 0;
    transform: translateX(var(--direction, 50px));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Trust metrics count up
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Component Animations

### Modal Animations (Property Discovery)
```scss
// Modal entrance (Homepage pattern)
.modal-enter {
  animation: modalFadeIn 300ms var(--ease-out);
  
  .modal-content {
    animation: modalScaleIn 300ms var(--spring-modal);
  }
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### Navigation Animations
```scss
// Sticky header transformation
.header {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  &.scrolled {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
  }
  
  &.hidden {
    transform: translateY(-100%);
  }
}

// Mobile menu slide
.mobile-menu {
  animation: slideInFromRight 300ms var(--ease-power3-out);
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Form Interactions
```scss
// Input focus animation
.form-input {
  transition: all 150ms var(--ease-out);
  
  &:focus {
    border-color: #1D4ED8;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &.error {
    animation: shake 400ms ease-in-out;
    border-color: #EF4444;
  }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60% { transform: translateX(3px); }
}
```

### Favorite Button Animation
```scss
// Heart animation (Property cards)
@keyframes heartBeat {
  0% { transform: scale(1); }
  15% { transform: scale(0); }
  30% { transform: scale(1.3); }
  45% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.favorite-btn {
  &.active {
    .heart-icon {
      animation: heartBeat 500ms var(--ease-elastic-out);
      fill: #EF4444;
    }
  }
}

// Particle burst
@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(1);
  }
}
```

## Performance Guidelines

### GPU Acceleration
```scss
// Homepage performance optimizations
.accelerated {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

// Remove after animation
.animation-complete {
  will-change: auto;
}
```

### Animation Budget (Homepage Standards)
- Hero animations: 600ms total with stagger
- Hover states: 150-200ms max
- Page transitions: 400ms max
- Loading animations: Continuous but GPU-optimized
- Scroll reveals: 600ms with intersection observer

### Performance Targets
- 60fps minimum (16.67ms per frame)
- GPU-accelerated properties only (transform, opacity, filter)
- Maximum 3-5 simultaneous animations
- Debounce scroll animations

## Accessibility Considerations

### Reduced Motion Support (Homepage Implementation)
```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  // Preserve essential animations
  .skeleton,
  .loading-dots {
    animation-duration: 1500ms !important;
  }
}
```

### Focus Management
```scss
// Visible focus for keyboard navigation
:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  transition: outline-offset 150ms ease-out;
}

// No animation for keyboard nav
.keyboard-user * {
  transition: none !important;
}
```

## Usage Guidelines

### Do's (Homepage Patterns)
- ✅ Use 150ms for hover states
- ✅ Apply 600ms for hero entrance with stagger
- ✅ Use `ease-out` for entering elements
- ✅ Apply `translateY(-2px)` for card hover lift
- ✅ Implement 1.5s shimmer for loading states

### Don'ts
- ❌ Create animations longer than 600ms (except loading)
- ❌ Animate width, height, or padding
- ❌ Use linear easing for natural motion
- ❌ Forget reduced motion alternatives
- ❌ Stack more than 5 animations

## Implementation Tokens

```scss
// Animation tokens (Homepage extracted)
--anim-hero-duration: 600ms;
--anim-hero-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--anim-hero-stagger: 100ms;

--anim-hover-duration: 150ms;
--anim-hover-easing: ease-out;
--anim-hover-lift: translateY(-2px);

--anim-button-duration: 150ms;
--anim-button-lift: translateY(-1px);
--anim-button-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);

--anim-card-duration: 200ms;
--anim-card-lift: translateY(-2px);
--anim-card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

--anim-shimmer-duration: 1500ms;
--anim-shimmer-gradient: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
```

## Related Documentation
- [Homepage Interactions](../../features/homepage-landing/interactions.md) - Source patterns
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Button Components](../components/buttons.md) - Button animations
- [Card Components](../components/cards.md) - Card animations

## Last Updated
2025-01-12 - Complete extraction from homepage interaction specifications