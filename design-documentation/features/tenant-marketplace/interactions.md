---
title: Tenant Marketplace - Interactions
description: Detailed interaction specifications for the tenant marketplace feature
feature: tenant-marketplace
last-updated: 2025-01-05
version: 1.0.0
related-files: 
  - ./screen-states.md
  - ./user-journey.md
  - ./implementation.md
status: approved
---

# Tenant Marketplace - Interactions

## Overview
Complete interaction design specifications for all tenant marketplace touchpoints, including post creation, browsing, and response management.

## Table of Contents
1. [Post Creation Interactions](#post-creation-interactions)
2. [Marketplace Browsing](#marketplace-browsing)
3. [Response Management](#response-management)
4. [Dashboard Controls](#dashboard-controls)
5. [Filtering & Sorting](#filtering-sorting)
6. [Notification Interactions](#notification-interactions)

## Post Creation Interactions

### Multi-Step Wizard Navigation

#### Step Progression
```javascript
// Forward navigation
onNextStep = () => {
  // Validate current step
  const errors = validateStep(currentStep);
  
  if (errors.length > 0) {
    // Show inline errors
    showErrors(errors);
    
    // Scroll to first error
    scrollToError(errors[0]);
    
    // Shake animation
    animateError(errors[0].field);
    return;
  }
  
  // Save current step data
  saveStepData(currentStep);
  
  // Progress animation
  animateProgress(currentStep, currentStep + 1);
  
  // Move to next step
  setCurrentStep(currentStep + 1);
};

// Animation sequence
animateProgress = (from, to) => {
  // Progress bar fill
  progressBar.animate({
    width: `${(to / totalSteps) * 100}%`
  }, {
    duration: 300,
    easing: 'ease-out'
  });
  
  // Step indicator update
  steps[from].classList.remove('active');
  steps[from].classList.add('completed');
  steps[to].classList.add('active');
};
```

#### Budget Range Slider
```javascript
// Dual handle slider interaction
class BudgetRangeSlider {
  constructor(element) {
    this.min = 3000;
    this.max = 100000;
    this.currentMin = 8000;
    this.currentMax = 15000;
    
    this.initHandles();
    this.bindEvents();
  }
  
  handleDrag = (handle, event) => {
    const rect = this.track.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const value = this.min + (this.max - this.min) * percent;
    
    if (handle === 'min') {
      this.currentMin = Math.min(value, this.currentMax - 1000);
      this.updateMinHandle();
    } else {
      this.currentMax = Math.max(value, this.currentMin + 1000);
      this.updateMaxHandle();
    }
    
    this.updateFill();
    this.updateLabels();
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };
  
  updateFill = () => {
    const minPercent = (this.currentMin - this.min) / (this.max - this.min);
    const maxPercent = (this.currentMax - this.min) / (this.max - this.min);
    
    this.fill.style.left = `${minPercent * 100}%`;
    this.fill.style.width = `${(maxPercent - minPercent) * 100}%`;
  };
}
```

### Area Selection Map

#### Interactive Map Selection
```javascript
// Map area selection
class AreaSelector {
  constructor(mapElement) {
    this.map = new MapLibrary(mapElement);
    this.selectedAreas = new Set();
    this.polygons = new Map();
    
    this.initializeAreas();
  }
  
  onAreaClick = (area) => {
    if (this.selectedAreas.has(area.id)) {
      // Deselect animation
      this.polygons.get(area.id).animate({
        fillOpacity: 0,
        strokeWidth: 1
      }, 200);
      
      this.selectedAreas.delete(area.id);
      this.removeAreaTag(area.id);
    } else {
      // Select animation
      this.polygons.get(area.id).animate({
        fillOpacity: 0.3,
        strokeWidth: 3
      }, 200);
      
      this.selectedAreas.add(area.id);
      this.addAreaTag(area);
      
      // Bounce effect
      this.bouncePolygon(area.id);
    }
    
    this.updateCounter();
  };
  
  bouncePolygon = (areaId) => {
    const polygon = this.polygons.get(areaId);
    polygon.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
  };
}
```

### Requirements Builder

#### Tag Management
```javascript
// Interactive tag builder
class RequirementsBuilder {
  constructor(container) {
    this.mustHaves = [];
    this.niceToHaves = [];
    this.dealBreakers = [];
    
    this.initializeInputs();
    this.loadSuggestions();
  }
  
  addRequirement = (type, value) => {
    // Create tag element
    const tag = document.createElement('div');
    tag.className = 'requirement-tag';
    tag.dataset.type = type;
    
    // Add content
    tag.innerHTML = `
      <span class="tag-text">${value}</span>
      <button class="tag-remove" aria-label="Remove">×</button>
    `;
    
    // Animate in
    tag.style.opacity = '0';
    tag.style.transform = 'scale(0.8)';
    this[type].appendChild(tag);
    
    requestAnimationFrame(() => {
      tag.style.transition = 'all 0.2s ease';
      tag.style.opacity = '1';
      tag.style.transform = 'scale(1)';
    });
    
    // Bind remove handler
    tag.querySelector('.tag-remove').onclick = () => {
      this.removeRequirement(tag);
    };
  };
  
  removeRequirement = (tag) => {
    // Animate out
    tag.style.transform = 'scale(0.8)';
    tag.style.opacity = '0';
    
    setTimeout(() => {
      tag.remove();
      this.updateQualityScore();
    }, 200);
  };
}
```

## Marketplace Browsing

### Post Card Interactions

#### Hover Preview (Desktop)
```javascript
// Enhanced hover preview
let hoverTimeout;

postCard.addEventListener('mouseenter', (e) => {
  clearTimeout(hoverTimeout);
  
  hoverTimeout = setTimeout(() => {
    showPreview(postCard);
  }, 500); // Delay to prevent accidental triggers
});

postCard.addEventListener('mouseleave', () => {
  clearTimeout(hoverTimeout);
  hidePreview();
});

showPreview = (card) => {
  const preview = createPreview(card.dataset.postId);
  
  // Position calculation
  const rect = card.getBoundingClientRect();
  const spaceRight = window.innerWidth - rect.right;
  
  if (spaceRight > 420) {
    preview.style.left = `${rect.right + 16}px`;
  } else {
    preview.style.right = `${window.innerWidth - rect.left + 16}px`;
  }
  
  preview.style.top = `${rect.top}px`;
  
  // Animate in
  preview.style.opacity = '0';
  preview.style.transform = 'translateX(-10px)';
  document.body.appendChild(preview);
  
  requestAnimationFrame(() => {
    preview.style.transition = 'all 0.3s ease';
    preview.style.opacity = '1';
    preview.style.transform = 'translateX(0)';
  });
};
```

#### Touch Interactions (Mobile)
```javascript
// Swipe to show actions
let touchStartX = 0;
let currentX = 0;

postCard.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

postCard.addEventListener('touchmove', (e) => {
  currentX = e.touches[0].clientX;
  const deltaX = currentX - touchStartX;
  
  // Swipe left to reveal actions
  if (deltaX < 0 && Math.abs(deltaX) < 100) {
    postCard.style.transform = `translateX(${deltaX}px)`;
    revealActions(Math.abs(deltaX) / 100);
  }
});

postCard.addEventListener('touchend', () => {
  const deltaX = currentX - touchStartX;
  
  if (Math.abs(deltaX) > 50) {
    // Snap to open
    postCard.style.transform = 'translateX(-100px)';
    showActions();
  } else {
    // Snap back
    postCard.style.transform = 'translateX(0)';
    hideActions();
  }
});
```

### Infinite Scroll Loading
```javascript
// Intersection Observer for infinite scroll
const observerOptions = {
  root: null,
  rootMargin: '100px',
  threshold: 0
};

const loadMoreObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMorePosts();
    }
  });
}, observerOptions);

// Observe sentinel element
loadMoreObserver.observe(document.querySelector('.load-more-sentinel'));

loadMorePosts = async () => {
  // Show skeleton cards
  showSkeletonCards(3);
  
  try {
    const posts = await fetchPosts(currentPage + 1);
    
    // Animate new posts in
    posts.forEach((post, index) => {
      const card = createPostCard(post);
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      container.appendChild(card);
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
    
    currentPage++;
  } catch (error) {
    showErrorMessage();
  } finally {
    removeSkeletonCards();
  }
};
```

## Response Management

### Response Notification
```javascript
// Real-time response notification
socket.on('new_response', (response) => {
  // Desktop notification
  if (Notification.permission === 'granted') {
    new Notification('Nueva respuesta en HEUREKKA', {
      body: `${response.landlordName} está interesado en tu perfil`,
      icon: '/icon.png',
      vibrate: [200, 100, 200]
    });
  }
  
  // In-app notification
  showNotificationToast({
    type: 'success',
    title: 'Nueva respuesta',
    message: `${response.landlordName} te ha enviado una propuesta`,
    action: {
      label: 'Ver ahora',
      onClick: () => openResponse(response.id)
    }
  });
  
  // Update UI
  updateResponseCount();
  highlightInboxTab();
});
```

### Response Actions
```javascript
// Accept/Decline interaction
class ResponseManager {
  acceptResponse = async (responseId) => {
    const modal = await showConfirmModal({
      title: 'Aceptar propuesta',
      message: '¿Deseas compartir tu información de contacto con este propietario?',
      confirmText: 'Sí, compartir',
      cancelText: 'Todavía no'
    });
    
    if (modal.confirmed) {
      // Optimistic update
      updateResponseStatus(responseId, 'accepted');
      
      try {
        await api.acceptResponse(responseId);
        
        // Success animation
        showSuccessAnimation();
        
        // Open WhatsApp
        setTimeout(() => {
          openWhatsAppChat(response.landlordPhone);
        }, 1000);
        
      } catch (error) {
        // Revert on error
        updateResponseStatus(responseId, 'pending');
        showError('No se pudo aceptar la respuesta');
      }
    }
  };
  
  declineResponse = async (responseId) => {
    // Slide out animation
    const element = document.querySelector(`[data-response="${responseId}"]`);
    
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'translateX(-100%)';
    element.style.opacity = '0';
    
    setTimeout(async () => {
      try {
        await api.declineResponse(responseId);
        element.remove();
        updateResponseCount();
      } catch (error) {
        // Revert animation
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
      }
    }, 300);
  };
}
```

## Dashboard Controls

### Post Status Toggle
```javascript
// Pause/Resume post
class PostControls {
  togglePostStatus = async () => {
    const button = document.querySelector('.status-toggle');
    const isActive = button.dataset.status === 'active';
    
    // Immediate visual feedback
    button.disabled = true;
    button.classList.add('loading');
    
    try {
      if (isActive) {
        await this.pausePost();
        
        // Update UI
        button.dataset.status = 'paused';
        button.innerHTML = '<icon>▶</icon> Reanudar';
        button.className = 'btn-warning';
        
        // Show pause indicator
        document.querySelector('.status-dot').className = 'status-dot paused';
        
      } else {
        await this.resumePost();
        
        // Update UI  
        button.dataset.status = 'active';
        button.innerHTML = '<icon>⏸</icon> Pausar';
        button.className = 'btn-secondary';
        
        // Show active indicator
        document.querySelector('.status-dot').className = 'status-dot active';
      }
      
    } finally {
      button.disabled = false;
      button.classList.remove('loading');
    }
  };
  
  deletePost = async () => {
    const confirmed = await showDeleteModal({
      title: 'Eliminar publicación',
      message: 'Esta acción no se puede deshacer. ¿Estás seguro?',
      type: 'danger'
    });
    
    if (confirmed) {
      // Fade out animation
      const container = document.querySelector('.active-post-section');
      container.style.transition = 'all 0.5s ease';
      container.style.opacity = '0';
      container.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        container.remove();
        showEmptyState();
      }, 500);
    }
  };
}
```

### Analytics Interaction
```javascript
// Interactive metrics
document.querySelectorAll('.metric-card').forEach(card => {
  card.addEventListener('click', () => {
    // Expand for details
    if (card.classList.contains('expanded')) {
      collapseMetric(card);
    } else {
      expandMetric(card);
    }
  });
});

expandMetric = (card) => {
  // Get detailed data
  const metricType = card.dataset.metric;
  const details = getMetricDetails(metricType);
  
  // Create chart
  const chart = createMiniChart(details);
  
  // Animate expansion
  card.style.height = 'auto';
  const height = card.offsetHeight;
  card.style.height = '120px';
  
  card.offsetHeight; // Force reflow
  
  card.style.transition = 'height 0.3s ease';
  card.style.height = `${height}px`;
  
  // Insert chart
  card.appendChild(chart);
  card.classList.add('expanded');
};
```

## Filtering & Sorting

### Filter Application
```javascript
// Real-time filtering
class FilterManager {
  constructor() {
    this.activeFilters = {};
    this.debounceTimer = null;
  }
  
  applyFilter = (filterType, value) => {
    // Update filter state
    this.activeFilters[filterType] = value;
    
    // Show filter tag
    this.addFilterTag(filterType, value);
    
    // Debounce API call
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchFilteredResults();
    }, 500);
    
    // Immediate UI feedback
    this.showLoadingState();
  };
  
  removeFilter = (filterType) => {
    // Animate tag removal
    const tag = document.querySelector(`[data-filter="${filterType}"]`);
    tag.style.animation = 'fadeOut 0.2s ease';
    
    setTimeout(() => {
      tag.remove();
      delete this.activeFilters[filterType];
      this.fetchFilteredResults();
    }, 200);
  };
  
  clearAllFilters = () => {
    // Cascade animation
    const tags = document.querySelectorAll('.filter-tag');
    tags.forEach((tag, index) => {
      setTimeout(() => {
        tag.style.animation = 'fadeOut 0.2s ease';
      }, index * 50);
    });
    
    setTimeout(() => {
      this.activeFilters = {};
      document.querySelector('.filter-tags').innerHTML = '';
      this.fetchFilteredResults();
    }, tags.length * 50 + 200);
  };
}
```

### Sort Dropdown
```javascript
// Custom sort dropdown
class SortDropdown {
  constructor(element) {
    this.element = element;
    this.isOpen = false;
    this.currentSort = 'relevance';
    
    this.init();
  }
  
  toggleDropdown = () => {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };
  
  open = () => {
    this.dropdown.style.display = 'block';
    this.dropdown.style.opacity = '0';
    this.dropdown.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
      this.dropdown.style.transition = 'all 0.2s ease';
      this.dropdown.style.opacity = '1';
      this.dropdown.style.transform = 'translateY(0)';
    });
    
    this.isOpen = true;
    
    // Close on outside click
    document.addEventListener('click', this.handleOutsideClick);
  };
  
  selectOption = (option) => {
    // Update selection
    this.currentSort = option.value;
    this.button.textContent = option.label;
    
    // Animate selection
    option.element.style.background = '#EEF2FF';
    setTimeout(() => {
      option.element.style.background = '';
    }, 200);
    
    this.close();
    this.onSort(option.value);
  };
}
```

## Notification Interactions

### Toast Notifications
```javascript
// Notification system
class NotificationManager {
  showToast = (config) => {
    const toast = this.createToast(config);
    
    // Add to container
    this.container.appendChild(toast);
    
    // Animate in
    toast.style.transform = 'translateX(400px)';
    requestAnimationFrame(() => {
      toast.style.transition = 'transform 0.3s ease';
      toast.style.transform = 'translateX(0)';
    });
    
    // Auto dismiss
    if (config.duration !== 0) {
      setTimeout(() => {
        this.dismissToast(toast);
      }, config.duration || 5000);
    }
    
    // Swipe to dismiss
    this.enableSwipeToDismiss(toast);
  };
  
  enableSwipeToDismiss = (toast) => {
    let startX = 0;
    let currentX = 0;
    
    toast.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    toast.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      if (deltaX > 0) {
        toast.style.transform = `translateX(${deltaX}px)`;
        toast.style.opacity = 1 - (deltaX / 200);
      }
    });
    
    toast.addEventListener('touchend', () => {
      const deltaX = currentX - startX;
      
      if (deltaX > 100) {
        this.dismissToast(toast);
      } else {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      }
    });
  };
}
```

## Performance Optimizations

### Debouncing & Throttling
```javascript
// Optimized event handlers
const optimizedHandlers = {
  // Debounced search
  search: debounce((query) => {
    performSearch(query);
  }, 500),
  
  // Throttled scroll
  scroll: throttle(() => {
    updateScrollPosition();
    checkLazyLoad();
  }, 100),
  
  // Debounced form validation
  validate: debounce((field) => {
    validateField(field);
  }, 300)
};
```

### Virtual Scrolling
```javascript
// Virtual list for large datasets
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleRange = { start: 0, end: 0 };
    
    this.init();
  }
  
  updateVisibleRange = () => {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    this.visibleRange.start = Math.floor(scrollTop / this.itemHeight);
    this.visibleRange.end = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
    
    this.render();
  };
  
  render = () => {
    const fragment = document.createDocumentFragment();
    
    for (let i = this.visibleRange.start; i <= this.visibleRange.end; i++) {
      if (this.items[i]) {
        const element = this.renderItem(this.items[i]);
        element.style.position = 'absolute';
        element.style.top = `${i * this.itemHeight}px`;
        fragment.appendChild(element);
      }
    }
    
    this.viewport.innerHTML = '';
    this.viewport.appendChild(fragment);
  };
}
```

## Related Documentation
- [Screen States Documentation](./screen-states.md)
- [User Journey](./user-journey.md)
- [Implementation Guide](./implementation.md)
- [Accessibility Requirements](./accessibility.md)