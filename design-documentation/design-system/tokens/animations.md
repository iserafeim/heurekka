---
title: Animation Token Specifications
description: Motion design system and animation tokens for fluid, purposeful interactions
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ../style-guide.md
  - ../../assets/design-tokens.json
status: approved
---

# Animation Token Specifications

## Overview
The Heurekka animation system creates purposeful motion that guides users, provides feedback, and adds personality to interactions while maintaining performance and accessibility standards.

## Table of Contents
1. [Motion Philosophy](#motion-philosophy)
2. [Duration Tokens](#duration-tokens)
3. [Easing Functions](#easing-functions)
4. [Animation Properties](#animation-properties)
5. [Predefined Animations](#predefined-animations)
6. [Interaction Patterns](#interaction-patterns)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility Considerations](#accessibility-considerations)

## Motion Philosophy

### Design Principles
- **Purposeful**: Every animation serves a functional purpose
- **Natural**: Motion feels organic and physics-based
- **Responsive**: Immediate feedback to user actions
- **Subtle**: Enhances without distracting
- **Performant**: Optimized for 60fps consistently

### Motion Goals
- Guide user attention to important changes
- Provide clear feedback for interactions
- Create smooth transitions between states
- Establish spatial relationships
- Add delight without overwhelming

## Duration Tokens

### Duration Scale
```scss
// Base durations
--duration-instant: 0ms;      // No animation
--duration-micro:   100ms;    // Micro-interactions
--duration-fast:    150ms;    // Quick feedback
--duration-short:   200ms;    // Standard transitions
--duration-medium:  300ms;    // Complex transitions
--duration-long:    400ms;    // Page transitions
--duration-slow:    600ms;    // Elaborate animations
--duration-slower:  800ms;    // Major transitions
--duration-slowest: 1000ms;   // Loading sequences
```

### Contextual Durations
```scss
// Interaction-specific durations
--duration-hover:       var(--duration-fast);     // 150ms
--duration-press:       var(--duration-micro);    // 100ms
--duration-focus:       var(--duration-fast);     // 150ms
--duration-transition:  var(--duration-short);    // 200ms
--duration-expand:      var(--duration-medium);   // 300ms
--duration-collapse:    var(--duration-short);    // 200ms
--duration-fade:        var(--duration-short);    // 200ms
--duration-slide:       var(--duration-medium);   // 300ms
--duration-modal:       var(--duration-medium);   // 300ms
--duration-page:        var(--duration-long);     // 400ms
--duration-loading:     var(--duration-slower);   // 800ms
```

### Stagger Delays
```scss
// For sequential animations
--stagger-fast:   25ms;
--stagger-base:   50ms;
--stagger-slow:   100ms;
--stagger-slower: 150ms;
```

## Easing Functions

### Standard Easings
```scss
// Core easing curves
--ease-linear:      cubic-bezier(0, 0, 1, 1);
--ease-in:          cubic-bezier(0.4, 0, 1, 1);
--ease-out:         cubic-bezier(0, 0, 0.2, 1);      // Default
--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);

// Expressive easings
--ease-in-quad:     cubic-bezier(0.55, 0.085, 0.68, 0.53);
--ease-out-quad:    cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);

// Material Design easings
--ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);    // MD standard
--ease-decelerate:  cubic-bezier(0, 0, 0.2, 1);      // MD decelerate
--ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);      // MD accelerate
--ease-sharp:       cubic-bezier(0.4, 0, 0.6, 1);    // MD sharp
```

### Spring Easings
```scss
// Spring physics (CSS Spring syntax)
--ease-spring-1: cubic-bezier(0.175, 0.885, 0.32, 1.275);  // Soft bounce
--ease-spring-2: cubic-bezier(0.68, -0.55, 0.265, 1.55);   // Medium bounce
--ease-spring-3: cubic-bezier(0.87, -0.41, 0.19, 1.44);    // Strong bounce
--ease-spring-4: cubic-bezier(0.895, 0.03, 0.685, 1.22);   // Subtle bounce
--ease-spring-5: cubic-bezier(1, -0.56, 0, 1.56);          // Extreme bounce
```

### Contextual Easings
```scss
// Purpose-specific easings
--ease-entrance:    var(--ease-out);          // Elements entering
--ease-exit:        var(--ease-in);           // Elements leaving
--ease-movement:    var(--ease-in-out);       // Position changes
--ease-transform:   var(--ease-standard);     // Scale/rotate
--ease-fade:        var(--ease-linear);       // Opacity changes
--ease-bounce:      var(--ease-spring-1);     // Playful feedback
--ease-overshoot:   var(--ease-spring-4);     // Emphasis
```

## Animation Properties

### Transformable Properties
```scss
// Properties safe to animate (GPU-accelerated)
--animate-transform: transform;
--animate-opacity: opacity;
--animate-filter: filter;

// Composite animations
--animate-all-safe: transform, opacity, filter;
--animate-movement: transform;
--animate-visibility: opacity, transform;
```

### Transform Origins
```scss
--origin-center:       center center;
--origin-top:          center top;
--origin-top-left:     left top;
--origin-top-right:    right top;
--origin-right:        right center;
--origin-bottom-right: right bottom;
--origin-bottom:       center bottom;
--origin-bottom-left:  left bottom;
--origin-left:         left center;
```

### Animation Fill Modes
```scss
--fill-none:      none;
--fill-forwards:  forwards;
--fill-backwards: backwards;
--fill-both:      both;       // Default for most animations
```

### Animation Play States
```scss
--play-running: running;
--play-paused:  paused;
```

## Predefined Animations

### Fade Animations
```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Scale Animations
```scss
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}
```

### Slide Animations
```scss
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
```

### Rotation Animations
```scss
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes swing {
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

@keyframes flip {
  from { transform: rotateY(0); }
  to { transform: rotateY(360deg); }
}
```

### Loading Animations
```scss
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

@keyframes dots {
  0%, 80%, 100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

@keyframes progress {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}
```

### Attention Animations
```scss
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}
```

## Interaction Patterns

### Hover Effects
```scss
.hover-lift {
  transition: transform var(--duration-hover) var(--ease-out);
  
  &:hover {
    transform: translateY(-2px);
  }
}

.hover-scale {
  transition: transform var(--duration-hover) var(--ease-out);
  
  &:hover {
    transform: scale(1.05);
  }
}

.hover-glow {
  transition: box-shadow var(--duration-hover) var(--ease-out);
  
  &:hover {
    box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.3);
  }
}
```

### Button Interactions
```scss
.button {
  transition: all var(--duration-fast) var(--ease-out);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transition-duration: var(--duration-micro);
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
}
```

### Modal Animations
```scss
.modal {
  &.modal-enter {
    animation: fadeIn var(--duration-modal) var(--ease-out);
    
    .modal-content {
      animation: scaleIn var(--duration-modal) var(--ease-spring-4);
    }
  }
  
  &.modal-exit {
    animation: fadeOut var(--duration-short) var(--ease-in);
    
    .modal-content {
      animation: scaleOut var(--duration-short) var(--ease-in);
    }
  }
}
```

### Page Transitions
```scss
.page-transition-fade {
  &-enter {
    animation: fadeIn var(--duration-page) var(--ease-out);
  }
  
  &-exit {
    animation: fadeOut var(--duration-page) var(--ease-in);
  }
}

.page-transition-slide {
  &-enter {
    animation: slideInRight var(--duration-page) var(--ease-standard);
  }
  
  &-exit {
    animation: slideOutLeft var(--duration-page) var(--ease-standard);
  }
}
```

### Staggered Animations
```scss
.stagger-children {
  > * {
    animation: fadeInUp var(--duration-medium) var(--ease-out) both;
    
    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: calc(#{$i} * var(--stagger-base));
      }
    }
  }
}
```

## Performance Guidelines

### Optimization Strategies

#### GPU Acceleration
```scss
// Force GPU acceleration
.accelerated {
  transform: translateZ(0);
  will-change: transform;
}

// Remove after animation
.animated {
  will-change: auto;
}
```

#### Reduce Paint Operations
```scss
// Avoid animating these properties
.bad-performance {
  // ❌ Triggers layout
  transition: width, height, padding, margin;
  
  // ❌ Triggers paint
  transition: background-color, color, box-shadow;
}

// Prefer these properties
.good-performance {
  // ✅ GPU-accelerated
  transition: transform, opacity, filter;
}
```

#### Animation Budgets
- Maximum simultaneous animations: 3-5
- Target frame rate: 60fps (16.67ms per frame)
- Animation budget: 10ms per frame (leaving 6ms for other operations)

### Performance Metrics
```scss
// Animation performance classes
.perf-critical {
  // Disable non-essential animations
  animation: none !important;
  transition: none !important;
}

.perf-reduced {
  // Simplify animations
  transition-duration: var(--duration-micro) !important;
}

.perf-normal {
  // Full animations
  // Default behavior
}
```

## Accessibility Considerations

### Reduced Motion Support
```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  // Preserve essential animations
  .spinner,
  .progress-indicator {
    animation-duration: var(--duration-slow) !important;
  }
}
```

### Motion Sensitivity Levels
```scss
// User preference settings
[data-motion="none"] * {
  animation: none !important;
  transition: none !important;
}

[data-motion="reduced"] * {
  animation-duration: calc(var(--duration) * 0.25);
  transition-duration: calc(var(--duration) * 0.25);
}

[data-motion="full"] * {
  // Default animations
}
```

### Focus Animations
```scss
// Subtle focus indicators with animation
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  transition: outline-offset var(--duration-fast) var(--ease-out);
}

// Skip animations for keyboard navigation
.keyboard-nav * {
  transition-duration: 0ms !important;
}
```

## Usage Guidelines

### Best Practices
- ✅ Keep animations under 400ms for responsiveness
- ✅ Use ease-out for entering elements
- ✅ Use ease-in for exiting elements
- ✅ Test with reduced motion preferences
- ✅ Optimize for 60fps performance

### Common Mistakes
- ❌ Animating too many properties simultaneously
- ❌ Using linear easing for natural motion
- ❌ Creating animations longer than 1 second
- ❌ Forgetting to test reduced motion
- ❌ Animating layout properties

### Animation Checklist
- [ ] Purpose defined for each animation
- [ ] Duration appropriate for context
- [ ] Easing function matches motion type
- [ ] Performance tested at 60fps
- [ ] Reduced motion alternative provided
- [ ] GPU acceleration utilized
- [ ] Will-change property managed
- [ ] Stagger timing feels natural
- [ ] Animation doesn't cause layout shifts
- [ ] Focus states properly animated

## Related Documentation
- [Design Tokens Overview](./README.md) - Token system architecture
- [Style Guide](../style-guide.md) - Complete visual guidelines
- [Accessibility Guidelines](../../accessibility/guidelines.md) - Motion accessibility
- [Component Specifications](../components/README.md) - Component animations

## Implementation Notes
Animations should enhance the user experience without causing distraction or performance issues. Always provide alternatives for users who prefer reduced motion. Test animations across devices to ensure consistent 60fps performance.

## Last Updated
2025-01-04 - Complete animation token specification