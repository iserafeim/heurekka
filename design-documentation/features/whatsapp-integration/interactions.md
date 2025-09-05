---
title: WhatsApp Integration - Interactions
description: Detailed interaction specifications for WhatsApp messaging feature
feature: whatsapp-integration
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./user-journey.md
  - ./implementation.md
status: approved
---

# WhatsApp Integration - Interactions

## Overview
Complete interaction design specifications for all WhatsApp integration touchpoints, including animations, transitions, and user feedback mechanisms.

## Table of Contents
1. [Button Interactions](#button-interactions)
2. [Modal Interactions](#modal-interactions)
3. [Form Interactions](#form-interactions)
4. [Message Editing](#message-editing)
5. [Deep Link Handling](#deep-link-handling)
6. [Error Recovery](#error-recovery)
7. [Bulk Actions](#bulk-actions)

## Button Interactions

### WhatsApp CTA Button

#### Hover Interaction
**Trigger**: Mouse enter (desktop)
**Response**:
```javascript
// Animation sequence
{
  duration: 200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  properties: {
    background: 'darken(5%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)'
  }
}
```

**Visual Feedback**:
- Icon subtle pulse animation
- Tooltip appearance after 800ms
- Cursor change to pointer

#### Click Interaction
**Trigger**: Mouse down / Touch start
**Immediate Response** (0-50ms):
```javascript
// Pressed state
{
  duration: 100,
  properties: {
    transform: 'scale(0.98)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  }
}
```

**Action Sequence**:
1. **Authentication Check** (50-100ms)
   - Verify user login status
   - Check profile completeness
   - Determine next action

2. **Loading State** (100ms+)
   - Show spinner overlay
   - Disable button interactions
   - Maintain button dimensions

3. **Route Decision** (200-300ms)
   - Logged in → Generate message
   - Not logged in → Show auth modal
   - Incomplete profile → Quick complete form

#### Touch Interactions (Mobile)
**Touch Feedback**:
```javascript
// Haptic feedback
if (navigator.vibrate) {
  navigator.vibrate(10); // Light tap feedback
}

// Visual response
{
  duration: 150,
  properties: {
    background: 'rgba(37, 211, 102, 0.1)',
    rippleEffect: true
  }
}
```

**Long Press** (500ms+):
- Show contact options menu
- Options: WhatsApp, Copy Message, Share

#### Keyboard Interaction
**Key Bindings**:
- `Enter/Space`: Activate button
- `Escape`: Cancel if in loading state

**Focus Management**:
```css
.whatsapp-cta:focus-visible {
  outline: 3px solid #25D366;
  outline-offset: 2px;
  animation: focusPulse 1.5s ease-in-out infinite;
}

@keyframes focusPulse {
  0%, 100% { outline-width: 3px; }
  50% { outline-width: 5px; }
}
```

## Modal Interactions

### Message Preview Modal

#### Opening Animation
**Trigger**: Button click completion
**Animation Sequence**:
```javascript
// Modal entrance
{
  backdrop: {
    duration: 200,
    from: { opacity: 0 },
    to: { opacity: 1, backdropFilter: 'blur(4px)' }
  },
  modal: {
    duration: 300,
    delay: 50,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    from: { 
      opacity: 0, 
      transform: 'scale(0.9) translateY(20px)' 
    },
    to: { 
      opacity: 1, 
      transform: 'scale(1) translateY(0)' 
    }
  }
}
```

#### Closing Animation
**Triggers**: 
- Close button click
- Escape key
- Backdrop click
- Successful send

**Animation**:
```javascript
{
  modal: {
    duration: 200,
    easing: 'ease-in',
    to: { 
      opacity: 0, 
      transform: 'scale(0.95) translateY(10px)' 
    }
  },
  backdrop: {
    duration: 150,
    delay: 50,
    to: { opacity: 0 }
  }
}
```

#### Drag Interactions (Mobile)
**Swipe Down to Dismiss**:
```javascript
// Touch tracking
let startY = 0;
let currentY = 0;
let isDragging = false;

onTouchStart = (e) => {
  startY = e.touches[0].clientY;
  isDragging = true;
};

onTouchMove = (e) => {
  if (!isDragging) return;
  currentY = e.touches[0].clientY;
  const deltaY = currentY - startY;
  
  if (deltaY > 0) {
    modal.style.transform = `translateY(${deltaY}px)`;
    modal.style.opacity = 1 - (deltaY / 300);
  }
};

onTouchEnd = () => {
  const deltaY = currentY - startY;
  if (deltaY > 100) {
    closeModal();
  } else {
    // Snap back
    modal.style.transform = 'translateY(0)';
    modal.style.opacity = 1;
  }
  isDragging = false;
};
```

### Modal Content Interactions

#### Message Editing
**Enable Edit Mode**:
```javascript
// Double-click to edit
onDoubleClick = () => {
  enableEditMode();
  
  // Visual transition
  {
    duration: 200,
    properties: {
      background: 'from(#E3F2E8) to(#FFFFFF)',
      border: '2px solid #25D366',
      cursor: 'text'
    }
  }
  
  // Select all text
  selectAllText();
};
```

**Character Counter Update**:
```javascript
onInput = (e) => {
  const length = e.target.value.length;
  const max = 1024;
  const remaining = max - length;
  
  // Update counter
  counter.textContent = `${remaining} caracteres restantes`;
  
  // Visual feedback
  if (remaining < 100) {
    counter.className = 'warning';
  } else if (remaining < 0) {
    counter.className = 'error';
    sendButton.disabled = true;
  } else {
    counter.className = 'normal';
    sendButton.disabled = false;
  }
};
```

#### Copy to Clipboard
**Trigger**: Copy button click
**Interaction**:
```javascript
onCopyClick = async () => {
  try {
    await navigator.clipboard.writeText(messageText);
    
    // Success feedback
    button.classList.add('success');
    button.textContent = 'Copiado!';
    
    // Haptic feedback (mobile)
    navigator.vibrate?.([50, 50, 50]);
    
    // Reset after delay
    setTimeout(() => {
      button.classList.remove('success');
      button.textContent = 'Copiar';
    }, 2000);
  } catch (err) {
    // Fallback method
    fallbackCopy(messageText);
  }
};
```

## Form Interactions

### Profile Quick Complete

#### Field Validation
**Real-time Validation**:
```javascript
// Budget field
budgetField.addEventListener('input', (e) => {
  const value = e.target.value.replace(/[^0-9]/g, '');
  const formatted = formatCurrency(value);
  e.target.value = formatted;
  
  // Visual feedback
  if (value < 3000) {
    showError('Presupuesto mínimo: L.3,000');
  } else if (value > 100000) {
    showError('Presupuesto máximo: L.100,000');
  } else {
    clearError();
    showSuccess();
  }
});

// Move date field
moveDate.addEventListener('change', (e) => {
  const selected = new Date(e.target.value);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  
  if (selected < today) {
    showError('La fecha no puede ser en el pasado');
  } else if (selected > maxDate) {
    showError('Máximo 6 meses en el futuro');
  } else {
    clearError();
    updateDateDisplay(selected);
  }
});
```

#### Auto-save Behavior
```javascript
// Debounced auto-save
let saveTimeout;

onFieldChange = (field, value) => {
  // Show saving indicator
  showSavingIndicator();
  
  // Clear previous timeout
  clearTimeout(saveTimeout);
  
  // Set new save timeout
  saveTimeout = setTimeout(() => {
    saveToLocalStorage(field, value);
    showSavedIndicator();
  }, 1000);
};
```

#### Progress Indication
```javascript
// Form completion tracking
updateProgress = () => {
  const requiredFields = ['budget', 'moveDate', 'occupants', 'areas'];
  const completed = requiredFields.filter(field => hasValue(field));
  const percentage = (completed.length / requiredFields.length) * 100;
  
  // Update progress bar
  progressBar.style.width = `${percentage}%`;
  
  // Update button state
  if (percentage === 100) {
    submitButton.disabled = false;
    submitButton.textContent = 'Continuar';
  } else {
    submitButton.disabled = true;
    submitButton.textContent = `Completar (${completed.length}/${requiredFields.length})`;
  }
};
```

## Message Editing

### Inline Editing

#### Text Selection
```javascript
// Smart text selection
onEditActivate = () => {
  const editableArea = document.querySelector('.message-content');
  
  // Select only user-editable portion
  const range = document.createRange();
  range.selectNodeContents(editableArea);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Show formatting toolbar
  showFormattingTools();
};
```

#### Formatting Tools
```javascript
// Text formatting shortcuts
formatShortcuts = {
  'Ctrl+B': () => wrapSelection('**', '**'), // Bold
  'Ctrl+I': () => wrapSelection('_', '_'),    // Italic
  'Ctrl+K': () => insertLink(),               // Link
  'Ctrl+Enter': () => sendMessage()           // Send
};

// Apply formatting
wrapSelection = (before, after) => {
  const selection = window.getSelection();
  const text = selection.toString();
  
  if (text) {
    document.execCommand('insertText', false, `${before}${text}${after}`);
  }
};
```

## Deep Link Handling

### WhatsApp Launch

#### Mobile App Detection
```javascript
// Detect WhatsApp availability
detectWhatsApp = () => {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isIOS) {
    // Try custom URL scheme
    window.location = 'whatsapp://';
    setTimeout(() => {
      // Fallback to web if app not installed
      if (document.hasFocus()) {
        openWhatsAppWeb();
      }
    }, 2500);
  } else if (isAndroid) {
    // Use intent for Android
    window.location = 'intent://send?phone=504XXXXXXXX#Intent;scheme=whatsapp;package=com.whatsapp;end';
  } else {
    // Desktop - use web
    openWhatsAppWeb();
  }
};
```

#### Message URL Construction
```javascript
// Build WhatsApp URL
buildWhatsAppURL = (phone, message) => {
  const baseURL = isMobile() 
    ? 'whatsapp://send' 
    : 'https://web.whatsapp.com/send';
  
  const params = new URLSearchParams({
    phone: phone.replace(/\D/g, ''), // Remove non-digits
    text: message
  });
  
  return `${baseURL}?${params.toString()}`;
};

// URL encoding for message
encodeMessage = (template, data) => {
  let message = template;
  
  // Replace placeholders
  Object.keys(data).forEach(key => {
    message = message.replace(`{{${key}}}`, data[key]);
  });
  
  // Proper encoding for WhatsApp
  return encodeURIComponent(message)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
};
```

## Error Recovery

### Network Errors

#### Retry Mechanism
```javascript
// Exponential backoff retry
retryWithBackoff = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Show retry indication
      showRetryMessage(`Intento ${i + 1} de ${maxRetries}...`);
      
      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await sleep(delay);
    }
  }
  
  // All retries failed
  showErrorWithRecovery(lastError);
  throw lastError;
};
```

#### Offline Handling
```javascript
// Offline detection and queue
handleOffline = () => {
  if (!navigator.onLine) {
    // Store action for later
    queueAction({
      type: 'whatsapp_contact',
      data: getCurrentFormData(),
      timestamp: Date.now()
    });
    
    // Show offline message
    showOfflineMessage('Sin conexión. Tu mensaje se enviará cuando recuperes internet.');
    
    // Listen for reconnection
    window.addEventListener('online', processQueuedActions);
  }
};
```

### Validation Errors

#### Field-level Errors
```javascript
// Show inline errors
showFieldError = (field, error) => {
  const fieldElement = document.getElementById(field);
  const errorElement = fieldElement.nextElementSibling;
  
  // Visual feedback
  fieldElement.classList.add('error');
  errorElement.textContent = error;
  errorElement.style.display = 'block';
  
  // Shake animation
  fieldElement.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' }
  ], {
    duration: 400,
    easing: 'ease-out'
  });
  
  // Focus on error
  fieldElement.focus();
};
```

## Bulk Actions

### Multi-select Mode

#### Selection Toggle
```javascript
// Enter selection mode
enableBulkSelect = () => {
  document.body.classList.add('bulk-select-mode');
  
  // Show selection UI
  properties.forEach(card => {
    card.classList.add('selectable');
    addCheckbox(card);
  });
  
  // Show bulk action bar
  showBulkActionBar();
};

// Toggle individual selection
toggleSelection = (card) => {
  card.classList.toggle('selected');
  
  // Update count
  const selected = document.querySelectorAll('.selected').length;
  updateSelectionCount(selected);
  
  // Haptic feedback
  navigator.vibrate?.(10);
  
  // Enable/disable bulk actions
  toggleBulkActions(selected > 0);
};
```

#### Batch Message Generation
```javascript
// Generate messages for selected properties
generateBulkMessages = async () => {
  const selected = getSelectedProperties();
  const messages = [];
  
  // Show progress
  showProgressModal(selected.length);
  
  for (let i = 0; i < selected.length; i++) {
    const property = selected[i];
    
    // Update progress
    updateProgress(i + 1, selected.length);
    
    // Generate message
    const message = await generateMessage(property);
    messages.push({
      property: property.id,
      phone: property.contactPhone,
      message: message
    });
    
    // Small delay to prevent rate limiting
    await sleep(100);
  }
  
  return messages;
};
```

#### Sequential Sending
```javascript
// Send messages one by one
sendBulkMessages = async (messages) => {
  for (let i = 0; i < messages.length; i++) {
    const { phone, message } = messages[i];
    
    // Show current sending
    showSendingStatus(i + 1, messages.length);
    
    // Open WhatsApp
    const url = buildWhatsAppURL(phone, message);
    window.open(url, '_blank');
    
    // Wait for user confirmation
    const confirmed = await waitForConfirmation();
    
    if (!confirmed) {
      // User cancelled
      break;
    }
    
    // Mark as contacted
    markAsContacted(messages[i].property);
    
    // Delay before next
    if (i < messages.length - 1) {
      await showCountdown(5); // 5 second countdown
    }
  }
  
  // Complete
  showBulkComplete();
};
```

## Animation Specifications

### Timing Functions
```javascript
const easings = {
  // Enter animations
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  
  // Exit animations
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  
  // Move animations
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Bounce effects
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  
  // Smooth deceleration
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
};
```

### Duration Guidelines
```javascript
const durations = {
  instant: 0,      // Immediate feedback
  fast: 100,       // Micro-interactions
  normal: 200,     // Standard transitions
  moderate: 300,   // Modal animations
  slow: 500,       // Complex animations
  verySlow: 1000   // Dramatic effects
};
```

## Gesture Support

### Mobile Gestures
```javascript
// Swipe gestures
gestures = {
  swipeRight: {
    threshold: 100,
    action: () => navigateBack()
  },
  swipeDown: {
    threshold: 150,
    action: () => dismissModal()
  },
  pinchZoom: {
    enabled: false // Disabled in modals
  },
  longPress: {
    duration: 500,
    action: () => showContextMenu()
  }
};
```

## Performance Optimizations

### Debouncing & Throttling
```javascript
// Debounce for text input
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Throttle for scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
```

### Request Animation Frame
```javascript
// Smooth animations
const animateWithRAF = (element, properties, duration) => {
  const start = performance.now();
  
  const animate = (timestamp) => {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing
    const eased = easeOutCubic(progress);
    
    // Update properties
    Object.keys(properties).forEach(prop => {
      const from = properties[prop].from;
      const to = properties[prop].to;
      const value = from + (to - from) * eased;
      element.style[prop] = value;
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};
```

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [User Journey](./user-journey.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)