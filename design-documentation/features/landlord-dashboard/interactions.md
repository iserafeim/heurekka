---
title: Landlord Dashboard - Interaction Patterns
description: Detailed interaction specifications and animations for landlord dashboard
feature: landlord-dashboard
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Landlord Dashboard - Interaction Patterns

## Overview
Complete interaction and animation specifications for the landlord dashboard feature, including lead management, response flows, real-time updates, and analytics interactions.

## Table of Contents
1. [Lead Inbox Interactions](#lead-inbox-interactions)
2. [Lead Card Behaviors](#lead-card-behaviors)
3. [Response Flow Interactions](#response-flow-interactions)
4. [Real-time Updates](#real-time-updates)
6. [Filtering & Sorting](#filtering-sorting)
7. [Mobile Gestures](#mobile-gestures)
8. [Performance Patterns](#performance-patterns)

## Lead Inbox Interactions

### Lead Reception Animation
```javascript
// New lead arrival
class LeadNotification {
  async onNewLead(lead) {
    // Desktop notification
    if (Notification.permission === 'granted') {
      new Notification('New Lead', {
        body: `${lead.tenantName} - ${lead.propertyTitle}`,
        icon: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: lead.id
      });
    }
    
    // UI animation
    const leadCard = this.createLeadCard(lead);
    leadCard.classList.add('lead-entering');
    
    // Slide in from top
    leadCard.style.animation = 'slideInTop 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Highlight flash
    setTimeout(() => {
      leadCard.style.animation = 'highlightPulse 1s ease';
    }, 400);
    
    // Update counter badge
    this.updateBadge('+1');
  }
}

@keyframes slideInTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes highlightPulse {
  0%, 100% { background: transparent; }
  50% { background: rgba(99, 102, 241, 0.1); }
}

// Badge update animation
.badge-update {
  animation: badgeBounce 0.3s ease;
}

@keyframes badgeBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### Lead List Scrolling
```javascript
// Infinite scroll implementation
class InfiniteLeadScroll {
  constructor(container) {
    this.container = container;
    this.loading = false;
    this.page = 1;
    this.hasMore = true;
    
    this.setupObserver();
  }
  
  setupObserver() {
    const options = {
      root: this.container,
      rootMargin: '100px',
      threshold: 0.1
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading && this.hasMore) {
          this.loadMore();
        }
      });
    }, options);
    
    // Observe sentinel element
    const sentinel = document.querySelector('.scroll-sentinel');
    this.observer.observe(sentinel);
  }
  
  async loadMore() {
    this.loading = true;
    this.showLoader();
    
    try {
      const newLeads = await fetchLeads(this.page + 1);
      this.appendLeads(newLeads);
      this.page++;
      this.hasMore = newLeads.length > 0;
    } finally {
      this.loading = false;
      this.hideLoader();
    }
  }
  
  appendLeads(leads) {
    leads.forEach((lead, index) => {
      const card = this.createLeadCard(lead);
      
      // Staggered animation
      card.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s forwards`;
      card.style.opacity = '0';
      
      this.container.appendChild(card);
    });
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pull to Refresh (Mobile)
```javascript
// Pull to refresh implementation
class PullToRefresh {
  constructor(element) {
    this.element = element;
    this.pullDistance = 0;
    this.threshold = 100;
    this.isRefreshing = false;
    
    this.setupTouchHandlers();
  }
  
  setupTouchHandlers() {
    let startY = 0;
    let currentY = 0;
    
    this.element.addEventListener('touchstart', (e) => {
      if (this.element.scrollTop === 0) {
        startY = e.touches[0].clientY;
      }
    });
    
    this.element.addEventListener('touchmove', (e) => {
      if (!startY) return;
      
      currentY = e.touches[0].clientY;
      this.pullDistance = currentY - startY;
      
      if (this.pullDistance > 0) {
        e.preventDefault();
        
        // Apply elastic effect
        const progress = Math.min(this.pullDistance / this.threshold, 1);
        const elasticDistance = this.threshold * this.easeOutCubic(progress);
        
        this.element.style.transform = `translateY(${elasticDistance}px)`;
        
        // Update pull indicator
        this.updatePullIndicator(progress);
      }
    });
    
    this.element.addEventListener('touchend', () => {
      if (this.pullDistance > this.threshold) {
        this.refresh();
      } else {
        this.reset();
      }
      
      startY = 0;
      this.pullDistance = 0;
    });
  }
  
  refresh() {
    this.isRefreshing = true;
    
    // Show refresh animation
    this.element.style.transform = `translateY(${this.threshold}px)`;
    this.showRefreshSpinner();
    
    // Fetch new data
    this.fetchNewLeads().then(() => {
      this.reset();
      this.showSuccessAnimation();
    });
  }
  
  reset() {
    this.element.style.transform = 'translateY(0)';
    this.element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      this.element.style.transition = '';
    }, 300);
  }
  
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}
```

## Lead Card Behaviors

### Card Hover Effects
```javascript
// Enhanced hover interactions
.lead-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  on:mouseenter {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    // Show quick actions
    .quick-actions {
      opacity: 1;
      transform: translateX(0);
      transition: all 0.2s ease 0.1s;
    }
    
    // Expand preview
    .lead-preview {
      max-height: 200px;
      transition: max-height 0.3s ease;
    }
  }
  
  on:mouseleave {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    
    .quick-actions {
      opacity: 0;
      transform: translateX(-10px);
    }
    
    .lead-preview {
      max-height: 60px;
    }
  }
}

// Quick action buttons
.quick-action-btn {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  
  .lead-card:hover & {
    opacity: 1;
    transform: scale(1);
    
    &:nth-child(1) { transition-delay: 0.05s; }
    &:nth-child(2) { transition-delay: 0.1s; }
    &:nth-child(3) { transition-delay: 0.15s; }
  }
  
  on:click {
    animation: buttonPress 0.2s ease;
  }
}

@keyframes buttonPress {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.95); }
}
```

### Card Selection
```javascript
// Multi-select behavior
class LeadSelection {
  constructor() {
    this.selectedLeads = new Set();
    this.lastSelected = null;
    
    this.setupSelectionHandlers();
  }
  
  setupSelectionHandlers() {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.lead-card');
      if (!card) return;
      
      if (e.shiftKey && this.lastSelected) {
        // Range selection
        this.selectRange(this.lastSelected, card);
      } else if (e.ctrlKey || e.metaKey) {
        // Toggle selection
        this.toggleSelection(card);
      } else {
        // Single selection
        this.clearSelection();
        this.selectLead(card);
      }
      
      this.lastSelected = card;
      this.updateBulkActions();
    });
  }
  
  selectLead(card) {
    const leadId = card.dataset.leadId;
    this.selectedLeads.add(leadId);
    
    card.classList.add('selected');
    card.style.animation = 'selectPulse 0.3s ease';
    
    // Add checkbox animation
    const checkbox = card.querySelector('.selection-checkbox');
    if (checkbox) {
      checkbox.checked = true;
      checkbox.style.animation = 'checkIn 0.3s ease';
    }
  }
  
  toggleSelection(card) {
    const leadId = card.dataset.leadId;
    
    if (this.selectedLeads.has(leadId)) {
      this.deselectLead(card);
    } else {
      this.selectLead(card);
    }
  }
  
  deselectLead(card) {
    const leadId = card.dataset.leadId;
    this.selectedLeads.delete(leadId);
    
    card.classList.remove('selected');
    card.style.animation = 'deselectFade 0.2s ease';
    
    const checkbox = card.querySelector('.selection-checkbox');
    if (checkbox) {
      checkbox.checked = false;
      checkbox.style.animation = 'checkOut 0.2s ease';
    }
  }
  
  updateBulkActions() {
    const bulkBar = document.querySelector('.bulk-actions-bar');
    const count = this.selectedLeads.size;
    
    if (count > 0) {
      bulkBar.classList.add('visible');
      bulkBar.style.animation = 'slideUpFade 0.3s ease';
      
      // Update count
      const countElement = bulkBar.querySelector('.selection-count');
      countElement.textContent = `${count} selected`;
      countElement.style.animation = 'countUpdate 0.3s ease';
    } else {
      bulkBar.classList.remove('visible');
      bulkBar.style.animation = 'slideDownFade 0.3s ease';
    }
  }
}

