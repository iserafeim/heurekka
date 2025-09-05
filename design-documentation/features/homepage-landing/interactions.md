---
title: Homepage/Landing Page - Interaction Patterns
description: Detailed interaction specifications and animations for homepage entry experience
feature: homepage-landing
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Homepage/Landing Page - Interaction Patterns

## Overview
Complete interaction and animation specifications for the homepage/landing page, focusing on immediate engagement, smooth search initiation, and conversion-driving micro-interactions that guide users toward profile creation and property discovery.

## Table of Contents
1. [Hero Section Interactions](#hero-section-interactions)
2. [Search Bar Behaviors](#search-bar-behaviors)
3. [Navigation Patterns](#navigation-patterns)
4. [Content Discovery Animations](#content-discovery-animations)
5. [Call-to-Action Interactions](#call-to-action-interactions)
6. [Property Card Behaviors](#property-card-behaviors)
7. [Mobile Gestures](#mobile-gestures)
8. [Performance Patterns](#performance-patterns)

## Hero Section Interactions

### Initial Load Animation
```javascript
// Progressive reveal on page load
class HeroAnimation {
  async initialize() {
    // Staggered content appearance
    const timeline = gsap.timeline({
      defaults: { 
        duration: 0.6, 
        ease: "power2.out" 
      }
    });
    
    timeline
      .from('.hero-headline', { 
        y: 30, 
        opacity: 0 
      })
      .from('.hero-subheadline', { 
        y: 20, 
        opacity: 0 
      }, '-=0.3')
      .from('.search-container', { 
        scale: 0.95, 
        opacity: 0 
      }, '-=0.2')
      .from('.quick-suggestions', { 
        y: 10, 
        opacity: 0,
        stagger: 0.05 
      }, '-=0.1');
  }
}
```

### Parallax Scrolling
```css
/* Subtle depth on scroll */
.hero-background {
  transform: translateY(calc(var(--scroll-y) * 0.3));
  will-change: transform;
}

.hero-content {
  transform: translateY(calc(var(--scroll-y) * 0.1));
}
```

## Search Bar Behaviors

### Focus Expansion
```javascript
class SearchBar {
  constructor() {
    this.searchInput = document.querySelector('.search-input');
    this.searchContainer = document.querySelector('.search-container');
    this.suggestions = document.querySelector('.search-suggestions');
  }
  
  onFocus() {
    // Expand search container
    this.searchContainer.classList.add('focused');
    
    // Mobile: Full screen takeover
    if (window.innerWidth < 768) {
      this.enableFullScreenSearch();
    }
    
    // Show suggestions with animation
    gsap.to(this.suggestions, {
      height: 'auto',
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
  
  enableFullScreenSearch() {
    document.body.classList.add('search-active');
    
    // Animate to full screen
    gsap.to('.search-overlay', {
      opacity: 1,
      duration: 0.2
    });
    
    gsap.to('.search-container', {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power3.out'
    });
  }
}
```

### Auto-complete Interactions
```javascript
class AutoComplete {
  async onInput(query) {
    // Debounced API call
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      const suggestions = await this.fetchSuggestions(query);
      this.renderSuggestions(suggestions);
    }, 300);
  }
  
  renderSuggestions(suggestions) {
    const items = suggestions.map((item, index) => {
      return `
        <li 
          class="suggestion-item"
          style="animation-delay: ${index * 30}ms"
          role="option"
          aria-selected="false"
        >
          <span class="suggestion-icon">${this.getIcon(item.type)}</span>
          <span class="suggestion-text">${item.text}</span>
          <span class="suggestion-count">${item.count} properties</span>
        </li>
      `;
    });
    
    this.container.innerHTML = items.join('');
  }
}
```

### Quick Search Pills
```css
/* Animated pill interactions */
.quick-search-pill {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.quick-search-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-search-pill:active {
  transform: translateY(0);
  transition-duration: 0.05s;
}

/* Ripple effect on click */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.quick-search-pill::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  animation: ripple 0.6s ease-out;
}
```

## Navigation Patterns

### Sticky Header Behavior
```javascript
class StickyNav {
  constructor() {
    this.header = document.querySelector('.main-header');
    this.heroHeight = document.querySelector('.hero-section').offsetHeight;
    this.lastScroll = 0;
  }
  
  onScroll() {
    const currentScroll = window.scrollY;
    
    // Hide/show based on scroll direction
    if (currentScroll > this.lastScroll && currentScroll > 100) {
      // Scrolling down - hide
      gsap.to(this.header, {
        y: -100,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    } else {
      // Scrolling up - show
      gsap.to(this.header, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    
    // Add background after hero
    if (currentScroll > this.heroHeight - 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
    
    this.lastScroll = currentScroll;
  }
}
```

### Mobile Menu Animation
```javascript
class MobileMenu {
  toggle() {
    const isOpen = this.menu.classList.contains('open');
    
    if (!isOpen) {
      this.open();
    } else {
      this.close();
    }
  }
  
  open() {
    this.menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Staggered menu item animation
    gsap.timeline()
      .to('.menu-overlay', {
        opacity: 1,
        duration: 0.3
      })
      .from('.menu-item', {
        x: -30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out'
      }, '-=0.2');
  }
  
  close() {
    gsap.timeline()
      .to('.menu-item', {
        x: 30,
        opacity: 0,
        duration: 0.2,
        stagger: 0.02
      })
      .to('.menu-overlay', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.menu.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, '-=0.1');
  }
}
```

## Content Discovery Animations

### Scroll-Triggered Reveals
```javascript
class ScrollReveal {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.observer = new IntersectionObserver(
      this.onIntersection.bind(this),
      this.observerOptions
    );
  }
  
  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.dataset.animation;
        
        switch(animation) {
          case 'fade-up':
            gsap.from(element, {
              y: 30,
              opacity: 0,
              duration: 0.6,
              ease: 'power2.out'
            });
            break;
            
          case 'scale-in':
            gsap.from(element, {
              scale: 0.9,
              opacity: 0,
              duration: 0.5,
              ease: 'back.out(1.7)'
            });
            break;
            
          case 'slide-in':
            gsap.from(element, {
              x: element.dataset.direction === 'left' ? -50 : 50,
              opacity: 0,
              duration: 0.7,
              ease: 'power3.out'
            });
            break;
        }
        
        this.observer.unobserve(element);
      }
    });
  }
}
```

### Value Proposition Cards
```css
/* Interactive value prop cards */
.value-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.value-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.value-card:hover .value-icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.value-card:hover .value-arrow {
  transform: translateX(5px);
}
```

## Call-to-Action Interactions

### Primary CTA Button
```javascript
class CTAButton {
  constructor(button) {
    this.button = button;
    this.init();
  }
  
  init() {
    // Magnetic hover effect
    this.button.addEventListener('mousemove', (e) => {
      const rect = this.button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(this.button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    this.button.addEventListener('mouseleave', () => {
      gsap.to(this.button, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.3)'
      });
    });
    
    // Click animation
    this.button.addEventListener('click', (e) => {
      this.createRipple(e);
      this.animateSuccess();
    });
  }
  
  createRipple(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = this.button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    this.button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}
```

### Floating Action Button (Mobile)
```css
/* FAB for mobile quick actions */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab:active {
  transform: scale(0.95);
}

.fab.expanded {
  border-radius: 28px;
  width: auto;
  padding: 16px 24px;
}

/* Sub-actions reveal */
.fab-actions {
  position: absolute;
  bottom: 70px;
  right: 0;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.fab.active .fab-actions {
  opacity: 1;
  pointer-events: auto;
}

.fab-action {
  transform: scale(0) translateY(20px);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transition-delay: calc(var(--index) * 0.05s);
}

.fab.active .fab-action {
  transform: scale(1) translateY(0);
}
```

## Property Card Behaviors

### Card Hover Effects
```javascript
class PropertyCard {
  constructor(card) {
    this.card = card;
    this.image = card.querySelector('.property-image');
    this.overlay = card.querySelector('.property-overlay');
    this.init();
  }
  
  init() {
    // 3D tilt effect on hover
    this.card.addEventListener('mousemove', (e) => {
      const rect = this.card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const tiltX = (y - 0.5) * 10;
      const tiltY = (x - 0.5) * -10;
      
      gsap.to(this.card, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000
      });
      
      // Move overlay gradient
      gsap.to(this.overlay, {
        background: `radial-gradient(
          circle at ${x * 100}% ${y * 100}%,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 70%
        )`,
        duration: 0.3
      });
    });
    
    this.card.addEventListener('mouseleave', () => {
      gsap.to(this.card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }
}
```

### Image Gallery Interaction
```javascript
class PropertyGallery {
  constructor(container) {
    this.container = container;
    this.images = container.querySelectorAll('.gallery-image');
    this.currentIndex = 0;
  }
  
  initSwipe() {
    let startX = 0;
    let currentX = 0;
    let diff = 0;
    
    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    this.container.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      diff = currentX - startX;
      
      // Visual feedback during swipe
      gsap.to(this.images[this.currentIndex], {
        x: diff * 0.3,
        duration: 0
      });
    });
    
    this.container.addEventListener('touchend', () => {
      if (Math.abs(diff) > 50) {
        if (diff > 0 && this.currentIndex > 0) {
          this.slideTo(this.currentIndex - 1);
        } else if (diff < 0 && this.currentIndex < this.images.length - 1) {
          this.slideTo(this.currentIndex + 1);
        }
      } else {
        // Snap back
        gsap.to(this.images[this.currentIndex], {
          x: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }
}
```

### Save/Favorite Animation
```javascript
class FavoriteButton {
  toggle() {
    const heart = this.button.querySelector('.heart-icon');
    const isActive = this.button.classList.contains('active');
    
    if (!isActive) {
      // Add to favorites
      this.button.classList.add('active');
      
      // Heart animation
      gsap.timeline()
        .to(heart, {
          scale: 0,
          duration: 0.15,
          ease: 'power2.in'
        })
        .to(heart, {
          scale: 1.3,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)'
        })
        .to(heart, {
          scale: 1,
          duration: 0.2
        });
      
      // Particle burst
      this.createParticles();
      
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      // Remove from favorites
      this.button.classList.remove('active');
      
      gsap.to(heart, {
        scale: 0.8,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }
  }
  
  createParticles() {
    const particles = 12;
    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('span');
      particle.classList.add('heart-particle');
      
      const angle = (360 / particles) * i;
      const distance = 30 + Math.random() * 20;
      
      particle.style.setProperty('--angle', `${angle}deg`);
      particle.style.setProperty('--distance', `${distance}px`);
      
      this.button.appendChild(particle);
      
      setTimeout(() => particle.remove(), 800);
    }
  }
}
```

## Mobile Gestures

### Pull-to-Refresh
```javascript
class PullToRefresh {
  constructor() {
    this.threshold = 80;
    this.maxPull = 120;
    this.startY = 0;
    this.currentY = 0;
  }
  
  init() {
    let isPulling = false;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        this.startY = e.touches[0].clientY;
        isPulling = true;
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      
      this.currentY = e.touches[0].clientY;
      const diff = Math.min(this.currentY - this.startY, this.maxPull);
      
      if (diff > 0) {
        e.preventDefault();
        
        // Visual feedback
        const progress = diff / this.threshold;
        this.updatePullIndicator(diff, progress);
        
        // Haptic feedback at threshold
        if (diff >= this.threshold && !this.hapticTriggered) {
          if (navigator.vibrate) navigator.vibrate(10);
          this.hapticTriggered = true;
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (this.currentY - this.startY >= this.threshold) {
        this.refresh();
      } else {
        this.reset();
      }
      
      isPulling = false;
      this.hapticTriggered = false;
    });
  }
  
  updatePullIndicator(offset, progress) {
    gsap.to('.pull-indicator', {
      y: offset * 0.5,
      rotation: progress * 360,
      scale: Math.min(progress, 1),
      duration: 0
    });
  }
}
```

### Swipe Navigation
```javascript
class SwipeNav {
  constructor() {
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.threshold = 50;
  }
  
  init() {
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
      this.touchEndX = e.touches[0].clientX;
      
      // Visual hint during swipe
      const diff = this.touchEndX - this.touchStartX;
      if (Math.abs(diff) > 20) {
        this.showSwipeHint(diff);
      }
    });
    
    document.addEventListener('touchend', () => {
      this.handleSwipe();
    });
  }
  
  handleSwipe() {
    const diff = this.touchEndX - this.touchStartX;
    
    if (Math.abs(diff) > this.threshold) {
      if (diff > 0) {
        // Swipe right - go back
        this.navigateBack();
      } else {
        // Swipe left - go forward
        this.navigateForward();
      }
    }
    
    this.hideSwipeHint();
  }
  
  showSwipeHint(offset) {
    const hint = document.querySelector('.swipe-hint');
    gsap.to(hint, {
      x: offset * 0.3,
      opacity: Math.min(Math.abs(offset) / 100, 1),
      duration: 0
    });
  }
}
```

## Performance Patterns

### Lazy Loading with Placeholder
```javascript
class LazyImage {
  constructor(img) {
    this.img = img;
    this.src = img.dataset.src;
    this.placeholder = img.src;
  }
  
  load() {
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Smooth transition from placeholder
      gsap.timeline()
        .to(this.img, {
          filter: 'blur(20px)',
          duration: 0.2
        })
        .set(this.img, {
          src: this.src
        })
        .to(this.img, {
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power2.out'
        });
      
      this.img.classList.add('loaded');
    };
    
    tempImg.src = this.src;
  }
}
```

### Skeleton Loading States
```css
/* Animated skeleton screens */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Content reveal after load */
.content-loaded {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
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

### Optimistic UI Updates
```javascript
class OptimisticUI {
  async saveProperty(propertyId) {
    // Immediate visual feedback
    const button = document.querySelector(`[data-property="${propertyId}"]`);
    button.classList.add('saving');
    
    // Optimistic update
    this.updateUI(propertyId, 'saved');
    
    try {
      // Actual API call
      await api.saveProperty(propertyId);
      
      // Success animation
      gsap.timeline()
        .to(button, {
          scale: 1.1,
          duration: 0.2
        })
        .to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)'
        });
      
    } catch (error) {
      // Revert on error
      this.updateUI(propertyId, 'unsaved');
      this.showError('Could not save property');
    } finally {
      button.classList.remove('saving');
    }
  }
}
```

## Animation Performance Guidelines

### GPU Acceleration
```css
/* Force GPU acceleration for smooth animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Remove after animation completes */
.animation-complete {
  will-change: auto;
}
```

### Request Animation Frame
```javascript
class SmoothScroll {
  constructor() {
    this.rafId = null;
    this.targetY = 0;
    this.currentY = 0;
    this.ease = 0.1;
  }
  
  scrollTo(target) {
    this.targetY = target;
    
    if (!this.rafId) {
      this.animate();
    }
  }
  
  animate() {
    this.currentY += (this.targetY - this.currentY) * this.ease;
    
    if (Math.abs(this.targetY - this.currentY) > 0.5) {
      window.scrollTo(0, this.currentY);
      this.rafId = requestAnimationFrame(() => this.animate());
    } else {
      window.scrollTo(0, this.targetY);
      this.rafId = null;
    }
  }
}
```

## Accessibility in Animations

### Respecting Motion Preferences
```javascript
class MotionSafe {
  constructor() {
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }
  
  animate(element, options) {
    if (this.prefersReducedMotion) {
      // Instant transitions for reduced motion
      gsap.set(element, options);
    } else {
      // Full animation for others
      gsap.to(element, {
        ...options,
        duration: options.duration || 0.3
      });
    }
  }
}
```

### Focus Management
```javascript
class FocusManager {
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
    
    // Set initial focus
    firstElement.focus();
  }
}
```

## Testing Checklist

### Interaction Testing
- [ ] All hover states work correctly on desktop
- [ ] Touch interactions feel natural on mobile
- [ ] Animations run at 60fps consistently
- [ ] No layout shifts during interactions
- [ ] Loading states appear within 100ms
- [ ] Feedback is immediate for all user actions

### Performance Testing
- [ ] Time to Interactive < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Animation frame rate stays above 60fps
- [ ] No memory leaks from event listeners
- [ ] Lazy loading works for all images
- [ ] Code splitting implemented for large components

### Accessibility Testing
- [ ] All interactions keyboard accessible
- [ ] Focus indicators clearly visible
- [ ] Screen reader announces state changes
- [ ] Reduced motion preference respected
- [ ] Touch targets minimum 44x44px
- [ ] Color contrast meets WCAG AA standards

## Related Documentation
- [User Journey](./user-journey.md) - Complete user flow analysis
- [Screen States](./screen-states.md) - Visual specifications for all states
- [Accessibility](./accessibility.md) - Detailed accessibility requirements
- [Implementation](./implementation.md) - Developer technical guide
- [Animation Tokens](../../design-system/tokens/animations.md) - System-wide animation values