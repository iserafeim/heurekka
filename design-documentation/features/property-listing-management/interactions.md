---
title: Property Listing Management - Interaction Patterns
description: Detailed interaction specifications and animations for property listing management
feature: property-listing-management
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Property Listing Management - Interaction Patterns

## Overview
Complete interaction and animation specifications for the property listing management feature, including form progression, photo management, validation feedback, and publishing flows.

## Table of Contents
1. [Wizard Navigation](#wizard-navigation)
2. [Form Interactions](#form-interactions)
3. [Photo Upload & Management](#photo-upload-management)
4. [Rich Text Editor](#rich-text-editor)
5. [Validation & Feedback](#validation-feedback)
6. [Preview Interactions](#preview-interactions)
7. [Publishing Flow](#publishing-flow)
8. [Mobile Interactions](#mobile-interactions)

## Wizard Navigation

### Step Progression
```javascript
// Wizard step management
class ListingWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 8;
    this.completedSteps = new Set();
    this.setupNavigation();
  }
  
  setupNavigation() {
    // Next button behavior
    document.querySelector('.next-button').addEventListener('click', () => {
      if (this.validateCurrentStep()) {
        this.animateStepTransition('forward');
        this.markStepComplete(this.currentStep);
        this.currentStep++;
        this.updateProgress();
      }
    });
    
    // Previous button behavior
    document.querySelector('.prev-button').addEventListener('click', () => {
      this.animateStepTransition('backward');
      this.currentStep--;
      this.updateProgress();
    });
    
    // Step indicator clicks
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        if (this.canNavigateToStep(index + 1)) {
          this.jumpToStep(index + 1);
        }
      });
    });
  }
  
  animateStepTransition(direction) {
    const currentContent = document.querySelector(`.step-${this.currentStep}`);
    const nextStep = direction === 'forward' ? this.currentStep + 1 : this.currentStep - 1;
    const nextContent = document.querySelector(`.step-${nextStep}`);
    
    // Fade out current
    currentContent.style.animation = direction === 'forward' 
      ? 'slideOutLeft 0.3s ease forwards'
      : 'slideOutRight 0.3s ease forwards';
    
    setTimeout(() => {
      currentContent.style.display = 'none';
      nextContent.style.display = 'block';
      
      // Fade in next
      nextContent.style.animation = direction === 'forward'
        ? 'slideInRight 0.3s ease forwards'
        : 'slideInLeft 0.3s ease forwards';
    }, 300);
  }
  
  updateProgress() {
    // Update progress bar
    const progress = (this.currentStep / this.totalSteps) * 100;
    const progressBar = document.querySelector('.progress-fill');
    progressBar.style.width = `${progress}%`;
    progressBar.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
      if (index + 1 < this.currentStep) {
        indicator.classList.add('completed');
        indicator.innerHTML = '<svg><!-- checkmark --></svg>';
      } else if (index + 1 === this.currentStep) {
        indicator.classList.add('active');
        indicator.classList.remove('completed');
      } else {
        indicator.classList.remove('active', 'completed');
      }
    });
    
    // Animate current step indicator
    const currentIndicator = document.querySelector(`.step-indicator:nth-child(${this.currentStep})`);
    currentIndicator.style.animation = 'pulseScale 0.5s ease';
  }
  
  markStepComplete(stepNumber) {
    this.completedSteps.add(stepNumber);
    
    // Show completion animation
    const indicator = document.querySelector(`.step-indicator:nth-child(${stepNumber})`);
    indicator.style.animation = 'checkmarkIn 0.4s ease';
    
    // Update connector line
    const connector = document.querySelector(`.connector-${stepNumber}`);
    if (connector) {
      connector.style.animation = 'fillLine 0.5s ease forwards';
    }
  }
}

@keyframes slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-50px); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes checkmarkIn {
  from { transform: scale(0) rotate(-180deg); }
  to { transform: scale(1) rotate(0); }
}

@keyframes fillLine {
  from { background-size: 0% 100%; }
  to { background-size: 100% 100%; }
}
```

### Keyboard Navigation
```javascript
// Keyboard shortcuts for wizard
document.addEventListener('keydown', (e) => {
  // Alt + Arrow for navigation
  if (e.altKey) {
    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        document.querySelector('.next-button').click();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        document.querySelector('.prev-button').click();
        break;
    }
  }
  
  // Number keys for direct step access
  if (e.ctrlKey && !isNaN(e.key)) {
    const stepNumber = parseInt(e.key);
    if (stepNumber >= 1 && stepNumber <= 8) {
      wizard.jumpToStep(stepNumber);
    }
  }
  
  // Enter to proceed
  if (e.key === 'Enter' && !isTextInput(e.target)) {
    e.preventDefault();
    document.querySelector('.next-button').click();
  }
});
```

## Form Interactions

### Property Type Selection
```javascript
// Interactive property type cards
class PropertyTypeSelector {
  constructor() {
    this.selectedType = null;
    this.setupInteractions();
  }
  
  setupInteractions() {
    const typeCards = document.querySelectorAll('.type-card');
    
    typeCards.forEach(card => {
      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.style.animation = 'cardLift 0.2s ease forwards';
      });
      
      card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('selected')) {
          card.style.animation = 'cardDrop 0.2s ease forwards';
        }
      });
      
      // Selection
      card.addEventListener('click', () => {
        this.selectType(card);
      });
    });
  }
  
  selectType(card) {
    // Deselect previous
    const prevSelected = document.querySelector('.type-card.selected');
    if (prevSelected && prevSelected !== card) {
      prevSelected.classList.remove('selected');
      prevSelected.style.animation = 'deselectType 0.3s ease';
    }
    
    // Select new
    card.classList.add('selected');
    card.style.animation = 'selectType 0.3s ease';
    
    // Update icon
    const icon = card.querySelector('.type-icon');
    icon.style.animation = 'iconFlip 0.4s ease';
    
    this.selectedType = card.dataset.type;
    
    // Enable next button
    this.enableNext();
    
    // Show related fields
    this.showTypeSpecificFields(this.selectedType);
  }
  
  showTypeSpecificFields(type) {
    const specificFields = document.querySelector('.type-specific-fields');
    
    // Fade out current fields
    specificFields.style.animation = 'fadeOut 0.2s ease';
    
    setTimeout(() => {
      // Update fields based on type
      this.updateFieldsForType(type);
      
      // Fade in new fields
      specificFields.style.animation = 'fadeIn 0.3s ease';
    }, 200);
  }
}

@keyframes cardLift {
  to { transform: translateY(-4px) scale(1.02); }
}

@keyframes selectType {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes iconFlip {
  0% { transform: rotateY(0); }
  100% { transform: rotateY(360deg); }
}
```

### Address Autocomplete
```javascript
// Location input with autocomplete
class AddressAutocomplete {
  constructor(input) {
    this.input = input;
    this.suggestions = [];
    this.selectedIndex = -1;
    this.setupAutocomplete();
  }
  
  setupAutocomplete() {
    // Debounced input
    let debounceTimer;
    this.input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      
      // Show loading indicator
      this.showLoadingIndicator();
      
      debounceTimer = setTimeout(() => {
        if (e.target.value.length >= 3) {
          this.fetchSuggestions(e.target.value);
        } else {
          this.hideSuggestions();
        }
      }, 300);
    });
    
    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      if (this.suggestions.length > 0) {
        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.navigateSuggestions(1);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.navigateSuggestions(-1);
            break;
          case 'Enter':
            e.preventDefault();
            this.selectSuggestion(this.selectedIndex);
            break;
          case 'Escape':
            this.hideSuggestions();
            break;
        }
      }
    });
  }
  
  async fetchSuggestions(query) {
    try {
      const results = await geocodingAPI.search(query);
      this.suggestions = results;
      this.displaySuggestions();
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }
  
  displaySuggestions() {
    const dropdown = document.querySelector('.address-dropdown');
    dropdown.innerHTML = '';
    
    // Animate dropdown appearance
    dropdown.style.display = 'block';
    dropdown.style.animation = 'dropdownSlide 0.2s ease';
    
    this.suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <div class="suggestion-main">${suggestion.street}</div>
        <div class="suggestion-sub">${suggestion.city}, ${suggestion.state}</div>
      `;
      
      // Stagger animation
      item.style.animation = `suggestionFade 0.3s ease ${index * 0.05}s forwards`;
      item.style.opacity = '0';
      
      item.addEventListener('click', () => {
        this.selectSuggestion(index);
      });
      
      item.addEventListener('mouseenter', () => {
        this.highlightSuggestion(index);
      });
      
      dropdown.appendChild(item);
    });
  }
  
  selectSuggestion(index) {
    if (index >= 0 && index < this.suggestions.length) {
      const suggestion = this.suggestions[index];
      
      // Fill input
      this.input.value = suggestion.fullAddress;
      
      // Animate selection
      const selectedItem = document.querySelectorAll('.suggestion-item')[index];
      selectedItem.style.animation = 'selectSuggestion 0.3s ease';
      
      // Update map
      this.updateMapLocation(suggestion.coordinates);
      
      // Hide dropdown
      setTimeout(() => {
        this.hideSuggestions();
      }, 300);
    }
  }
  
  updateMapLocation(coords) {
    const mapContainer = document.querySelector('.map-preview');
    
    // Zoom animation
    mapContainer.style.animation = 'mapZoom 0.5s ease';
    
    // Update marker
    const marker = document.querySelector('.map-marker-custom');
    marker.style.animation = 'markerDrop 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Pan to location
    map.panTo(coords, { duration: 500 });
  }
}

@keyframes dropdownSlide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes suggestionFade {
  to { opacity: 1; transform: translateX(0); }
}

@keyframes selectSuggestion {
  0% { background: transparent; }
  50% { background: rgba(99, 102, 241, 0.2); }
  100% { background: transparent; }
}

@keyframes markerDrop {
  from { transform: translateY(-100px) scale(0); }
  to { transform: translateY(0) scale(1); }
}
```

### Counter Inputs
```javascript
// Room counter with smooth animations
class CounterInput {
  constructor(element) {
    this.element = element;
    this.value = parseInt(element.dataset.value) || 0;
    this.min = parseInt(element.dataset.min) || 0;
    this.max = parseInt(element.dataset.max) || 99;
    this.setupCounter();
  }
  
  setupCounter() {
    const decrementBtn = this.element.querySelector('.counter-decrease');
    const incrementBtn = this.element.querySelector('.counter-increase');
    const display = this.element.querySelector('.counter-value');
    
    decrementBtn.addEventListener('click', () => {
      if (this.value > this.min) {
        this.updateValue(this.value - 1, 'decrease');
      } else {
        this.shakeButton(decrementBtn);
      }
    });
    
    incrementBtn.addEventListener('click', () => {
      if (this.value < this.max) {
        this.updateValue(this.value + 1, 'increase');
      } else {
        this.shakeButton(incrementBtn);
      }
    });
    
    // Keyboard support
    display.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        incrementBtn.click();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        decrementBtn.click();
      }
    });
  }
  
  updateValue(newValue, direction) {
    const display = this.element.querySelector('.counter-value');
    
    // Animate number change
    display.style.animation = direction === 'increase' 
      ? 'countUp 0.3s ease'
      : 'countDown 0.3s ease';
    
    setTimeout(() => {
      this.value = newValue;
      display.textContent = newValue;
      
      // Update button states
      this.updateButtonStates();
    }, 150);
    
    // Trigger change event
    this.element.dispatchEvent(new CustomEvent('change', {
      detail: { value: newValue }
    }));
  }
  
  shakeButton(button) {
    button.style.animation = 'shake 0.3s ease';
    setTimeout(() => {
      button.style.animation = '';
    }, 300);
  }
  
  updateButtonStates() {
    const decrementBtn = this.element.querySelector('.counter-decrease');
    const incrementBtn = this.element.querySelector('.counter-increase');
    
    decrementBtn.disabled = this.value <= this.min;
    incrementBtn.disabled = this.value >= this.max;
  }
}

@keyframes countUp {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(-10px); opacity: 0; }
  51% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes countDown {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(10px); opacity: 0; }
  51% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

## Photo Upload & Management

### Drag and Drop Upload
```javascript
// Photo upload with drag and drop
class PhotoUploader {
  constructor(dropZone) {
    this.dropZone = dropZone;
    this.photos = [];
    this.setupDragDrop();
    this.setupFileInput();
  }
  
  setupDragDrop() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.add('dragging');
        this.dropZone.style.animation = 'dragPulse 1s ease infinite';
      });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.remove('dragging');
        this.dropZone.style.animation = '';
      });
    });
    
    // Handle drop
    this.dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });
  }
  
  handleFiles(files) {
    const validFiles = Array.from(files).filter(file => 
      this.validateFile(file)
    );
    
    validFiles.forEach((file, index) => {
      // Create preview immediately
      this.createPreview(file, index);
      
      // Start upload
      this.uploadFile(file, index);
    });
  }
  
  createPreview(file, index) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const preview = document.createElement('div');
      preview.className = 'photo-item uploading';
      preview.innerHTML = `
        <img src="${e.target.result}" class="photo-image" />
        <div class="upload-overlay">
          <div class="upload-progress-ring">
            <svg>
              <circle cx="40" cy="40" r="36"></circle>
              <circle cx="40" cy="40" r="36" class="progress-circle"></circle>
            </svg>
            <span class="progress-text">0%</span>
          </div>
        </div>
      `;
      
      // Animate appearance
      preview.style.animation = `photoAppear 0.4s ease ${index * 0.1}s forwards`;
      preview.style.opacity = '0';
      
      document.querySelector('.photo-grid').appendChild(preview);
    };
    
    reader.readAsDataURL(file);
  }
  
  async uploadFile(file, index) {
    const formData = new FormData();
    formData.append('photo', file);
    
    const xhr = new XMLHttpRequest();
    const preview = document.querySelectorAll('.photo-item')[index];
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        this.updateProgress(preview, percentComplete);
      }
    });
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        this.onUploadSuccess(preview, JSON.parse(xhr.response));
      } else {
        this.onUploadError(preview);
      }
    };
    
    xhr.open('POST', '/api/photos/upload');
    xhr.send(formData);
  }
  
  updateProgress(preview, percent) {
    const circle = preview.querySelector('.progress-circle');
    const text = preview.querySelector('.progress-text');
    
    // Update circular progress
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (percent / 100 * circumference);
    
    circle.style.strokeDashoffset = offset;
    text.textContent = `${Math.round(percent)}%`;
    
    // Add pulse at milestones
    if (percent === 25 || percent === 50 || percent === 75) {
      preview.style.animation = 'uploadPulse 0.3s ease';
    }
  }
  
  onUploadSuccess(preview, response) {
    preview.classList.remove('uploading');
    preview.classList.add('uploaded');
    
    // Success animation
    const overlay = preview.querySelector('.upload-overlay');
    overlay.innerHTML = `
      <div class="success-icon">
        <svg><!-- checkmark --></svg>
      </div>
    `;
    
    overlay.style.animation = 'successFade 0.5s ease forwards';
    
    setTimeout(() => {
      overlay.remove();
      this.enablePhotoActions(preview);
    }, 500);
    
    // Add to photos array
    this.photos.push(response.photo);
    
    // Enable make main photo if first
    if (this.photos.length === 1) {
      this.setMainPhoto(preview);
    }
  }
  
  enablePhotoActions(preview) {
    // Add action buttons
    const actions = document.createElement('div');
    actions.className = 'photo-actions';
    actions.innerHTML = `
      <button class="photo-action make-main">Main</button>
      <button class="photo-action edit">Edit</button>
      <button class="photo-action delete">Delete</button>
    `;
    
    preview.appendChild(actions);
    
    // Setup action handlers
    actions.querySelector('.make-main').addEventListener('click', () => {
      this.setMainPhoto(preview);
    });
    
    actions.querySelector('.edit').addEventListener('click', () => {
      this.openPhotoEditor(preview);
    });
    
    actions.querySelector('.delete').addEventListener('click', () => {
      this.deletePhoto(preview);
    });
  }
  
  setMainPhoto(preview) {
    // Remove previous main
    const prevMain = document.querySelector('.photo-item.main');
    if (prevMain) {
      prevMain.classList.remove('main');
      prevMain.querySelector('.main-photo-badge')?.remove();
    }
    
    // Set new main
    preview.classList.add('main');
    preview.style.animation = 'selectMain 0.4s ease';
    
    // Add badge
    const badge = document.createElement('div');
    badge.className = 'main-photo-badge';
    badge.textContent = 'Main Photo';
    badge.style.animation = 'badgeAppear 0.3s ease';
    preview.appendChild(badge);
  }
  
  deletePhoto(preview) {
    // Confirm deletion
    if (confirm('Delete this photo?')) {
      preview.style.animation = 'photoDelete 0.3s ease forwards';
      
      setTimeout(() => {
        preview.remove();
        this.reorderPhotos();
      }, 300);
    }
  }
}

@keyframes dragPulse {
  0%, 100% { border-color: #6366F1; background: rgba(99, 102, 241, 0.05); }
  50% { border-color: #818CF8; background: rgba(99, 102, 241, 0.1); }
}

@keyframes photoAppear {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes uploadPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes successFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes selectMain {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes photoDelete {
  to { opacity: 0; transform: scale(0.8); }
}
```

### Photo Reordering
```javascript
// Drag to reorder photos
class PhotoReorder {
  constructor(container) {
    this.container = container;
    this.draggedElement = null;
    this.setupDragReorder();
  }
  
  setupDragReorder() {
    const photos = this.container.querySelectorAll('.photo-item');
    
    photos.forEach(photo => {
      photo.draggable = true;
      
      photo.addEventListener('dragstart', (e) => {
        this.draggedElement = photo;
        photo.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      photo.addEventListener('dragend', () => {
        photo.classList.remove('dragging');
        this.draggedElement = null;
        this.saveOrder();
      });
      
      photo.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(e.clientX);
        
        if (afterElement == null) {
          this.container.appendChild(this.draggedElement);
        } else {
          this.container.insertBefore(this.draggedElement, afterElement);
        }
        
        // Animate reorder
        this.animateReorder();
      });
    });
  }
  
  getDragAfterElement(x) {
    const draggableElements = [
      ...this.container.querySelectorAll('.photo-item:not(.dragging)')
    ];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  animateReorder() {
    const photos = this.container.querySelectorAll('.photo-item:not(.dragging)');
    photos.forEach(photo => {
      photo.style.animation = 'photoShift 0.3s ease';
    });
  }
}

@keyframes photoShift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

// CSS for dragging state
.photo-item.dragging {
  opacity: 0.5;
  cursor: move;
  transform: scale(1.05);
}
```

## Rich Text Editor

### Text Formatting
```javascript
// Rich text editor interactions
class RichTextEditor {
  constructor(element) {
    this.editor = element;
    this.toolbar = element.querySelector('.editor-toolbar');
    this.content = element.querySelector('.editor-content');
    this.setupFormatting();
  }
  
  setupFormatting() {
    // Format buttons
    this.toolbar.querySelectorAll('.toolbar-button').forEach(button => {
      button.addEventListener('click', () => {
        const command = button.dataset.command;
        const value = button.dataset.value || null;
        
        // Execute formatting
        document.execCommand(command, false, value);
        
        // Animate button
        button.style.animation = 'buttonPress 0.2s ease';
        
        // Update button states
        this.updateToolbarStates();
        
        // Focus back to content
        this.content.focus();
      });
    });
    
    // Content changes
    this.content.addEventListener('input', () => {
      this.updateCharCount();
      this.autoSave();
    });
    
    // Selection changes
    document.addEventListener('selectionchange', () => {
      if (this.content.contains(window.getSelection().anchorNode)) {
        this.updateToolbarStates();
      }
    });
  }
  
  updateToolbarStates() {
    const buttons = this.toolbar.querySelectorAll('.toolbar-button');
    
    buttons.forEach(button => {
      const command = button.dataset.command;
      const isActive = document.queryCommandState(command);
      
      if (isActive) {
        button.classList.add('active');
        button.style.animation = 'activateTool 0.2s ease';
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  updateCharCount() {
    const count = this.content.textContent.length;
    const counter = document.querySelector('.character-count');
    const maxLength = 2000;
    
    counter.textContent = `${count} / ${maxLength}`;
    
    // Warning states
    if (count > maxLength * 0.9) {
      counter.classList.add('warning');
      counter.style.animation = 'countWarning 0.3s ease';
    } else if (count > maxLength) {
      counter.classList.add('error');
      counter.style.animation = 'countError 0.3s ease';
    } else {
      counter.classList.remove('warning', 'error');
    }
  }
  
  autoSave() {
    // Debounced auto-save
    clearTimeout(this.saveTimeout);
    
    // Show saving indicator
    this.showSavingIndicator();
    
    this.saveTimeout = setTimeout(() => {
      this.saveContent();
    }, 1000);
  }
  
  showSavingIndicator() {
    const indicator = document.querySelector('.save-indicator');
    indicator.textContent = 'Saving...';
    indicator.style.animation = 'fadeIn 0.2s ease';
    indicator.style.opacity = '1';
  }
  
  saveContent() {
    const content = this.content.innerHTML;
    
    // Save to localStorage or API
    localStorage.setItem('listing-description', content);
    
    // Show saved confirmation
    const indicator = document.querySelector('.save-indicator');
    indicator.textContent = 'Saved';
    indicator.style.animation = 'saveConfirm 0.3s ease';
    
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }
}

@keyframes activateTool {
  from { background: transparent; }
  to { background: #6366F1; }
}

@keyframes countWarning {
  0%, 100% { color: #F59E0B; }
  50% { color: #DC2626; }
}

@keyframes saveConfirm {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

## Validation & Feedback

### Real-time Validation
```javascript
// Form field validation with feedback
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.setupValidation();
  }
  
  setupValidation() {
    // Input fields
    this.form.querySelectorAll('input, textarea').forEach(field => {
      // On blur validation
      field.addEventListener('blur', () => {
        this.validateField(field);
      });
      
      // Real-time validation for critical fields
      if (field.dataset.realtime === 'true') {
        field.addEventListener('input', () => {
          this.debouncedValidate(field);
        });
      }
    });
    
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateAll()) {
        this.submitForm();
      }
    });
  }
  
  validateField(field) {
    const rules = this.getValidationRules(field);
    const value = field.value;
    let isValid = true;
    let errorMessage = '';
    
    // Required check
    if (rules.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    
    // Pattern check
    if (rules.pattern && value) {
      const pattern = new RegExp(rules.pattern);
      if (!pattern.test(value)) {
        isValid = false;
        errorMessage = rules.patternMessage || 'Invalid format';
      }
    }
    
    // Min/max length
    if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum ${rules.minLength} characters required`;
    }
    
    if (isValid) {
      this.showSuccess(field);
    } else {
      this.showError(field, errorMessage);
    }
    
    return isValid;
  }
  
  showError(field, message) {
    const wrapper = field.closest('.input-group');
    
    // Remove previous states
    wrapper.classList.remove('success');
    wrapper.classList.add('error');
    
    // Animate error
    field.style.animation = 'fieldError 0.3s ease';
    
    // Show error message
    let errorElement = wrapper.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      wrapper.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.animation = 'errorSlide 0.3s ease';
    
    // Add to errors map
    this.errors.set(field.name, message);
  }
  
  showSuccess(field) {
    const wrapper = field.closest('.input-group');
    
    // Remove error state
    wrapper.classList.remove('error');
    wrapper.classList.add('success');
    
    // Animate success
    field.style.animation = 'fieldSuccess 0.3s ease';
    
    // Show checkmark
    let successIcon = wrapper.querySelector('.success-icon');
    if (!successIcon) {
      successIcon = document.createElement('span');
      successIcon.className = 'success-icon';
      successIcon.innerHTML = '✓';
      wrapper.appendChild(successIcon);
    }
    
    successIcon.style.animation = 'successPop 0.4s ease';
    
    // Remove from errors map
    this.errors.delete(field.name);
    
    // Remove error message if exists
    const errorElement = wrapper.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.animation = 'errorFade 0.2s ease forwards';
      setTimeout(() => errorElement.remove(), 200);
    }
  }
  
  validateAll() {
    const fields = this.form.querySelectorAll('input, textarea');
    let allValid = true;
    
    fields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });
    
    if (!allValid) {
      // Scroll to first error
      const firstError = this.form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Shake animation
        firstError.style.animation = 'shakeError 0.5s ease';
      }
    }
    
    return allValid;
  }
}

@keyframes fieldError {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes fieldSuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes errorSlide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes successPop {
  from { transform: scale(0) rotate(-180deg); }
  to { transform: scale(1) rotate(0); }
}

@keyframes shakeError {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
```

## Preview Interactions

### Live Preview Updates
```javascript
// Real-time preview synchronization
class LivePreview {
  constructor() {
    this.previewPane = document.querySelector('.wizard-preview');
    this.setupLiveUpdates();
  }
  
  setupLiveUpdates() {
    // Listen to form changes
    document.addEventListener('input', (e) => {
      const field = e.target;
      if (field.dataset.preview) {
        this.updatePreview(field);
      }
    });
    
    // Photo updates
    document.addEventListener('photo-uploaded', (e) => {
      this.updatePreviewPhotos(e.detail);
    });
    
    // Feature selections
    document.addEventListener('feature-toggled', (e) => {
      this.updatePreviewFeatures(e.detail);
    });
  }
  
  updatePreview(field) {
    const targetElement = this.previewPane.querySelector(
      `[data-preview-target="${field.dataset.preview}"]`
    );
    
    if (targetElement) {
      // Fade transition
      targetElement.style.animation = 'previewUpdate 0.3s ease';
      
      // Update content
      setTimeout(() => {
        if (field.type === 'number') {
          targetElement.textContent = this.formatNumber(field.value);
        } else {
          targetElement.textContent = field.value || field.placeholder;
        }
      }, 150);
    }
  }
  
  updatePreviewPhotos(photos) {
    const gallery = this.previewPane.querySelector('.preview-gallery');
    
    // Clear existing
    gallery.style.animation = 'fadeOut 0.2s ease';
    
    setTimeout(() => {
      gallery.innerHTML = this.renderPhotoGallery(photos);
      gallery.style.animation = 'fadeIn 0.3s ease';
    }, 200);
  }
  
  updatePreviewFeatures(features) {
    const featuresList = this.previewPane.querySelector('.preview-features');
    
    // Animate update
    featuresList.style.animation = 'featureUpdate 0.3s ease';
    
    // Update list
    setTimeout(() => {
      featuresList.innerHTML = features.map(feature => `
        <li class="feature-item">
          <span class="feature-icon">✓</span>
          ${feature}
        </li>
      `).join('');
    }, 150);
  }
}

@keyframes previewUpdate {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes featureUpdate {
  0% { transform: translateX(0); }
  50% { transform: translateX(-10px); opacity: 0.5; }
  100% { transform: translateX(0); opacity: 1; }
}
```

### Device Preview Toggle
```javascript
// Responsive preview modes
class DevicePreview {
  constructor() {
    this.previewContainer = document.querySelector('.preview-container');
    this.currentDevice = 'desktop';
    this.setupDeviceToggle();
  }
  
  setupDeviceToggle() {
    const toggleButtons = document.querySelectorAll('.device-toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const device = button.dataset.device;
        this.switchDevice(device);
      });
    });
  }
  
  switchDevice(device) {
    // Update button states
    document.querySelectorAll('.device-toggle').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-device="${device}"]`).classList.add('active');
    
    // Animate transition
    this.previewContainer.style.animation = 'deviceSwitch 0.5s ease';
    
    setTimeout(() => {
      // Apply device dimensions
      switch(device) {
        case 'mobile':
          this.previewContainer.style.width = '375px';
          this.previewContainer.classList.add('mobile-preview');
          break;
        case 'tablet':
          this.previewContainer.style.width = '768px';
          this.previewContainer.classList.add('tablet-preview');
          break;
        default:
          this.previewContainer.style.width = '100%';
          this.previewContainer.classList.remove('mobile-preview', 'tablet-preview');
      }
      
      this.currentDevice = device;
    }, 250);
  }
}