@keyframes selectPulse {
  0%, 100% { background: transparent; }
  50% { background: rgba(99, 102, 241, 0.1); }
}

@keyframes checkIn {
  from { transform: scale(0) rotate(-180deg); }
  to { transform: scale(1) rotate(0); }
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Swipe Actions (Mobile)
```javascript
// Swipeable lead cards
class SwipeableLeadCard {
  constructor(element) {
    this.element = element;
    this.threshold = 100;
    this.setupSwipeHandlers();
  }
  
  setupSwipeHandlers() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Touch events
    this.element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.element.style.transition = 'none';
    });
    
    this.element.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Apply transform with resistance
      const resistance = Math.abs(deltaX) > this.threshold ? 0.3 : 1;
      const transform = deltaX * resistance;
      
      this.element.style.transform = `translateX(${transform}px)`;
      
      // Show action indicators
      if (deltaX > this.threshold) {
        this.showAction('respond', 'right');
      } else if (deltaX < -this.threshold) {
        this.showAction('archive', 'left');
      } else {
        this.hideActions();
      }
    });
    
    this.element.addEventListener('touchend', () => {
      isDragging = false;
      const deltaX = currentX - startX;
      
      if (Math.abs(deltaX) > this.threshold) {
        // Trigger action
        if (deltaX > 0) {
          this.triggerRespond();
        } else {
          this.triggerArchive();
        }
      } else {
        // Snap back
        this.resetPosition();
      }
    });
  }
  
  showAction(type, direction) {
    const indicator = this.element.querySelector(`.swipe-${direction}`);
    indicator.classList.add('visible');
    indicator.style.opacity = '1';
    
    if (type === 'respond') {
      indicator.style.background = '#10B981';
      indicator.innerHTML = '<svg><!-- respond icon --></svg>';
    } else {
      indicator.style.background = '#EF4444';
      indicator.innerHTML = '<svg><!-- archive icon --></svg>';
    }
  }
  
  triggerRespond() {
    this.element.style.transform = 'translateX(100%)';
    this.element.style.opacity = '0';
    
    setTimeout(() => {
      this.openResponseModal();
      this.resetPosition();
    }, 300);
  }
  
  triggerArchive() {
    this.element.style.transform = 'translateX(-100%)';
    this.element.style.opacity = '0';
    
    setTimeout(() => {
      this.archiveLead();
      this.element.remove();
    }, 300);
  }
  
  resetPosition() {
    this.element.style.transition = 'transform 0.3s ease';
    this.element.style.transform = 'translateX(0)';
    this.element.style.opacity = '1';
    this.hideActions();
  }
}
```

## Response Flow Interactions

### Quick Response Modal
```javascript
// Response modal interaction
class ResponseModal {
  constructor() {
    this.modal = document.querySelector('.response-modal');
    this.currentStep = 1;
    this.setupInteractions();
  }
  
  open(lead) {
    this.lead = lead;
    this.modal.classList.add('opening');
    
    // Backdrop fade
    this.modal.style.animation = 'backdropFade 0.3s ease forwards';
    
    // Modal slide up
    const content = this.modal.querySelector('.modal-content');
    content.style.animation = 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Initialize first step
    this.showStep(1);
  }
  
  showStep(step) {
    const steps = this.modal.querySelectorAll('.response-step');
    
    // Hide current step
    if (this.currentStep !== step) {
      steps[this.currentStep - 1].style.animation = 'stepOut 0.2s ease forwards';
    }
    
    setTimeout(() => {
      // Show new step
      steps.forEach(s => s.style.display = 'none');
      steps[step - 1].style.display = 'block';
      steps[step - 1].style.animation = 'stepIn 0.3s ease forwards';
      
      this.currentStep = step;
      this.updateProgress();
    }, 200);
  }
  
  updateProgress() {
    const progress = (this.currentStep / 3) * 100;
    const progressBar = this.modal.querySelector('.progress-bar');
    
    progressBar.style.width = `${progress}%`;
    progressBar.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  }
}

@keyframes backdropFade {
  from { background: rgba(0, 0, 0, 0); }
  to { background: rgba(0, 0, 0, 0.5); }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes stepIn {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes stepOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50px);
  }
}
```

### WhatsApp Launch
```javascript
// WhatsApp integration
class WhatsAppLauncher {
  launch(phoneNumber, message) {
    // Format message
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Show launching animation
    const button = document.querySelector('.whatsapp-button');
    button.classList.add('launching');
    
    // Ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    button.appendChild(ripple);
    
    // Animate ripple
    ripple.style.animation = 'rippleExpand 0.6s ease-out';
    
    setTimeout(() => {
      // Open WhatsApp
      if (this.isMobile()) {
        window.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      
      // Reset button
      button.classList.remove('launching');
      ripple.remove();
    }, 300);
  }
  
  isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}

@keyframes rippleExpand {
  from {
    width: 0;
    height: 0;
    opacity: 1;
  }
  to {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

.whatsapp-button.launching {
  animation: buttonPulse 0.5s ease;
  background: #25D366;
  color: white;
}

@keyframes buttonPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Template Selection
```javascript
// Dynamic template insertion
class TemplateSelector {
  constructor(textarea) {
    this.textarea = textarea;
    this.templates = this.loadTemplates();
    this.setupSelector();
  }
  
  setupSelector() {
    const selector = document.querySelector('.template-selector');
    
    selector.addEventListener('change', (e) => {
      const templateId = e.target.value;
      if (templateId) {
        this.insertTemplate(templateId);
      }
    });
    
    // Quick template chips
    const chips = document.querySelectorAll('.template-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const templateId = chip.dataset.templateId;
        this.insertTemplate(templateId);
        
        // Chip animation
        chip.style.animation = 'chipBounce 0.3s ease';
        setTimeout(() => {
          chip.style.animation = '';
        }, 300);
      });
    });
  }
  
  insertTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Get current cursor position
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    
    // Insert template with animation
    const processedText = this.processVariables(template.text);
    
    // Animate insertion
    this.animateTextInsertion(processedText, start, end);
  }
  
  animateTextInsertion(text, start, end) {
    const currentText = this.textarea.value;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    
    // Clear and type effect
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= text.length) {
        this.textarea.value = before + text.substring(0, charIndex) + after;
        charIndex++;
        
        // Scroll to cursor
        this.textarea.scrollTop = this.textarea.scrollHeight;
      } else {
        clearInterval(typeInterval);
        
        // Flash success
        this.textarea.style.animation = 'textareaFlash 0.3s ease';
        setTimeout(() => {
          this.textarea.style.animation = '';
        }, 300);
      }
    }, 10);
  }
  
  processVariables(text) {
    const variables = {
      tenant_name: this.lead.tenantName,
      property_address: this.lead.propertyAddress,
      viewing_time: this.getNextViewingSlot(),
      agent_name: this.currentUser.name
    };
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}

