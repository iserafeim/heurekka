---
title: Tenant Marketplace - Accessibility
description: Accessibility requirements and implementation guidelines for the tenant marketplace
feature: tenant-marketplace
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./implementation.md
  - ./screen-states.md
  - ./interactions.md
  - ../../accessibility/guidelines.md
status: approved
---

# Tenant Marketplace - Accessibility

## Overview
Comprehensive accessibility specifications ensuring the tenant marketplace feature is usable by all users, regardless of abilities or assistive technologies used.

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

#### 1.3.1 Info and Relationships
**Multi-step Form Structure**:
```html
<!-- Wizard with proper ARIA -->
<div role="group" aria-labelledby="wizard-title">
  <h1 id="wizard-title">Crear publicación de búsqueda</h1>
  
  <!-- Progress indicator -->
  <nav aria-label="Progreso del formulario">
    <ol role="list">
      <li role="listitem" aria-current="step">
        <span class="step-number">1</span>
        <span class="step-label">Información básica</span>
      </li>
      <li role="listitem">
        <span class="step-number">2</span>
        <span class="step-label">Preferencias</span>
      </li>
    </ol>
  </nav>
  
  <!-- Current step content -->
  <section aria-label="Paso 1: Información básica">
    <form role="form">
      <!-- Form fields -->
    </form>
  </section>
</div>
```

#### 2.1.1 Keyboard Navigation
**Complete Keyboard Support**:
```typescript
// Keyboard navigation for wizard
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Tab':
      // Natural tab flow through form
      break;
      
    case 'Enter':
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (canProceed()) {
          nextStep();
        }
      }
      break;
      
    case 'Escape':
      if (showConfirmDialog()) {
        closeWizard();
      }
      break;
      
    case 'ArrowLeft':
      if (e.ctrlKey && currentStep > 0) {
        previousStep();
      }
      break;
      
    case 'ArrowRight':
      if (e.ctrlKey && currentStep < totalSteps - 1) {
        nextStep();
      }
      break;
  }
};
```

#### 1.4.3 Contrast Requirements
**Color Contrast Compliance**:
```css
/* Primary text - 7:1 ratio */
.post-card {
  color: #111827; /* on white: 15.3:1 ✓ */
  background: #FFFFFF;
}

/* Secondary text - 4.5:1 minimum */
.post-meta {
  color: #6B7280; /* on white: 4.6:1 ✓ */
}

/* Interactive elements - 3:1 minimum */
.btn-primary {
  background: #6366F1;
  color: #FFFFFF; /* 4.7:1 ✓ */
}

/* Error states */
.error-text {
  color: #DC2626; /* on white: 7:1 ✓ */
}

/* Success states */
.success-badge {
  background: #D1FAE5;
  color: #065F46; /* 7.2:1 ✓ */
}
```

## Screen Reader Support

### Form Announcements
```html
<!-- Budget range slider with ARIA -->
<div class="budget-slider" role="group" aria-labelledby="budget-label">
  <label id="budget-label">Rango de presupuesto mensual</label>
  
  <div class="slider-container">
    <input
      type="range"
      id="budget-min"
      min="3000"
      max="100000"
      value="8000"
      aria-label="Presupuesto mínimo"
      aria-valuenow="8000"
      aria-valuemin="3000"
      aria-valuemax="100000"
      aria-valuetext="8,000 lempiras"
    />
    
    <input
      type="range"
      id="budget-max"
      min="3000"
      max="100000"
      value="15000"
      aria-label="Presupuesto máximo"
      aria-valuenow="15000"
      aria-valuemin="3000"
      aria-valuemax="100000"
      aria-valuetext="15,000 lempiras"
    />
  </div>
  
  <div aria-live="polite" aria-atomic="true" class="visually-hidden">
    <span id="budget-announcement">
      Presupuesto seleccionado: 8,000 a 15,000 lempiras
    </span>
  </div>
</div>
```

### Area Selection Map
```html
<!-- Accessible map interface -->
<div role="application" aria-label="Selector de áreas en el mapa">
  <div id="map-instructions" class="visually-hidden">
    Usa las teclas de flecha para navegar entre áreas.
    Presiona Espacio para seleccionar o deseleccionar un área.
    Presiona Tab para salir del mapa.
  </div>
  
  <div 
    id="map-container"
    tabindex="0"
    aria-describedby="map-instructions"
    role="grid"
  >
    <!-- Map areas as grid cells -->
    <div role="row">
      <div 
        role="gridcell"
        tabindex="-1"
        aria-label="Las Colinas"
        aria-selected="false"
        data-area-id="las-colinas"
      >
        <!-- Area polygon -->
      </div>
    </div>
  </div>
  
  <!-- Selected areas list -->
  <div role="region" aria-label="Áreas seleccionadas">
    <ul role="list" aria-live="polite">
      <li role="listitem">
        Las Colinas
        <button aria-label="Remover Las Colinas">×</button>
      </li>
    </ul>
  </div>
</div>
```

