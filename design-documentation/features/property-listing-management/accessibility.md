---
title: Property Listing Management - Accessibility
description: Comprehensive accessibility specifications and WCAG compliance for property listing management
feature: property-listing-management
last-updated: 2025-01-05
version: 1.0.0
related-files:
  - ./README.md
  - ./screen-states.md
  - ./interactions.md
  - ./implementation.md
  - ../../accessibility/guidelines.md
dependencies:
  - WCAG 2.1 Level AA compliance
  - ARIA 1.2 specifications
  - Platform accessibility APIs
status: approved
---

# Property Listing Management - Accessibility

## Overview

This document provides comprehensive accessibility specifications for the property listing management feature, ensuring WCAG 2.1 Level AA compliance and optimal user experience for all users, including those using assistive technologies.

## Table of Contents

1. [WCAG Compliance Requirements](#wcag-compliance-requirements)
2. [Keyboard Navigation](#keyboard-navigation)
3. [Screen Reader Support](#screen-reader-support)
4. [Focus Management](#focus-management)
5. [Form Accessibility](#form-accessibility)
6. [Photo Upload Accessibility](#photo-upload-accessibility)
7. [Error Handling](#error-handling)
8. [Mobile Accessibility](#mobile-accessibility)
9. [Testing Procedures](#testing-procedures)
10. [Implementation Checklist](#implementation-checklist)

## WCAG Compliance Requirements

### Level AA Standards

```css
/* Color Contrast Requirements */
.text-normal {
  color: #1a1a1a; /* 12.6:1 contrast ratio on white */
  background: #ffffff;
}

.text-secondary {
  color: #666666; /* 5.7:1 contrast ratio on white */
  background: #ffffff;
}

.text-disabled {
  color: #999999; /* 2.8:1 contrast ratio - decorative only */
  background: #ffffff;
}

/* Focus Indicators */
*:focus-visible {
  outline: 3px solid #2E90FA;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Touch Targets */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Text Sizing */
html {
  font-size: 100%; /* Respects user preferences */
}

body {
  font-size: 1rem; /* Minimum 16px at default zoom */
  line-height: 1.5; /* Adequate spacing */
}
```

### Perceivable Content

```html
<!-- Image Alternative Text -->
<div class="property-photo">
  <img 
    src="photo.jpg" 
    alt="Living room with hardwood floors, large windows facing south, modern furniture"
    loading="lazy"
  />
</div>

<!-- Video Captions -->
<video controls aria-label="Property video tour">
  <source src="tour.mp4" type="video/mp4">
  <track 
    kind="captions" 
    src="captions.vtt" 
    srclang="es" 
    label="Español"
  >
  <track 
    kind="descriptions" 
    src="descriptions.vtt" 
    srclang="es" 
    label="Audio descriptions"
  >
</video>

<!-- Form Labels -->
<div class="form-field">
  <label for="monthly-rent" class="required">
    Monthly Rent
    <span class="sr-only">(required)</span>
  </label>
  <div class="input-group">
    <span class="currency-symbol" aria-hidden="true">$</span>
    <input 
      type="number" 
      id="monthly-rent" 
      name="monthlyRent"
      aria-describedby="rent-help"
      aria-invalid="false"
      required
    />
  </div>
  <span id="rent-help" class="field-help">
    Enter the monthly rent amount in pesos
  </span>
</div>
```

### Operable Interface

```javascript
// Keyboard Navigation Map
const keyboardShortcuts = {
  'Tab': 'Move to next interactive element',
  'Shift+Tab': 'Move to previous interactive element',
  'Enter': 'Activate button or submit form',
  'Space': 'Toggle checkbox or activate button',
  'Arrow Keys': 'Navigate within photo gallery or dropdown',
  'Escape': 'Close modal or cancel operation',
  'Alt+S': 'Save draft',
  'Alt+P': 'Preview listing',
  'Alt+N': 'Next wizard step',
  'Alt+B': 'Previous wizard step'
};

// Timeout Warnings
class SessionTimeout {
  constructor() {
    this.warningTime = 2 * 60 * 1000; // 2 minutes before timeout
    this.timeoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  startTimer() {
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.timeoutDuration - this.warningTime);
  }

  showWarning() {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-labelledby', 'timeout-title');
    dialog.setAttribute('aria-describedby', 'timeout-message');
    
    dialog.innerHTML = `
      <h2 id="timeout-title">Session Timeout Warning</h2>
      <p id="timeout-message">
        Your session will expire in 2 minutes. 
        Would you like to extend your session?
      </p>
      <button onclick="extendSession()">Extend Session</button>
      <button onclick="logout()">Log Out</button>
    `;
    
    // Announce to screen readers
    this.announce('Session timeout warning. 2 minutes remaining.');
  }

  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}
```

## Keyboard Navigation

### Wizard Navigation

```javascript
// Step Navigation
class WizardKeyboardNavigation {
  constructor(wizard) {
    this.wizard = wizard;
    this.currentStep = 0;
    this.totalSteps = 5;
    this.bindKeyboardEvents();
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Alt + N: Next step
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        this.navigateNext();
      }
      
      // Alt + B: Back/Previous step
      if (e.altKey && e.key === 'b') {
        e.preventDefault();
        this.navigateBack();
      }
      
      // Ctrl/Cmd + S: Save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveDraft();
      }
    });
  }

  navigateNext() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      this.updateStepDisplay();
      this.focusFirstField();
      this.announceStepChange();
    }
  }

  navigateBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepDisplay();
      this.focusFirstField();
      this.announceStepChange();
    }
  }

  focusFirstField() {
    const firstField = this.wizard.querySelector(
      `#step-${this.currentStep} [tabindex]:not([tabindex="-1"]), 
       #step-${this.currentStep} input:not([disabled]), 
       #step-${this.currentStep} select:not([disabled]), 
       #step-${this.currentStep} textarea:not([disabled]), 
       #step-${this.currentStep} button:not([disabled])`
    );
    
    if (firstField) {
      firstField.focus();
    }
  }

  announceStepChange() {
    const stepName = this.getStepName(this.currentStep);
    this.announce(`Step ${this.currentStep + 1} of ${this.totalSteps}: ${stepName}`);
  }
}
```

### Photo Gallery Navigation

```javascript
// Accessible Photo Gallery
class AccessiblePhotoGallery {
  constructor(container) {
    this.container = container;
    this.photos = [];
    this.currentIndex = 0;
    this.setupKeyboardNav();
  }

  setupKeyboardNav() {
    this.container.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
          e.preventDefault();
          this.navigateNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.navigatePrevious();
          break;
        case 'Home':
          e.preventDefault();
          this.navigateFirst();
          break;
        case 'End':
          e.preventDefault();
          this.navigateLast();
          break;
        case 'Delete':
          if (confirm('Delete this photo?')) {
            this.deleteCurrentPhoto();
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.openPhotoEditor();
          break;
      }
    });
  }

  navigateNext() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
      this.updateFocus();
      this.announcePhoto();
    }
  }

  announcePhoto() {
    const photo = this.photos[this.currentIndex];
    const message = `Photo ${this.currentIndex + 1} of ${this.photos.length}. ${photo.alt || 'No description available'}`;
    this.announce(message);
  }
}
```

## Screen Reader Support

### ARIA Landmarks

```html
<!-- Page Structure -->
<div class="listing-wizard">
  <header role="banner">
    <nav aria-label="Wizard steps">
      <ol class="wizard-steps">
        <li aria-current="step">
          <span class="sr-only">Current step:</span>
          Property Details
        </li>
        <li>Location</li>
        <li>Amenities</li>
        <li>Photos</li>
        <li>Review</li>
      </ol>
    </nav>
  </header>

  <main role="main" aria-labelledby="page-title">
    <h1 id="page-title">Create New Property Listing</h1>
    
    <form role="form" aria-label="Property listing form">
      <!-- Form content -->
    </form>
  </main>

  <aside role="complementary" aria-label="Listing help">
    <h2>Tips for Creating a Great Listing</h2>
    <!-- Help content -->
  </aside>
</div>
```

### Live Regions

```html
<!-- Status Updates -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
  id="form-status"
>
  <!-- Dynamically updated status messages -->
</div>

<!-- Error Announcements -->
<div 
  role="alert" 
  aria-live="assertive" 
  aria-atomic="true"
  id="error-announcement"
>
  <!-- Critical error messages -->
</div>

<!-- Progress Updates -->
<div 
  role="progressbar"
  aria-valuenow="2"
  aria-valuemin="1"
  aria-valuemax="5"
  aria-label="Listing creation progress"
>
  Step 2 of 5
</div>
```

### Form Field Descriptions

```html
<!-- Complex Form Field -->
<fieldset>
  <legend>Property Type</legend>
  
  <div class="radio-group" role="radiogroup" aria-required="true">
    <label class="radio-option">
      <input 
        type="radio" 
        name="propertyType" 
        value="apartment"
        aria-describedby="apartment-desc"
      />
      <span>Apartment</span>
    </label>
    <span id="apartment-desc" class="sr-only">
      Individual unit in a multi-unit building
    </span>

    <label class="radio-option">
      <input 
        type="radio" 
        name="propertyType" 
        value="house"
        aria-describedby="house-desc"
      />
      <span>House</span>
    </label>
    <span id="house-desc" class="sr-only">
      Standalone residential building
    </span>
  </div>
</fieldset>

<!-- Multi-select with Instructions -->
<div class="form-field">
  <label for="amenities">
    Select Amenities
    <span class="sr-only">Use arrow keys to navigate, space to select</span>
  </label>
  <select 
    id="amenities" 
    multiple 
    size="10"
    aria-describedby="amenities-help"
    aria-required="false"
  >
    <optgroup label="Essential">
      <option value="wifi">WiFi</option>
      <option value="parking">Parking</option>
      <option value="laundry">Laundry</option>
    </optgroup>
    <optgroup label="Comfort">
      <option value="ac">Air Conditioning</option>
      <option value="heating">Heating</option>
    </optgroup>
  </select>
  <span id="amenities-help" class="field-help">
    Select all amenities available in your property. Hold Ctrl/Cmd to select multiple.
  </span>
</div>
```

## Focus Management

### Focus Trap Implementation

```javascript
// Modal Focus Trap
class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    this.activate();
  }

  getFocusableElements() {
    return this.element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  activate() {
    // Store previous focus
    this.previouslyFocused = document.activeElement;
    
    // Set initial focus
    this.firstFocusable.focus();
    
    // Bind tab trap
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable.focus();
        }
      }
    }
    
    if (e.key === 'Escape') {
      this.deactivate();
    }
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown);
    this.previouslyFocused.focus();
  }
}
```

### Focus Restoration

```javascript
// Focus Management During Async Operations
class FocusManager {
  constructor() {
    this.focusHistory = [];
  }

