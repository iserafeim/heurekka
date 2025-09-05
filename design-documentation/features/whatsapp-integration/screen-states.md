---
title: WhatsApp Integration - Screen States
description: Complete screen state specifications for WhatsApp integration feature
feature: whatsapp-integration
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./interactions.md
  - ./implementation.md
  - ../../design-system/components/buttons.md
status: approved
---

# WhatsApp Integration - Screen States

## Overview
Comprehensive documentation of all screen states for WhatsApp integration, including contact buttons, message preview modals, and conversation management interfaces.

## Table of Contents
1. [WhatsApp Contact Button](#whatsapp-contact-button)
2. [Message Preview Modal](#message-preview-modal)
3. [Profile Quick Complete](#profile-quick-complete)
4. [Fallback Interface](#fallback-interface)
5. [Contact Status Indicators](#contact-status-indicators)
6. [Bulk Contact Interface](#bulk-contact-interface)

## WhatsApp Contact Button

### State: Default
**Visual Specifications**:
```css
.whatsapp-cta {
  background: linear-gradient(135deg, #25D366 0%, #20BD5C 100%);
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(37, 211, 102, 0.25);
}

.whatsapp-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whatsapp-text {
  letter-spacing: 0.01em;
}
```

**Component Structure**:
```html
<button class="whatsapp-cta" aria-label="Contactar por WhatsApp">
  <span class="whatsapp-icon">
    <svg><!-- WhatsApp logo --></svg>
  </span>
  <span class="whatsapp-text">Contactar por WhatsApp</span>
</button>
```

### State: Hover (Desktop)
**Visual Changes**:
```css
.whatsapp-cta:hover {
  background: linear-gradient(135deg, #20BD5C 0%, #1BA652 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
}

.whatsapp-cta:hover .whatsapp-icon {
  animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### State: Active/Pressed
**Visual Changes**:
```css
.whatsapp-cta:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(37, 211, 102, 0.2);
  background: linear-gradient(135deg, #1BA652 0%, #179548 100%);
}
```

### State: Loading
**Visual Specifications**:
```css
.whatsapp-cta.loading {
  pointer-events: none;
  opacity: 0.9;
}

.whatsapp-cta.loading .whatsapp-text {
  opacity: 0;
}

.whatsapp-cta.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  margin: auto;
  border: 3px solid transparent;
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s ease infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### State: Disabled
**Visual Specifications**:
```css
.whatsapp-cta:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
  box-shadow: none;
}

.whatsapp-cta:disabled .whatsapp-icon {
  opacity: 0.5;
}
```

### State: Contacted
**Visual Specifications**:
```css
.whatsapp-cta.contacted {
  background: #FFFFFF;
  border: 2px solid #25D366;
  color: #25D366;
}

.whatsapp-cta.contacted::before {
  content: '✓';
  margin-right: 6px;
  font-weight: 700;
}

.whatsapp-cta.contacted .whatsapp-text {
  content: 'Contactado';
}
```

## Message Preview Modal

### State: Default View
**Layout Structure**:
```css
.message-preview-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 560px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #F3F4F6;
}
```

### State: Message Content
**Visual Specifications**:
```css
.message-preview {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.message-bubble {
  background: #E3F2E8;
  border-radius: 18px;
  padding: 16px;
  position: relative;
  margin-left: 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #1F2937;
}

.message-bubble::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 20px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 10px 10px 0;
  border-color: transparent #E3F2E8 transparent transparent;
}

.message-property {
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.message-profile {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.message-profile-item {
  display: flex;
  align-items: center;
  margin: 6px 0;
}

.message-profile-item::before {
  content: '•';
  margin-right: 8px;
  color: #6B7280;
}
```

### State: Editable Mode
**Visual Specifications**:
```css
.message-preview.editable .message-bubble {
  background: #FFFFFF;
  border: 2px solid #25D366;
  cursor: text;
}

.message-editor {
  width: 100%;
  min-height: 300px;
  border: none;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.character-counter {
  display: flex;
  justify-content: flex-end;
  padding: 8px 24px;
  font-size: 13px;
  color: #6B7280;
}

.character-counter.warning {
  color: #F59E0B;
}

.character-counter.error {
  color: #EF4444;
}
```

### State: Modal Actions
**Visual Specifications**:
```css
.modal-actions {
  padding: 20px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background: #FFFFFF;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-whatsapp {
  padding: 10px 24px;
  border-radius: 8px;
  background: #25D366;
  color: #FFFFFF;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-whatsapp:hover {
  background: #20BD5C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
}
```

## Profile Quick Complete

### State: Inline Form
**Layout Structure**:
```css
.profile-quick-complete {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.quick-complete-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.warning-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #F59E0B;
}

.quick-complete-text {
  flex: 1;
}

.quick-complete-title {
  font-weight: 600;
  color: #92400E;
  margin-bottom: 4px;
}

.quick-complete-description {
  font-size: 14px;
  color: #78350F;
}
```

### State: Form Fields
**Visual Specifications**:
```css
.quick-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .quick-form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-label.required::after {
  content: ' *';
  color: #EF4444;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.form-input.error {
  border-color: #EF4444;
}

.form-error {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}
```

## Fallback Interface

### State: Copy Message View
**Layout Structure**:
```css
.fallback-container {
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.fallback-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #6B7280;
}

.fallback-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.fallback-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 20px;
}

.message-copy-box {
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  position: relative;
  text-align: left;
}

.copy-button {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: #6366F1;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: #4F46E5;
}

.copy-button.copied {
  background: #10B981;
}

.copy-button.copied::before {
  content: '✓ ';
}
```

### State: Alternative Methods
**Visual Specifications**:
```css
.alternative-methods {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.alt-method-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alt-method-button:hover {
  border-color: #9CA3AF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.alt-method-icon {
  width: 32px;
  height: 32px;
}

.alt-method-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
```

## Contact Status Indicators

### State: Contact Badge
**Visual Specifications**:
```css
.contact-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-not-contacted {
  background: #F3F4F6;
  color: #6B7280;
}

.status-contacted {
  background: #D1FAE5;
  color: #065F46;
}

.status-in-conversation {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-viewing-scheduled {
  background: #FEF3C7;
  color: #92400E;
}

.status-application-sent {
  background: #EDE9FE;
  color: #5B21B6;
}
```

### State: Timeline View
**Visual Specifications**:
```css
.contact-timeline {
  position: relative;
  padding-left: 32px;
}

.timeline-line {
  position: absolute;
  left: 12px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background: #E5E7EB;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #25D366;
  border: 2px solid #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-content {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
}

.timeline-date {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.timeline-description {
  font-size: 13px;
  color: #4B5563;
}
```

## Bulk Contact Interface

### State: Selection Mode
**Layout Structure**:
```css
.bulk-contact-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #111827;
  color: #FFFFFF;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 900;
}

.bulk-contact-bar.active {
  transform: translateY(0);
}

.bulk-selection-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selection-count {
  font-size: 16px;
  font-weight: 600;
}

.clear-selection {
  font-size: 14px;
  color: #9CA3AF;
  cursor: pointer;
  text-decoration: underline;
}

.bulk-actions {
  display: flex;
  gap: 12px;
}

.bulk-whatsapp-button {
  padding: 10px 20px;
  background: #25D366;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
```

### State: Property Selection
**Visual Specifications**:
```css
.property-card.selectable {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selection-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  background: #FFFFFF;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.property-card.selectable:hover .selection-checkbox {
  opacity: 1;
  transform: scale(1);
}

.property-card.selected {
  border: 2px solid #25D366;
  background: rgba(37, 211, 102, 0.05);
}

.property-card.selected .selection-checkbox {
  opacity: 1;
  transform: scale(1);
  background: #25D366;
  border-color: #25D366;
}

.property-card.selected .selection-checkbox::after {
  content: '✓';
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
}
```

## Responsive Behavior

### Mobile Adaptations (320-767px)
```css
@media (max-width: 767px) {
  .whatsapp-cta {
    width: 100%;
    justify-content: center;
    position: sticky;
    bottom: 20px;
    z-index: 100;
  }

  .message-preview-modal {
    width: 100%;
    height: 100%;
    max-width: none;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: none;
  }

  .modal-header {
    position: sticky;
    top: 0;
    background: #FFFFFF;
    z-index: 10;
  }

  .message-preview {
    padding-bottom: 100px;
  }

  .modal-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .bulk-contact-bar {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### Tablet Adaptations (768-1023px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .whatsapp-cta {
    padding: 12px 24px;
    font-size: 15px;
  }

  .message-preview-modal {
    max-width: 480px;
  }

  .quick-form-grid {
    grid-template-columns: 1fr;
  }
}
```

### Desktop Optimizations (1024px+)
```css
@media (min-width: 1024px) {
  .whatsapp-cta {
    position: relative;
  }

  .whatsapp-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #111827;
    color: #FFFFFF;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .whatsapp-cta:hover .whatsapp-tooltip {
    opacity: 1;
  }

  .bulk-selection-mode {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
```

## Accessibility States

### Focus States
```css
.whatsapp-cta:focus-visible {
  outline: 3px solid #25D366;
  outline-offset: 2px;
}

.form-input:focus {
  outline: 2px solid #25D366;
  outline-offset: 0;
}

.modal-close:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 50%;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .whatsapp-cta {
    border: 2px solid currentColor;
  }

  .message-bubble {
    border: 1px solid #000000;
  }

  .form-input {
    border-width: 2px;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .whatsapp-cta,
  .modal-actions button,
  .alt-method-button {
    transition: none;
  }

  .message-preview-modal {
    animation: none;
  }

  .whatsapp-icon {
    animation: none !important;
  }
}
```

## Related Documentation
- [User Journey Documentation](./user-journey.md)
- [Interaction Specifications](./interactions.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)