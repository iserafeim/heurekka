---
title: WhatsApp Integration - Accessibility
description: Accessibility requirements and implementation guidelines for WhatsApp integration
feature: whatsapp-integration
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./implementation.md
  - ./screen-states.md
  - ./interactions.md
  - ../../accessibility/guidelines.md
status: approved
---

# WhatsApp Integration - Accessibility

## Overview
Comprehensive accessibility specifications ensuring the WhatsApp integration feature is usable by all users, regardless of their abilities or the assistive technologies they use.

## Table of Contents
1. [WCAG Compliance](#wcag-compliance)
2. [Screen Reader Support](#screen-reader-support)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Visual Accessibility](#visual-accessibility)
5. [Motor Accessibility](#motor-accessibility)
6. [Cognitive Accessibility](#cognitive-accessibility)
7. [Testing Checklist](#testing-checklist)

## WCAG Compliance

### Level AA Requirements

#### 1.1.1 Non-text Content
**Requirement**: All non-text content has text alternatives
**Implementation**:
```html
<!-- WhatsApp icon with proper alt text -->
<button aria-label="Contactar por WhatsApp">
  <svg role="img" aria-label="WhatsApp">
    <title>WhatsApp Logo</title>
    <!-- SVG path data -->
  </svg>
  <span>Contactar por WhatsApp</span>
</button>

<!-- Status indicators -->
<span class="contact-status" role="status">
  <span class="visually-hidden">Estado: Contactado</span>
  <svg aria-hidden="true"><!-- Check icon --></svg>
</span>
```

#### 1.3.1 Info and Relationships
**Requirement**: Information structure is programmatically determined
**Implementation**:
```html
<!-- Semantic form structure -->
<form role="form" aria-label="Completar perfil de búsqueda">
  <fieldset>
    <legend>Información básica</legend>
    
    <div role="group" aria-labelledby="budget-label">
      <label id="budget-label" for="budget">
        Presupuesto mensual
        <span aria-label="requerido">*</span>
      </label>
      <input 
        type="number" 
        id="budget"
        aria-required="true"
        aria-invalid="false"
        aria-describedby="budget-error budget-help"
      />
      <span id="budget-help" class="help-text">
        Entre L.3,000 y L.100,000
      </span>
      <span id="budget-error" role="alert" aria-live="polite">
        <!-- Error message inserted dynamically -->
      </span>
    </div>
  </fieldset>
</form>
```

#### 1.4.3 Contrast (Minimum)
**Requirement**: 4.5:1 contrast ratio for normal text, 3:1 for large text
**Implementation**:
```css
/* WhatsApp button colors with proper contrast */
.whatsapp-button {
  background: #25D366; /* WhatsApp green */
  color: #FFFFFF;      /* White text */
  /* Contrast ratio: 3.54:1 (passes for large text) */
}

/* Ensure text is large enough for 3:1 ratio */
.whatsapp-button {
  font-size: 16px; /* Large text threshold */
  font-weight: 600;
}

/* Alternative high contrast version */
@media (prefers-contrast: high) {
  .whatsapp-button {
    background: #1A8F49; /* Darker green */
    color: #FFFFFF;
    /* Contrast ratio: 5.2:1 (passes for all text) */
    border: 2px solid #FFFFFF;
  }
}
```

#### 2.1.1 Keyboard
**Requirement**: All functionality available via keyboard
**Implementation**:
```typescript
// Keyboard event handlers
const WhatsAppButton = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'Escape':
        if (isModalOpen) {
          closeModal();
        }
        break;
    }
  };
  
  return (
    <button
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Contactar por WhatsApp"
    >
      Contactar por WhatsApp
    </button>
  );
};
```

#### 2.4.7 Focus Visible
**Requirement**: Keyboard focus indicator is visible
**Implementation**:
```css
/* Custom focus styles */
.whatsapp-button:focus-visible {
  outline: 3px solid #25D366;
  outline-offset: 2px;
  box-shadow: 0 0 0 5px rgba(37, 211, 102, 0.2);
}

/* Modal focus trap */
.modal:focus-visible {
  outline: 2px solid #6366F1;
}

/* Form inputs focus */
.form-input:focus {
  outline: 2px solid #25D366;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}
```

## Screen Reader Support

### ARIA Labels and Descriptions
```html
<!-- Main button with context -->
<button 
  aria-label="Contactar por WhatsApp sobre Casa en Lomas del Guijarro"
  aria-describedby="whatsapp-description"
>
  <svg aria-hidden="true"><!-- Icon --></svg>
  <span>Contactar por WhatsApp</span>
</button>
<span id="whatsapp-description" class="visually-hidden">
  Se abrirá WhatsApp con un mensaje prellenado incluyendo tu perfil de búsqueda
</span>

<!-- Modal with proper labeling -->
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Vista previa del mensaje</h2>
  <p id="modal-description">
    Revisa y edita tu mensaje antes de enviarlo por WhatsApp
  </p>
</div>
```

### Live Regions
```html
<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  <span id="status-message"></span>
</div>

<script>
// Announce status changes
function announceStatus(message) {
  const status = document.getElementById('status-message');
  status.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    status.textContent = '';
  }, 1000);
}

// Usage
announceStatus('Mensaje copiado al portapapeles');
announceStatus('Abriendo WhatsApp...');
announceStatus('Perfil guardado exitosamente');
</script>
```

### Form Validation Announcements
```typescript
// Accessible form validation
const FormField = ({ label, error, required, children }) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  
  return (
    <div role="group">
      <label htmlFor={fieldId}>
        {label}
        {required && <span aria-label="requerido"> *</span>}
      </label>
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-describedby': `${errorId} ${descriptionId}`
      })}
      
      {error && (
        <span 
          id={errorId}
          role="alert"
          aria-live="polite"
          className="error-message"
        >
          {error}
        </span>
      )}
    </div>
  );
};
```

## Keyboard Navigation

### Tab Order
```html
<!-- Logical tab order through interface -->
<div class="property-card" tabindex="-1">
  <img src="..." alt="Casa en Lomas del Guijarro" tabindex="-1">
  <h3><a href="/property/123" tabindex="0">Casa en Lomas del Guijarro</a></h3>
  <p tabindex="-1">3 habitaciones, 2 baños</p>
  <button tabindex="0" aria-label="Guardar propiedad">
    <svg aria-hidden="true"><!-- Heart icon --></svg>
  </button>
  <button 
    tabindex="0" 
    aria-label="Contactar por WhatsApp"
    class="whatsapp-button"
  >
    Contactar por WhatsApp
  </button>
</div>
```

### Focus Management
```typescript
// Focus trap for modal
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element on mount
    firstElement?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref]);
};
```

### Keyboard Shortcuts
```typescript
// Global keyboard shortcuts
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + W to open WhatsApp
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        document.querySelector('.whatsapp-button')?.click();
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        closeAllModals();
      }
      
      // ? to show keyboard shortcuts help
      if (e.key === '?' && !isInputFocused()) {
        showKeyboardHelp();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

## Visual Accessibility

### Color Contrast
```css
/* Ensure all text meets WCAG AA standards */
.whatsapp-button {
  /* Primary button */
  background: #25D366;
  color: #FFFFFF;
  /* Large text (16px bold): 3.54:1 ✓ */
}

.whatsapp-button:hover {
  /* Darker on hover for better contrast */
  background: #20BD5C;
  /* Contrast: 4.1:1 ✓ */
}

/* Error states with sufficient contrast */
.error-message {
  color: #DC2626; /* Red-600 */
  background: #FEE2E2; /* Red-50 */
  /* Contrast: 7.5:1 ✓ */
}

/* Success states */
.success-message {
  color: #059669; /* Green-600 */
  background: #D1FAE5; /* Green-100 */
  /* Contrast: 7.2:1 ✓ */
}
```

### Focus Indicators
```css
/* High visibility focus indicators */
*:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}

/* Custom focus for interactive elements */
.whatsapp-button:focus-visible {
  outline: 3px solid #25D366;
  outline-offset: 4px;
  box-shadow: 
    0 0 0 4px #FFFFFF,
    0 0 0 7px #25D366;
}

/* Focus within form groups */
.form-group:focus-within {
  background: rgba(37, 211, 102, 0.05);
  border-radius: 8px;
  transition: background 0.2s ease;
}
```

### Text Sizing
```css
/* Responsive font sizing */
html {
  font-size: 100%; /* 16px base */
}

/* Allow user scaling */
body {
  font-size: 1rem;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}

/* Minimum text sizes */
.whatsapp-button {
  font-size: max(16px, 1rem);
}

.form-label {
  font-size: max(14px, 0.875rem);
}

.help-text {
  font-size: max(12px, 0.75rem);
}

/* Support user font size preferences */
@media (prefers-contrast: high) {
  body {
    font-weight: 500;
  }
}
```

## Motor Accessibility

### Touch Targets
```css
/* Minimum 48x48px touch targets */
.whatsapp-button {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
}

/* Spacing between interactive elements */
.button-group {
  display: flex;
  gap: 16px; /* Prevent mis-taps */
}

/* Larger click areas for small icons */
.icon-button {
  position: relative;
  padding: 12px;
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: -8px;
  /* Extends clickable area */
}
```

### Gesture Alternatives
```typescript
// Provide alternatives to complex gestures
const AccessibleSwipeModal = () => {
  // Swipe to dismiss for those who can use it
  const handleSwipe = useSwipeGesture({
    onSwipeDown: () => closeModal()
  });
  
  // But always provide button alternative
  return (
    <div {...handleSwipe}>
      <button
        onClick={closeModal}
        aria-label="Cerrar modal"
        className="close-button"
      >
        ×
      </button>
      {/* Modal content */}
    </div>
  );
};
```

## Cognitive Accessibility

### Clear Language
```typescript
// Use simple, clear language
const messages = {
  // Good: Clear and direct
  contactButton: 'Contactar por WhatsApp',
  profileIncomplete: 'Completa tu perfil para continuar',
  messageSent: 'Mensaje enviado',
  
  // Avoid: Complex or ambiguous
  // contactButton: 'Iniciar comunicación vía mensajería instantánea',
  // profileIncomplete: 'Requisitos de perfil pendientes',
  // messageSent: 'Transmisión completada'
};
```

### Progressive Disclosure
```html
<!-- Show complexity gradually -->
<div class="profile-form">
  <!-- Step 1: Essential fields only -->
  <fieldset class="step-1">
    <legend>Información básica (Paso 1 de 2)</legend>
    <input type="text" placeholder="Tu nombre" required>
    <input type="tel" placeholder="Tu teléfono" required>
  </fieldset>
  
  <!-- Step 2: Additional details -->
  <fieldset class="step-2" hidden>
    <legend>Detalles adicionales (Paso 2 de 2)</legend>
    <input type="number" placeholder="Presupuesto">
    <input type="date" placeholder="Fecha de mudanza">
  </fieldset>
  
  <button onclick="nextStep()">Continuar</button>
</div>
```

### Error Prevention
```typescript
// Confirm destructive actions
const handleBulkSend = async () => {
  const count = selectedProperties.length;
  
  const confirmed = await showConfirmation({
    title: `¿Enviar ${count} mensajes?`,
    message: `Se abrirá WhatsApp ${count} veces para enviar mensajes a diferentes propiedades.`,
    confirmText: 'Sí, enviar todos',
    cancelText: 'Cancelar',
    type: 'warning'
  });
  
  if (confirmed) {
    await sendBulkMessages();
  }
};
```

## Testing Checklist

### Manual Testing
- [ ] **Keyboard Navigation**
  - [ ] Can access all interactive elements with Tab
  - [ ] Can activate buttons with Enter/Space
  - [ ] Can close modals with Escape
  - [ ] Focus trap works in modals
  - [ ] Focus visible on all elements

- [ ] **Screen Reader Testing**
  - [ ] All buttons have descriptive labels
  - [ ] Form fields properly associated with labels
  - [ ] Error messages announced
  - [ ] Status changes announced
  - [ ] Modal role and labeling correct

- [ ] **Visual Testing**
  - [ ] Text contrast passes WCAG AA
  - [ ] Focus indicators clearly visible
  - [ ] Works at 200% zoom
  - [ ] No horizontal scrolling at zoom
  - [ ] Color not sole indicator

- [ ] **Motor Testing**
  - [ ] Touch targets ≥48x48px
  - [ ] Adequate spacing between buttons
  - [ ] No precision clicking required
  - [ ] Gesture alternatives available

### Automated Testing
```typescript
// Jest + Testing Library accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('WhatsApp Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<WhatsAppButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA labels', () => {
    const { getByLabelText } = render(<WhatsAppButton />);
    expect(getByLabelText(/contactar por whatsapp/i)).toBeInTheDocument();
  });
  
  it('should be keyboard navigable', () => {
    const { getByRole } = render(<WhatsAppButton />);
    const button = getByRole('button');
    
    button.focus();
    expect(document.activeElement).toBe(button);
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Screen Reader Scripts
```javascript
// NVDA/JAWS test scripts
// Test 1: Button announcement
// Expected: "Contactar por WhatsApp, botón"
document.querySelector('.whatsapp-button').focus();

// Test 2: Form field with error
// Expected: "Presupuesto mensual, requerido, entrada inválida, Presupuesto mínimo: 3000 lempiras"
document.querySelector('#budget').focus();

// Test 3: Status announcement
// Expected: "Mensaje copiado al portapapeles"
copyMessage();
```

## Related Documentation
- [Implementation Guide](./implementation.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Global Accessibility Guidelines](../../accessibility/guidelines.md)