  saveFocus() {
    this.focusHistory.push(document.activeElement);
  }

  restoreFocus() {
    const element = this.focusHistory.pop();
    if (element && element.focus) {
      element.focus();
    }
  }

  manageDuringAsync(asyncOperation) {
    this.saveFocus();
    
    return asyncOperation()
      .then(result => {
        this.restoreFocus();
        return result;
      })
      .catch(error => {
        this.restoreFocus();
        throw error;
      });
  }
}

// Usage in photo upload
async function uploadPhoto(file) {
  const focusManager = new FocusManager();
  
  return focusManager.manageDuringAsync(async () => {
    // Show loading state
    showLoadingIndicator();
    
    try {
      const result = await uploadToServer(file);
      announceSuccess(`Photo uploaded successfully`);
      return result;
    } catch (error) {
      announceError(`Failed to upload photo: ${error.message}`);
      throw error;
    } finally {
      hideLoadingIndicator();
    }
  });
}
```

## Form Accessibility

### Field Validation

```javascript
// Accessible Form Validation
class AccessibleFormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.setupValidation();
  }

  setupValidation() {
    // Real-time validation on blur
    this.form.addEventListener('blur', (e) => {
      if (e.target.matches('input, select, textarea')) {
        this.validateField(e.target);
      }
    }, true);

    // Form submission validation
    this.form.addEventListener('submit', (e) => {
      if (!this.validateAll()) {
        e.preventDefault();
        this.focusFirstError();
      }
    });
  }

  validateField(field) {
    const errors = [];
    
    // Required field
    if (field.hasAttribute('required') && !field.value) {
      errors.push('This field is required');
    }
    
    // Pattern validation
    if (field.hasAttribute('pattern')) {
      const pattern = new RegExp(field.getAttribute('pattern'));
      if (!pattern.test(field.value)) {
        errors.push(field.getAttribute('data-pattern-error') || 'Invalid format');
      }
    }
    
    // Custom validation
    if (field.dataset.validate) {
      const customErrors = this.customValidators[field.dataset.validate](field.value);
      errors.push(...customErrors);
    }
    
    this.updateFieldError(field, errors);
    return errors.length === 0;
  }

  updateFieldError(field, errors) {
    const fieldId = field.id;
    const errorId = `${fieldId}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (errors.length > 0) {
      // Create or update error message
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = errors.join('. ');
      
      // Update field ARIA attributes
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
      
      // Store error for summary
      this.errors.set(fieldId, errors);
    } else {
      // Remove error
      if (errorElement) {
        errorElement.remove();
      }
      
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
      
      this.errors.delete(fieldId);
    }
  }

  focusFirstError() {
    const firstErrorField = this.form.querySelector('[aria-invalid="true"]');
    if (firstErrorField) {
      firstErrorField.focus();
      
      // Announce error summary
      const errorCount = this.errors.size;
      this.announce(
        `Form contains ${errorCount} error${errorCount !== 1 ? 's' : ''}. ` +
        `First error: ${this.errors.values().next().value.join('. ')}`
      );
    }
  }
}
```

### Error Summary

```html
<!-- Error Summary Pattern -->
<div 
  role="alert" 
  aria-labelledby="error-summary-title"
  class="error-summary"
  tabindex="-1"
>
  <h2 id="error-summary-title">
    <span aria-hidden="true">⚠️</span>
    There are 3 errors in your form
  </h2>
  
  <ul class="error-list">
    <li>
      <a href="#property-title">
        Property Title: This field is required
      </a>
    </li>
    <li>
      <a href="#monthly-rent">
        Monthly Rent: Please enter a valid amount
      </a>
    </li>
    <li>
      <a href="#bedrooms">
        Bedrooms: Please select number of bedrooms
      </a>
    </li>
  </ul>
</div>
```

## Photo Upload Accessibility

### Drag and Drop Alternative

```html
<!-- Accessible Photo Upload -->
<div class="photo-upload-area">
  <div 
    class="dropzone"
    role="region"
    aria-label="Photo upload area"
    tabindex="0"
    aria-describedby="upload-instructions"
  >
    <svg aria-hidden="true" class="upload-icon">
      <!-- Icon SVG -->
    </svg>
    
    <p id="upload-instructions">
      Drag photos here or use the button below to browse
    </p>
    
    <button 
      type="button"
      class="browse-button"
      onclick="document.getElementById('file-input').click()"
    >
      <span aria-hidden="true">📁</span>
      Browse Files
    </button>
    
    <input 
      type="file" 
      id="file-input"
      multiple 
      accept="image/*"
      class="sr-only"
      aria-label="Select photos to upload"
    />
  </div>
  
  <!-- Upload Progress -->
  <div 
    class="upload-progress"
    role="progressbar"
    aria-valuenow="0"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Photo upload progress"
  >
    <div class="progress-bar"></div>
    <span class="progress-text">0% uploaded</span>
  </div>
</div>
```

### Photo Management

```javascript
// Accessible Photo Gallery Management
class AccessiblePhotoManager {
  constructor(container) {
    this.container = container;
    this.photos = [];
    this.setupAccessibility();
  }

  addPhoto(file, index) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.setAttribute('role', 'img');
    photoItem.setAttribute('aria-label', `Photo ${index + 1}: ${file.name}`);
    
    photoItem.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="">
      <div class="photo-actions">
        <button 
          type="button"
          aria-label="Set as primary photo"
          onclick="setPrimary(${index})"
        >
          ⭐ Set as Primary
        </button>
        <button 
          type="button"
          aria-label="Edit photo description"
          onclick="editDescription(${index})"
        >
          ✏️ Edit Description
        </button>
        <button 
          type="button"
          aria-label="Delete photo"
          onclick="deletePhoto(${index})"
        >
          🗑️ Delete
        </button>
      </div>
      
      <div class="photo-description">
        <label for="photo-desc-${index}" class="sr-only">
          Photo description
        </label>
        <textarea 
          id="photo-desc-${index}"
          placeholder="Add a description (optional)"
          aria-describedby="desc-help-${index}"
        ></textarea>
        <span id="desc-help-${index}" class="sr-only">
          Describe what's shown in this photo to help users understand your property
        </span>
      </div>
    `;
    
    this.container.appendChild(photoItem);
    this.photos.push(photoItem);
    
    this.announcePhotoAdded(index + 1);
  }

  announcePhotoAdded(position) {
    this.announce(`Photo added at position ${position} of ${this.photos.length}`);
  }
}
```

## Error Handling

### Error Messaging

```javascript
// Accessible Error Messages
class AccessibleErrorHandler {
  constructor() {
    this.errorContainer = this.createErrorContainer();
  }

