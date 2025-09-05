---
title: Search Profile Creation - Interaction Patterns
description: Detailed interaction specifications and animations for search profile creation
feature: search-profile-creation
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Search Profile Creation - Interaction Patterns

## Overview
Complete interaction and animation specifications for the search profile creation feature, including gesture controls, keyboard navigation, and motion design.

## Table of Contents
1. [Core Interactions](#core-interactions)
2. [Form Interactions](#form-interactions)
3. [Map Interactions](#map-interactions)
4. [Animation Choreography](#animation-choreography)
5. [Gesture Controls](#gesture-controls)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Feedback Patterns](#feedback-patterns)

## Core Interactions

### Button Interactions

#### Primary Button
```javascript
// Hover State
on:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}

// Active State
on:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  transition: transform 0.1s ease;
}

// Focus State
on:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

// Loading State
on:loading {
  pointer-events: none;
  opacity: 0.7;
  // Spinner animation
  animation: spin 1s linear infinite;
}

// Disabled State
when:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Secondary Button
```javascript
// Hover State
on:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366F1;
  transition: all 0.2s ease;
}

// Active State
on:active {
  background: rgba(99, 102, 241, 0.15);
  transition: background 0.1s ease;
}
```

### Card Interactions

#### Profile Card
```javascript
// Hover State
on:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Click Animation
on:click {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

// Expand/Collapse
on:toggle {
  height: auto; // Calculated height
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
```

## Form Interactions

### Input Field Behaviors

#### Text Input
```javascript
// Focus Behavior
on:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transition: all 0.2s ease;
  
  // Label animation
  label {
    transform: translateY(-24px) scale(0.85);
    color: #6366F1;
    transition: all 0.2s ease;
  }
}

// Input Validation
on:input {
  // Real-time validation
  if (value.length > 0) {
    validateField();
  }
  
  // Character counter update
  updateCounter();
  
  // Auto-save after 1s delay
  debounce(autoSave, 1000);
}

// Error State
on:error {
  border-color: #DC2626;
  background: #FEF2F2;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

// Success State
on:success {
  border-color: #10B981;
  // Checkmark animation
  &::after {
    animation: checkmark 0.3s ease;
  }
}
```

#### Select Dropdown
```javascript
// Open Animation
on:open {
  .dropdown-menu {
    opacity: 0;
    transform: translateY(-10px);
    animation: slideDown 0.2s ease forwards;
  }
}

@keyframes slideDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Option Hover
.option:hover {
  background: #F3F4F6;
  padding-left: 20px;
  transition: all 0.15s ease;
}

// Selection Animation
on:select {
  animation: flash 0.3s ease;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(99, 102, 241, 0.1) 50%, 
    transparent 100%);
}
```

### Range Slider Interactions

```javascript
// Thumb Drag
.slider-thumb {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
    transform: scale(1.2);
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.1);
    transition: all 0.1s ease;
  }
}

// Value Update
on:input {
  // Update fill percentage
  .slider-fill {
    width: percentage;
    transition: width 0.1s linear;
  }
  
  // Update value label
  .value-label {
    transform: translateX(position);
    opacity: 1;
  }
}

// Range Selection (Min-Max)
.range-selection {
  background: rgba(99, 102, 241, 0.2);
  transition: all 0.15s ease;
}
```

### Toggle Switch Interactions

```javascript
// Toggle Animation
on:change {
  .toggle-thumb {
    transform: translateX(checked ? 24px : 0);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .toggle-track {
    background: checked ? #6366F1 : #E5E7EB;
    transition: background 0.2s ease;
  }
}

// Hover State
on:hover {
  .toggle-thumb {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
```

## Map Interactions

### Map Controls

#### Pan and Zoom
```javascript
// Pan Gesture
on:pan {
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  // Smooth momentum scrolling
  transition: transform 0.1s linear;
  will-change: transform;
}

// Zoom Controls
.zoom-button {
  on:click {
    // Animated zoom
    map.animateZoom({
      duration: 300,
      easing: 'ease-in-out'
    });
  }
}

// Pinch Zoom (Touch)
on:pinch {
  transform-origin: gesture.center;
  transform: scale(gesture.scale);
  transition: none; // Immediate response
}
```

#### Area Selection

```javascript
// Drawing Mode
.draw-tool {
  on:activate {
    cursor: crosshair;
    map.overlay.opacity = 0.3;
  }
  
  on:drawstart {
    // Show measurement tooltip
    .measurement-tooltip {
      opacity: 1;
      transform: translate(mouse.x, mouse.y);
    }
  }
  
  on:drawing {
    // Update area in real-time
    updatePolygon(points);
    updateAreaMeasurement();
  }
  
  on:drawend {
    // Confirm animation
    .selected-area {
      animation: pulseGlow 0.5s ease;
    }
  }
}

@keyframes pulseGlow {
  0% { opacity: 0.3; }
  50% { opacity: 0.5; }
  100% { opacity: 0.3; }
}
```

#### Location Pins

```javascript
// Pin Drop Animation
.location-pin {
  animation: dropBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes dropBounce {
  0% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
  60% {
    transform: translateY(10px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

// Pin Hover
.location-pin:hover {
  transform: translateY(-4px) scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: all 0.2s ease;
  
  // Show details tooltip
  .pin-tooltip {
    opacity: 1;
    transform: translateY(-8px);
    transition: all 0.2s ease;
  }
}
```

## Animation Choreography

### Page Load Sequence

```javascript
// Staggered entry animation
.page-content {
  // Header
  .header {
    animation: fadeSlideIn 0.4s ease;
  }
  
  // Form sections
  .form-section {
    opacity: 0;
    animation: fadeSlideIn 0.4s ease forwards;
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
  
  // Side elements
  .sidebar {
    animation: slideInRight 0.5s ease 0.4s forwards;
  }
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Step Transitions

```javascript
// Forward Navigation
.step-transition-forward {
  .current-step {
    animation: slideOutLeft 0.3s ease forwards;
  }
  
  .next-step {
    animation: slideInRight 0.3s ease forwards;
  }
}

// Backward Navigation
.step-transition-backward {
  .current-step {
    animation: slideOutRight 0.3s ease forwards;
  }
  
  .previous-step {
    animation: slideInLeft 0.3s ease forwards;
  }
}

// Progress Bar Update
.progress-bar {
  .progress-fill {
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .progress-step {
    &.completed {
      animation: checkmarkPop 0.3s ease;
    }
  }
}

@keyframes checkmarkPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

## Gesture Controls

### Touch Gestures

#### Swipe Navigation
```javascript
// Swipe between steps
on:swipeleft {
  if (canNavigateForward) {
    navigateToNextStep();
    animateTransition('forward');
  } else {
    // Rubber band effect
    elasticBounce('right');
  }
}

on:swiperight {
  if (canNavigateBackward) {
    navigateToPreviousStep();
    animateTransition('backward');
  } else {
    elasticBounce('left');
  }
}

// Elastic bounce feedback
function elasticBounce(direction) {
  anime({
    targets: '.form-container',
    translateX: direction === 'right' ? -20 : 20,
    duration: 200,
    easing: 'easeOutElastic(1, 0.5)',
    complete: () => {
      anime({
        targets: '.form-container',
        translateX: 0,
        duration: 200,
        easing: 'easeOutQuad'
      });
    }
  });
}
```

#### Pull to Refresh
```javascript
on:pulldown {
  if (scrollTop === 0) {
    .pull-indicator {
      transform: translateY(pullDistance);
      opacity: pullDistance / 100;
    }
    
    if (pullDistance > 80) {
      triggerRefresh();
      .pull-indicator {
        animation: spin 1s linear infinite;
      }
    }
  }
}
```

### Long Press Actions
```javascript
.profile-card {
  on:longpress {
    // Haptic feedback
    navigator.vibrate(50);
    
    // Show context menu
    .context-menu {
      opacity: 0;
      transform: scale(0.8);
      animation: popIn 0.2s ease forwards;
    }
  }
}

@keyframes popIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## Keyboard Navigation

### Tab Navigation Order
```javascript
// Define tab sequence
tabOrder: [
  'header-nav',
  'main-heading',
  'form-field-1',
  'form-field-2',
  'help-button',
  'advanced-toggle',
  'submit-button',
  'cancel-button'
]

// Focus trap in modals
.modal {
  on:keydown {
    if (key === 'Tab') {
      if (shiftKey && activeElement === firstFocusable) {
        lastFocusable.focus();
        preventDefault();
      } else if (!shiftKey && activeElement === lastFocusable) {
        firstFocusable.focus();
        preventDefault();
      }
    }
  }
}
```

### Keyboard Shortcuts
```javascript
// Global shortcuts
document.on:keydown {
  // Save profile
  if (cmd/ctrl + S) {
    saveProfile();
    showToast('Profile saved');
  }
  
  // Navigate steps
  if (cmd/ctrl + ArrowRight) {
    navigateForward();
  }
  
  if (cmd/ctrl + ArrowLeft) {
    navigateBackward();
  }
  
  // Open search
  if (cmd/ctrl + K) {
    openQuickSearch();
  }
  
  // Close modal
  if (Escape) {
    closeActiveModal();
  }
}

// Form field shortcuts
.form-field {
  on:keydown {
    // Increment/decrement numeric inputs
    if (type === 'number') {
      if (ArrowUp) value++;
      if (ArrowDown) value--;
    }
    
    // Date picker navigation
    if (type === 'date') {
      if (ArrowUp) previousWeek();
      if (ArrowDown) nextWeek();
      if (ArrowLeft) previousDay();
      if (ArrowRight) nextDay();
    }
  }
}
```

## Feedback Patterns

### Loading States

#### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F3F4F6 0%,
    #E5E7EB 50%,
    #F3F4F6 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Progress Indicators
```javascript
// Linear progress
.progress-linear {
  .progress-track {
    overflow: hidden;
  }
  
  .progress-bar {
    width: percentage;
    transition: width 0.3s ease;
    
    // Indeterminate state
    &.indeterminate {
      width: 30%;
      animation: indeterminate 1.5s ease infinite;
    }
  }
}

@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

// Circular progress
.progress-circular {
  svg circle {
    stroke-dasharray: circumference;
    stroke-dashoffset: circumference * (1 - progress);
    transition: stroke-dashoffset 0.3s ease;
    transform: rotate(-90deg);
    transform-origin: center;
  }
}
```

### Success Feedback

```javascript
// Success animation sequence
on:success {
  // Step 1: Pulse
  .success-container {
    animation: successPulse 0.3s ease;
  }
  
  // Step 2: Checkmark draw
  .checkmark-path {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCheckmark 0.4s ease 0.3s forwards;
  }
  
  // Step 3: Confetti (optional)
  if (majorSuccess) {
    triggerConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

@keyframes successPulse {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes drawCheckmark {
  to { stroke-dashoffset: 0; }
}
```

### Error Feedback

```javascript
// Error notification
.error-toast {
  animation: slideInTop 0.3s ease;
  
  // Auto-dismiss after 5s
  animation: slideOutTop 0.3s ease 5s forwards;
}

// Field error shake
.field-error {
  animation: errorShake 0.4s ease;
  border-color: #DC2626;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
```

## Performance Considerations

### Animation Performance
```javascript
// Use CSS transforms for animations
.animated-element {
  will-change: transform, opacity; // Hint for optimization
  transform: translateZ(0); // Force hardware acceleration
}

// Reduce motion for accessibility
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Debounce expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
```

## Related Documentation
- [Screen States](./screen-states.md)
- [Animation System](../../design-system/tokens/animations.md)
- [Accessibility Guidelines](./accessibility.md)
- [Implementation Guide](./implementation.md)