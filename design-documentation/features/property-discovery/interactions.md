---
title: Property Discovery - Interaction Patterns
description: Detailed interaction specifications and animations for property discovery
feature: property-discovery
last-updated: 2025-01-04
version: 1.0.0
related-files: 
  - ./user-journey.md
  - ./screen-states.md
  - ./implementation.md
  - ../../design-system/tokens/animations.md
status: approved
---

# Property Discovery - Interaction Patterns

## Overview
Complete interaction and animation specifications for the property discovery feature, including search interactions, map controls, and property browsing behaviors.

## Table of Contents
1. [Search Interactions](#search-interactions)
2. [Map Interactions](#map-interactions)
3. [Property Card Interactions](#property-card-interactions)
4. [Gallery Interactions](#gallery-interactions)
5. [Filter Interactions](#filter-interactions)
6. [Comparison Interactions](#comparison-interactions)
7. [Performance Patterns](#performance-patterns)

## Search Interactions

### Search Bar Behaviors

#### Auto-complete
```javascript
// Location auto-complete
on:input {
  // Debounce input
  debounce(() => {
    if (value.length >= 2) {
      fetchSuggestions(value);
    }
  }, 300);
}

// Suggestion dropdown animation
.suggestions-dropdown {
  opacity: 0;
  transform: translateY(-10px);
  animation: slideDown 0.2s ease forwards;
  max-height: 320px;
  overflow-y: auto;
}

@keyframes slideDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Suggestion hover
.suggestion-item:hover {
  background: linear-gradient(90deg, #F0F1FF 0%, #F9FAFB 100%);
  padding-left: 20px;
  transition: all 0.15s ease;
}

// Selection feedback
on:select {
  .selected-suggestion {
    animation: flash 0.3s ease;
    background: rgba(99, 102, 241, 0.1);
  }
}
```

#### Search Submission
```javascript
// Search button animation
.search-button {
  on:click {
    animation: pulse 0.3s ease;
    
    // Loading state
    .icon {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

// Results transition
.results-transition {
  // Fade out old results
  .old-results {
    animation: fadeOut 0.2s ease forwards;
  }
  
  // Fade in new results
  .new-results {
    animation: fadeIn 0.3s ease 0.2s forwards;
  }
}
```

### Quick Filters

```javascript
// Filter chip interactions
.filter-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  
  on:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  on:click {
    // Toggle animation
    if (!selected) {
      animation: chipSelect 0.3s ease;
      background: #6366F1;
      color: white;
    } else {
      animation: chipDeselect 0.3s ease;
      background: white;
      color: #4B5563;
    }
  }
}

@keyframes chipSelect {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

// Multiple selection feedback
.filter-group {
  on:change {
    // Update count badge
    .filter-count {
      animation: countUpdate 0.3s ease;
    }
    
    // Apply filters with delay
    setTimeout(() => {
      applyFilters();
    }, 500);
  }
}
```

## Map Interactions

### Map Navigation

#### Pan and Zoom
```javascript
// Smooth pan
.map-container {
  on:pan {
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
    
    // Update visible markers
    throttle(() => {
      updateVisibleMarkers(bounds);
    }, 100);
  }
}

// Zoom animations
.zoom-controls {
  .zoom-in, .zoom-out {
    on:click {
      map.animateZoom({
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
      
      // Button feedback
      animation: buttonPress 0.2s ease;
    }
  }
}

@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

// Scroll zoom
on:wheel {
  if (ctrlKey) {
    preventDefault();
    
    const zoomDelta = event.deltaY > 0 ? -0.5 : 0.5;
    map.smoothZoom(currentZoom + zoomDelta);
  }
}
```

#### Marker Interactions

```javascript
// Marker hover
.map-marker {
  on:mouseenter {
    // Scale up
    transform: scale(1.2);
    z-index: 1000;
    
    // Show preview
    showPropertyPreview(propertyId, {
      position: 'top',
      offset: 10,
      animation: 'fadeIn'
    });
  }
  
  on:mouseleave {
    transform: scale(1);
    z-index: auto;
    hidePropertyPreview();
  }
  
  on:click {
    // Bounce animation
    animation: markerBounce 0.5s ease;
    
    // Center map on marker
    map.panTo(markerPosition, {
      duration: 500,
      easing: 'ease-in-out'
    });
    
    // Highlight corresponding card
    highlightPropertyCard(propertyId);
  }
}

@keyframes markerBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-5px); }
}

// Cluster interactions
.marker-cluster {
  on:click {
    // Expand animation
    animation: clusterExpand 0.3s ease;
    
    // Zoom to cluster bounds
    map.fitBounds(clusterBounds, {
      padding: 50,
      duration: 500
    });
  }
}

@keyframes clusterExpand {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
```

### Drawing Tools

```javascript
// Area selection
.draw-area-tool {
  on:activate {
    map.style.cursor = 'crosshair';
    
    // Show instructions
    .draw-instructions {
      animation: slideInTop 0.3s ease;
    }
  }
  
  on:drawstart {
    vertices = [];
    
    on:click {
      // Add vertex
      vertices.push(clickPosition);
      
      // Draw vertex marker
      createVertexMarker(clickPosition);
      
      // Update polygon
      updatePolygon(vertices);
    }
  }
  
  on:drawend {
    // Complete polygon animation
    .drawn-polygon {
      animation: polygonComplete 0.5s ease;
    }
    
    // Calculate area
    const area = calculateArea(vertices);
    showAreaStats(area);
  }
}

@keyframes polygonComplete {
  0% { 
    fill-opacity: 0;
    stroke-dasharray: 10, 10;
  }
  100% { 
    fill-opacity: 0.2;
    stroke-dasharray: 0, 0;
  }
}
```

## Property Card Interactions

### Card Hover States

```javascript
// Card hover effects
.property-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  on:mouseenter {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    
    // Image zoom
    .property-image {
      transform: scale(1.05);
      transition: transform 5s ease;
    }
    
    // Show quick actions
    .quick-actions {
      opacity: 1;
      transform: translateY(0);
      transition: all 0.2s ease;
    }
    
    // Highlight on map
    if (mapVisible) {
      highlightMapMarker(propertyId);
    }
  }
  
  on:mouseleave {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    .property-image {
      transform: scale(1);
    }
    
    .quick-actions {
      opacity: 0;
      transform: translateY(10px);
    }
  }
}
```

### Favorite Button

```javascript
// Favorite toggle
.favorite-button {
  on:click {
    event.stopPropagation();
    
    if (!favorited) {
      // Add to favorites
      animation: heartBurst 0.4s ease;
      background: #EF4444;
      
      // Success feedback
      showToast('Added to favorites', 'success');
    } else {
      // Remove from favorites
      animation: heartShrink 0.3s ease;
      background: white;
    }
  }
}

@keyframes heartBurst {
  0% { transform: scale(1); }
  30% { transform: scale(0.8); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes heartShrink {
  0% { transform: scale(1); }
  50% { transform: scale(0.8); }
  100% { transform: scale(1); }
}

// Heart particles animation (optional)
.heart-particles {
  position: absolute;
  pointer-events: none;
  
  .particle {
    animation: floatUp 1s ease-out forwards;
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) scale(1);
    opacity: 0;
  }
}
```

### Quick View Modal

```javascript
// Open quick view
.property-card {
  on:click {
    // Card shrink effect
    animation: cardPress 0.2s ease;
    
    // Open modal
    setTimeout(() => {
      openQuickView(propertyId);
    }, 200);
  }
}

// Modal animation
.quick-view-modal {
  // Entry animation
  animation: modalEntry 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Backdrop fade
  .modal-backdrop {
    animation: fadeIn 0.3s ease;
  }
}

@keyframes modalEntry {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Close animation
.modal-close {
  on:click {
    .quick-view-modal {
      animation: modalExit 0.2s ease forwards;
    }
    
    .modal-backdrop {
      animation: fadeOut 0.2s ease forwards;
    }
  }
}

@keyframes modalExit {
  to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
}
```

## Gallery Interactions

### Image Navigation

```javascript
// Gallery controls
.gallery-container {
  position: relative;
  
  // Next/Previous buttons
  .gallery-nav {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  on:hover {
    .gallery-nav {
      opacity: 1;
    }
  }
  
  .next-button, .prev-button {
    on:click {
      // Slide animation
      const direction = this.classList.contains('next') ? -1 : 1;
      
      .gallery-images {
        transform: translateX(${direction * 100}%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      // Update indicators
      updateGalleryIndicators(currentIndex);
    }
  }
}

// Touch gestures
.gallery-images {
  on:swipeleft {
    navigateGallery('next');
  }
  
  on:swiperight {
    navigateGallery('prev');
  }
  
  // Pinch to zoom
  on:pinch {
    if (scale > 1) {
      enableZoomMode();
    }
  }
}
```

### Lightbox Mode

```javascript
// Open lightbox
.gallery-image {
  on:click {
    openLightbox(imageIndex);
  }
}

.lightbox {
  // Zoom in animation
  animation: lightboxOpen 0.3s ease;
  
  .lightbox-image {
    transform-origin: center;
    transition: transform 0.3s ease;
  }
  
  // Zoom controls
  on:wheel {
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    currentZoom = Math.max(1, Math.min(3, currentZoom * zoomFactor));
    
    .lightbox-image {
      transform: scale(currentZoom);
    }
  }
  
  // Pan when zoomed
  on:mousemove {
    if (currentZoom > 1 && isDragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      
      .lightbox-image {
        transform: scale(currentZoom) translate(deltaX, deltaY);
      }
    }
  }
}

@keyframes lightboxOpen {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Virtual Tour

```javascript
// 360° viewer
.virtual-tour {
  on:mousedown {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  }
  
  on:mousemove {
    if (isDragging) {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      
      // Update camera rotation
      camera.rotation.y += deltaX * 0.01;
      camera.rotation.x += deltaY * 0.01;
      
      // Smooth animation
      requestAnimationFrame(() => {
        renderer.render(scene, camera);
      });
    }
  }
  
  // Hotspot interactions
  .tour-hotspot {
    animation: pulse 2s ease infinite;
    
    on:click {
      // Navigate to room
      navigateToRoom(roomId, {
        duration: 1000,
        easing: 'ease-in-out'
      });
      
      // Show room info
      showRoomInfo(roomData);
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}
```

## Filter Interactions

### Range Sliders

```javascript
// Price range slider
.price-slider {
  // Thumb drag
  .slider-thumb {
    on:mousedown {
      isDragging = true;
      this.style.cursor = 'grabbing';
      
      // Show value tooltip
      .value-tooltip {
        opacity: 1;
        transform: translateY(-10px);
      }
    }
    
    on:mousemove {
      if (isDragging) {
        // Update position
        const percentage = calculatePercentage(event.clientX);
        updateSliderValue(percentage);
        
        // Live preview
        throttle(() => {
          previewFilterResults();
        }, 200);
      }
    }
    
    on:mouseup {
      isDragging = false;
      this.style.cursor = 'grab';
      
      // Hide tooltip with delay
      setTimeout(() => {
        .value-tooltip {
          opacity: 0;
        }
      }, 1000);
      
      // Apply filter
      applyPriceFilter(minValue, maxValue);
    }
  }
  
  // Range fill animation
  .range-fill {
    transition: all 0.2s ease;
    background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
  }
}
```

### Multi-select Filters

```javascript
// Property type selection
.property-type-grid {
  .type-option {
    transition: all 0.2s ease;
    
    on:click {
      toggleSelection();
      
      if (selected) {
        animation: selectBounce 0.3s ease;
        background: #6366F1;
        color: white;
        
        // Icon animation
        .type-icon {
          animation: iconRotate 0.3s ease;
        }
      } else {
        background: white;
        color: #4B5563;
      }
      
      // Update results count
      updateResultsPreview();
    }
  }
}

@keyframes selectBounce {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes iconRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Filter Application

```javascript
// Apply filters button
.apply-filters-button {
  on:click {
    // Button loading state
    this.disabled = true;
    animation: buttonLoading 1s ease infinite;
    
    // Apply filters
    applyAllFilters().then(() => {
      // Success animation
      animation: buttonSuccess 0.3s ease;
      
      // Close filter panel
      setTimeout(() => {
        closeFilterPanel();
      }, 300);
    });
  }
}

// Clear filters
.clear-filters-button {
  on:click {
    // Confirmation animation
    animation: shake 0.3s ease;
    
    // Clear with cascade effect
    .filter-item {
      animation: clearCascade 0.3s ease;
      animation-delay: calc(var(--index) * 0.05s);
    }
    
    setTimeout(() => {
      resetAllFilters();
      refreshResults();
    }, 500);
  }
}

@keyframes clearCascade {
  0% { transform: translateX(0); opacity: 1; }
  50% { transform: translateX(-20px); opacity: 0.5; }
  100% { transform: translateX(0); opacity: 1; }
}
```

## Comparison Interactions

### Add to Comparison

```javascript
// Compare checkbox
.compare-checkbox {
  on:change {
    if (checked) {
      // Add animation
      animation: addToCompare 0.3s ease;
      
      // Show comparison bar
      if (comparisonCount === 1) {
        .comparison-bar {
          animation: slideUp 0.3s ease;
          transform: translateY(0);
        }
      }
      
      // Update count
      .comparison-count {
        animation: countBump 0.3s ease;
      }
    } else {
      // Remove animation
      animation: removeFromCompare 0.3s ease;
    }
    
    // Limit check
    if (comparisonCount >= 4) {
      showToast('Maximum 4 properties for comparison', 'warning');
      disableUnselectedCheckboxes();
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes countBump {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### Comparison View

```javascript
// Open comparison
.compare-button {
  on:click {
    // Transition to comparison view
    .property-grid {
      animation: fadeOut 0.3s ease forwards;
    }
    
    setTimeout(() => {
      showComparisonView();
      
      .comparison-table {
        animation: fadeIn 0.3s ease;
      }
    }, 300);
  }
}

// Remove from comparison
.remove-property {
  on:click {
    const propertyColumn = this.closest('.property-column');
    
    // Remove animation
    propertyColumn.style.animation = 'slideOutRight 0.3s ease forwards';
    
    setTimeout(() => {
      removeFromComparison(propertyId);
      rebalanceColumns();
    }, 300);
  }
}

// Highlight differences
.highlight-differences-toggle {
  on:change {
    if (checked) {
      // Analyze and highlight
      findDifferences().forEach(cell => {
        cell.classList.add('highlighted');
        cell.style.animation = 'highlightPulse 0.5s ease';
      });
    } else {
      removeHighlights();
    }
  }
}

@keyframes highlightPulse {
  0%, 100% { background: transparent; }
  50% { background: rgba(99, 102, 241, 0.1); }
}
```

## Performance Patterns

### Lazy Loading

```javascript
// Image lazy loading
.property-image {
  // Intersection Observer
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Load image
        const img = entry.target;
        img.src = img.dataset.src;
        
        // Fade in animation
        img.onload = () => {
          img.style.animation = 'fadeIn 0.3s ease';
        };
        
        imageObserver.unobserve(img);
      }
    });
  });
  
  // Observe all images
  document.querySelectorAll('.lazy-image').forEach(img => {
    imageObserver.observe(img);
  });
}
```

### Debouncing and Throttling

```javascript
// Search debouncing
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 500);

// Map pan throttling
const throttledMapUpdate = throttle(() => {
  updateMapMarkers();
  loadVisibleProperties();
}, 200);

// Scroll pagination
const handleScroll = throttle(() => {
  if (nearBottom()) {
    loadMoreProperties();
  }
}, 300);
```

### Optimistic Updates

```javascript
// Favorite action
.favorite-button {
  on:click {
    // Immediate UI update
    this.classList.toggle('favorited');
    
    // API call in background
    toggleFavorite(propertyId)
      .catch(error => {
        // Revert on error
        this.classList.toggle('favorited');
        showError('Failed to update favorite');
      });
  }
}

// Filter application
function applyFilter(filter) {
  // Show loading state immediately
  showFilterLoading();
  
  // Update URL immediately
  updateURLParams(filter);
  
  // Fetch results
  fetchFilteredResults(filter)
    .then(results => {
      updateResults(results);
    })
    .catch(error => {
      revertFilter();
      showError('Failed to apply filter');
    });
}
```

## Related Documentation
- [Screen States](./screen-states.md)
- [Animation System](../../design-system/tokens/animations.md)
- [Performance Guidelines](./implementation.md#performance-optimization)
- [Accessibility Requirements](./accessibility.md)