  createErrorContainer() {
    const container = document.createElement('div');
    container.setAttribute('role', 'alert');
    container.setAttribute('aria-live', 'assertive');
    container.setAttribute('aria-atomic', 'true');
    container.className = 'error-messages sr-only';
    document.body.appendChild(container);
    return container;
  }

  showError(message, field = null) {
    // Update screen reader announcement
    this.errorContainer.textContent = message;
    
    // Visual error display
    if (field) {
      this.showFieldError(field, message);
    } else {
      this.showGlobalError(message);
    }
    
    // Log for debugging
    console.error('Accessibility Error:', message);
  }

  showFieldError(field, message) {
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.id = errorId;
      errorElement.className = 'field-error';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
    
    // Focus management
    field.focus();
  }

  clearErrors() {
    // Clear all field errors
    document.querySelectorAll('[aria-invalid="true"]').forEach(field => {
      field.setAttribute('aria-invalid', 'false');
      const errorElement = document.getElementById(`${field.id}-error`);
      if (errorElement) {
        errorElement.remove();
      }
    });
    
    // Clear announcements
    this.errorContainer.textContent = '';
  }
}
```

## Mobile Accessibility

### Touch Interactions

```css
/* Touch-Friendly Targets */
@media (hover: none) and (pointer: coarse) {
  /* Increase touch targets on touch devices */
  button,
  a,
  input[type="checkbox"],
  input[type="radio"],
  select {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Add padding to clickable elements */
  .clickable {
    padding: 12px;
    margin: -12px;
  }
  
  /* Prevent text selection on interactive elements */
  button,
  a {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}

/* Gesture Hints */
.swipeable::after {
  content: "Swipe left or right to navigate photos";
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: #666;
  text-align: center;
  width: 100%;
}

@media (hover: hover) {
  .swipeable::after {
    content: "Use arrow keys to navigate photos";
  }
}
```

### Orientation Support

```javascript
// Orientation Change Handling
class OrientationAccessibility {
  constructor() {
    this.setupOrientationHandling();
  }

  setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange();
    });
    
    // Also handle resize for devices that don't fire orientationchange
    window.addEventListener('resize', debounce(() => {
      this.handleOrientationChange();
    }, 250));
  }

  handleOrientationChange() {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    
    // Update ARIA labels based on orientation
    if (orientation === 'landscape') {
      this.updateLandscapeLabels();
    } else {
      this.updatePortraitLabels();
    }
    
    // Announce orientation change
    this.announce(`Screen rotated to ${orientation} mode`);
    
    // Adjust focus if needed
    this.maintainFocus();
  }

  maintainFocus() {
    // Ensure focused element is still visible
    const focused = document.activeElement;
    if (focused && !this.isInViewport(focused)) {
      focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
}
```

## Testing Procedures

### Automated Testing

```javascript
// Accessibility Testing Suite
describe('Property Listing Accessibility', () => {
  beforeEach(() => {
    cy.visit('/property/create');
    cy.injectAxe(); // Inject axe-core
  });

  it('should have no accessibility violations', () => {
    cy.checkA11y();
  });

  it('should be fully keyboard navigable', () => {
    // Tab through all elements
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-step', '1');
    
    // Navigate wizard with keyboard
    cy.get('body').type('{alt}n');
    cy.focused().should('have.attr', 'data-step', '2');
    
    // Test escape key
    cy.get('.modal-trigger').click();
    cy.get('.modal').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('.modal').should('not.be.visible');
  });

  it('should announce form errors to screen readers', () => {
    cy.get('#property-title').clear();
    cy.get('form').submit();
    
    // Check ARIA attributes
    cy.get('#property-title').should('have.attr', 'aria-invalid', 'true');
    cy.get('#property-title-error').should('have.attr', 'role', 'alert');
  });

  it('should maintain focus management', () => {
    // Open modal
    cy.get('.photo-upload-trigger').click();
    
    // Check focus trapped in modal
    cy.focused().should('be.within', '.modal');
    
    // Tab cycling
    cy.get('.modal').find('[tabindex]:last').focus().tab();
    cy.focused().should('match', '.modal [tabindex]:first');
  });

  it('should support screen reader navigation', () => {
    // Check landmarks
    cy.get('[role="banner"]').should('exist');
    cy.get('[role="main"]').should('exist');
    cy.get('[role="navigation"]').should('exist');
    
    // Check headings hierarchy
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('exist');
    
    // Check form labels
    cy.get('input:not([type="hidden"])').each(($input) => {
      cy.wrap($input).should('have.attr', 'id');
      cy.get(`label[for="${$input.attr('id')}"]`).should('exist');
    });
  });
});
```

### Manual Testing Checklist

```markdown
## Screen Reader Testing

### NVDA (Windows)
- [ ] All form fields are announced with labels
- [ ] Error messages are announced when they appear
- [ ] Photo upload status is announced
- [ ] Wizard step changes are announced
- [ ] Focus changes are logical and announced

### JAWS (Windows)
- [ ] Forms mode works correctly
- [ ] Virtual cursor navigation is smooth
- [ ] Landmarks are properly identified
- [ ] Tables (if any) are properly structured

### VoiceOver (macOS/iOS)
- [ ] Rotor navigation works for headings, forms, landmarks
- [ ] Gestures work correctly on touch devices
- [ ] Form hints are announced
- [ ] Image descriptions are read

### TalkBack (Android)
- [ ] Touch exploration works correctly
- [ ] Reading order is logical
- [ ] Form controls are accessible
- [ ] Custom components work with gestures

## Keyboard Navigation Testing

- [ ] Tab order is logical and complete
- [ ] No keyboard traps exist
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] Shortcuts work and don't conflict
- [ ] Modal focus management works
- [ ] Escape key closes modals/dropdowns