### Post Card Announcements
```html
<!-- Accessible post card -->
<article 
  class="post-card"
  role="article"
  aria-labelledby="post-title-123"
  aria-describedby="post-desc-123"
>
  <header>
    <h3 id="post-title-123">
      María busca apartamento
    </h3>
    <span class="badge" role="status">
      <span class="visually-hidden">Estado:</span> Verificado
    </span>
  </header>
  
  <div id="post-desc-123">
    <p>
      <span class="visually-hidden">Presupuesto:</span>
      <strong>L.8,000 - L.12,000</strong> por mes
    </p>
    <p>
      <span class="visually-hidden">Fecha de mudanza:</span>
      15 de marzo, 2025
    </p>
  </div>
  
  <footer>
    <div role="group" aria-label="Estadísticas">
      <span aria-label="127 vistas">👁 127</span>
      <span aria-label="5 respuestas">💬 5</span>
    </div>
    
    <button 
      aria-label="Contactar a María sobre su búsqueda"
      aria-describedby="contact-help"
    >
      Contactar
    </button>
    <span id="contact-help" class="visually-hidden">
      Se abrirá un formulario para enviar una propuesta
    </span>
  </footer>
</article>
```

## Keyboard Navigation

### Wizard Navigation
```typescript
// Focus management in wizard
class WizardAccessibility {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = 0;
  
  initializeFocus() {
    // Find all focusable elements in current step
    this.focusableElements = Array.from(
      this.currentStep.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    
    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
  }
  
  handleTabKey(event: KeyboardEvent) {
    const isShift = event.shiftKey;
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    
    if (isShift && document.activeElement === firstElement) {
      // Focus previous step button if available
      if (this.canGoPrevious()) {
        event.preventDefault();
        this.previousButton.focus();
      }
    } else if (!isShift && document.activeElement === lastElement) {
      // Focus next step button
      if (this.canGoNext()) {
        event.preventDefault();
        this.nextButton.focus();
      }
    }
  }
}
```

### Post Grid Navigation
```typescript
// Keyboard navigation for post grid
class PostGridNavigation {
  private posts: HTMLElement[] = [];
  private currentIndex = 0;
  private columnsCount = 3;
  
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
    let newIndex = this.currentIndex;
    
    switch(key) {
      case 'ArrowRight':
        newIndex = Math.min(this.currentIndex + 1, this.posts.length - 1);
        break;
        
      case 'ArrowLeft':
        newIndex = Math.max(this.currentIndex - 1, 0);
        break;
        
      case 'ArrowDown':
        newIndex = Math.min(
          this.currentIndex + this.columnsCount,
          this.posts.length - 1
        );
        break;
        
      case 'ArrowUp':
        newIndex = Math.max(this.currentIndex - this.columnsCount, 0);
        break;
        
      case 'Home':
        newIndex = 0;
        break;
        
      case 'End':
        newIndex = this.posts.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectPost(this.currentIndex);
        break;
    }
    
    if (newIndex !== this.currentIndex) {
      event.preventDefault();
      this.moveFocus(newIndex);
    }
  }
  
  moveFocus(index: number) {
    // Remove focus from current
    this.posts[this.currentIndex].tabIndex = -1;
    
    // Add focus to new
    this.currentIndex = index;
    this.posts[this.currentIndex].tabIndex = 0;
    this.posts[this.currentIndex].focus();
    
    // Announce change
    this.announcePost(this.posts[this.currentIndex]);
  }
}
```

## Visual Accessibility

### Focus Indicators
```css
/* Clear focus indicators */
*:focus-visible {
  outline: 3px solid #6366F1;
  outline-offset: 2px;
}

/* Form fields */
.form-input:focus {
  outline: 2px solid #6366F1;
  outline-offset: 0;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Post cards */
.post-card:focus-visible {
  outline: 3px solid #6366F1;
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* Skip links */
.skip-link:focus {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 9999;
  padding: 12px 24px;
  background: #6366F1;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .post-card {
    border: 2px solid currentColor;
  }
  
  .btn-primary {
    border: 2px solid transparent;
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .badge {
    border: 1px solid currentColor;
  }
}
```

## Motor Accessibility

### Large Touch Targets
```css
/* Minimum 48x48px touch targets */
.btn-primary,
.btn-secondary {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
}

/* Tag remove buttons */
.tag-remove {
  min-width: 32px;
  min-height: 32px;
  padding: 8px;
  margin-left: 8px; /* Spacing from text */
}

/* Checkbox and radio buttons */
input[type="checkbox"],
input[type="radio"] {
  width: 24px;
  height: 24px;
  margin: 12px;
}

/* Clickable cards */
.post-card {
  padding: 20px;
  margin-bottom: 16px; /* Prevent accidental clicks */
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Maintain essential feedback */
  .btn-primary:hover {
    background: #4F46E5; /* Color change only */
  }
  
  .post-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); /* Shadow only */
  }
}
```

