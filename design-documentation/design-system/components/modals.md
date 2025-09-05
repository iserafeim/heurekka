---
title: Modal & Dialog Components
description: Complete specifications for modal windows, dialogs, and overlays
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ../style-guide.md
  - ../tokens/animations.md
  - ./buttons.md
status: approved
---

# Modal & Dialog Components

## Overview
Comprehensive specifications for modal windows, dialogs, alerts, and overlay components that provide focused user interactions.

## Table of Contents
1. [Standard Modal](#standard-modal)
2. [Dialog Variants](#dialog-variants)
3. [Alert Dialogs](#alert-dialogs)
4. [Bottom Sheets](#bottom-sheets)
5. [Lightbox](#lightbox)
6. [Toast Notifications](#toast-notifications)
7. [Popovers](#popovers)

## Standard Modal

### Full Modal
**Component**: Modal
**Sizes**: Small (400px), Medium (600px), Large (800px), Full-width
**States**: Closed, Opening, Open, Closing

**Visual Specifications**:
```css
/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-backdrop.open {
  opacity: 1;
}

/* Modal container */
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 2001;
  pointer-events: none;
}

.modal-container.open {
  pointer-events: auto;
}

/* Modal content */
.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
}

.modal.open {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Modal sizes */
.modal.small { width: 400px; }
.modal.medium { width: 600px; }
.modal.large { width: 800px; }
.modal.full { 
  width: calc(100vw - 48px);
  max-width: 1200px;
}

/* Modal header */
.modal-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #F3F4F6;
  color: #1A1A1A;
}

/* Modal body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

/* Modal footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.modal-footer.left-aligned {
  justify-content: flex-start;
}

.modal-footer.space-between {
  justify-content: space-between;
}

/* Animations */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-50px);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .modal-container {
    padding: 0;
    align-items: flex-end;
  }
  
  .modal {
    width: 100%;
    max-height: calc(100vh - 20px);
    border-radius: 16px 16px 0 0;
    margin-top: 20px;
  }
  
  .modal.open {
    animation: slideUp 0.3s ease;
  }
}
```

**Interaction Specifications**:
```javascript
// Modal opening
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = modal.querySelector('.modal-backdrop');
  const content = modal.querySelector('.modal');
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  // Show modal
  modal.classList.add('open');
  backdrop.classList.add('open');
  
  // Animate content
  setTimeout(() => {
    content.classList.add('open');
  }, 10);
  
  // Focus management
  const firstFocusable = modal.querySelector('button, input, select, textarea');
  if (firstFocusable) firstFocusable.focus();
  
  // Trap focus
  trapFocus(modal);
}

// Modal closing
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  const content = modal.querySelector('.modal');
  
  // Animate out
  content.classList.remove('open');
  
  setTimeout(() => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    
    // Return focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }, 300);
}

// ESC key handling
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModal = document.querySelector('.modal.open');
    if (openModal) closeModal(openModal.id);
  }
});

// Click outside to close
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) {
    closeModal(modalId);
  }
});
```

## Dialog Variants

### Confirmation Dialog
**Component**: ConfirmDialog
**Types**: Confirm, Warning, Danger
**States**: Default, Processing

**Visual Specifications**:
```css
.confirm-dialog {
  max-width: 440px;
  text-align: center;
}

.confirm-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.confirm-icon.info {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.confirm-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.confirm-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.confirm-message {
  font-size: 15px;
  line-height: 1.6;
  color: #6B7280;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-button {
  min-width: 100px;
}
```

### Form Dialog
**Component**: FormDialog
**Types**: Input, Multi-step, Complex
**States**: Default, Validating, Submitting

**Visual Specifications**:
```css
.form-dialog {
  width: 500px;
}

.form-dialog-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  outline: none;
}

.form-helper {
  font-size: 13px;
  color: #6B7280;
  margin-top: 6px;
}

.form-error {
  font-size: 13px;
  color: #EF4444;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Multi-step form */
.form-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 0 24px;
}

.form-step {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9CA3AF;
}

.form-step.active {
  color: #6366F1;
}

.form-step.completed {
  color: #10B981;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: currentColor;
  opacity: 0.3;
}
```

## Alert Dialogs

### System Alerts
**Component**: AlertDialog
**Types**: Success, Info, Warning, Error
**States**: Showing, Hiding

**Visual Specifications**:
```css
.alert-dialog {
  position: fixed;
  top: 24px;
  right: 24px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 3000;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-content {
  padding: 16px;
  display: flex;
  gap: 12px;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-icon.success { color: #10B981; }
.alert-icon.info { color: #6366F1; }
.alert-icon.warning { color: #F59E0B; }
.alert-icon.error { color: #EF4444; }

.alert-body {
  flex: 1;
}

.alert-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
}

.alert-close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  cursor: pointer;
  transition: color 0.2s ease;
}

.alert-close:hover {
  color: #1A1A1A;
}

/* Alert with actions */
.alert-actions {
  padding: 12px 16px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.alert-action {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

## Bottom Sheets

### Mobile Bottom Sheet
**Component**: BottomSheet
**Heights**: Auto, Half, Full
**States**: Closed, Opening, Open, Closing

**Visual Specifications**:
```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 2000;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.bottom-sheet.open {
  transform: translateY(0);
}

.bottom-sheet-handle {
  padding: 12px;
  display: flex;
  justify-content: center;
}

.bottom-sheet-bar {
  width: 48px;
  height: 4px;
  background: #D1D5DB;
  border-radius: 2px;
}

.bottom-sheet-header {
  padding: 0 20px 16px;
  border-bottom: 1px solid #E5E7EB;
}

.bottom-sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.bottom-sheet-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.bottom-sheet-footer {
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
}

/* Swipe to close */
.bottom-sheet.dragging {
  transition: none;
}

/* Height variants */
.bottom-sheet.auto {
  height: auto;
  max-height: calc(100vh - 40px);
}

.bottom-sheet.half {
  height: 50vh;
}

.bottom-sheet.full {
  height: calc(100vh - 40px);
}
```

**Touch Interactions**:
```javascript
// Swipe to close bottom sheet
let startY = 0;
let currentY = 0;
let isDragging = false;

bottomSheet.addEventListener('touchstart', (e) => {
  if (e.target.closest('.bottom-sheet-handle')) {
    startY = e.touches[0].clientY;
    isDragging = true;
    bottomSheet.classList.add('dragging');
  }
});

bottomSheet.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  
  currentY = e.touches[0].clientY;
  const translateY = Math.max(0, currentY - startY);
  bottomSheet.style.transform = `translateY(${translateY}px)`;
});

bottomSheet.addEventListener('touchend', () => {
  if (!isDragging) return;
  
  isDragging = false;
  bottomSheet.classList.remove('dragging');
  
  const translateY = currentY - startY;
  if (translateY > 100) {
    closeBottomSheet();
  } else {
    bottomSheet.style.transform = 'translateY(0)';
  }
});
```

## Lightbox

### Image Lightbox
**Component**: Lightbox
**Features**: Zoom, Pan, Gallery
**States**: Closed, Loading, Open

**Visual Specifications**:
```css
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.lightbox.open {
  opacity: 1;
  visibility: visible;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s ease;
}

.lightbox.open .lightbox-image {
  opacity: 1;
  transform: scale(1);
}

.lightbox-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
}

.lightbox-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav.prev { left: 20px; }
.lightbox-nav.next { right: 20px; }

.lightbox-thumbnails {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
}

.lightbox-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.lightbox-thumbnail:hover,
.lightbox-thumbnail.active {
  opacity: 1;
}

.lightbox-caption {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  color: white;
  text-align: center;
  font-size: 14px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
}
```

## Toast Notifications

### Toast Messages
**Component**: Toast
**Positions**: Top-right, Top-center, Bottom-center, Bottom-right
**Types**: Success, Info, Warning, Error

**Visual Specifications**:
```css
.toast-container {
  position: fixed;
  z-index: 3000;
  pointer-events: none;
}

.toast-container.top-right {
  top: 24px;
  right: 24px;
}

.toast-container.top-center {
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-center {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-right {
  bottom: 24px;
  right: 24px;
}

.toast {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  animation: toastSlideIn 0.3s ease;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast.removing {
  animation: toastSlideOut 0.3s ease;
}

@keyframes toastSlideOut {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast.success { border-left: 4px solid #10B981; }
.toast.info { border-left: 4px solid #6366F1; }
.toast.warning { border-left: 4px solid #F59E0B; }
.toast.error { border-left: 4px solid #EF4444; }

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 2px;
}

.toast-message {
  font-size: 13px;
  color: #6B7280;
}

.toast-close {
  width: 16px;
  height: 16px;
  color: #9CA3AF;
  cursor: pointer;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #1A1A1A;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: progress 5s linear;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}
```

## Popovers

### Contextual Popovers
**Component**: Popover
**Triggers**: Click, Hover, Focus
**Positions**: Top, Right, Bottom, Left

**Visual Specifications**:
```css
.popover {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 12px;
  z-index: 1500;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.95);
  transition: all 0.2s ease;
}

.popover.open {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}

.popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  transform: rotate(45deg);
}

.popover.top .popover-arrow {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.05);
}

.popover.right .popover-arrow {
  left: -4px;
  top: 50%;
  margin-top: -4px;
  box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.05);
}

.popover.bottom .popover-arrow {
  top: -4px;
  left: 50%;
  margin-left: -4px;
  box-shadow: -2px -2px 2px rgba(0, 0, 0, 0.05);
}

.popover.left .popover-arrow {
  right: -4px;
  top: 50%;
  margin-top: -4px;
  box-shadow: 2px -2px 2px rgba(0, 0, 0, 0.05);
}

.popover-header {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E5E7EB;
}

.popover-content {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
}

.popover-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.popover-action {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
}
```

**Accessibility Considerations**:
- Focus trap for modal dialogs
- ARIA attributes for screen readers
- Keyboard navigation support
- ESC key to close
- Return focus on close
- Announce dialog opening/closing

**Usage Guidelines**:
- Use modals for focused tasks
- Keep modal content concise
- Provide clear actions
- Allow backdrop click to close (when safe)
- Stack modals carefully
- Consider mobile experience

**Implementation Notes**:
- Prevent body scroll when open
- Use portal for rendering
- Implement focus management
- Handle z-index stacking
- Animate smoothly (respect prefers-reduced-motion)
- Clean up on unmount

## Related Documentation
- [Component Overview](./README.md)
- [Buttons](./buttons.md)
- [Forms](./forms.md)
- [Navigation](./navigation.md)
- [Animation System](../tokens/animations.md)