@keyframes chipBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes textareaFlash {
  0%, 100% { background: white; }
  50% { background: rgba(99, 102, 241, 0.05); }
}
```

## Real-time Updates

### Live Lead Updates
```javascript
// WebSocket connection for real-time updates
class RealtimeLeadUpdates {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket('wss://api.heurekka.com/leads');
    
    this.ws.onopen = () => {
      console.log('Connected to lead stream');
      this.reconnectAttempts = 0;
      this.showConnectionStatus('connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleUpdate(data);
    };
    
    this.ws.onclose = () => {
      this.showConnectionStatus('disconnected');
      this.reconnect();
    };
  }
  
  handleUpdate(data) {
    switch(data.type) {
      case 'new_lead':
        this.handleNewLead(data.lead);
        break;
      case 'lead_updated':
        this.handleLeadUpdate(data.lead);
        break;
      case 'lead_responded':
        this.handleLeadResponse(data.lead);
        break;
    }
  }
  
  handleNewLead(lead) {
    // Add to inbox with animation
    const card = this.createLeadCard(lead);
    const inbox = document.querySelector('.lead-inbox');
    
    // Prepare for animation
    card.style.opacity = '0';
    card.style.transform = 'translateX(-100%)';
    inbox.insertBefore(card, inbox.firstChild);
    
    // Animate in
    requestAnimationFrame(() => {
      card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
      
      // Flash highlight
      setTimeout(() => {
        card.style.animation = 'newLeadHighlight 2s ease';
      }, 500);
    });
    
    // Update notification badge
    this.incrementBadge();
    
    // Play notification sound
    this.playNotificationSound();
  }
  