## Visual Testing

- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Text is resizable to 200% without loss
- [ ] Focus indicators are clearly visible
- [ ] Error states use more than color
- [ ] Works without color information
- [ ] Animations respect prefers-reduced-motion

## Mobile Testing

- [ ] Touch targets are at least 44x44px
- [ ] Pinch-to-zoom is not disabled
- [ ] Works in both orientations
- [ ] Form inputs trigger appropriate keyboards
- [ ] Scrolling doesn't trap focus
```

## Implementation Checklist

### Development Phase

```markdown
## Pre-Development
- [ ] Review WCAG 2.1 Level AA requirements
- [ ] Set up accessibility testing tools
- [ ] Configure linting for accessibility
- [ ] Plan keyboard navigation flow
- [ ] Design focus management strategy

## During Development
- [ ] Use semantic HTML elements
- [ ] Add ARIA labels and descriptions
- [ ] Implement keyboard navigation
- [ ] Create focus management system
- [ ] Add skip links for navigation
- [ ] Ensure color contrast compliance
- [ ] Make touch targets 44x44px minimum
- [ ] Add alt text for images
- [ ] Create accessible forms with labels
- [ ] Implement error handling with announcements
- [ ] Add loading state announcements
- [ ] Test with screen readers during development

## Testing Phase
- [ ] Run automated accessibility tests (axe-core)
- [ ] Test with keyboard only navigation
- [ ] Test with NVDA on Windows
- [ ] Test with VoiceOver on macOS/iOS
- [ ] Test with TalkBack on Android
- [ ] Verify color contrast ratios
- [ ] Test with browser zoom at 200%
- [ ] Test with Windows High Contrast Mode
- [ ] Test with prefers-reduced-motion
- [ ] Validate HTML for proper structure
- [ ] Test form validation and error handling
- [ ] Test focus management in modals