@keyframes deviceSwitch {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
}
```

## Publishing Flow

### Final Validation
```javascript
// Pre-publish validation
class PublishValidator {
  async validateListing() {
    const checks = [
      { name: 'photos', check: this.checkPhotos, weight: 25 },
      { name: 'description', check: this.checkDescription, weight: 20 },
      { name: 'pricing', check: this.checkPricing, weight: 20 },
      { name: 'location', check: this.checkLocation, weight: 15 },
      { name: 'amenities', check: this.checkAmenities, weight: 10 },
      { name: 'contact', check: this.checkContact, weight: 10 }
    ];
    
    let totalScore = 0;
    const results = [];
    
    // Run checks with animation
    for (const [index, item] of checks.entries()) {
      const checkElement = document.querySelector(`.check-${item.name}`);
      
      // Show checking state
      checkElement.style.animation = 'checking 1s ease infinite';
      
      const result = await item.check();
      
      // Show result
      if (result.passed) {
        checkElement.classList.add('passed');
        checkElement.style.animation = 'checkPass 0.3s ease';
        totalScore += item.weight;
      } else {
        checkElement.classList.add('failed');
        checkElement.style.animation = 'checkFail 0.3s ease';
      }
      
      results.push(result);
      
      // Update progress
      this.updateQualityScore(totalScore);
    }
    
    return {
      score: totalScore,
      results: results,
      canPublish: totalScore >= 70
    };
  }
  