  handleLeadUpdate(lead) {
    const card = document.querySelector(`[data-lead-id="${lead.id}"]`);
    if (!card) return;
    
    // Update card content
    this.updateCardContent(card, lead);
    
    // Subtle update animation
    card.style.animation = 'updatePulse 0.5s ease';
    
    setTimeout(() => {
      card.style.animation = '';
    }, 500);
  }
}

@keyframes newLeadHighlight {
  0%, 100% { background: transparent; }
  10%, 30%, 50% { background: rgba(99, 102, 241, 0.1); }
  20%, 40% { background: transparent; }
}

@keyframes updatePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

// Connection status indicator
.connection-status {
  position: fixed;
  top: 90px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  z-index: 1000;
}

.connection-status.connected {
  background: #D1FAE5;
  color: #065F46;
}

.connection-status.disconnected {
  background: #FEE2E2;
  color: #991B1B;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusPulse 2s ease infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

### Optimistic UI Updates
```javascript
// Optimistic updates for better UX
class OptimisticUpdates {
  async markAsRead(leadId) {
    const card = document.querySelector(`[data-lead-id="${leadId}"]`);
    
    // Immediate UI update
    card.classList.remove('unread');
    card.querySelector('.unread-dot')?.remove();
    
    // Fade transition
    card.style.animation = 'markRead 0.3s ease';
    
    try {
      // API call in background
      await api.markLeadAsRead(leadId);
    } catch (error) {
      // Revert on error
      card.classList.add('unread');
      this.showError('Failed to mark as read');
    }
  }
  
  async updateLeadStatus(leadId, status) {
    const card = document.querySelector(`[data-lead-id="${leadId}"]`);
    const oldStatus = card.dataset.status;
    
    // Optimistic update
    card.dataset.status = status;
    this.updateStatusBadge(card, status);
    
    // Animate status change
    const badge = card.querySelector('.status-badge');
    badge.style.animation = 'statusChange 0.5s ease';
    
    try {
      await api.updateLeadStatus(leadId, status);
    } catch (error) {
      // Revert on error
      card.dataset.status = oldStatus;
      this.updateStatusBadge(card, oldStatus);
      this.showError('Failed to update status');
    }
  }
}

@keyframes markRead {
  from { background: rgba(99, 102, 241, 0.1); }
  to { background: transparent; }
}

@keyframes statusChange {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```


## Filtering & Sorting

### Filter Panel Interactions
```javascript
// Advanced filtering system
class FilterPanel {
  constructor() {
    this.filters = {
      quality: [],
      status: [],
      property: [],
      dateRange: null
    };
    
    this.setupFilters();
  }
  
  setupFilters() {
    // Quality filter chips
    const qualityChips = document.querySelectorAll('.quality-filter');
    qualityChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.toggleFilter('quality', chip.dataset.value);
        
        // Animate chip
        if (chip.classList.contains('active')) {
          chip.style.animation = 'chipDeactivate 0.2s ease';
          chip.classList.remove('active');
        } else {
          chip.style.animation = 'chipActivate 0.3s ease';
          chip.classList.add('active');
        }
        
        this.applyFilters();
      });
    });
    
    // Date range picker
    const dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.filters.dateRange = {
          from: document.querySelector('#date-from').value,
          to: document.querySelector('#date-to').value
        };
        
        // Animate date highlight
        input.style.animation = 'inputHighlight 0.3s ease';
        
        this.applyFilters();
      });
    });
  }
  
  applyFilters() {
    const leads = document.querySelectorAll('.lead-card');
    let visibleCount = 0;
    
    leads.forEach((lead, index) => {
      const shouldShow = this.matchesFilters(lead);
      
      if (shouldShow) {
        // Staggered show animation
        setTimeout(() => {
          lead.style.display = 'block';
          lead.style.animation = `filterIn 0.3s ease forwards`;
          lead.style.animationDelay = `${visibleCount * 0.05}s`;
        }, 0);
        visibleCount++;
      } else {
        // Hide animation
        lead.style.animation = 'filterOut 0.2s ease forwards';
        setTimeout(() => {
          lead.style.display = 'none';
        }, 200);
      }
    });
    
    // Update count
    this.updateFilterCount(visibleCount);
  }
  
  updateFilterCount(count) {
    const counter = document.querySelector('.filter-count');
    const badge = counter.querySelector('.count-badge');
    
    // Animate counter update
    badge.style.animation = 'countFlip 0.3s ease';
    
    setTimeout(() => {
      badge.textContent = count;
    }, 150);
  }
}

@keyframes chipActivate {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes filterIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes filterOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes countFlip {
  0%, 100% { transform: rotateX(0); }
  50% { transform: rotateX(90deg); }
}
```

### Sort Dropdown
```javascript
// Sort functionality with animations
class SortController {
  constructor() {
    this.currentSort = 'newest';
    this.setupSortDropdown();
  }
  
  setupSortDropdown() {
    const dropdown = document.querySelector('.sort-dropdown');
    
    dropdown.addEventListener('change', (e) => {
      const newSort = e.target.value;
      
      if (newSort !== this.currentSort) {
        this.animateSortChange(newSort);
        this.currentSort = newSort;
      }
    });
  }
  
  animateSortChange(sortType) {
    const container = document.querySelector('.lead-list');
    const leads = Array.from(container.querySelectorAll('.lead-card'));
    
    // Fade out all cards
    leads.forEach((lead, index) => {
      lead.style.animation = `fadeOut 0.2s ease ${index * 0.02}s forwards`;
    });
    
    setTimeout(() => {
      // Sort leads
      const sortedLeads = this.sortLeads(leads, sortType);
      
      // Clear container
      container.innerHTML = '';
      
      // Add sorted leads with animation
      sortedLeads.forEach((lead, index) => {
        container.appendChild(lead);
        lead.style.animation = `fadeInUp 0.3s ease ${index * 0.03}s forwards`;
      });
    }, 300);
  }
  
  sortLeads(leads, sortType) {
    return leads.sort((a, b) => {
      switch(sortType) {
        case 'newest':
          return b.dataset.timestamp - a.dataset.timestamp;
        case 'quality':
          return b.dataset.quality - a.dataset.quality;
        case 'urgent':
          return a.dataset.urgency - b.dataset.urgency;
        default:
          return 0;
      }
    });
  }
}
```

## Mobile Gestures

### Touch-based Navigation
```javascript
// Mobile gesture handler
class MobileGestures {
  constructor() {
    this.setupGestures();
  }
  
  setupGestures() {
    // Long press for multi-select
    let pressTimer;
    const cards = document.querySelectorAll('.lead-card');
    
    cards.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
          // Enter selection mode
          this.enterSelectionMode(card);
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, 500);
      });
      
      card.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });
    });
    
    // Pinch to zoom analytics
    let initialDistance = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches);
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches);
        const scale = currentDistance / initialDistance;
        
        // Apply zoom to charts
        const chart = document.querySelector('.chart-container');
        if (chart) {
          chart.style.transform = `scale(${scale})`;
        }
      }
    });
  }
  
  enterSelectionMode(card) {
    document.body.classList.add('selection-mode');
    card.classList.add('selected');
    
    // Show selection toolbar
    const toolbar = document.querySelector('.selection-toolbar');
    toolbar.style.animation = 'slideUp 0.3s ease forwards';
    
    // Add checkboxes to all cards
    const cards = document.querySelectorAll('.lead-card');
    cards.forEach(c => {
      const checkbox = c.querySelector('.selection-checkbox');
      checkbox.style.display = 'block';
      checkbox.style.animation = 'fadeIn 0.2s ease';
    });
  }
  
  getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

## Performance Patterns

### Lazy Loading
```javascript
// Lazy loading for heavy content
class LazyLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
    
    this.observeElements();
  }
  
  observeElements() {
    // Lazy load images
    const images = document.querySelectorAll('[data-lazy-src]');
    images.forEach(img => this.observer.observe(img));
    
    // Lazy load charts
    const charts = document.querySelectorAll('[data-lazy-chart]');
    charts.forEach(chart => this.observer.observe(chart));
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        if (element.dataset.lazySrc) {
          this.loadImage(element);
        } else if (element.dataset.lazyChart) {
          this.loadChart(element);
        }
        
        this.observer.unobserve(element);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.lazySrc;
    
    // Create temp image
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.style.animation = 'imageFadeIn 0.3s ease';
      delete img.dataset.lazySrc;
    };
    tempImg.src = src;
  }
  
  loadChart(container) {
    const chartType = container.dataset.lazyChart;
    
    // Show loading spinner
    container.innerHTML = '<div class="chart-spinner"></div>';
    
    // Load chart data
    this.fetchChartData(chartType).then(data => {
      this.renderChart(container, data);
      container.style.animation = 'chartFadeIn 0.5s ease';
    });
  }
}