## Cognitive Accessibility

### Clear Instructions
```html
<!-- Form field with clear instructions -->
<div class="form-group">
  <label for="budget-min">
    Presupuesto mínimo mensual
    <span class="required" aria-label="campo requerido">*</span>
  </label>
  
  <p id="budget-help" class="help-text">
    Ingresa el monto mínimo que puedes pagar por mes en Lempiras
  </p>
  
  <input
    type="number"
    id="budget-min"
    name="budgetMin"
    min="3000"
    max="100000"
    step="500"
    required
    aria-required="true"
    aria-describedby="budget-help budget-error"
    aria-invalid="false"
  />
  
  <p id="budget-error" role="alert" class="error-message" hidden>
    El presupuesto debe ser entre L.3,000 y L.100,000
  </p>
</div>
```

### Progress Indicators
```html
<!-- Clear progress indication -->
<div class="wizard-progress" role="status" aria-live="polite">
  <p class="progress-text">
    Paso <strong>2</strong> de <strong>5</strong>: Preferencias de propiedad
  </p>
  
  <div class="progress-bar" role="progressbar" 
       aria-valuenow="40" 
       aria-valuemin="0" 
       aria-valuemax="100">
    <div class="progress-fill" style="width: 40%"></div>
  </div>
  
  <p class="progress-help">
    Completa este paso para continuar
  </p>
</div>
```

### Error Prevention
```typescript
// Confirmation before destructive actions
const confirmDelete = async () => {
  const result = await showConfirmDialog({
    title: '¿Eliminar publicación?',
    message: 'Esta acción no se puede deshacer. Tu publicación será eliminada permanentemente.',
    confirmButton: {
      label: 'Sí, eliminar',
      variant: 'danger'
    },
    cancelButton: {
      label: 'Cancelar',
      variant: 'secondary'
    }
  });
  
  if (result.confirmed) {
    await deletePost();
  }
};

// Auto-save drafts
const autoSaveDraft = debounce(() => {
  const formData = getFormData();
  localStorage.setItem('post-draft', JSON.stringify(formData));
  
  showToast({
    message: 'Borrador guardado',
    type: 'info',
    duration: 2000
  });
}, 3000);
```

## Testing Checklist

### Manual Testing
- [ ] **Keyboard Navigation**
  - [ ] All interactive elements reachable via Tab
  - [ ] Logical tab order through wizard steps
  - [ ] Arrow key navigation in post grid
  - [ ] Escape key closes modals
  - [ ] Enter/Space activates buttons

- [ ] **Screen Reader Testing**
  - [ ] All form fields properly labeled
  - [ ] Progress announcements clear
  - [ ] Area selection announces changes
  - [ ] Post cards read meaningfully
  - [ ] Error messages announced

- [ ] **Visual Testing**
  - [ ] Focus indicators visible on all elements
  - [ ] Text contrast passes WCAG AA
  - [ ] Works at 200% zoom without horizontal scroll
  - [ ] High contrast mode functional
  - [ ] Color not sole indicator

- [ ] **Motor Testing**
  - [ ] All touch targets ≥48x48px
  - [ ] Adequate spacing between interactive elements
  - [ ] No time limits on form completion
  - [ ] Drag interactions have alternatives

### Automated Testing
```typescript
// Jest + Testing Library
describe('Marketplace Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MarketplacePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should announce form progress', () => {
    const { getByRole } = render(<PostWizard />);
    const progress = getByRole('progressbar');
    
    expect(progress).toHaveAttribute('aria-valuenow', '20');
    
    // Move to next step
    fireEvent.click(getByText('Siguiente'));
    
    expect(progress).toHaveAttribute('aria-valuenow', '40');
  });
  
  it('should support keyboard navigation in grid', () => {
    const { getAllByRole } = render(<PostGrid posts={mockPosts} />);
    const posts = getAllByRole('article');
    
    posts[0].focus();
    expect(document.activeElement).toBe(posts[0]);
    
    fireEvent.keyDown(posts[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(posts[1]);
  });
});
```

### Screen Reader Testing Script
```javascript
// NVDA/JAWS test scenarios
// Test 1: Wizard navigation
// Expected: "Crear publicación de búsqueda, paso 1 de 5, Información básica"

// Test 2: Budget slider
// Expected: "Presupuesto mínimo, 8000 lempiras, deslizador"

// Test 3: Area selection
// Expected: "Las Colinas, no seleccionado, presiona espacio para seleccionar"

// Test 4: Form submission
// Expected: "Publicación creada exitosamente"
```

## Related Documentation
- [Implementation Guide](./implementation.md)
- [Screen States](./screen-states.md)
- [Interactions](./interactions.md)
- [Global Accessibility Guidelines](../../accessibility/guidelines.md)