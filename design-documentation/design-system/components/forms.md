---
title: Form Component Specifications
description: Comprehensive form element design patterns and specifications
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./README.md
  - ./buttons.md
  - ../tokens/spacing.md
status: approved
---

# Form Component Specifications

## Overview
Form components enable user input and data collection across the Heurekka platform, designed for clarity, efficiency, and accessibility.

## Table of Contents
1. [Form Design Principles](#form-design-principles)
2. [Text Input](#text-input)
3. [Select Dropdown](#select-dropdown)
4. [Checkbox](#checkbox)
5. [Radio Button](#radio-button)
6. [Toggle Switch](#toggle-switch)
7. [Slider](#slider)
8. [Date Picker](#date-picker)
9. [File Upload](#file-upload)
10. [Form Validation](#form-validation)
11. [Form Layout Patterns](#form-layout-patterns)

## Form Design Principles

### Clarity
- Clear labels above inputs
- Helpful placeholder text
- Descriptive helper text
- Obvious required fields

### Efficiency
- Smart defaults
- Auto-complete support
- Inline validation
- Logical tab order

### Accessibility
- Proper label associations
- Error announcements
- Keyboard navigable
- Screen reader optimized

## Text Input

### Variants
- **Default**: Standard text input
- **Search**: With search icon
- **Password**: Masked input with toggle
- **Number**: Numeric input with controls
- **Textarea**: Multi-line text input

### Visual Specifications
```scss
.text-input {
  // Dimensions
  height: 48px;
  padding: 12px 16px;
  width: 100%;
  
  // Typography
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  
  // Colors
  background: var(--color-white);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-medium);
  
  // Shape
  border-radius: var(--radius-md);
  
  // Transition
  transition: all var(--duration-fast) var(--ease-out);
}
```

### States
```scss
// Default
.text-input {
  border-color: var(--color-neutral-300);
  background: var(--color-white);
}

// Hover
.text-input:hover {
  border-color: var(--color-neutral-400);
}

// Focus
.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

// Disabled
.text-input:disabled {
  background: var(--color-neutral-100);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

// Error
.text-input.error {
  border-color: var(--color-error);
}

// Success
.text-input.success {
  border-color: var(--color-success);
}
```

### With Icons
```html
<div class="input-group">
  <span class="input-icon-left">
    <svg class="icon"><!-- Icon --></svg>
  </span>
  <input type="text" class="text-input with-icon-left" placeholder="Search properties...">
</div>
```

## Select Dropdown

### Visual Specifications
```scss
.select {
  // Dimensions
  height: 48px;
  padding: 12px 40px 12px 16px;
  
  // Appearance
  appearance: none;
  background-image: url("data:image/svg+xml,..."); // Chevron icon
  background-repeat: no-repeat;
  background-position: right 16px center;
  
  // Style matches text input
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
}
```

### Custom Dropdown
```javascript
class CustomSelect {
  constructor(element) {
    this.select = element;
    this.options = this.select.querySelectorAll('option');
    this.createCustom();
  }
  
  createCustom() {
    // Create custom dropdown structure
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    
    const trigger = document.createElement('button');
    trigger.className = 'select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    
    const dropdown = document.createElement('ul');
    dropdown.className = 'select-dropdown';
    dropdown.setAttribute('role', 'listbox');
    
    // Build options
    this.options.forEach((option, index) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', option.value);
      li.textContent = option.textContent;
      dropdown.appendChild(li);
    });
  }
}
```

## Checkbox

### Visual Specifications
```scss
.checkbox {
  // Hide native checkbox
  position: absolute;
  opacity: 0;
  
  & + label {
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    
    &::before {
      // Checkbox box
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      background: var(--color-white);
      transition: all var(--duration-fast) var(--ease-out);
    }
    
    &::after {
      // Checkmark
      content: '';
      position: absolute;
      left: 7px;
      top: 3px;
      width: 6px;
      height: 11px;
      border: solid var(--color-white);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0);
      transition: transform var(--duration-fast) var(--ease-spring);
    }
  }
  
  &:checked + label {
    &::before {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    &::after {
      transform: rotate(45deg) scale(1);
    }
  }
}
```

### States
- **Unchecked**: Empty box
- **Checked**: Filled with checkmark
- **Indeterminate**: Dash symbol
- **Disabled**: Reduced opacity
- **Focus**: Outline ring

## Radio Button

### Visual Specifications
```scss
.radio {
  // Hide native radio
  position: absolute;
  opacity: 0;
  
  & + label {
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    
    &::before {
      // Radio circle
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border-strong);
      border-radius: 50%;
      background: var(--color-white);
    }
    
    &::after {
      // Radio dot
      content: '';
      position: absolute;
      left: 6px;
      top: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
      transform: scale(0);
      transition: transform var(--duration-fast) var(--ease-spring);
    }
  }
  
  &:checked + label::after {
    transform: scale(1);
  }
}
```

## Toggle Switch

### Visual Specifications
```scss
.toggle {
  // Container
  position: relative;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-neutral-400);
    border-radius: 24px;
    transition: background var(--duration-fast) var(--ease-out);
    
    &::before {
      // Toggle knob
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: var(--color-white);
      border-radius: 50%;
      transition: transform var(--duration-fast) var(--ease-out);
    }
  }
  
  input:checked + .toggle-slider {
    background: var(--color-primary);
    
    &::before {
      transform: translateX(24px);
    }
  }
}
```

## Slider

### Range Input Specifications
```scss
.slider {
  // Track
  width: 100%;
  height: 4px;
  background: var(--color-neutral-200);
  border-radius: 2px;
  outline: none;
  
  // Thumb
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--color-primary);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    &:hover {
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  // Track fill
  &::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      var(--color-primary) 0%,
      var(--color-primary) var(--value),
      var(--color-neutral-200) var(--value),
      var(--color-neutral-200) 100%
    );
  }
}
```

### With Labels
```html
<div class="slider-container">
  <label for="price-range">Price Range</label>
  <div class="slider-wrapper">
    <span class="slider-min">$0</span>
    <input type="range" id="price-range" class="slider" min="0" max="1000000" value="500000">
    <span class="slider-max">$1M+</span>
  </div>
  <output class="slider-value">$500,000</output>
</div>
```

## Date Picker

### Calendar Widget
```scss
.datepicker {
  // Container
  position: absolute;
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  
  // Header
  .datepicker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }
  
  // Calendar grid
  .datepicker-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-xs);
    
    .day {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      
      &:hover {
        background: var(--color-neutral-100);
      }
      
      &.selected {
        background: var(--color-primary);
        color: var(--color-white);
      }
      
      &.disabled {
        color: var(--color-text-tertiary);
        cursor: not-allowed;
      }
    }
  }
}
```

## File Upload

### Drag and Drop Zone
```scss
.file-upload {
  // Drop zone
  border: 2px dashed var(--color-border-medium);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  transition: all var(--duration-fast) var(--ease-out);
  
  &.drag-over {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
  }
  
  // Upload button
  .upload-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  // File preview
  .file-preview {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--color-neutral-50);
    border-radius: var(--radius-md);
    margin-top: var(--spacing-md);
    
    .file-icon {
      width: 32px;
      height: 32px;
    }
    
    .file-info {
      flex: 1;
      margin: 0 var(--spacing-md);
    }
    
    .file-remove {
      cursor: pointer;
      color: var(--color-text-tertiary);
      
      &:hover {
        color: var(--color-error);
      }
    }
  }
}
```

## Form Validation

### Validation States
```scss
.form-field {
  // Error state
  &.has-error {
    .text-input {
      border-color: var(--color-error);
    }
    
    .error-message {
      color: var(--color-error);
      font-size: var(--font-size-body-small);
      margin-top: var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }
  }
  
  // Success state
  &.has-success {
    .text-input {
      border-color: var(--color-success);
    }
    
    .success-icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-success);
    }
  }
}
```

### Real-time Validation
```javascript
class FormValidator {
  constructor(form) {
    this.form = form;
    this.fields = form.querySelectorAll('[data-validate]');
    this.init();
  }
  
  init() {
    this.fields.forEach(field => {
      // Validate on blur
      field.addEventListener('blur', () => this.validateField(field));
      
      // Clear error on input
      field.addEventListener('input', () => this.clearError(field));
    });
  }
  
  validateField(field) {
    const type = field.dataset.validate;
    const value = field.value;
    
    switch(type) {
      case 'email':
        return this.validateEmail(value);
      case 'required':
        return this.validateRequired(value);
      case 'phone':
        return this.validatePhone(value);
      default:
        return true;
    }
  }
}
```

## Form Layout Patterns

### Vertical Form
```html
<form class="form-vertical">
  <div class="form-group">
    <label for="email">Email Address</label>
    <input type="email" id="email" class="text-input" required>
    <span class="helper-text">We'll never share your email</span>
  </div>
  
  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" id="password" class="text-input" required>
    <span class="helper-text">Minimum 8 characters</span>
  </div>
  
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Horizontal Form
```html
<form class="form-horizontal">
  <div class="form-row">
    <label for="name" class="col-3">Name</label>
    <div class="col-9">
      <input type="text" id="name" class="text-input">
    </div>
  </div>
  
  <div class="form-row">
    <label for="email" class="col-3">Email</label>
    <div class="col-9">
      <input type="email" id="email" class="text-input">
    </div>
  </div>
</form>
```

### Multi-Column Form
```html
<form class="form-grid">
  <div class="form-row">
    <div class="col-6">
      <label for="first-name">First Name</label>
      <input type="text" id="first-name" class="text-input">
    </div>
    <div class="col-6">
      <label for="last-name">Last Name</label>
      <input type="text" id="last-name" class="text-input">
    </div>
  </div>
  
  <div class="form-row">
    <div class="col-12">
      <label for="address">Street Address</label>
      <input type="text" id="address" class="text-input">
    </div>
  </div>
  
  <div class="form-row">
    <div class="col-6">
      <label for="city">City</label>
      <input type="text" id="city" class="text-input">
    </div>
    <div class="col-3">
      <label for="state">State</label>
      <select id="state" class="select">
        <option>Select State</option>
      </select>
    </div>
    <div class="col-3">
      <label for="zip">ZIP Code</label>
      <input type="text" id="zip" class="text-input">
    </div>
  </div>
</form>
```

## Accessibility Guidelines

### Label Associations
```html
<!-- Explicit label -->
<label for="username">Username</label>
<input type="text" id="username" name="username">

<!-- Implicit label -->
<label>
  <input type="checkbox" name="agree">
  I agree to the terms
</label>

<!-- ARIA label -->
<input type="search" aria-label="Search properties" placeholder="Search...">
```

### Error Announcements
```html
<div class="form-group">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    aria-describedby="email-error"
    aria-invalid="true"
  >
  <span id="email-error" role="alert" class="error-message">
    Please enter a valid email address
  </span>
</div>
```

### Keyboard Navigation
- Tab through all form elements
- Space/Enter to toggle checkboxes
- Arrow keys for radio groups
- Escape to close dropdowns

## Related Documentation
- [Button Specifications](./buttons.md)
- [Design Tokens](../tokens/README.md)
- [Accessibility Guidelines](../../accessibility/guidelines.md)

## Last Updated
2025-01-04 - Complete form component specifications