## Pre-Launch
- [ ] Complete accessibility audit
- [ ] Document keyboard shortcuts
- [ ] Create accessibility statement
- [ ] Train support team on accessibility
- [ ] Set up monitoring for accessibility issues
- [ ] Plan regular accessibility reviews
```

### Code Review Checklist

```markdown
## HTML Review
- [ ] Semantic elements used appropriately
- [ ] Headings follow logical hierarchy
- [ ] Forms have associated labels
- [ ] Images have alt text
- [ ] Tables have headers and captions
- [ ] Landmark roles used correctly

## ARIA Review  
- [ ] ARIA used only when necessary
- [ ] ARIA labels are descriptive
- [ ] Live regions configured correctly
- [ ] States and properties updated dynamically
- [ ] Roles match element behavior

## CSS Review
- [ ] Focus indicators not removed
- [ ] Color contrast meets standards
- [ ] Text is resizable
- [ ] Animations can be disabled
- [ ] Touch targets are large enough

## JavaScript Review
- [ ] Keyboard events handled properly
- [ ] Focus managed during interactions
- [ ] Announcements made for dynamic changes
- [ ] Timeouts are adjustable
- [ ] Error messages are accessible
```

## Related Documentation

- [Screen States Documentation](./screen-states.md)
- [Interactions Documentation](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Global Accessibility Guidelines](../../accessibility/guidelines.md)

## Resources

### Testing Tools
- axe DevTools: Browser extension for accessibility testing
- WAVE: Web Accessibility Evaluation Tool
- Lighthouse: Chrome DevTools accessibility audit
- NVDA: Free screen reader for Windows
- VoiceOver: Built-in screen reader for macOS/iOS
- TalkBack: Built-in screen reader for Android

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Last Updated

**Date**: 2025-01-05
**Version**: 1.0.0
**Status**: Approved for implementation

### Change Log
- 2025-01-05: Initial comprehensive accessibility specifications