  updateQualityScore(score) {
    const scoreDisplay = document.querySelector('.quality-score');
    const scoreCircle = document.querySelector('.score-circle');
    
    // Animate score number
    this.animateNumber(scoreDisplay, score);
    
    // Animate circle fill
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (score / 100 * circumference);
    
    scoreCircle.style.strokeDashoffset = offset;
    scoreCircle.style.transition = 'stroke-dashoffset 0.5s ease';
    
    // Color based on score
    if (score >= 80) {
      scoreCircle.style.stroke = '#10B981';
    } else if (score >= 60) {
      scoreCircle.style.stroke = '#F59E0B';
    } else {
      scoreCircle.style.stroke = '#EF4444';
    }
  }
  
  animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const increment = (target - start) / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if ((increment > 0 && current >= target) || 
          (increment < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      
      element.textContent = Math.round(current);
    }, 16);
  }
}

@keyframes checking {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes checkPass {
  from { transform: scale(0) rotate(-180deg); }
  to { transform: scale(1) rotate(0); }
}

@keyframes checkFail {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Publish Confirmation
```javascript
// Publish listing with celebration
class PublishFlow {
  async publishListing() {
    // Show publishing modal
    const modal = document.querySelector('.publish-modal');
    modal.style.display = 'flex';
    modal.style.animation = 'modalFadeIn 0.3s ease';
    
    // Start publishing animation
    const progress = modal.querySelector('.publish-progress');
    progress.style.animation = 'publishing 2s ease-out forwards';
    
    try {
      // API call
      const result = await api.publishListing(this.listingData);
      
      // Success celebration
      this.celebratePublish(result);
    } catch (error) {
      this.showPublishError(error);
    }
  }
  
  celebratePublish(result) {
    const modal = document.querySelector('.publish-modal');
    
    // Change to success state
    modal.innerHTML = `
      <div class="publish-success">
        <div class="success-animation">
          <svg><!-- animated checkmark --></svg>
        </div>
        <h2>Listing Published!</h2>
        <p>Your property is now live and visible to tenants</p>
        <div class="publish-actions">
          <button class="view-listing">View Listing</button>
          <button class="share-listing">Share</button>
          <button class="create-another">Create Another</button>
        </div>
      </div>
    `;
    
    // Trigger animations
    const successIcon = modal.querySelector('.success-animation');
    successIcon.style.animation = 'successBurst 0.6s ease';
    
    // Confetti effect
    this.triggerConfetti();
  }
  
  triggerConfetti() {
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animation = `confettiFall 3s ease-out forwards`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  }
}

@keyframes publishing {
  from { width: 0%; }
  to { width: 100%; }
}

@keyframes successBurst {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

## Mobile Interactions

### Touch Gestures
```javascript
// Mobile-optimized interactions
class MobileListingCreator {
  constructor() {
    this.setupTouchInteractions();
    this.setupCameraIntegration();
  }
  
  setupTouchInteractions() {
    // Swipe to navigate steps
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
    
    // Long press for help
    let pressTimer;
    document.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        this.showContextHelp(e.target);
      }, 500);
    });
    
    document.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
  }
  
  handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        // Swipe right - previous step
        document.querySelector('.prev-button').click();
      } else {
        // Swipe left - next step
        document.querySelector('.next-button').click();
      }
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  }
  
  setupCameraIntegration() {
    const cameraButton = document.querySelector('.camera-capture');
    
    cameraButton.addEventListener('click', async () => {
      try {
        // Access camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        // Show camera preview
        this.showCameraPreview(stream);
      } catch (error) {
        // Fallback to file picker
        document.querySelector('#photo-input').click();
      }
    });
  }
  
  showCameraPreview(stream) {
    const preview = document.createElement('div');
    preview.className = 'camera-preview';
    preview.innerHTML = `
      <video autoplay></video>
      <button class="capture-button">Capture</button>
      <button class="cancel-button">Cancel</button>
    `;
    
    document.body.appendChild(preview);
    
    const video = preview.querySelector('video');
    video.srcObject = stream;
    
    // Animate preview appearance
    preview.style.animation = 'slideUp 0.3s ease';
    
    // Capture photo
    preview.querySelector('.capture-button').addEventListener('click', () => {
      this.capturePhoto(video, stream);
    });
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

## Related Documentation
- [Screen States](./screen-states.md)
- [Animation System](../../design-system/tokens/animations.md)
- [Performance Guidelines](./implementation.md#performance-optimization)
- [Accessibility Requirements](./accessibility.md)