@keyframes imageFadeIn {
  from { opacity: 0; filter: blur(10px); }
  to { opacity: 1; filter: blur(0); }
}

@keyframes chartFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

### Debouncing and Throttling
```javascript
// Performance optimizations
class PerformanceOptimizer {
  constructor() {
    // Debounced search
    this.searchInput = document.querySelector('.search-input');
    this.debouncedSearch = this.debounce(this.performSearch, 500);
    
    this.searchInput.addEventListener('input', this.debouncedSearch);
    
    // Throttled scroll
    this.scrollContainer = document.querySelector('.lead-list');
    this.throttledScroll = this.throttle(this.handleScroll, 100);
    
    this.scrollContainer.addEventListener('scroll', this.throttledScroll);
  }
  
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      
      // Show loading indicator
      this.showSearchLoading();
      
      timeout = setTimeout(() => {
        func.apply(this, args);
        this.hideSearchLoading();
      }, wait);
    };
  }
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
  
  performSearch(query) {
    // Animate search results
    const results = document.querySelector('.search-results');
    results.style.animation = 'resultsUpdate 0.3s ease';
    
    // Fetch and display results
    this.fetchSearchResults(query).then(data => {
      this.displayResults(data);
    });
  }
  
  handleScroll() {
    const scrollPercentage = this.getScrollPercentage();
    
    // Update scroll indicator
    const indicator = document.querySelector('.scroll-indicator');
    indicator.style.width = `${scrollPercentage}%`;
    
    // Load more if near bottom
    if (scrollPercentage > 90) {
      this.loadMoreLeads();
    }
  }
}

@keyframes resultsUpdate {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
```

## Related Documentation
- [Screen States](./screen-states.md)
- [Animation System](../../design-system/tokens/animations.md)
- [Performance Guidelines](./implementation.md#performance-optimization)
- [Accessibility Requirements](./accessibility.md)